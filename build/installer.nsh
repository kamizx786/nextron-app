!macro customInstall
  SetDetailsView show

  DetailPrint "Installing Visual C++ Redistributable (with logs)..."

  ; Full path to the VC++ installer bundled in your app installation directory
  ExecWait '"$INSTDIR\\vc_redist.x64.exe" /passive /norestart' $0

  ; Check if it executed successfully
  ${If} $0 = 0
    DetailPrint "VC++ Redistributable installed successfully."
  ${Else}
    DetailPrint "VC++ Redistributable installer returned error code $0"
  ${EndIf}
!macroend
