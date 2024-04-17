#! /bin/sh
if [-d ".venv"]; then
    echo "Virtual environment already exists"
else
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi
echo "Virtual environment is activated and dependencies are installed."