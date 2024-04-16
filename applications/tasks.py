from celery import shared_task
from flask_mail import Message, Mail
from flask import current_app as app


@shared_task(ignore_result=True)
def sendTestEmail():
    return "Test email sent"