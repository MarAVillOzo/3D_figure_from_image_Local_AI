@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalador\instalar.ps1" -SoloDiagnostico
echo.
echo Puedes compartir el texto y el archivo instalador\instalacion.log para diagnosticar errores.
pause
