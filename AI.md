# Elix IDE — AI Coding Agent & Mentor System

## 🤖 Philosophy
AI in Elix is cloud/API-based only:
- No local weights or heavyweight local LLMs are downloaded.
- Cloud providers supported: Google Gemini, OpenAI (GPT-4o, o1), Anthropic Claude, and Mistral.
- AI is strictly optional — Elix functions fully as an offline IDE and Practice platform without any network connection.

## 🛡️ Permission System
Elix provides a fine-grained permission control dropdown in the AI Agent header:
1. **Read-only**: Inspects workspace files without ability to suggest modifications.
2. **Read + Analyze**: Analyzes structure, dependencies, and algorithms.
3. **Edit Files**: Can propose code diffs (requires user approval).
4. **Run Commands**: Can trigger project builds and test runs.
5. **Full Agent**: Coordinates multi-step plans and prepares atomic diffs.

## 🔍 Diff Review Workflow
Before any AI-proposed modification touches user source code:
1. The AI Agent displays an atomic proposed change card showing filename and status.
2. The user can inspect the proposed diff.
3. User selects **Accept & Apply** or **Reject**.
4. Time Machine automatically snapshots the project before changes are applied, allowing 1-click rollback.

## 🎓 AI Practice Mentor Modes
- **Hint Mode**: High-level algorithmic hints avoiding direct answers.
- **Guided Mode**: Breaks problems down into 3 structured steps.
- **Explain Mode**: Detailed time and space complexity breakdown.
- **Interview Mode**: Simulates real technical interview follow-up questions.
