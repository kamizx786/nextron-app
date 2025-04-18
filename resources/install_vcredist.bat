@echo off
echo Checking for MSVC runtime...

IF EXIST "%SystemRoot%\System32\msvcp140_1.dll" (
    echo MSVC runtime is already installed.
) ELSE (
    echo Installing MSVC runtime...
    "%~dp0vc_redist.x64.exe" /quiet /norestart /log "%~dp0install_log.txt"
    echo Installation complete. Please check the log for errors.
)
