from celery import shared_task
from flask_mail import Message, Mail
from flask import current_app as app, render_template
from celery.schedules import crontab
from app import celery_app
from applications.extensions import db
from datetime import datetime, timedelta
from applications.models import AccessLog, User, Section, Book, Feedback
import calendar

mail = Mail(app)

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(20.0, dailyReminders.s("Daily Reminder"), name='send daily reminders')
    #Run every 5 minutes
    sender.add_periodic_task(60.0, update_expired_books.s(), name='update expired books')
    #Run every month
    sender.add_periodic_task(crontab(day=17, hour=19, minute=40), monthlyUserReport.s(), name='send monthly user report')

def get_monthly_user_metrics(user_id, year, month):
    today = datetime.today()
    start_date = datetime(year, month, 1)
    end_date = start_date.replace(day=calendar.monthrange(year, month)[1])

    monthly_logs = AccessLog.query.filter(
        AccessLog.user_id == user_id,
        AccessLog.access_date >= start_date,
        AccessLog.access_date <= end_date
    ).all()

    section_distribution = db.session.query(
        Section.name,
        db.func.count(Book.id),
        db.func.sum(AccessLog.read_time)
    ).join(Book, Section.id == Book.section_id) \
    .join(AccessLog, Book.id == AccessLog.book_id) \
    .filter(AccessLog.user_id == user_id,
            AccessLog.access_date >= start_date,
            AccessLog.access_date <= end_date) \
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
        .filter(AccessLog.user_id == user_id,
                AccessLog.status.in_(['returned','revoked','revoked-Acknowledged']),
                AccessLog.access_date >= start_date,
                AccessLog.access_date <= end_date) \
        .scalar() or 0

    top_rated_books = db.session.query(
        Book.title,
        db.func.avg(Feedback.rating)
    ).join(Feedback, Book.id == Feedback.book_id) \
    .join(AccessLog, Book.id == AccessLog.book_id) \
    .filter(Feedback.user_id == user_id,
            AccessLog.status.in_(['returned','revoked','revoked-Acknowledged']),
            AccessLog.access_date >= start_date,
            AccessLog.access_date <= end_date) \
    .group_by(Book.title) \
    .order_by(db.func.avg(Feedback.rating).desc()) \
    .limit(5) \
    .all()

    top_rated_books_serial = [{'title': title, 'rating': avg_rating}
                              for title, avg_rating in top_rated_books]

    most_requested_books = db.session.query(
        Book.title,
        db.func.count(AccessLog.id)
    ).join(AccessLog, Book.id == AccessLog.book_id) \
    .filter(AccessLog.user_id == user_id,
            AccessLog.status.in_(['active','returned', 'revoked', 'revoked-Acknowledged']),
            AccessLog.access_date >= start_date,
            AccessLog.access_date <= end_date) \
    .group_by(Book.title) \
    .order_by(db.func.count(AccessLog.id).desc()) \
    .limit(5) \
    .all()

    most_requested_books_serial = [{'title': title, 'count': count}
                                    for title, count in most_requested_books]

    total_books_read = len(monthly_logs)
    total_reading_time = sum(log.read_time for log in monthly_logs)

    return total_books_read, total_reading_time, section_distribution_serial, reading_time, top_rated_books_serial, most_requested_books_serial


@shared_task(ignore_result=True)
def monthlyUserReport():
    today = datetime.now()
    first_day_of_month = today.replace(day=1)
    last_month = first_day_of_month - timedelta(days=1)
    first_day_of_previous_month = last_month.replace(day=1)
    users = User.query.all()

    for user in users:
        user_id = user.id

        total_books_read, total_reading_time, \
        section_distribution, reading_time, \
        top_rated_books, most_requested_books = get_monthly_user_metrics(user_id, last_month.year, last_month.month)

        report = render_template('monthly-report.html', 
                                user=user,
                                total_books_read=total_books_read,
                                total_reading_time=total_reading_time,
                                section_distribution=section_distribution,
                                reading_time=reading_time,
                                top_rated_books=top_rated_books,
                                most_requested_books=most_requested_books,
                                month=last_month.strftime('%B'),
                                year=last_month.year
                                )
        message = f"Monthly Report for {user.username} for {last_month.strftime('%B %Y')}"
        EmailMessage = Message(message, recipients=[user.email])
        EmailMessage.html = report
        mail.send(EmailMessage)


        

    
    msg = Message("Hello", recipients=["test@mail.com"])
    msg.html = report
    mail.send(msg)
    

@shared_task(ignore_result=True)
def dailyReminders(message):
    print("Sending daily reminders")
    return message

@shared_task(ignore_result=True)
def update_expired_books():
    current_datetime = datetime.now()

    expired_access_logs = AccessLog.query.filter(AccessLog.expiry_date < current_datetime).all()

    for log in expired_access_logs:
        log.status = 'expired'

    db.session.commit()


