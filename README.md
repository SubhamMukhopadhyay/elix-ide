# Elix IDE — Universal Development Environment & Career Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/elix-ide)
[![Version](https://img.shields.io/badge/Version-1.0.0-cyan)](https://github.com/elix-ide)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64-blue)](https://github.com/elix-ide)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

**Elix IDE** is a modern, professional, premium universal development environment combining a high-performance code editor, right-side AI coding agent, universal execution layer (local + cloud warm sandbox), offline capabilities, DSA practice bank with personalized goals, hackathon project manager, and career analytics.

---

## ⚡ Core Philosophy: Zero-Configuration Execution

**Download Elix → Install → Open → Choose Category → Choose Technology → Create → Code → Run**

You are never asked to manually install Python, configure JDK, install GCC/Clang, or edit system `PATH` variables. Elix handles runtime discovery, sandboxing, and execution automatically behind the scenes.

---

## 🚀 Key Features

* **Universal Execution Layer:**
  - Automatic detection of local and bundled runtimes (Node.js, Python 3.12, OpenJDK 17 LTS, C/C++ compiler toolchain).
  - Warm Cloud Sandbox fallback when local runtimes are missing and internet is available.
  - Seamless Online, Local, and Offline state handling with clear user guidance.
* **Category-First Workflow:**
  - Built-in categories: Web Development, Python & AI, Java, C/C++, Rust, Go, .NET / C#, Mobile Development, Game Dev, Desktop Apps, Backend & APIs, AI/ML, Practice & Career, Hackathons.
  - Custom user-created categories with custom icons, descriptions, and non-exclusive tagging.
* **Professional Editor Workspace:**
  - Multi-tab file manager with Monaco Editor.
  - Split view with live integrated Web Preview and Expo-like Mobile Device Simulator (iPhone 16 / Pixel 8 frame with QR code).
  - Breadcrumb navigation, minimap, syntax highlighting, and formatting.
* **Bottom Execution & Terminal Panel:**
  - Real interactive PowerShell / shell terminal tabs.
  - Live execution output with process metrics, exit codes, and timestamps.
  - Problems tab with instant linting and error inspection.
  - Dev server port exposure tracking.
* **Dedicated AI Coding Agent:**
  - Docked right-hand agent supporting Google Gemini, OpenAI, Claude, and Mistral.
  - Permission levels: Read-only, Read + Analyze, Edit Files, Run Commands, Full Agent.
  - Multi-step planning with execution tracking.
  - Atomic visual diff review before applying code modifications (Accept, Reject, Review).
  - AI Practice Mentor with Hint, Guided, Explain, and Interview modes.
* **🎯 Practice & Career Hub:**
  - Extensible Question Bank across DSA, Problem Solving, OOP, DBMS, OS, Computer Networks, and System Design.
  - Separation of central question bank (10,000+ questions) from individual user practice goals (e.g. 127/300 solved).
  - In-IDE code testing with instant test case runner, runtime, and memory metrics.
  - Verified Strength/Weakness analysis and Level Engine (Beginner, Intermediate, Advanced, Expert).
* **🏆 Hackathons Sprint Hub:**
  - Sprints tracker with team members, deadlines, countdowns, and task boards.
* **💼 Career Dashboard & Streaks:**
  - 28-day active heatmap calendar.
  - Skill competency matrix.
  - 1-click resume bullet point export.
* **Project Time Machine:**
  - Snapshots captured before runs or AI edits with 1-click rollback.

---

## 🛠️ Quick Launch

### Running the Pre-Packaged Application
```powershell
& "D:\Engineering\Project\Elex IDE\release\Elix-IDE-win32-x64\Elix IDE.exe"
```

### Developing from Source
```powershell
npm install
npm run dev
```

### Re-packaging the Executable
```powershell
node scripts/build-win.js
```
