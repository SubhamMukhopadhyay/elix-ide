# Elix IDE — Environments & Runtime Architecture

## 📦 Runtime Provisioning Overview

Elix eliminates manual compiler and PATH setup through a two-tier execution design:

### 1. Essential Runtimes
- **Node.js / TypeScript**: Bundled engine for full-stack and web applications.
- **Python 3.12**: Discovered from system or bundled interpreter with virtual environment isolation.
- **OpenJDK 17 LTS**: Discovered from system Java runtime or bundled JDK.
- **C/C++ Toolchain**: GCC/Clang with local fallback sandbox.

### 2. Automatic Optional Component System
For heavy frameworks that should not inflate the initial download:
- **Flutter SDK**: Downloaded on demand when online, verified, and configured with zero PATH setup.
- **Android SDK / Command-line Tools**: Automatically managed through Settings → Environments.
- **Rust & Cargo**: 1-click install and registration.
- **Go Toolchain**: 1-click install and registration.

### 3. Automatic Online / Local / Offline States
- **Online**: Full cloud sandbox execution, package downloads, AI agent active.
- **Local**: Local runtimes active, offline practice database active, Git operations active.
- **Offline**: Missing runtimes display clear guidance: *"This environment is not available offline. Connect to the internet once to install it."* with Retry, Go Online, and View Details options.

### 4. Self-Healing & Environment Repair
Under `Settings → Environments → Repair`:
- Diagnostics run across runtime binaries.
- Broken build caches and temporary lockfiles are removed.
- Sandbox execution flags are restored.
