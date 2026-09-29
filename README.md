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

## Downloads

Download the latest production release of Elix IDE for your operating system:

| Operating System | Package Format | Target Architecture | Description |
| :--- | :--- | :--- | :--- |
| **Windows 10, 11** | `Elix-IDE-Setup.exe` | `x64` | Full installer wizard with custom directory picker & clean uninstaller |
| **Ubuntu / Debian / Mint** | `Elix-IDE-Setup.deb` | `amd64` | Native Debian package for 1-click system installation |
| **Fedora / RHEL / openSUSE** | `Elix-IDE-Setup.rpm` | `x86_64` | Native Red Hat package manager binary |
| **Universal Linux** | `Elix-IDE-Setup.tar.gz` | `x64` | Portable install-free archive (extract and run on any Linux distro) |
| **macOS (Apple)** | `Elix-IDE-Setup.dmg` | `Universal (ARM/Intel)` | Drag-and-drop installer image for macOS 12.0+ |

All release packages and checksums are published under [GitHub Releases](https://github.com/SubhamMukhopadhyay/elix-ide/releases).

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

