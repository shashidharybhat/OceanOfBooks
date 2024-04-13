from flask_wtf import FlaskForm, StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError
from applications.models import User

class Registration(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=30)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(user_name=username.data).first()
        if user:
            raise ValidationError("That Username is taken! Please try a different one")
        if ' ' in username.data:
            raise ValidationError("White spaces are not allowed in the Username")

    def validate_email(self, email):
        user = User.query.filter_by(user_email=email.data).first()
        if user:
            raise ValidationError("That Email is taken!")

class Login(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Log in')