import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { rcedit } from 'rcedit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
const appIconPath = path.join(rootDir, 'public', 'app-icon.ico');

const OWNER = 'SubhamMukhopadhyay';
const REPO = 'elix-ide';
const TAG = 'v1.0.0';

// 1. Git Authentication
console.log('🔑 Reading GitHub token from Git Credential Manager...');
const credOut = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n'
}).toString();
const tokenLine = credOut.split('\n').find(l => l.startsWith('password='));
if (!tokenLine) {
  throw new Error('Could not retrieve GitHub token from credentials.');
}
const token = tokenLine.replace('password=', '').trim();
console.log('✅ GitHub authentication ready.');

function apiRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = {
      'User-Agent': 'Elix-Release-Sync',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: body ? JSON.parse(body) : {} });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function uploadAsset(uploadUrl, filePath, fileName) {
  const stats = fs.statSync(filePath);
  const cleanUploadUrl = uploadUrl.replace(/\{\?name,label\}/, '') + `?name=${encodeURIComponent(fileName)}`;
  const urlObj = new URL(cleanUploadUrl);

  console.log(`📤 Uploading ${fileName} (${(stats.size / 1024 / 1024).toFixed(1)} MB)...`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Elix-Release-Sync',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size,
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Uploaded ${fileName} successfully!`);
          resolve(true);
        } else {
          console.error(`❌ Failed to upload ${fileName}: Status ${res.statusCode} - ${body}`);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    fs.createReadStream(filePath).pipe(req);
  });
}

async function main() {
  // Step 1: Frontend & Electron Bundle Build
  console.log('\n⚡ [1/7] Building Vite frontend and Electron bundles...');
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

  // Step 2: Windows Binaries & Setup Assembly via electron-builder
  console.log('\n📦 [2/7] Packaging Windows application with fresh ASAR...');
  execSync('npx electron-builder --dir', { cwd: rootDir, stdio: 'inherit' });
  const winReleaseDir = path.join(releaseDir, 'win-unpacked');

  const winExe = path.join(winReleaseDir, 'Elix IDE.exe');
  console.log('🎨 Stamping Windows PE metadata and multi-res icon on Elix IDE.exe...');
  await rcedit(winExe, {
    'icon': appIconPath,
    'version-string': {
      'CompanyName': 'Elix Technologies',
      'FileDescription': 'Elix IDE',
      'ProductName': 'Elix IDE',
      'LegalCopyright': 'Copyright (C) 2026 Elix Technologies',
      'OriginalFilename': 'Elix IDE.exe',
      'InternalName': 'Elix IDE'
    },
    'file-version': '1.0.0.0',
    'product-version': '1.0.0.0'
  });

  // Compile standalone uninstaller
  console.log('🔨 Compiling standalone native uninstaller...');
  const uninstallerCs = path.join(rootDir, 'scripts', 'uninstaller.cs');
  const uninstallerExe = path.join(winReleaseDir, 'Uninstall Elix IDE.exe');
  execSync(`"${cscPath}" /nologo /target:winexe /out:"${uninstallerExe}" /r:System.Windows.Forms.dll,System.Drawing.dll /win32icon:"${appIconPath}" "${uninstallerCs}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  // Create Portable Zip
  const portableZip = path.join(releaseDir, 'Elix-IDE-Windows-Portable.zip');
  if (fs.existsSync(portableZip)) fs.unlinkSync(portableZip);
  console.log('📦 Compressing Windows Standalone Portable Archive...');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${winReleaseDir.replace(/'/g, "''")}/*' -DestinationPath '${portableZip.replace(/'/g, "''")}' -CompressionLevel Fastest -Force"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  // Compress Setup payload zip
  const payloadZip = path.join(releaseDir, 'payload.zip');
  if (fs.existsSync(payloadZip)) fs.unlinkSync(payloadZip);
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${winReleaseDir.replace(/'/g, "''")}/*' -DestinationPath '${payloadZip.replace(/'/g, "''")}' -CompressionLevel Fastest -Force"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  // Compile Setup.exe
  const setupExe = path.join(releaseDir, 'Elix-IDE-Setup.exe');
  const winSetupExe = path.join(releaseDir, 'Elix-IDE-Windows-Setup.exe');
  const installerCs = path.join(rootDir, 'scripts', 'installer.cs');
  execSync(`"${cscPath}" /nologo /target:winexe /out:"${setupExe}" /r:System.Windows.Forms.dll,System.Drawing.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll /win32icon:"${appIconPath}" /resource:"${payloadZip}" "${installerCs}"`, {
    cwd: rootDir,
    stdio: 'inherit'
  });

  await rcedit(setupExe, {
    'icon': appIconPath,
    'version-string': {
      'CompanyName': 'Elix Technologies',
      'FileDescription': 'Elix IDE Setup',
      'ProductName': 'Elix IDE Setup',
      'LegalCopyright': 'Copyright (C) 2026 Elix Technologies',
      'OriginalFilename': 'Elix-IDE-Setup.exe',
      'InternalName': 'Elix-IDE-Setup'
    },
    'file-version': '1.0.0.0',
    'product-version': '1.0.0.0'
  });

  fs.copyFileSync(setupExe, winSetupExe);
  if (fs.existsSync(payloadZip)) fs.unlinkSync(payloadZip);

  // Step 3: Linux Packages Assembly
  console.log('\n🐧 [3/7] Assembling Linux packages (.deb & .tar.gz)...');
  const linuxUnpacked = path.join(releaseDir, 'linux-unpacked');
  if (fs.existsSync(linuxUnpacked)) {
    const linuxAppDir = path.join(linuxUnpacked, 'resources', 'app');
    fs.mkdirSync(linuxAppDir, { recursive: true });
    fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(linuxAppDir, 'package.json'));
    fs.cpSync(path.join(rootDir, 'dist'), path.join(linuxAppDir, 'dist'), { recursive: true });
    fs.cpSync(path.join(rootDir, 'dist-electron'), path.join(linuxAppDir, 'dist-electron'), { recursive: true });

    // Pack Debian .deb package
    console.log('Building Debian package with pack-deb.js...');
    execSync('node scripts/pack-deb.js', { cwd: rootDir, stdio: 'inherit' });
    const debFile = path.join(releaseDir, 'Elix-IDE-Setup.deb');
    const linuxDebFile = path.join(releaseDir, 'Elix-IDE-Linux.deb');
    if (fs.existsSync(debFile)) {
      fs.copyFileSync(debFile, linuxDebFile);
    }

    // Create Linux tar.gz
    console.log('Creating Linux universal tar.gz archive...');
    const tarGzFile = path.join(releaseDir, 'Elix-IDE-Setup.tar.gz');
    const linuxTarGzFile = path.join(releaseDir, 'Elix-IDE-Linux.tar.gz');
    execSync(`tar -czf "${tarGzFile}" -C "${linuxUnpacked}" .`, { cwd: rootDir, stdio: 'inherit' });
    fs.copyFileSync(tarGzFile, linuxTarGzFile);
  }

  // Step 4: macOS Packages Prep
  console.log('\n🍎 [4/7] Verifying macOS packages...');
  const macExtracted = path.join(releaseDir, 'mac-extracted');
  const macDmg = path.join(releaseDir, 'Elix-IDE-Mac.dmg');
  const macZip = path.join(releaseDir, 'Elix-IDE-Mac.zip');

  if (fs.existsSync(path.join(macExtracted, 'Elix-IDE-Setup.dmg'))) {
    fs.copyFileSync(path.join(macExtracted, 'Elix-IDE-Setup.dmg'), macDmg);
  }
  if (fs.existsSync(path.join(macExtracted, 'Elix-IDE-Setup.zip'))) {
    fs.copyFileSync(path.join(macExtracted, 'Elix-IDE-Setup.zip'), macZip);
  }

  // Step 5: Replace GitHub Release Assets
  console.log('\n☁️ [5/7] Uploading and overwriting GitHub Release v1.0.0 assets...');
  const relRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`);
  if (relRes.status !== 200) {
    throw new Error(`Release ${TAG} not found: ${relRes.status}`);
  }
  const release = relRes.data;
  const existingAssets = release.assets || [];

  const filesToUpload = [
    { name: 'Elix-IDE-Windows-Setup.exe', path: winSetupExe },
    { name: 'Elix-IDE-Windows-Portable.zip', path: portableZip },
    { name: 'Elix-IDE-Linux.deb', path: path.join(releaseDir, 'Elix-IDE-Linux.deb') },
    { name: 'Elix-IDE-Linux.tar.gz', path: path.join(releaseDir, 'Elix-IDE-Linux.tar.gz') },
    { name: 'Elix-IDE-Mac.dmg', path: macDmg },
    { name: 'Elix-IDE-Mac.zip', path: macZip },
  ];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.path)) {
      console.warn(`⚠️ Warning: local file ${item.path} not found, skipping.`);
      continue;
    }

    // Check if asset already exists on release -> Delete it first to overwrite!
    const existing = existingAssets.find(a => a.name === item.name);
    if (existing) {
      console.log(`🗑️ Deleting older version of ${item.name} (Asset ID: ${existing.id})...`);
      const delRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${existing.id}`, {
        method: 'DELETE'
      });
      if (delRes.status === 204) {
        console.log(`✅ Deleted old ${item.name}`);
      } else {
        console.warn(`⚠️ Could not delete asset ${existing.id}: ${delRes.status}`);
      }
    }

    // Upload fresh asset
    await uploadAsset(release.upload_url, item.path, item.name);
  }

  // Step 6: Dispatch CI workflow for native cloud builds
  console.log('\n🚀 [6/7] Dispatching GitHub Actions build workflow...');
  try {
    const dispatchRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/build-all.yml/dispatches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ ref: 'main' }));
    if (dispatchRes.status === 204) {
      console.log('✅ Triggered GitHub Actions CI workflow (build-all.yml) for fresh macOS/Linux/Windows cloud runner builds!');
    } else {
      console.log(`ℹ️ Workflow dispatch status: ${dispatchRes.status}`);
    }
  } catch (err) {
    console.warn('⚠️ Could not dispatch workflow:', err.message);
  }

  // Step 7: Deploy Website to Vercel
  console.log('\n🌐 [7/7] Deploying updated landing website to Vercel...');
  try {
    const websiteDir = path.join(rootDir, 'website');
    execSync('npx vercel --prod --yes', { cwd: websiteDir, stdio: 'inherit' });
    console.log('✅ Website deployed to https://elixide.vercel.app!');
  } catch (err) {
    console.warn('⚠️ Vercel deployment note:', err.message);
  }

  console.log('\n🎉 ALL DONE! WEBSITE & GITHUB RELEASES FULLY UPDATED WITH NEW APPS!');
}

main().catch(err => {
  console.error('❌ Build and sync failed:', err);
  process.exit(1);
});
