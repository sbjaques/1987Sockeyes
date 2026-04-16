@echo off
echo ==========================================
echo  Installing Tesseract + FFmpeg via winget
echo ==========================================
echo.
echo If UAC prompts appear, click YES.
echo.
winget install --id UB-Mannheim.TesseractOCR --accept-source-agreements --accept-package-agreements
winget install --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
echo.
echo ==========================================
echo  Done. Close and reopen any terminal to
echo  pick up the new PATH entries.
echo ==========================================
pause
