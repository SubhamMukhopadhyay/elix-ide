import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'release');
const linuxUnpacked = path.join(releaseDir, 'linux-unpacked');
const tempDir = path.join(releaseDir, 'temp_deb_build');
const outputDeb = path.join(releaseDir, 'Elix-IDE-Setup.deb');

if (!fs.existsSync(linuxUnpacked)) {
  console.error('Error: linux-unpacked directory not found at', linuxUnpacked);
  process.exit(1);
}

console.log('--- Building Debian .deb Package for Elix IDE ---');

// 1. Clean & prepare temp folders
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

const controlDir = path.join(tempDir, 'control');
const dataDir = path.join(tempDir, 'data');
fs.mkdirSync(controlDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

// 2. Write debian-binary
const debianBinaryPath = path.join(tempDir, 'debian-binary');
fs.writeFileSync(debianBinaryPath, '2.0\n');

// 3. Write control file
const controlContent = `Package: elix-ide
Version: 1.0.0
Section: devel
Priority: optional
Architecture: amd64
Maintainer: Elix Team <support@elixide.com>
Installed-Size: 450000
Depends: libgtk-3-0, libnotify4, libnss3, libxss1, libxtst6, xdg-utils, libatspi2.0-0, libuuid1, libsecret-1-0
Recommends: libappindicator3-1
Homepage: https://github.com/elix-ide/elix-ide
Description: Elix IDE — Universal Development Environment & AI Agent
 Universal Development Environment, AI Agent & Career Practice Platform.
`;
fs.writeFileSync(path.join(controlDir, 'control'), controlContent.replace(/\r\n/g, '\n'));

const postinstContent = `#!/bin/sh
set -e
if [ -x /usr/bin/update-desktop-database ]; then
  update-desktop-database -q || true
fi
if [ -x /usr/bin/gtk-update-icon-cache ]; then
  gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor || true
fi
`;
fs.writeFileSync(path.join(controlDir, 'postinst'), postinstContent.replace(/\r\n/g, '\n'));

// 4. Populate data structure
const optDir = path.join(dataDir, 'opt', 'Elix IDE');
fs.mkdirSync(optDir, { recursive: true });

console.log('Copying Linux app files to /opt/Elix IDE...');
// Copy contents of linuxUnpacked to optDir
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
copyRecursiveSync(linuxUnpacked, optDir);

// Desktop file
const appsDir = path.join(dataDir, 'usr', 'share', 'applications');
fs.mkdirSync(appsDir, { recursive: true });
const desktopContent = `[Desktop Entry]
Name=Elix IDE
Comment=Universal Development Environment & AI Agent
GenericName=Text Editor
Exec="/opt/Elix IDE/elix-ide" %U
Icon=elix-ide
Type=Application
StartupNotify=true
Categories=Development;IDE;
MimeType=text/plain;inode/directory;
`;
fs.writeFileSync(path.join(appsDir, 'elix-ide.desktop'), desktopContent.replace(/\r\n/g, '\n'));

// Icon
const iconDir = path.join(dataDir, 'usr', 'share', 'icons', 'hicolor', '512x512', 'apps');
fs.mkdirSync(iconDir, { recursive: true });
const srcIcon = path.join(rootDir, 'public', 'icon.png');
if (fs.existsSync(srcIcon)) {
  fs.copyFileSync(srcIcon, path.join(iconDir, 'elix-ide.png'));
}

// /usr/bin/elix-ide launcher script
const binDir = path.join(dataDir, 'usr', 'bin');
fs.mkdirSync(binDir, { recursive: true });
const launcherContent = `#!/bin/sh
exec "/opt/Elix IDE/elix-ide" "$@"
`;
fs.writeFileSync(path.join(binDir, 'elix-ide'), launcherContent.replace(/\r\n/g, '\n'));

console.log('Compressing control.tar.gz and data.tar.gz with tar...');
const controlTarGz = path.join(tempDir, 'control.tar.gz');
const dataTarGz = path.join(tempDir, 'data.tar.gz');

// Use Windows native tar
execSync(`tar -czf "${controlTarGz}" -C "${controlDir}" .`, { stdio: 'inherit' });
execSync(`tar -czf "${dataTarGz}" -C "${dataDir}" .`, { stdio: 'inherit' });

console.log('Creating Debian AR archive:', outputDeb);

// Function to format AR entry header (60 bytes)
function createArHeader(name, size) {
  const formattedName = (name + '/').padEnd(16, ' ');
  const timestamp = Math.floor(Date.now() / 1000).toString().padEnd(12, ' ');
  const owner = '0'.padEnd(6, ' ');
  const group = '0'.padEnd(6, ' ');
  const mode = '100644'.padEnd(8, ' ');
  const formattedSize = size.toString().padEnd(10, ' ');
  const magic = '`\n';
  return Buffer.from(formattedName + timestamp + owner + group + mode + formattedSize + magic, 'ascii');
}

const debFd = fs.openSync(outputDeb, 'w');

// AR Magic
fs.writeSync(debFd, Buffer.from('!<arch>\n', 'ascii'));

function appendFileToAr(fileName, filePath) {
  const stats = fs.statSync(filePath);
  const header = createArHeader(fileName, stats.size);
  fs.writeSync(debFd, header);
  const data = fs.readFileSync(filePath);
  fs.writeSync(debFd, data);
  if (stats.size % 2 !== 0) {
    fs.writeSync(debFd, Buffer.from('\n', 'ascii'));
  }
}

appendFileToAr('debian-binary', debianBinaryPath);
appendFileToAr('control.tar.gz', controlTarGz);
appendFileToAr('data.tar.gz', dataTarGz);

fs.closeSync(debFd);

console.log('Cleaning up temporary build folder...');
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {
  // ignore
}

console.log('SUCCESS! Created Debian package at:');
console.log(outputDeb);
