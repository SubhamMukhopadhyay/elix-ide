import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');

console.log('🔑 Reading GitHub token...');
const credOut = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n'
}).toString();
const token = credOut.split('\n').find(l => l.startsWith('password=')).slice(9).trim();

const OWNER = 'SubhamMukhopadhyay';
const REPO = 'elix-ide';
const TAG = 'v1.0.0';

function apiRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const headers = {
      'User-Agent': 'Elix-Release-Sync',
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };
    if (!options.noAuth) {
      headers.Authorization = `token ${token}`;
    }

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers
    }, (res) => {
      // Follow redirects (for artifact download)
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        const nextUrl = res.headers.location;
        const isExternal = nextUrl.includes('blob.core.windows.net') || !nextUrl.includes('api.github.com');
        return resolve(apiRequest(nextUrl, { ...options, noAuth: isExternal }, postData));
      }

      // Stream directly to file
      if (options.downloadDest) {
        const fileStream = fs.createWriteStream(options.downloadDest);
        res.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(() => resolve({ status: res.statusCode })));
        fileStream.on('error', reject);
        return;
      }

      // Check if binary download requested
      if (options.binary) {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks) }));
        return;
      }

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
          console.error(`❌ Failed ${fileName}: ${res.statusCode} - ${body}`);
          resolve(false);
        }
      });
    });

    req.on('error', reject);
    fs.createReadStream(filePath).pipe(req);
  });
}

async function main() {
  console.log('1. Checking GitHub Release...');
  const relRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`);
  if (relRes.status !== 200) {
    console.error('Release not found:', relRes.status);
    return;
  }
  const release = relRes.data;
  const existingAssets = new Set((release.assets || []).map(a => a.name));
  console.log('Current Release Assets:', Array.from(existingAssets).join(', '));

  console.log('\n2. Checking CI Artifacts from recent runs...');
  const runsRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/actions/runs?per_page=5`);
  const runs = runsRes.data.workflow_runs || [];

  for (const r of runs) {
    console.log(`Checking Run #${r.run_number} (${r.status})...`);
    const artRes = await apiRequest(r.artifacts_url);
    const artifacts = artRes.data.artifacts || [];

    for (const art of artifacts) {
      console.log(`  Artifact: ${art.name} (${(art.size_in_bytes / 1024 / 1024).toFixed(1)} MB)`);

      if (art.name === 'Elix-IDE-Mac-Installer') {
        const destZip = path.join(releaseDir, 'mac-artifacts.zip');
        const extractDir = path.join(releaseDir, 'mac-extracted');

        const needMacAssets = !existingAssets.has('Elix-IDE-Setup.dmg') || !existingAssets.has('Elix-IDE-Setup.zip');
        if (needMacAssets) {
          console.log('  📥 Downloading macOS artifacts...');
          await apiRequest(art.archive_download_url, { downloadDest: destZip });

          console.log('  📦 Extracting macOS files...');
          if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
          fs.mkdirSync(extractDir, { recursive: true });
          execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${destZip.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`);

          const extractedFiles = fs.readdirSync(extractDir);
          for (const file of extractedFiles) {
            if ((file.endsWith('.dmg') || file.endsWith('.zip')) && !existingAssets.has(file)) {
              const filePath = path.join(extractDir, file);
              await uploadAsset(release.upload_url, filePath, file);
              existingAssets.add(file);
            }
          }
        }
      }

      if (art.name === 'Elix-IDE-Linux-Packages') {
        const destZip = path.join(releaseDir, 'linux-artifacts.zip');
        const extractDir = path.join(releaseDir, 'linux-extracted');

        if (!existingAssets.has('Elix-IDE-Setup.rpm')) {
          console.log('  📥 Downloading Linux artifacts for RPM...');
          await apiRequest(art.archive_download_url, { downloadDest: destZip });

          console.log('  📦 Extracting Linux files...');
          if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
          fs.mkdirSync(extractDir, { recursive: true });
          execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${destZip.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force"`);

          const extractedFiles = fs.readdirSync(extractDir);
          for (const file of extractedFiles) {
            if (file.endsWith('.rpm') && !existingAssets.has(file)) {
              const filePath = path.join(extractDir, file);
              await uploadAsset(release.upload_url, filePath, file);
              existingAssets.add(file);
            }
          }
        }
      }
    }
  }

  console.log('\n3. Updating Release Body with Visual Download Showcase...');
  const updatedBody = `## Elix IDE v1.0.0 — Production Release

Universal AI-Powered Development Environment, Intelligent AI Coding Agent & Career Practice Platform.

---

### 🪟 Windows
- **Installer**: [\`Elix-IDE-Setup.exe\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Setup.exe) (96.7 MB)
- **Architecture**: 64-bit (\`x64\`)
- **Compatibility**: Windows 10, Windows 11
- **Features**: Interactive Setup Wizard with custom directory selector, start menu shortcuts, and clean uninstaller.

---

### 🐧 Linux
- **Ubuntu / Debian / Mint**: [\`Elix-IDE-Setup.deb\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Setup.deb) (126.8 MB) — Install via \`sudo dpkg -i Elix-IDE-Setup.deb\`
- **Universal Portable**: [\`Elix-IDE-Setup.tar.gz\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Setup.tar.gz) (126.7 MB) — Extract & run on any Linux distribution
- **Features**: Native system desktop launcher, icon integration, and terminal hooks.

---

### 🍎 macOS
- **Disk Image**: [\`Elix-IDE-Setup.dmg\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Setup.dmg) (Apple Silicon M1/M2/M3/M4 & Intel)
- **Portable Zip**: [\`Elix-IDE-Setup.zip\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Setup.zip)
- **Compatibility**: macOS 12.0 Monterey or later
- **Features**: Universal binary for both Apple Silicon and Intel Macs.

---
*All packages are standalone, self-contained, pre-configured, and ready for instant deployment.*`;

  const patchRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${release.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ body: updatedBody }));

  if (patchRes.status === 200) {
    console.log('✅ GitHub Release body updated successfully with clear OS sections!');
  }

  console.log('\n🎉 ALL DONE! Check release at: https://github.com/' + OWNER + '/' + REPO + '/releases/tag/' + TAG);
}

main().catch(console.error);
