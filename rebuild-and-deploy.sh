#!/bin/bash

# Script para rebuild completo y deploy a Railway

echo "================================="
echo "🧹 Limpiando builds anteriores..."
echo "================================="

# Limpiar frontend
rm -rf dist
rm -rf node_modules/.vite

# Limpiar backend (opcional)
# rm -rf server/node_modules

echo ""
echo "================================="
echo "📦 Instalando dependencias..."
echo "================================="

npm install

echo ""
echo "================================="
echo "🔨 Construyendo frontend..."
echo "================================="

npm run build

echo ""
echo "================================="
echo "✅ Build completado"
echo "================================="
echo ""
echo "Para deployar a Railway:"
echo "  git add ."
echo "  git commit -m \"Rebuild frontend con configuración actualizada\""
echo "  git push"
echo ""
echo "Railway automáticamente redesplegará."

