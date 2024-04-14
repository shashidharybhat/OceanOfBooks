from flask_restful import Resource, Api, abort, marshal, fields, reqparse, marshal_with
from flask_security import auth_token_required, current_user, hash_password, roles_required, auth_required
from applications.security import user_datastore
from applications.extensions import db
from applications.models import Book, User, Section
from flask import jsonify
from applications.forms import Registration, Login
import json

api = Api(prefix='/api')

book_parser = reqparse.RequestParser()
book_parser.add_argument('title', type=str, required=True, help='Title is required')
book_parser.add_argument('section_id', type=int, required=True, help='Section ID is required')
book_parser.add_argument('stock')

user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help='Username is required')
user_parser.add_argument('password', type=str, required=True, help='Password is required')
user_parser.add_argument('email', type=str, required=True, help='Email is required')
user_parser.add_argument('role', type=str, required=True, help='Role is required')

section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str, required=True, help='Section name is required')

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'role': fields.String
}

section_fields = {
    'id': fields.Integer,
    'name': fields.String
}

book_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'section_id': fields.Integer,
    'stock': fields.Integer,
    'rating': fields.Float
}

class UserListResource(Resource):
    @marshal_with(user_fields)
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
        print(sections)
        return sections

    @marshal_with(section_fields)
    @auth_required('token')
    @roles_required('librarian')
    def post(self):
        args = section_parser.parse_args()
        name = args['name']
        print(name)
        section = Section(name=name)
        db.session.add(section)
        db.session.commit()
        return section, 201

class SectionResource(Resource):
    @marshal_with(section_fields)
    @auth_required('token')
    def get(self, section_id):
        section = Section.query.get_or_404(section_id)
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
    def get(self):
        books = Book.query.all()
        return books

    @auth_token_required
    @marshal_with(book_fields)
    def post(self):
        args = book_parser.parse_args()
        title = args['title']
        section_id = args['section_id']
        # Default stock is 1 if not provided
        stock = args['stock'] or 1

        book = Book(title=title, section_id=section_id, stock=stock)
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
    
# Get books rented by users
class UserBooksResource(Resource):
    @auth_token_required
    def get(self):
        user = current_user
        books = user.books
        return jsonify(books)

api.add_resource(UserListResource, '/users/all')
api.add_resource(UserResource, '/users/<int:user_id>')

api.add_resource(SectionListResource, '/sections')
api.add_resource(SectionResource, '/sections/<int:section_id>')

api.add_resource(BookListResource, '/books')
api.add_resource(BookResource, '/books/<int:book_id>')

api.add_resource(UserBooksResource, '/books/user')
