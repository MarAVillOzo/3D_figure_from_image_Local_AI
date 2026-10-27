@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "NODE_EXE=%~dp0runtime\node\node.exe"
if not exist "%NODE_EXE%" (
 for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined NODE_EXE_FOUND set "NODE_EXE_FOUND=%%I"

)
if defined NODE_EXE_FOUND set "NODE_EXE=%NODE_EXE_FOUND%"
if not exist "%NODE_EXE%" (
 echo ERROR: Node.js no se encuentra. Ejecuta INSTALAR_Y_ABRIR.bat.
 exit /b 2
)
echo Abriendo FLUID 3D Studio V3: http://127.0.0.1:8789
"%NODE_EXE%" "%~dp0server.js"
exit /b %ERRORLEVEL%
