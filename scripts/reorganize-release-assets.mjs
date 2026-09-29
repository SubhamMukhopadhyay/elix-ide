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
      'User-Agent': 'Elix-Release-Reorganizer',
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

async function uploadAsset(uploadUrl, filePath, fileName, label) {
  const stats = fs.statSync(filePath);
  const cleanUploadUrl = uploadUrl.replace(/\{\?name,label\}/, '') + 
    `?name=${encodeURIComponent(fileName)}&label=${encodeURIComponent(label)}`;
  const urlObj = new URL(cleanUploadUrl);

  console.log(`📤 Uploading ${fileName} (${(stats.size / 1024 / 1024).toFixed(1)} MB) [${label}]...`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Elix-Release-Reorganizer',
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

async function updateAssetMetadata(assetId, name, label) {
  console.log(`🏷️ Updating asset ${assetId} -> name: "${name}", label: "${label}"...`);
  const res = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${assetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ name, label }));

  if (res.status === 200) {
    console.log(`✅ Successfully updated ${name}`);
  } else {
    console.error(`❌ Failed updating asset ${assetId}:`, res.status, res.data);
  }
}

async function main() {
  console.log('1. Fetching Release info...');
  const relRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`);
  if (relRes.status !== 200) {
    console.error('Release not found:', relRes.status);
    return;
  }
  const release = relRes.data;
  const assets = release.assets || [];

  console.log(`Found ${assets.length} assets on release.`);

  // Mapping from current names to clean, platform-separated names + descriptive labels
  const renameMap = {
    'Elix-IDE-Setup.exe': {
      name: 'Elix-IDE-Windows-Setup-x64.exe',
      label: 'Windows: 10 / 11 64-bit Setup Wizard (.exe)'
    },
    'Elix-IDE-Setup.deb': {
      name: 'Elix-IDE-Linux-Ubuntu-Debian-amd64.deb',
      label: 'Linux: Ubuntu, Debian, Mint (.deb)'
    },
    'Elix-IDE-Setup.rpm': {
      name: 'Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm',
      label: 'Linux: Fedora, RHEL, openSUSE (.rpm)'
    },
    'Elix-IDE-Setup.tar.gz': {
      name: 'Elix-IDE-Linux-Universal-Portable-x64.tar.gz',
      label: 'Linux: Universal Portable Archive (.tar.gz)'
    },
    'Elix-IDE-Setup.dmg': {
      name: 'Elix-IDE-macOS-Universal.dmg',
      label: 'macOS: Apple Silicon & Intel Disk Image (.dmg)'
    },
    'Elix-IDE-Setup.zip': {
      name: 'Elix-IDE-macOS-Universal-Portable.zip',
      label: 'macOS: Universal Portable Archive (.zip)'
    }
  };

  // Update existing assets
  for (const a of assets) {
    if (renameMap[a.name]) {
      const target = renameMap[a.name];
      await updateAssetMetadata(a.id, target.name, target.label);
    }
  }

  // Upload Windows Portable ZIP if not present
  const existingNames = new Set(assets.map(a => a.name));
  const winPortableZip = path.join(releaseDir, 'Elix-IDE-Windows-Portable.zip');

  if (fs.existsSync(winPortableZip) && !existingNames.has('Elix-IDE-Windows-Portable-x64.zip')) {
    console.log('\n2. Uploading Windows Portable ZIP package...');
    await uploadAsset(
      release.upload_url,
      winPortableZip,
      'Elix-IDE-Windows-Portable-x64.zip',
      'Windows: 10 / 11 64-bit Portable Standalone (.zip)'
    );
  }

  console.log('\n3. Updating Release Description with Separated Platform Sections...');
  const releaseBody = `## Elix IDE v1.0.0 — Production Release

Universal AI-Powered Development Environment, Intelligent AI Pair-Programming Agent & Career Practice Platform.

---

### 🪟 Windows (Windows 10 / 11 64-bit)
| Package | Format | Description | Direct Download |
| :--- | :--- | :--- | :--- |
| **Setup Wizard** | \`.exe\` | Standard installer with custom install directory & uninstaller | [Download .exe](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Setup-x64.exe) |
| **Portable Standalone** | \`.zip\` | No installation required — extract and run \`Elix IDE.exe\` | [Download .zip](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Portable-x64.zip) |

---

### 🐧 Linux (Debian, Ubuntu, Fedora, RHEL, openSUSE, Arch)
| Package | Format | Target Distribution | Direct Download |
| :--- | :--- | :--- | :--- |
| **Debian / Ubuntu** | \`.deb\` | Ubuntu, Debian, Linux Mint, Pop!_OS (\`sudo dpkg -i\`) | [Download .deb](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Ubuntu-Debian-amd64.deb) |
| **Fedora / RHEL** | \`.rpm\` | Fedora, Red Hat Enterprise Linux, openSUSE (\`sudo rpm -ivh\`) | [Download .rpm](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm) |
| **Universal Portable** | \`.tar.gz\` | Works on all Linux distros — extract and run \`./elix-ide\` | [Download .tar.gz](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Universal-Portable-x64.tar.gz) |

---

### 🍎 macOS (macOS 12 Monterey or later)
| Package | Format | Architecture | Direct Download |
| :--- | :--- | :--- | :--- |
| **Disk Image** | \`.dmg\` | Universal (Apple Silicon M1/M2/M3/M4 + Intel) | [Download .dmg](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal.dmg) |
| **Portable Archive** | \`.zip\` | Universal (Apple Silicon M1/M2/M3/M4 + Intel) | [Download .zip](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal-Portable.zip) |

---
*All packages are standalone, pre-configured, self-contained, and ready for instant deployment.*`;

  const patchRes = await apiRequest(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${release.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ body: releaseBody }));

  if (patchRes.status === 200) {
    console.log('✅ GitHub Release body updated with clearly separated OS tables!');
  }

  console.log('\n🚀 ALL DONE! Check release at: https://github.com/' + OWNER + '/' + REPO + '/releases/tag/' + TAG);
}

main().catch(console.error);
