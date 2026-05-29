@echo off
echo AI service ishga tushmoqda...
call "%~dp0.venv\Scripts\activate.bat"
python "%~dp0main.py"
pause
