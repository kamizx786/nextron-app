!macro customInstall
  DetailPrint "🔧 Running VC++ Redistributable Installer..."
  SetOutPath "$INSTDIR\resources"
  ExecWait '"$INSTDIR\resources\vc_redist.x64.exe" /quiet /norestart' $0
  DetailPrint "✅ Installer finished with exit code $0"
!macroend
