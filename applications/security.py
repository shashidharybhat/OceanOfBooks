from flask_security import Security, SQLAlchemyUserDatastore
from applications.models import db, User, Role

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(datastore=user_datastore)

