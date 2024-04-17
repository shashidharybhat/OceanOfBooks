from flask_restful import Resource, Api, abort, marshal, fields, reqparse, marshal_with
from flask_security import auth_token_required, current_user, hash_password, roles_required, auth_required
from applications.security import user_datastore
from applications.extensions import db
from applications.models import Book, User, Section, Request, AccessLog, Feedback
from flask import jsonify
from sqlalchemy import or_
from datetime import datetime, timezone, timedelta
from applications.cache import cache 

api = Api(prefix='/api')

book_parser = reqparse.RequestParser()
book_parser.add_argument('title', type=str, required=True, help='Title is required')
book_parser.add_argument('section_id', type=int, required=True, help='Section ID is required')
book_parser.add_argument('author', type=str, required=True, help='Author is required')
book_parser.add_argument('stock')

user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help='Username is required')
user_parser.add_argument('password', type=str, required=True, help='Password is required')
user_parser.add_argument('email', type=str, required=True, help='Email is required')
user_parser.add_argument('role', type=str, required=True, help='Role is required')

section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str, required=True, help='Section name is required')
section_parser.add_argument('description', type=str, required=True, help='Section description is required')

book_request_parser = reqparse.RequestParser()
book_request_parser.add_argument('book_id', type=int, required=True, help='Book ID is required')
book_request_parser.add_argument('user_id', type=int, required=True, help='User ID is required')
book_request_parser.add_argument('status', type=str)

request_update_parser = reqparse.RequestParser()
request_update_parser.add_argument('status', type=str, required=True, help='Status is required')
request_update_parser.add_argument('id', type=int, required=True, help='Request ID is required')

access_log_parser = reqparse.RequestParser()
access_log_parser.add_argument('id', type=int)
access_log_parser.add_argument('user_id', type=int)
access_log_parser.add_argument('book_id', type=int)
access_log_parser.add_argument('status', type=str)

feedback_parser = reqparse.RequestParser()
feedback_parser.add_argument('book_id', type=int, required=True, help='Book ID is required')
feedback_parser.add_argument('user_id', type=int, required=True, help='User ID is required')
feedback_parser.add_argument('rating', type=int, required=True, help='Rating is required')
feedback_parser.add_argument('comment', type=str, required=True, help='Comment is required')




user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'role': fields.String
}

section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'books': fields.List(fields.Nested({
        'id': fields.Integer,
        'title': fields.String,
        'stock': fields.Integer
    }))
}

book_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'section_id': fields.Integer,
    'stock': fields.Integer,
    'rating': fields.Float,
    'author': fields.String
}

request_fields = {
    'id': fields.Integer,
    'book_id': fields.Integer,
    'user_id': fields.Integer,
    'status': fields.String
}

access_log_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'book_id': fields.Integer,
    'expiry_date': fields.DateTime,
    'return_date': fields.DateTime,
    'status': fields.String
}

feedback_fields = {
    'id': fields.Integer,
    'request_id': fields.Integer,
    'rating': fields.Integer,
    'comment': fields.String
}

class UserListResource(Resource):
    @marshal_with(user_fields)
    @cache.cached(timeout=30)
    def get(self):
        users = User.query.all()
        return users

    @marshal_with(user_fields)
    def post(self):
        args = user_parser.parse_args()
        print(args)
        username = args['username']
        email_add = args['email']
        password = args['password']

        user = user_datastore.create_user(username=username,email=email_add, password=hash_password(password))
        db.session.add(user)
        db.session.commit()
        user_datastore.add_role_to_user(user, 'user')
        db.session.commit()
        return user, 201

class UserResource(Resource):
    @auth_token_required
    def get(self, user_id):
        if user_id == 0:
                return marshal(User.query.filter_by(id=current_user.id).first(), user_fields)

        if user_id == 1 and current_user.id != 1:
            abort(400, message="User {} is restricted".format(id))
        else:
            if 1 == current_user.id:
                return marshal(user_datastore.query.filter_by(id=id).first() , user_fields)
            elif user_id == current_user.id:
                return marshal(current_user, user_fields)
            else:
                abort(400, message="User {} is not your ID".format(id))

    
    @auth_required('token')
    @roles_required('librarian')
    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204


class SectionListResource(Resource):
    @marshal_with(section_fields)
    @auth_token_required
    def get(self):
        sections = Section.query.all()
        return sections, 200

    @marshal_with(section_fields)
    @auth_required('token')
    @roles_required('librarian')
    def post(self):
        args = section_parser.parse_args()
        name = args['name']
        description = args['description']
        section = Section(name=name, description=description)
        db.session.add(section)
        db.session.commit()
        return section, 201

class SectionResource(Resource):
    @marshal_with(section_fields)
    @auth_required('token')
    def get(self, section_id):
        section = Section.query.get_or_404(section_id)
        return section
    
    @marshal_with(section_fields)
    @auth_required('token')
    @roles_required('librarian')
    def put(self, section_id):
        section = Section.query.get_or_404(section_id)
        args = section_parser.parse_args()
        section.name = args['name']
        section.description = args['description']
        db.session.commit()
        return section

    @auth_required('token')
    @roles_required('librarian')
    def delete(self, section_id):
        section = Section.query.get_or_404(section_id)
        db.session.delete(section)
        db.session.commit()
        return '', 204


