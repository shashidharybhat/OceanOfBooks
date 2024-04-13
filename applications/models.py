from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin, AsaList
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import Boolean, DateTime, Column, Integer, \
                    String, ForeignKey
from applications.extensions import db
from datetime import datetime, timezone

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    active = Column(Boolean, default=True)
    last_login_at = Column(DateTime())
    current_login_at = Column(DateTime())
    active = Column(Boolean())
    fs_uniquifier = Column(String(64), unique=True, nullable=False)
    roles = relationship('Role', secondary='user_roles')
    requests = relationship('Request', backref='user')

class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True)
    description = Column(String(255))

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = Column(Integer(), primary_key=True)
    user_id = Column('user_id', Integer(), ForeignKey('user.id', ondelete='CASCADE'))
    role_id = Column('role_id', Integer(), ForeignKey('roles.id', ondelete='CASCADE'))

class Section(db.Model):
    __tablename__ = 'sections'
    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(255), nullable=False)
    books = relationship('Book', backref='section')

class Book(db.Model):
    __tablename__ = 'books'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), unique=True, nullable=False)
    author = Column(String(255), nullable=False)
    section_id = Column(Integer, ForeignKey('sections.id'))
    description = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False)
    image = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False)
    reviews = relationship('Feedback', backref='book')
    requests = relationship('Request', backref='book')
    
class Request(db.Model):
    __tablename__ = 'request'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    request_date = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    status = db.Column(db.String(20), nullable=False, default='pending')  # 'pending', 'approved', 'rejected'

class AccessLog(db.Model):
    __tablename__ = 'access_log'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, nullable=False)
    access_date = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    expiry_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'expired', 'revoked'

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Rating out of 5
    comment = db.Column(db.Text)
    created_at = Column(DateTime())
    updated_at = Column(DateTime())