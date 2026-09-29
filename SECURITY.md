# Elix IDE — Security Architecture

## 🛡️ Security Boundaries

1. **Context Isolation:**
   - The Electron renderer runs with `contextIsolation: true` and `nodeIntegration: false`.
   - All host filesystem and process operations are mediated through the audited `preload.ts` IPC layer.

2. **Process Sandboxing:**
   - Child processes are executed in isolated working directories.
   - Non-zero exit codes, stdout, and stderr are captured and sanitized before display.

3. **Time Machine Rollback Safeguards:**
   - Before executing unknown code or applying AI suggestions, a local project snapshot is recorded to prevent accidental work destruction.

4. **API Credential Protection:**
   - Third-party API keys (Gemini, OpenAI, Anthropic, GitHub) are stored in local user configuration and are never logged or exposed to third parties.