class BookListResource(Resource):
    @marshal_with(book_fields)
    @cache.cached(timeout=30)
    def get(self):
        books = Book.query.all()
        return books

    @auth_token_required
    @marshal_with(book_fields)
    @roles_required('librarian')
    def post(self):
        args = book_parser.parse_args()
        title = args['title']
        section_id = args['section_id']
        stock = args['stock'] or 1
        author = args['author']

        book = Book(title=title, section_id=section_id, stock=stock, author=author)
        db.session.add(book)
        db.session.commit()
        return book, 201

class BookResource(Resource):
    @marshal_with(book_fields)
    def get(self, book_id):
        book = Book.query.get_or_404(book_id)
        return book

    @auth_token_required
    @roles_required('librarian')
    def delete(self, book_id):
        book = Book.query.get_or_404(book_id)
        db.session.delete(book)
        db.session.commit()
        return '', 204

    @auth_token_required
    @roles_required('librarian')
    @marshal_with(book_fields)
    def put(self, book_id):
        book = Book.query.get_or_404(book_id)
        args = book_parser.parse_args()
        book.title = args['title']
        book.section_id = args['section_id']
        db.session.commit()
        return book
    
class UserBooksResource(Resource):
    @auth_token_required
    def get(self):
        user = current_user
        books = user.books
        return jsonify(books)
    
class UserRequestsResource(Resource):
    @marshal_with(request_fields)
    @auth_token_required
    def get(self):
        requests = Request.query.filter_by(user_id=current_user.id).all()
        return requests
    
    @marshal_with(request_fields)
    @auth_token_required
    def post(self):
        args = book_request_parser.parse_args()
        book_id = args['book_id']
        user_id = args['user_id']   
        request = Request(book_id=book_id, user_id=user_id, status="pending")
        db.session.add(request)
        db.session.commit()
        return request, 201
    
    @auth_token_required
    def delete(self):
        args = book_request_parser.parse_args()
        book_id = args['book_id']
        user_id = args['user_id']
        request = Request.query.filter_by(book_id=book_id, user_id=user_id).first()
        db.session.delete(request)
        db.session.commit()
        return '', 204
    
class BookRequestResource(Resource):
    @marshal_with(request_fields)
    @auth_token_required
    @roles_required('librarian')
    def get(self):
        requests = Request.query.filter_by(status='pending').all()
        return requests
    
    @marshal_with(request_fields)
    @auth_token_required
    @roles_required('librarian')
    def put(self):
        args = request_update_parser.parse_args()
        request_id = args['id']
        status = args['status']
        request = Request.query.filter_by(id=request_id).first()
        request.status = status
        db.session.commit()
        if status == 'approved':
            access_log = AccessLog(user_id=request.user_id, book_id=request.book_id, 
                                   access_date=datetime.now(timezone.utc),
                                   expiry_date=datetime.now(timezone.utc) + timedelta(days=7))
            db.session.add(access_log)
            db.session.commit()
        return request
    
class UserAccessLogResource(Resource):
    @marshal_with(request_fields)
    @auth_token_required
    def get(self):
        access_logs = AccessLog.query.filter_by(user_id=current_user.id).all()
        return access_logs
    
    @marshal_with(request_fields)
    @auth_token_required
    def put(self):
        args = access_log_parser.parse_args()
        user_id = args['user_id']
        book_id = args['book_id']
        status = args['status']
        if status == 'revoked-Acknowledged':
            accessLog = AccessLog.query.filter_by(user_id=user_id, book_id=book_id, status='revoked').distinct().first()
            print(accessLog)
            accessLog.expiry_date = datetime.now(timezone.utc)
            accessLog.status = status
            db.session.commit()
            return accessLog
        accessLog = AccessLog.query.filter_by(user_id=user_id, book_id=book_id, status='active').first()
        accessLog.access_date = accessLog.access_date.replace(tzinfo=timezone.utc)
        accessLog.return_date = datetime.now(timezone.utc)
        accessLog.read_time = (accessLog.return_date - accessLog.access_date).seconds
        print(accessLog.read_time)
        accessLog.status = status
        db.session.commit()
        request = Request.query.filter_by(user_id=user_id, book_id=book_id).first()
        db.session.delete(request)
        db.session.commit()
        return accessLog

