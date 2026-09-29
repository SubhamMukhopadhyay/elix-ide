import https from 'https';
import { execSync } from 'child_process';

const credOut = execSync('git credential fill', {
  input: 'protocol=https\nhost=github.com\n\n'
}).toString();
const token = credOut.split('\n').find(l => l.startsWith('password=')).slice(9).trim();

const body = `## Elix IDE v1.0.0 — Production Release

Universal AI-Powered Development Environment & Career Practice Platform.

---

### 🪟 Windows (10 / 11 64-bit)
* **Setup Installer**: [\`Elix-IDE-Windows-Setup.exe\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Setup.exe) (123.5 MB)
* **Portable Standalone**: [\`Elix-IDE-Windows-Portable.zip\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Portable.zip) (131.5 MB)

---

### 🐧 Linux
* **Ubuntu / Debian / Mint**: [\`Elix-IDE-Linux.deb\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux.deb) (83.0 MB)
* **Fedora / RHEL / openSUSE**: [\`Elix-IDE-Linux.rpm\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux.rpm) (83.0 MB)
* **Universal Standalone**: [\`Elix-IDE-Linux.tar.gz\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux.tar.gz) (120.6 MB)

---

### 🍎 macOS (macOS 12 Monterey or later)
* **Apple Disk Image**: [\`Elix-IDE-Mac.dmg\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Mac.dmg) (117.8 MB — Apple Silicon & Intel)
* **Portable Archive**: [\`Elix-IDE-Mac.zip\`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Mac.zip) (113.5 MB)

---
*All packages are pre-configured, standalone, and ready for instant deployment.*`;

function api(path, method, data = null) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'NodeJS',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const getRes = await api('/repos/SubhamMukhopadhyay/elix-ide/releases/tags/v1.0.0', 'GET');
  const release = JSON.parse(getRes.data);
  const patchRes = await api(`/repos/SubhamMukhopadhyay/elix-ide/releases/${release.id}`, 'PATCH', { body });
  console.log('Update release body status:', patchRes.status);
}

main();
