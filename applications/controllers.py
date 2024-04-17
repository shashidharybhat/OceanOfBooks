from flask import current_app as app
from flask import jsonify, render_template, request
from flask_security.utils import hash_password, verify_password
from applications.models import User, Book, Section, Request, AccessLog
from applications.security import user_datastore as datastore
from flask_security import auth_token_required, current_user, roles_required, auth_required, logout_user, login_user
import flask_excel as excel
from datetime import datetime, timezone
from applications.extensions import db

@app.route('/')
@app.route('/home')
def index():
    return render_template('index.html')

@app.post('/Ulogin')
def login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if verify_password(data.get("password"), user.password):
        login_user(user)
        user.last_login_at = user.current_login_at
        user.current_login_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name, "id": user.id})
    else:
        return jsonify({"message": "Wrong Password"}), 400
    
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    print(current_user)
    if current_user.is_authenticated:
        logout_user()
        return jsonify({'message': 'Logged out successfully'}), 200
    else:
        return jsonify({'message': 'No user logged in'}), 401
    
@app.route('/test')
def test():
    get_data1 = Book.query.with_entities(Book.title, Book.author).all()
    csv_out = excel.make_response_from_query_sets(get_data1, ["title", "author"], "csv", file_name="test2.csv")
    return csv_out