class AccessLogResource(Resource):
    @marshal_with(access_log_fields)
    @auth_token_required
    @roles_required('librarian')
    def get(self):
        access_logs = AccessLog.query.filter_by(status='active').all()
        print(access_logs)
        return access_logs
    
    @marshal_with(access_log_fields)
    @auth_token_required
    @roles_required('librarian')
    def put(self):
        args = access_log_parser.parse_args()
        id = args['id']
        status = args['status']
        accessLog = AccessLog.query.filter_by(id=id).first()
        if status == 'revoked':
            accessLog.expiry_date = datetime.now(timezone.utc)
            request = Request.query.filter_by(user_id=accessLog.user_id, book_id=accessLog.book_id).first()
            db.session.delete(request)
        accessLog.return_date = datetime.now(timezone.utc)
        accessLog.access_date = accessLog.access_date.replace(tzinfo=timezone.utc)
        accessLog.read_time = (accessLog.return_date - accessLog.access_date).seconds
        print(accessLog.read_time)
        accessLog.status = status
        db.session.commit()
        return accessLog

class UserStatsResource(Resource):
    def get(self, user_id):
        section_distribution = db.session.query(Section.name, db.func.count(Book.id), db.func.sum(AccessLog.read_time)) \
            .join(Book, Section.id == Book.section_id) \
            .join(AccessLog, Book.id == AccessLog.book_id) \
            .filter(AccessLog.user_id == user_id) \
            .group_by(Section.name) \
            .all()
        
        section_distribution_serial = []
        for section_name, book_count, reading_time in section_distribution:
            section_distribution_serial.append({
                'section_name': section_name,
                'book_count': book_count,
                'reading_time': reading_time or 0 
            })

        reading_time = db.session.query(db.func.sum(AccessLog.read_time)) \
        .filter(AccessLog.user_id == user_id, AccessLog.status.in_(['returned','revoked','revoked-Acknowledged'])) \
        .scalar() or 0

        top_rated_books = db.session.query(Book.title, db.func.avg(Feedback.rating)) \
            .join(Feedback, Book.id == Feedback.book_id) \
            .join(AccessLog, Book.id == AccessLog.book_id) \
            .filter(Feedback.user_id == user_id, AccessLog.status.in_(['returned','revoked','revoked-Acknowledged'])) \
            .group_by(Book.title) \
            .order_by(db.func.avg(Feedback.rating).desc()) \
            .limit(5) \
            .all()
        
        top_rated_books_serial = [{'title': title, 'rating': avg_rating}
                                       for title, avg_rating in top_rated_books]

        most_requested_books = db.session.query(Book.title, db.func.count(AccessLog.id)) \
            .join(AccessLog, Book.id == AccessLog.book_id) \
            .filter(AccessLog.user_id == user_id, AccessLog.status.in_(['active','returned', 'revoked', 'revoked-Acknowledged'])) \
            .group_by(Book.title) \
            .order_by(db.func.count(AccessLog.id).desc()) \
            .limit(5) \
            .all()
        
        most_requested_books_serial = [{'title': title, 'count': count} for title, count in most_requested_books]
        return jsonify({
            'section_distribution': section_distribution_serial,
            'reading_time': reading_time,
            'top_rated_books': top_rated_books_serial,
            'most_requested_books': most_requested_books_serial
            })

class LibrarianStatsResource(Resource):
    def get(self):
        total_books = Book.query.count()

        total_sections = Section.query.count()

        active_logs = AccessLog.query.filter_by(status='active').count()

        section_distribution = db.session.query(Section.name, db.func.count(Book.id)) \
            .join(Book, Section.id == Book.section_id) \
            .join(AccessLog, Book.id == AccessLog.book_id) \
            .filter(AccessLog.status.in_(['active', 'revoked', 'expired', 'revoked-Acknowledged', 'returned' ])) \
            .group_by(Section.name) \
            .all()

        section_names = [section[0] for section in section_distribution]
        book_counts = [section[1] for section in section_distribution]

        return jsonify({
            'total_books': total_books,
            'total_sections': total_sections,
            'active_logs': active_logs,
            'section_distribution': {
                'section_names': section_names,
                'book_counts': book_counts
            }
        })
    
class FeedbackResource(Resource):
    @marshal_with(request_fields)
    @auth_token_required
    def post(self):
        args = feedback_parser.parse_args()
        book_id = args['book_id']
        user_id = args['user_id']
        rating = args['rating']
        comment = args['comment']
        book = Book.query.get_or_404(book_id)
        feedback = Feedback(user_id=user_id, book_id=book_id, rating=rating, comment=comment, created_at=datetime.now(timezone.utc))
        db.session.add(feedback)
        db.session.commit()
        return feedback, 201
    

api.add_resource(UserListResource, '/users/all')
api.add_resource(UserResource, '/users/<int:user_id>')

api.add_resource(SectionListResource, '/sections')
api.add_resource(SectionResource, '/sections/<int:section_id>')

api.add_resource(BookListResource, '/books')
api.add_resource(BookResource, '/books/<int:book_id>')

api.add_resource(UserBooksResource, '/books/user')

api.add_resource(BookRequestResource, '/admin/request')
api.add_resource(UserRequestsResource, '/requests')

api.add_resource(UserAccessLogResource, '/logs')
api.add_resource(AccessLogResource, '/admin/logs')

api.add_resource(UserStatsResource, '/stats/<int:user_id>')
api.add_resource(LibrarianStatsResource, '/admin/stats')

api.add_resource(FeedbackResource, '/feedback')