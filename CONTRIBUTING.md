# Contributing to Elix IDE

Thank you for contributing to Elix IDE!

## 📜 Development Workflow
1. Fork and clone the repository.
2. Ensure you have Node.js 18+ and Python installed.
3. Install dependencies: `npm install --ignore-scripts`.
4. Run `npm run dev` to start the development shell.
5. Create a branch: `git checkout -b feature/your-feature`.
6. Verify code compiles with `npx tsc --noEmit` and `npx vite build`.
7. Submit a clean Pull Request.

## 📐 Coding Conventions
- TypeScript with strict interfaces.
- Tailored Tailwind utility classes following the Elix obsidian design system (`bg-elix-950`, `bg-elix-900`, `text-cyan-400`, `border-elix-border`).
- Zero hardcoded API keys or credentials.
