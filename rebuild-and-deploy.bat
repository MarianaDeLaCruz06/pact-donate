@echo off
REM Script para rebuild completo y deploy a Railway (Windows)

echo =================================
echo 🧹 Limpiando builds anteriores...
echo =================================

REM Limpiar frontend
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo =================================
echo 📦 Instalando dependencias...
echo =================================

call npm install

echo.
echo =================================
echo 🔨 Construyendo frontend...
echo =================================

call npm run build

echo.
echo =================================
echo ✅ Build completado
echo =================================
echo.
echo Para deployar a Railway:
echo   git add .
echo   git commit -m "Rebuild frontend con configuración actualizada"
echo   git push
echo.
echo Railway automáticamente redesplegará.
echo.

pause

