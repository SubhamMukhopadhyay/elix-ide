# Elix IDE — System Architecture

This document details the modular architecture, execution abstraction, database models, and IPC design of **Elix IDE**.

---

## 🏛️ High-Level Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ELIX IDE SHELL (ELECTRON)                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│      RENDERER PROCESS (REACT)    │      MAIN PROCESS (NODE.JS)         │
│  • Startup Animation             │  • Window Lifecycle                 │
│  • Header & View Switchers       │  • DatabaseService (Atomic Storage) │
│  • Category-First Home           │  • ExecutionEngine (Local/Cloud)    │
│  • Monaco Editor & File Tree     │  • EnvironmentManager               │
│  • Integrated Web & Mobile Sim   │  • QuestionBankService              │
│  • Practice Hub & Test Runner    │  • GitService                       │
│  • AI Agent & Diff Review Drawer │  • AiService                        │
│  • Bottom Panel (Terminal/Logs)  │  • TimeMachineService               │
│  • Universal Search (Ctrl+K)     │  • TerminalService (Interactive PTY)│
├──────────────────────────────────┴─────────────────────────────────────┤
│                          PRELOAD IPC BRIDGE                            │
│                 window.elix.* (contextIsolation: true)                 │
└────────────────────────────────────────────────────────────────────────┘
                                    │
               ┌────────────────────┴───────────────────┐
               ▼                                        ▼
   LOCAL EXECUTION LAYER                     CLOUD WARM SANDBOX POOL
   • Bundled/System Node.js                  • Isolated Container/VM
   • Bundled/System Python 3.12              • Streaming Stdout/Stderr
   • Bundled/System OpenJDK 17               • Port Forwarding
   • Bundled/System C++ Toolchain            • Zero-config Cloud Fallback
```

---

## 🔌 Core Services Architecture

### 1. Execution Provider Abstraction (`electron/services/ExecutionEngine.ts`)
- **LocalExecutionEngine**: Executes programs directly using local runtimes via `child_process.spawn`. Handles exit codes, PID tracking, and graceful termination.
- **CloudExecutionEngine**: Simulated warm-container sandbox that connects seamlessly when a runtime is not available locally and the machine is online.
- **Network Awareness**: Automatically switches between `online`, `local`, and `offline` modes. In offline mode, if a missing runtime is requested, it provides clear guidance instead of failing silently.

### 2. Environment Manager (`electron/services/EnvironmentManager.ts`)
- Discovers installed compilers and runtimes.
- Manages optional components (Flutter, Android SDK, Rust, Go).
- Features automatic repair: cleans broken caches, resets execution flags, and re-validates sandbox boundaries.

### 3. Practice Engine & Question Bank (`electron/services/QuestionBankService.ts`)
- Separates question content from individual user practice goals.
- Provides test-case runner with expected vs. actual output matching, runtime measurement, and memory tracking.
- Calculates dynamic topic mastery and computes user levels (Beginner, Intermediate, Advanced, Expert).

### 4. AI Coding Agent & Practice Mentor (`electron/services/AiService.ts`)
- Multi-step planning pipeline.
- Visual diff generator: presents atomic before/after diffs with user-controlled Accept/Reject workflows.
- Dedicated Practice Mentor with Hint, Guided, Explain, and Interview modes.

### 5. Time Machine Service (`electron/services/TimeMachineService.ts`)
- Creates lightweight workspace snapshots before major AI modifications or runs.
- Offers 1-click full workspace rollback.
