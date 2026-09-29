# Elix IDE — Troubleshooting Guide

## Common Questions and Solutions

### 1. "The development environment could not be started"
- Open **Settings → Environments** (or click the Boxes icon in the sidebar/header).
- Click **Repair** next to the relevant language.
- Elix will clear corrupt build artifacts and refresh execution permissions.

### 2. "This environment is not available offline"
- You are in **Offline Mode** and the requested language requires an optional component that was not previously downloaded.
- Switch to **Online Mode** via the connection badge in the header, or click **Install** under Environments.

### 3. Port conflict with Web Dev Server
- If port `5173` or `8000` is already occupied, Elix automatically increments to the next available port. Check the **Ports** tab in the bottom panel for the active URL.

### 4. Re-packaging Executable (.exe)
- If you made changes to source files and wish to update the standalone executable, run:
  ```powershell
  node scripts/build-win.js
  ```
- The new executable will immediately be placed in `release/Elix-IDE-win32-x64/Elix IDE.exe`.
