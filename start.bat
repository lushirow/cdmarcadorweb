@echo off
echo Iniciando Servidor de WebSockets (Backend)...
start cmd /k "cd server && npm start"

echo Iniciando Aplicacion React (Frontend)...
start cmd /k "cd client && npm run dev"

echo TODO INICIADO!
echo El panel de control se abrira automaticamente en tu navegador.
echo Para OBS, la url es: http://localhost:5173/obs
pause
