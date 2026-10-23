@echo off
cd /d "%~dp0"
python -m pip install -r requirements.txt --quiet
python aavl99_beta.py
pause
