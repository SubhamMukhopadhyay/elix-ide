<div align="center">

# Elix IDE

### The Universal AI-Powered Development Environment

[![Release](https://img.shields.io/github/v/release/SubhamMukhopadhyay/elix-ide?color=00e5ff&label=Version)](https://github.com/SubhamMukhopadhyay/elix-ide/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-0b132b)](https://github.com/SubhamMukhopadhyay/elix-ide/releases)
[![Electron](https://img.shields.io/badge/Electron-34.5-47848F?logo=electron&logoColor=white)](https://electronjs.org/)
[![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0.52-blue)](https://microsoft.github.io/monaco-editor/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**Elix IDE** is a modern, high-performance desktop development environment engineered for developers, students, and engineers. It combines a zero-config universal compiler toolchain, an autonomous AI pair-programming agent, an interactive mobile device simulator, and a comprehensive DSA career practice hub into a single, unified workspace.

[Downloads](#downloads) • [Key Features](#key-features) • [Keyboard Shortcuts](#keyboard-shortcuts) • [Architecture](#architecture--system-foundation)

</div>

---

## 💾 Download Elix IDE

Choose the build tailored for your operating system. All official packages are pre-configured, self-contained, and ready for instant deployment.

<table>
  <tr>
    <td align="center" width="33%" valign="top">
      <br/>
      <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Windows-Dark.svg" width="60" height="60" alt="Windows" />
      <h3>Windows</h3>
      <p><b>Windows 10, 11 (64-bit)</b></p>
      <p>Native Setup Wizard with custom directory selector, Start Menu shortcuts & uninstaller.</p>
      <br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Setup-x64.exe">
        <img src="https://img.shields.io/badge/Download_for-Windows_x64-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows .exe" />
      </a>
      <br/><br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Portable-x64.zip">
        <img src="https://img.shields.io/badge/Portable-Windows_.zip-005A9E?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows .zip" />
      </a>
      <br/><br/>
      <sub>Package: <code>.exe</code> (123.5 MB) • <code>.zip</code> (131.5 MB)</sub>
      <br/><br/>
    </td>
    <td align="center" width="33%" valign="top">
      <br/>
      <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Linux-Dark.svg" width="60" height="60" alt="Linux" />
      <h3>Linux</h3>
      <p><b>Ubuntu, Debian, Fedora, Arch</b></p>
      <p>Native deb/rpm packages with desktop launcher integration and portable universal tarball.</p>
      <br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Ubuntu-Debian-amd64.deb">
        <img src="https://img.shields.io/badge/Ubuntu%20%2F%20Debian-.deb-E95420?style=for-the-badge&logo=ubuntu&logoColor=white" alt="Download .deb" />
      </a>
      <br/><br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm">
        <img src="https://img.shields.io/badge/Fedora%20%2F%20RHEL-.rpm-51A2DA?style=for-the-badge&logo=fedora&logoColor=white" alt="Download .rpm" />
      </a>
      <br/><br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Universal-Portable-x64.tar.gz">
        <img src="https://img.shields.io/badge/Universal_Linux-.tar.gz-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Download .tar.gz" />
      </a>
      <br/><br/>
      <sub>Package: <code>.deb</code> (83.0 MB) • <code>.rpm</code> (83.0 MB) • <code>.tar.gz</code> (120.6 MB)</sub>
      <br/><br/>
    </td>
    <td align="center" width="33%" valign="top">
      <br/>
      <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Apple-Dark.svg" width="60" height="60" alt="macOS" />
      <h3>macOS</h3>
      <p><b>macOS 12 Monterey or later</b></p>
      <p>Universal build with native performance on Apple Silicon (M1/M2/M3/M4) and Intel Macs.</p>
      <br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal.dmg">
        <img src="https://img.shields.io/badge/Download_for-macOS_Universal-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download macOS .dmg" />
      </a>
      <br/><br/>
      <a href="https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal-Portable.zip">
        <img src="https://img.shields.io/badge/Portable-macOS_.zip-555555?style=for-the-badge&logo=apple&logoColor=white" alt="Download macOS .zip" />
      </a>
      <br/><br/>
      <sub>Package: <code>.dmg</code> (117.8 MB) • <code>.zip</code> (113.5 MB)</sub>
      <br/><br/>
    </td>
  </tr>
</table>

### 📋 Quick Installation Matrix

| Operating System | Recommended Download | Quick Install / Launch Command |
| :--- | :--- | :--- |
| **🪟 Windows (Installer)** | [`Elix-IDE-Windows-Setup-x64.exe`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Setup-x64.exe) | Double-click wizard or run: `.\Elix-IDE-Windows-Setup-x64.exe` |
| **🪟 Windows (Portable)** | [`Elix-IDE-Windows-Portable-x64.zip`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Windows-Portable-x64.zip) | Extract zip and double-click `Elix IDE.exe` directly |
| **🐧 Ubuntu / Debian / Mint** | [`Elix-IDE-Linux-Ubuntu-Debian-amd64.deb`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Ubuntu-Debian-amd64.deb) | `sudo dpkg -i Elix-IDE-Linux-Ubuntu-Debian-amd64.deb` |
| **🐧 Fedora / RHEL / openSUSE** | [`Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm) | `sudo rpm -ivh Elix-IDE-Linux-Fedora-RHEL-x86_64.rpm` |
| **🐧 Universal Linux** | [`Elix-IDE-Linux-Universal-Portable-x64.tar.gz`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-Linux-Universal-Portable-x64.tar.gz) | `tar -xzf Elix-IDE-Linux-Universal-Portable-x64.tar.gz && ./elix-ide` |
| **🍎 macOS (Universal)** | [`Elix-IDE-macOS-Universal.dmg`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal.dmg) | Drag `Elix IDE.app` into your `/Applications` folder |
| **🍎 macOS (Portable)** | [`Elix-IDE-macOS-Universal-Portable.zip`](https://github.com/SubhamMukhopadhyay/elix-ide/releases/download/v1.0.0/Elix-IDE-macOS-Universal-Portable.zip) | Extract zip and run `Elix IDE.app` |

All releases, package checksums, and changelogs are published on the [Official GitHub Releases](https://github.com/SubhamMukhopadhyay/elix-ide/releases) page.

---

## Key Features

### 1. Universal Zero-Config Execution Layer
No more fighting environment variables or missing toolchains:
* **Automatic Discovery**: Automatically detects local compilers for C/C++ (MinGW/GCC/Clang), Python 3, OpenJDK, Rust, Go, and Node.js.
* **Warm Cloud Sandbox**: Intelligent online execution fallback when local runtimes are unavailable, ensuring code runs anywhere on day one.
* **Integrated Interactive Terminal**: Native xterm.js terminal emulator wired directly to your platform's native shell (PowerShell, Bash, or Zsh).

### 2. Autonomous AI Pair-Programming Agent
A deeply integrated coding copilot that understands your project context:
* **Context Mentions (`@`)**:
  * `@Codebase` — References and searches the entire repository structure.
  * `@CurrentFile` — Attaches the active editor file and cursor context.
  * `@Terminal` — Pulls recent terminal output, stack traces, and compiler errors.
  * `@GitDiff` — Inspects working tree changes and staged modifications.
  * `@Docs` — References language-specific documentation and API signatures.
* **Quick Slash Actions (`/`)**:
  * `/explain` — Step-by-step code architecture and data flow walkthrough.
  * `/fix` — Automatic bug detection, linter resolution, and patch generation.
  * `/test` — Generates comprehensive unit and integration test suites with edge cases.
  * `/refactor` — Modernizes code structure, cleans complexity, and optimizes performance.
  * `/doc` — Generates precise JSDoc, Docstrings, and markdown documentation.
  * `/clear` — Cleans conversation history and resets session memory.
* **Atomic Visual Diff Review**: All AI-proposed file edits are rendered with side-by-side colorized diffs (`Accept & Apply` or `Reject`).

### 3. Interactive Virtual Mobile Simulator
Built specifically for mobile and frontend developers working with React Native, Flutter, and web frameworks:
* **Side-by-Side Split View**: Code on the left in Monaco Editor while previewing the live app on the right.
* **Realistic Device Frames**: Switch between iPhone 16 Pro and Google Pixel 8 frames complete with Dynamic Island, screen curvature, and orientation toggle.
* **Live LAN Wi-Fi QR Code**: Scan with your physical phone to test Expo Go, Flutter web, or local network servers instantly.

### 4. DSA & Technical Interview Practice Hub
Prepare for technical interviews directly inside your IDE:
* **1,000+ Curated Problems**: Comprehensive coverage of Data Structures, Algorithms, System Design, OOP, DBMS, and Computer Networks.
* **Automated Test Runner**: Execute your solution against hidden test cases with execution time and memory benchmarks.
* **Daily Streaks & Competency Matrix**: Track your solving velocity, streak calendar, and topic mastery.

### 5. Local Time Machine
* Instant snapshots created before significant refactors or AI modifications.
* 1-click rollback restores prior workspace state without git commit overhead.

### 6. Native Desktop Polish
* **Dynamic TitleBar Sync**: On Windows 11, the native window caption controls (Minimize, Maximize, Close) dynamically match dark, light, and custom IDE themes.
* **Industry Standard Iconography**: Integrated Seti file icon themes and full Monaco Editor keybindings (`Ctrl+P`, `Ctrl+Shift+P`, `Ctrl+\``).

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + P` | Quick Open File by Name |
| `Ctrl + Shift + P` | Command Palette |
| `Ctrl + \`` | Toggle Interactive Terminal |
| `Ctrl + B` | Toggle Primary Sidebar |
| `Ctrl + Shift + F` | Global Project Search |
| `Ctrl + Shift + L` | Toggle AI Agent Panel |
| `Ctrl + S` | Save Active File |

---

## Architecture & System Foundation

```text
┌─────────────────────────────────────────────────────────────┐
│                          Elix IDE                           │
├──────────────────────────────┬──────────────────────────────┤
│ Frontend Shell & Workspace   │ Core Desktop Process         │
│ • React 18 + TypeScript      │ • Electron 34 Architecture   │
│ • Monaco Editor 0.52 Engine  │ • Native Platform IPC Layer  │
│ • Tailwind CSS Theme System  │ • SQLite Local Storage Engine│
│ • xterm.js Terminal Engine   │ • Git Integration Layer     │
│ • Fast Vite Build Pipeline   │ • Multi-Runtime Discovery    │
└──────────────────────────────┴──────────────────────────────┘
```

---

## Security & Privacy

* **Local-First Execution**: Your source code, files, and project directories remain on your local machine.
* **Controlled AI Sharing**: The integrated AI agent only accesses files and terminal logs that you explicitly attach or mention with `@`.
* **Zero Telemetry Leaks**: Execution sandbox runs locally without streaming code to third-party tracking servers.

---

## License & Copyright

Copyright © 2026 Elix Team. All rights reserved.

Elix IDE is proprietary software. Unauthorized copying, distribution, modification, reverse engineering, or public mirroring of this software and source code via any medium is strictly prohibited.

