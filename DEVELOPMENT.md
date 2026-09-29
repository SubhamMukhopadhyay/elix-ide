# Elix IDE — Development Guide

## 📋 Prerequisites
- Windows 10/11 x64
- Node.js 18+ (tested on Node v24.16.0)
- npm 9+ (tested on npm 11.13.0)
- Git 2.40+

## 🚀 Setup & Build Steps

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/elix-ide/elix-ide.git
   cd "elix-ide"
   ```

2. **Install dependencies:**
   ```powershell
   npm install --ignore-scripts
   ```

3. **Download & unpack Electron binary:**
   ```powershell
   curl.exe -L "https://github.com/electron/electron/releases/download/v34.2.0/electron-v34.2.0-win32-x64.zip" -o electron.zip
   Expand-Archive -Path electron.zip -DestinationPath "node_modules/electron/dist" -Force
   Remove-Item electron.zip
   Set-Content -Path "node_modules/electron/path.txt" -Value "dist/electron.exe"
   ```

4. **Run Vite development server:**
   ```powershell
   npm run dev
   ```

5. **Typecheck and build application:**
   ```powershell
   npx tsc --noEmit
   npx vite build
   ```

6. **Package Windows Executable (.exe):**
   ```powershell
   node scripts/build-win.js
   ```

The packaged executable will be generated at:
`release/Elix-IDE-win32-x64/Elix IDE.exe`
