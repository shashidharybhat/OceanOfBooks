import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_migrate import Migrate
from applications.extensions import db, migrate
from api.resource import api
from sqlalchemy_utils import database_exists, create_database
from applications.security import user_datastore, security
from flask_security.utils import hash_password
from config import LocalDevelopmentConfig
from applications.workers import celery_init_app
from applications.cache import cache_init_app
import flask_excel as excel

app = None

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    registerExtensions(app)
    app.app_context().push()
    return app

def registerExtensions(app):
    db.init_app(app)
    api.init_app(app) 
    cache_init_app(app)
    excel.init_excel(app)
    security.init_app(app, user_datastore)
    migrate.init_app(app, db, render_as_batch=True)

app = create_app()
celery_app = celery_init_app(app)

if not database_exists(app.config['SQLALCHEMY_DATABASE_URI']):
    print("Creating database...", app.config['SQLALCHEMY_DATABASE_URI'])
    create_database(app.config['SQLALCHEMY_DATABASE_URI'])

with app.app_context():
    db.create_all()
    
    if not user_datastore.find_role('librarian'):
        user_datastore.create_role(name='librarian', description='Librarian')
        db.session.commit()

    if not user_datastore.find_role('user'):
        user_datastore.create_role(name='user', description='User')
        db.session.commit()

    if not user_datastore.find_user(username='librarian'):
        user_datastore.create_user(username='librarian', email="lib@mail.com", 
                                   password=hash_password('test'), roles=['librarian'], active=True)
        db.session.commit()
        user_datastore.add_role_to_user(user=user_datastore.find_user(username='librarian'), role=user_datastore.find_role('librarian'))
        db.session.commit()

    if not user_datastore.find_user(username='test'):
        user_datastore.create_user(username='test', email="test@mail.com", 
                                   password=hash_password('test'), roles=['user'], active=True)
        db.session.commit()
        user_datastore.add_role_to_user(user=user_datastore.find_user(username='test'), role=user_datastore.find_role('user'))
                                                                                                       
    

from applications.controllers import * 


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")