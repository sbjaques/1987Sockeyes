@echo off
setlocal
cd /d "%~dp0\.."

echo ==========================================
echo  Running OCR + Whisper extractions
echo ==========================================
echo.
echo Outputs go to: docs\extractions\new-sources\
echo.

mkdir docs\extractions\new-sources 2>nul

echo --- Abbott Cup Souvenir Program ---
ocrmypdf --force-ocr --output-type pdf --sidecar "docs\extractions\new-sources\abbott-cup-program.txt" "G:\My Drive\87 Sockeyes\Abbott Cup Souvenir Program\Abbott Cup Souvenir Program.pdf" "docs\extractions\new-sources\abbott-cup-program-ocr.pdf"

echo.
echo --- Centennial Cup Souvenir Program (Full) ---
ocrmypdf --force-ocr --output-type pdf --sidecar "docs\extractions\new-sources\centennial-cup-program.txt" "G:\My Drive\87 Sockeyes\Centennial Cup Souvenir Program\87 Centennial Cup Souvenir Program - Full.pdf" "docs\extractions\new-sources\centennial-cup-program-ocr.pdf"

echo.
echo --- Banner Night Ceremony Video (Whisper medium model) ---
echo This will take 10-25 minutes depending on your GPU/CPU...
whisper "G:\My Drive\87 Sockeyes\2025-09-26 - Banner Night\Ceremony Video.mp4" --model medium --language en --output_format txt --output_dir "docs\extractions\new-sources\"

echo.
echo ==========================================
echo  All done!
echo ==========================================
echo.
echo Generated files in docs\extractions\new-sources\:
dir /b docs\extractions\new-sources\
echo.
pause
