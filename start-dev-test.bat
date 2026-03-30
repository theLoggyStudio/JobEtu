@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "BACK=%ROOT%onejob-back"
set "FRONT=%ROOT%onejob-front"

if not exist "%BACK%\package.json" (
  echo Erreur: dossier introuvable — "%BACK%"
  pause
  exit /b 1
)
if not exist "%FRONT%\package.json" (
  echo Erreur: dossier introuvable — "%FRONT%"
  pause
  exit /b 1
)

echo.
echo  OneJob — demarrage test
echo  - API  : npm run dev:memory  ^(donnees en RAM, reset au redemarrage^)
echo  - Front: npm run dev       ^(Vite, souvent http://localhost:5173^)
echo  Fichier JSON a la place : remplacez dev:memory par dev:json. PostgreSQL : npm run dev.
echo.

start "OneJob — API" cmd /k "cd /d ""%BACK%"" && npm run dev:memory"
start "OneJob — Front" cmd /k "cd /d ""%FRONT%"" && npm run dev"

echo Deux fenetres ont ete ouvertes. Fermez-les pour arreter les serveurs.
endlocal
