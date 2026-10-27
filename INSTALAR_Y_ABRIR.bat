@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title FLUID 3D STUDIO V3 - Instalacion visible
color 0B
echo ================================================================
echo FLUID 3D STUDIO V3 - Instalacion y arranque
 echo.
echo La instalacion NO se ejecuta silenciosamente.
echo Este proceso deja un registro en instalador\instalacion.log.
echo Si ya tienes Python/Node/modelos, intenta reutilizarlos.
echo ================================================================
echo.
where powershell.exe >nul 2>nul
if errorlevel 1 (
 echo ERROR: PowerShell de Windows no disponible.
 pause
 exit /b 10
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalador\instalar.ps1"
set "RESULTADO=%ERRORLEVEL%"
if not "%RESULTADO%"=="0" (
 echo.
 echo ================================================================
 echo INSTALACION IA NO COMPLETADA. Codigo: %RESULTADO%
 echo El registro se encuentra en instalador\instalacion.log
 echo Puedes abrir la interfaz igualmente; NO se fingira tener IA.
 echo ================================================================
 echo.
)
call "%~dp0ABRIR_FLUID.bat"
if errorlevel 1 (
 echo ERROR: no se pudo iniciar FLUID Studio. Revisa instalador\instalacion.log.
 pause
 exit /b 20
)
endlocal
