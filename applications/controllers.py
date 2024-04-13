from flask import current_app as app
from flask import jsonify, render_template, request
from flask_security.utils import hash_password, verify_password
from applications.security import user_datastore as datastore
from flask_security import auth_token_required, current_user, roles_required, auth_required

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
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400
