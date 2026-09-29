import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('⚡ [1/5] Building Vite frontend and Electron bundles...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

const releaseDir = path.join(rootDir, 'release', 'Elix-IDE-win32-x64');
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');

console.log('📦 [2/5] Assembling unpacked release directory at:', releaseDir);
const rootVideoDir = path.join(rootDir, 'Video');
const releaseVideoDir = path.join(releaseDir, 'Video');

// Preserve any existing Video files in release directory
if (fs.existsSync(releaseVideoDir)) {
  fs.mkdirSync(rootVideoDir, { recursive: true });
  fs.cpSync(releaseVideoDir, rootVideoDir, { recursive: true });
}

// Terminate any running instances so files are not locked
if (process.platform === 'win32') {
  try {
    execSync('powershell -NoProfile -Command "Get-Process -Name \'Elix IDE\' -ErrorAction SilentlyContinue | Stop-Process -Force"', { stdio: 'ignore' });
  } catch {}
  try {
    execSync('powershell -NoProfile -Command "taskkill /F /IM \'Elix IDE.exe\' /T"', { stdio: 'ignore' });
  } catch {}
  // Give Windows 1 second to release locked file handles
  try {
    execSync('powershell -NoProfile -Command "Start-Sleep -Seconds 1"', { stdio: 'ignore' });
  } catch {}
}

const oldExe = path.join(releaseDir, 'electron.exe');
const newExe = path.join(releaseDir, 'Elix IDE.exe');

if (!fs.existsSync(newExe)) {
  console.log('📋 [3/5] Copying Electron binaries and dependencies...');
  fs.mkdirSync(releaseDir, { recursive: true });
  fs.cpSync(electronDist, releaseDir, { recursive: true });
  if (fs.existsSync(oldExe)) {
    fs.renameSync(oldExe, newExe);
  }
} else {
  console.log('⚡ [3/5] Electron runtime binaries already present, updating application payload...');
}

// Remove default_app.asar if present
const defaultAppAsar = path.join(releaseDir, 'resources', 'default_app.asar');
if (fs.existsSync(defaultAppAsar)) {
  try { fs.unlinkSync(defaultAppAsar); } catch {}
}

// Create resources/app
const appDir = path.join(releaseDir, 'resources', 'app');
fs.mkdirSync(appDir, { recursive: true });

// Copy package.json, dist, and dist-electron to resources/app
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(appDir, 'package.json'));
fs.cpSync(path.join(rootDir, 'dist'), path.join(appDir, 'dist'), { recursive: true });
fs.cpSync(path.join(rootDir, 'dist-electron'), path.join(appDir, 'dist-electron'), { recursive: true });

// Create desktop quick runner script in release folder
const quickCmd = `@echo off
start "" "%~dp0Elix IDE.exe"
`;
fs.writeFileSync(path.join(releaseDir, 'Launch-Elix.cmd'), quickCmd, 'utf8');

// Ensure Video directory is preserved inside release folder
if (fs.existsSync(rootVideoDir)) {
  fs.mkdirSync(releaseVideoDir, { recursive: true });
  fs.cpSync(rootVideoDir, releaseVideoDir, { recursive: true });
}

console.log('📦 [4/5] Packaging app payload archive...');
if (process.platform === 'win32') {
  try {
    execSync('powershell -NoProfile -Command "Get-Process -Name \'Elix IDE\' -ErrorAction SilentlyContinue | Stop-Process -Force"', { stdio: 'ignore' });
    execSync('powershell -NoProfile -Command "taskkill /F /IM \'Elix IDE.exe\' /T"', { stdio: 'ignore' });
    execSync('powershell -NoProfile -Command "Start-Sleep -Seconds 1"', { stdio: 'ignore' });
  } catch {}
}

const payloadZip = path.join(rootDir, 'release', 'payload.zip');
if (fs.existsSync(payloadZip)) {
  fs.unlinkSync(payloadZip);
}

// Use PowerShell Fast compression to zip release directory contents
const zipCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${releaseDir.replace(/'/g, "''")}/*' -DestinationPath '${payloadZip.replace(/'/g, "''")}' -CompressionLevel Fastest -Force"`;
console.log('Compressing files into setup payload archive...');
execSync(zipCmd, { cwd: rootDir, stdio: 'inherit' });

console.log('🔨 [5/5] Compiling native Windows Setup Wizard (Elix-IDE-Setup.exe)...');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const setupExe = path.join(rootDir, 'release', 'Elix-IDE-Setup.exe');
const installerCs = path.join(rootDir, 'scripts', 'installer.cs');

const compileCmd = `"${cscPath}" /nologo /target:winexe /out:"${setupExe}" /r:System.Windows.Forms.dll,System.Drawing.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll /resource:"${payloadZip}" "${installerCs}"`;
execSync(compileCmd, { cwd: rootDir, stdio: 'inherit' });

// Remove temporary payload zip after embedding
if (fs.existsSync(payloadZip)) {
  fs.unlinkSync(payloadZip);
}

console.log('\n🎉 ALL DONE — ELIX IDE PROFESSIONAL ARTIFACTS READY!');
console.log('1. Professional Windows Setup Wizard: ' + setupExe);
console.log('2. Unpacked Desktop Application:      ' + newExe);
console.log('\nYou can install via: & "' + setupExe + '"');
console.log('Or launch directly:  & "' + newExe + '"\n');
