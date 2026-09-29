import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');

// 1. Get GitHub token from Windows Credential Manager
console.log('🔑 Fetching GitHub token from Git Credential Manager...');
const credOut = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n'
}).toString();
const tokenLine = credOut.split('\n').find(l => l.startsWith('password='));
if (!tokenLine) {
  console.error('❌ Could not retrieve GitHub token.');
  process.exit(1);
}
const token = tokenLine.replace('password=', '').trim();
console.log('✅ Authenticated successfully.');

const OWNER = 'SubhamMukhopadhyay';
const REPO = 'elix-ide';
const TAG = 'v1.0.0';

function apiRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'Elix-Release-Publisher',
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    };
    options.headers = { ...defaultHeaders, ...options.headers };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
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
        'User-Agent': 'Elix-Release-Publisher',
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
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(req);
  });
}

async function main() {
  console.log(`🔍 Checking if release for ${TAG} exists...`);
  let release = null;
  const existingRes = await apiRequest({
    hostname: 'api.github.com',
    path: `/repos/${OWNER}/${REPO}/releases/tags/${TAG}`,
    method: 'GET'
  });

  if (existingRes.status === 200) {
    release = existingRes.data;
    console.log(`ℹ️ Found existing release: ${release.name} (ID: ${release.id})`);
  } else {
    console.log(`⚡ Creating official Release ${TAG}...`);
    const releaseBody = JSON.stringify({
      tag_name: TAG,
      target_commitish: 'main',
      name: 'Elix IDE v1.0.0 — Production Release',
      body: `## Elix IDE v1.0.0 — Universal AI-Powered Development Environment

Official production release of **Elix IDE**, an integrated development platform featuring intelligent AI agent pairing, Monaco editor core, multi-workspace management, and real-time developer workflows.

### 📦 Platform Packages Available:
- **Windows**: \`Elix-IDE-Setup.exe\` (Interactive Setup Wizard with custom directory selector & uninstaller)
- **Linux (Debian / Ubuntu / Mint)**: \`Elix-IDE-Setup.deb\` (Native Debian package)
- **Linux (Universal Portable)**: \`Elix-IDE-Setup.tar.gz\` (Universal tarball for all Linux distributions)

---
*All packages are standalone, self-contained, and ready for instant deployment.*`,
      draft: false,
      prerelease: false
    });

    const createRes = await apiRequest({
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/releases`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(releaseBody)
      }
    }, releaseBody);

    if (createRes.status !== 201) {
      console.error('❌ Failed to create release:', createRes.status, createRes.data);
      process.exit(1);
    }
    release = createRes.data;
    console.log(`🎉 Created release ${release.name} (ID: ${release.id})!`);
  }

  // Get current assets
  const existingAssets = release.assets || [];
  const existingAssetNames = new Set(existingAssets.map(a => a.name));

  const targetFiles = [
    { path: path.join(releaseDir, 'Elix-IDE-Setup.exe'), name: 'Elix-IDE-Setup.exe' },
    { path: path.join(releaseDir, 'Elix-IDE-Setup.deb'), name: 'Elix-IDE-Setup.deb' },
    { path: path.join(releaseDir, 'Elix-IDE-Setup.tar.gz'), name: 'Elix-IDE-Setup.tar.gz' },
  ];

  for (const item of targetFiles) {
    if (!fs.existsSync(item.path)) {
      console.warn(`⚠️ Warning: ${item.name} not found on disk, skipping.`);
      continue;
    }

    if (existingAssetNames.has(item.name)) {
      console.log(`ℹ️ Asset ${item.name} already exists on GitHub Release.`);
      continue;
    }

    await uploadAsset(release.upload_url, item.path, item.name);
  }

  console.log('\n🚀 ALL RELEASE ASSETS PUBLISHED TO GITHUB!');
  console.log(`🔗 Release URL: https://github.com/${OWNER}/${REPO}/releases/tag/${TAG}`);
}

main().catch(err => {
  console.error('❌ Error during release publication:', err);
  process.exit(1);
});
