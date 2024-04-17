#! /bin/sh

if [-d ".venv"]; then
    echo "Virtual environment already exists"
    source .venv/bin/activate
else
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

python -m celery -A app:celery_app worker --beat --loglevel=info