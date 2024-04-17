import os

basedir = os.path.abspath(os.path.dirname(__file__))

#What else needs to be done

class Config():
    DEBUG = True
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class LocalDevelopmentConfig(Config):
    SECRET_KEY= '478f3606c05401caa37c8d2a47b27b0c077b4e9f5cc317b94b3a45bf862720cc'
    SQLITE_DB_DIR = os.path.join(basedir, "db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "database.sqlite3")
    SECURITY_PASSWORD_SALT = 'sugar'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    WTF_CSRF_ENABLED = False
    DEBUG = True
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 1025
    MAIL_USE_TLS = False
    MAIL_USE_SSL = False
    MAIL_USERNAME = None
    MAIL_PASSWORD = None
    MAIL_DEFAULT_SENDER = '21f1002649@ds.study.iitm.ac.in'