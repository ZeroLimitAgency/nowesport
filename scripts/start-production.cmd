@echo off
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%.."
node .\node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 3001
