import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { AiMessage, AiPermissionLevel, AiConfig } from '../../src/types';
import { DatabaseService } from './DatabaseService';

export interface AiTaskRequest {
  prompt: string;
  projectPath: string;
  currentFilePath?: string;
  currentFileContent?: string;
  attachments?: { name: string; type: 'file' | 'folder' | 'log' | 'image'; content: string }[];
  permissionLevel?: AiPermissionLevel;
  mentorMode?: 'hint' | 'guided' | 'explain' | 'full' | 'interview';
  isPracticeMentor?: boolean;
  questionDetails?: {
    id?: string;
    title?: string;
    difficulty?: string;
    topics?: string[];
    description?: string;
    hints?: string[];
    solutionExplanation?: string;
    timeComplexityTarget?: string;
    spaceComplexityTarget?: string;
    userCode?: string;
    language?: string;
  };
  model?: string;
}

// Automatic failover chains when a free model hits quota / rate limit (HTTP 429)
const OPENROUTER_FREE_CHAIN = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
  'deepseek/deepseek-r1:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free'
];

const GROQ_FREE_CHAIN = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it'
];

const NVIDIA_FREE_CHAIN = [
  'meta/llama-3.3-70b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'meta/llama-3.1-8b-instruct'
];

const GEMINI_FREE_CHAIN = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro'
];

export interface LlmResult {
  text: string;
  provider: string;
  model: string;
  wasAutoSwitched?: boolean;
}

export class AiService {
  private static instance: AiService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * Universal LLM API caller with Automatic Model Failover:
   * When one model quota or rate limit is reached, it seamlessly switches to the next free model.
   */
  private async callLlm(config: AiConfig, sysPrompt: string, userPrompt: string): Promise<LlmResult | null> {
    if (!config.apiKey && config.provider !== 'ollama') {
      return null;
    }

    const provider = config.provider || 'gemini';
    const rawModel = (config.model || '').trim();

    try {
      // 1. Google Gemini (Google AI Studio) with auto-failover
      if (provider === 'gemini') {
        const geminiCandidates = Array.from(new Set([rawModel || 'gemini-1.5-flash', ...GEMINI_FREE_CHAIN]));
        for (let i = 0; i < geminiCandidates.length; i++) {
          const m = geminiCandidates[i];
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${config.apiKey.trim()}`;
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${sysPrompt}\n\n${userPrompt}` }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 4000 }
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                return {
                  text,
                  provider: 'Google Gemini',
                  model: m,
                  wasAutoSwitched: i > 0
                };
              }
            } else if (resp.status === 429) {
              console.warn(`Gemini model ${m} rate-limited (429), auto-switching to next candidate...`);
              continue;
            } else {
              const errBody = await resp.text();
              console.error(`Gemini API error (${resp.status}):`, errBody);
              return {
                text: `❌ Gemini API Error (${resp.status}): ${errBody}`,
                provider: 'Google Gemini',
                model: m
              };
            }
          } catch (e: any) {
            console.warn(`Gemini candidate ${m} error:`, e);
            if (i === geminiCandidates.length - 1) {
              return {
                text: `❌ Gemini Connection Error: ${e.message}`,
                provider: 'Google Gemini',
                model: m
              };
            }
          }
        }
        return null;
      }

      // 2. Anthropic Claude
      if (provider === 'anthropic') {
        const activeModel = rawModel || 'claude-3-5-sonnet-20241022';
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey.trim(),
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: activeModel,
            system: sysPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: 4000,
            temperature: 0.3
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.content?.[0]?.text;
          if (text) return { text, provider: 'Anthropic Claude', model: activeModel };
        }
        return null;
      }

      // 3. OpenRouter (Multi-Model Auto Fallback)
      if (provider === 'openrouter') {
        const candidates = Array.from(new Set([rawModel || OPENROUTER_FREE_CHAIN[0], ...OPENROUTER_FREE_CHAIN]));
        const endpointUrl = 'https://openrouter.ai/api/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`,
          'HTTP-Referer': 'https://elix.dev',
          'X-Title': 'Elix IDE'
        };

        // Try primary with OpenRouter native fallback array first
        try {
          const resp = await fetch(endpointUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: candidates[0],
              models: candidates, // OpenRouter native fallback parameter
              messages: [
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.3,
              max_tokens: 4000
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              const actualModel = data?.model || candidates[0];
              return {
                text,
                provider: 'OpenRouter',
                model: actualModel,
                wasAutoSwitched: actualModel !== candidates[0]
              };
            }
          }
        } catch (e) {
          console.warn('OpenRouter primary attempt failed, trying individual fallbacks:', e);
        }

        // Client-side sequential fallback if server-side array was rejected or 429
        for (let i = 1; i < candidates.length; i++) {
          const fallbackModel = candidates[i];
          try {
            console.log(`Auto-switching OpenRouter model to: ${fallbackModel}`);
            const fbResp = await fetch(endpointUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: fallbackModel,
                messages: [
                  { role: 'system', content: sysPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 4000
              })
            });
            if (fbResp.ok) {
              const fbData = await fbResp.json();
              const text = fbData?.choices?.[0]?.message?.content;
              if (text) {
                return {
                  text,
                  provider: 'OpenRouter',
                  model: fallbackModel,
                  wasAutoSwitched: true
                };
              }
            }
          } catch (e) {
            console.warn(`OpenRouter fallback ${fallbackModel} failed:`, e);
          }
        }
        return null;
      }

      // 4. Groq (Ultra-Fast Free Tier with Auto-Failover)
      if (provider === 'groq' || (provider as string) === 'grok') {
        const groqCandidates = Array.from(new Set([rawModel || GROQ_FREE_CHAIN[0], ...GROQ_FREE_CHAIN]));
        const endpointUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        };

        for (let i = 0; i < groqCandidates.length; i++) {
          const m = groqCandidates[i];
          try {
            const resp = await fetch(endpointUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: m,
                messages: [
                  { role: 'system', content: sysPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 4000
              })
            });

            if (resp.ok) {
              const data = await resp.json();
              const text = data?.choices?.[0]?.message?.content;
              if (text) {
                return {
                  text,
                  provider: 'Groq',
                  model: m,
                  wasAutoSwitched: i > 0
                };
              }
            } else if (resp.status === 429) {
              console.warn(`Groq model ${m} rate limited (429), auto-switching...`);
              continue;
            } else {
              const errBody = await resp.text();
              console.error(`Groq API returned error status ${resp.status}:`, errBody);
              return {
                text: `❌ Groq API Error (${resp.status}): ${errBody}`,
                provider: 'Groq',
                model: m
              };
            }
          } catch (e: any) {
            console.warn(`Groq candidate ${m} error:`, e);
            if (i === groqCandidates.length - 1) {
              return {
                text: `❌ Groq Connection Error: ${e.message}`,
                provider: 'Groq',
                model: m
              };
            }
          }
        }
        return null;
      }

      // 5. NVIDIA NIM with Auto-Failover
      if (provider === 'nvidia') {
        const nvidiaCandidates = Array.from(new Set([rawModel || NVIDIA_FREE_CHAIN[0], ...NVIDIA_FREE_CHAIN]));
        const endpointUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        };

        for (let i = 0; i < nvidiaCandidates.length; i++) {
          const m = nvidiaCandidates[i];
          try {
            const resp = await fetch(endpointUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: m,
                messages: [
                  { role: 'system', content: sysPrompt },
                  { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 4000
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const text = data?.choices?.[0]?.message?.content;
              if (text) {
                return {
                  text,
                  provider: 'NVIDIA NIM',
                  model: m,
                  wasAutoSwitched: i > 0
                };
              }
            } else if (resp.status === 429) {
              continue;
            }
          } catch (e) {
            console.warn(`NVIDIA model ${m} error:`, e);
          }
        }
        return null;
      }

      // 6. Generic OpenAI / Mistral / Ollama / Custom
      let endpointUrl = 'https://api.openai.com/v1/chat/completions';
      let defaultModel = 'gpt-4o-mini';

      if (provider === 'mistral') {
        endpointUrl = 'https://api.mistral.ai/v1/chat/completions';
        defaultModel = 'codestral-latest';
      } else if (provider === 'ollama') {
        endpointUrl = `${config.customEndpoint || 'http://localhost:11434/v1'}/chat/completions`;
        defaultModel = 'deepseek-coder:6.7b';
      } else if (provider === 'custom_api') {
        endpointUrl = config.customEndpoint 
          ? (config.customEndpoint.endsWith('/chat/completions') ? config.customEndpoint : `${config.customEndpoint}/chat/completions`) 
          : 'http://localhost:11434/v1/chat/completions';
        defaultModel = 'custom-model';
      }

      const activeModel = rawModel || defaultModel;
      const resp = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey ? config.apiKey.trim() : 'ollama'}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          return { text, provider: provider.toUpperCase(), model: activeModel };
        }
      }
    } catch (err) {
      console.warn(`Call to LLM provider (${provider}) failed:`, err);
    }

    return null;
  }

  public async processMessage(req: AiTaskRequest): Promise<AiMessage> {
    const config = this.db.getAiConfig();
    const effectiveConfig = { ...config };
    
    // Auto-detect provider if key format matches known provider pattern
    const key = (effectiveConfig.apiKey || '').trim();
    if (key.startsWith('gsk_')) {
      effectiveConfig.provider = 'groq';
      if (!effectiveConfig.model) effectiveConfig.model = 'llama-3.3-70b-versatile';
    } else if (key.startsWith('AIza')) {
      effectiveConfig.provider = 'gemini';
      if (!effectiveConfig.model) effectiveConfig.model = 'gemini-1.5-flash';
    } else if (key.startsWith('sk-ant-')) {
      effectiveConfig.provider = 'anthropic';
    } else if (key.startsWith('sk-or-')) {
      effectiveConfig.provider = 'openrouter';
    } else if (key.startsWith('nvapi-')) {
      effectiveConfig.provider = 'nvidia';
    }

    // Map selected model from Elix Agent model selector ONLY if compatible
    if (req.model && req.model !== 'Auto' && req.model !== 'Auto Universal Failover') {
      if (req.model.includes('Groq') || req.model.includes('Grok') || key.startsWith('gsk_')) {
        effectiveConfig.provider = 'groq';
        effectiveConfig.model = 'llama-3.3-70b-versatile';
      } else if (req.model.includes('Gemini') && !key.startsWith('gsk_')) {
        effectiveConfig.provider = 'gemini';
        effectiveConfig.model = req.model.includes('2.0') ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
      } else if (req.model.includes('OpenRouter')) {
        effectiveConfig.provider = 'openrouter';
        effectiveConfig.model = req.model.includes('DeepSeek') ? 'deepseek/deepseek-r1:free' : 'meta-llama/llama-3.3-70b-instruct:free';
      } else if (req.model.includes('NVIDIA')) {
        effectiveConfig.provider = 'nvidia';
        effectiveConfig.model = 'meta/llama-3.3-70b-instruct';
      } else if (req.model.includes('Claude')) {
        effectiveConfig.provider = 'anthropic';
        effectiveConfig.model = 'claude-3-5-sonnet-20241022';
      } else if (req.model.includes('GPT-4o')) {
        effectiveConfig.provider = 'openai';
        effectiveConfig.model = 'gpt-4o';
      } else if (req.model.includes('Ollama')) {
        effectiveConfig.provider = 'ollama';
        effectiveConfig.model = 'codellama';
      }
    }

    const promptLower = req.prompt.toLowerCase();

    // AI Practice Mentor handling
    if (req.isPracticeMentor) {
      return this.handlePracticeMentor(req, effectiveConfig);
    }

    // Try Live Online AI for Agent prompt if configured
    if ((effectiveConfig.apiKey && effectiveConfig.apiKey.trim().length > 6) || effectiveConfig.provider === 'ollama') {
      const sysPrompt = `You are Elix Agent, an elite autonomous AI coding assistant and pair programmer modeled with the precision, depth, and pro-level execution of Google DeepMind's Antigravity and Claude Code. You have full workspace and terminal access.

WORKSPACE CONTEXT:
• Project Root: ${req.projectPath}
• Active File: ${req.currentFilePath || 'None'}
• File Content (Active Buffer):
\`\`\`
${req.currentFileContent ? req.currentFileContent.slice(0, 5000) : 'None'}
\`\`\`
• Permission Level: ${req.permissionLevel || effectiveConfig.permissionLevel}

ENGINEERING PRINCIPLES (ANTIGRAVITY STYLE):
1. **Autonomous Execution First**: Never ask the user to manually copy-paste or write files if you can execute it for them. Write full, clean, production-ready code directly.
2. **Clear & Structured Response**:
   - Begin with a brief, high-level summary of your diagnosis or strategy.
   - Use clean GitHub-flavored markdown: bold headers, bulleted lists, and readable code blocks.
   - Explain non-obvious design decisions or edge-case handling clearly without unnecessary fluff.
3. **High Architectural Precision**: Maintain existing codebase architecture, follow modern idioms (TypeScript/React/Node/Python), and ensure zero syntax or type errors.

AUTONOMOUS CAPABILITY BLOCKS (Executed directly in the user's workspace):
Whenever your solution requires creating directories, creating/updating files, or running terminal commands, emit these exact markdown blocks:

1. Create directory / folder:
\`\`\`create_dir
relative/or/absolute/path
\`\`\`

2. Create or write to a file (Always write complete, working file content):
\`\`\`write_file:relative/path/to/file.ext
[full file content here]
\`\`\`

3. Run terminal commands (e.g. installs, builds, git, tests):
\`\`\`run_command
command here
\`\`\`

State your analysis and plan in clean Antigravity style, then append the action blocks so Elix executes them immediately.`;

      const aiRes = await this.callLlm(effectiveConfig, sysPrompt, req.prompt);
      if (aiRes) {
        const autoSwitchNotice = aiRes.wasAutoSwitched ? ' 🔄 (Auto-Switched on Quota Limit)' : '';
        this.db.recordActivity({
          type: 'ai_task_completed',
          category: 'ai',
          description: `AI Agent (${aiRes.provider}) answered "${req.prompt.slice(0, 40)}..."`
        });

        const planSteps: { id: string; title: string; status: 'completed' | 'pending' | 'running' | 'failed' }[] = [];
        const proposedChanges: { filePath: string; oldContent: string; newContent: string; status: 'pending' | 'accepted' | 'rejected' }[] = [];

        // 1. Execute create_dir blocks
        const dirMatches = [...aiRes.text.matchAll(/```create_dir\s*\n([\s\S]*?)```/g)];
        for (const dm of dirMatches) {
          const dirRel = dm[1].trim();
          if (dirRel) {
            try {
              const fullDir = path.isAbsolute(dirRel) ? dirRel : path.join(req.projectPath, dirRel);
              if (!fs.existsSync(fullDir)) {
                fs.mkdirSync(fullDir, { recursive: true });
              }
              planSteps.push({
                id: `step_dir_${Date.now()}_${Math.random()}`,
                title: `📁 Created folder: ${dirRel}`,
                status: 'completed'
              });
            } catch (err: any) {
              planSteps.push({
                id: `step_dir_${Date.now()}_${Math.random()}`,
                title: `📁 Failed folder: ${dirRel} (${err.message})`,
                status: 'failed'
              });
            }
          }
        }

        // 2. Execute write_file blocks
        const fileMatches = [...aiRes.text.matchAll(/```write_file:([^\n]+)\n([\s\S]*?)```/g)];
        for (const fm of fileMatches) {
          const fileRel = fm[1].trim();
          const newContent = fm[2];
          if (fileRel) {
            try {
              const fullPath = path.isAbsolute(fileRel) ? fileRel : path.join(req.projectPath, fileRel);
              fs.mkdirSync(path.dirname(fullPath), { recursive: true });
              const oldContent = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
              fs.writeFileSync(fullPath, newContent, 'utf8');
              planSteps.push({
                id: `step_file_${Date.now()}_${Math.random()}`,
                title: `📝 Created/Updated file: ${fileRel}`,
                status: 'completed'
              });
              proposedChanges.push({
                filePath: fullPath,
                oldContent,
                newContent,
                status: 'accepted'
              });
            } catch (err: any) {
              planSteps.push({
                id: `step_file_${Date.now()}_${Math.random()}`,
                title: `📝 Failed to write: ${fileRel} (${err.message})`,
                status: 'failed'
              });
            }
          }
        }

        // 3. Execute run_command blocks
        const cmdMatches = [...aiRes.text.matchAll(/```run_command\s*\n([\s\S]*?)```/g)];
        for (const cm of cmdMatches) {
          const cmd = cm[1].trim();
          if (cmd) {
            const perm = req.permissionLevel || effectiveConfig.permissionLevel;
            if (perm === 'full_agent' || perm === 'run_commands') {
              try {
                await new Promise((resolve) => {
                  exec(cmd, { cwd: req.projectPath, timeout: 60000 }, (error, stdout, stderr) => {
                    resolve({ error, stdout, stderr });
                  });
                });
                planSteps.push({
                  id: `step_cmd_${Date.now()}_${Math.random()}`,
                  title: `⚡ Executed: ${cmd}`,
                  status: 'completed'
                });
              } catch (err: any) {
                planSteps.push({
                  id: `step_cmd_${Date.now()}_${Math.random()}`,
                  title: `⚡ Command error: ${cmd} (${err.message})`,
                  status: 'failed'
                });
              }
            } else {
              planSteps.push({
                id: `step_cmd_${Date.now()}_${Math.random()}`,
                title: `⚡ Propose command: ${cmd} (Awaiting approval)`,
                status: 'pending'
              });
            }
          }
        }

        // Clean out raw execution action blocks from message display so the chat stays readable
        let cleanText = aiRes.text
          .replace(/```create_dir\s*\n[\s\S]*?```/g, '')
          .replace(/```write_file:[^\n]+\n[\s\S]*?```/g, '')
          .replace(/```run_command\s*\n[\s\S]*?```/g, '')
          .trim();

        if (!cleanText && planSteps.length > 0) {
          cleanText = `Executed ${planSteps.length} autonomous action(s) successfully.`;
        }

        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `✨ **${aiRes.provider} (${aiRes.model}${autoSwitchNotice}):**\n\n${cleanText}`,
          isPlan: planSteps.length > 0,
          planSteps: planSteps.length > 0 ? planSteps : undefined,
          proposedChanges: proposedChanges.length > 0 ? proposedChanges : undefined
        };
      }

      // If online LLM was configured but returned no result
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `❌ **AI Connection Failure:**\n\nUnable to obtain a response from **${effectiveConfig.provider.toUpperCase()}** (${effectiveConfig.model || 'default model'}).\n\n**Troubleshooting steps:**\n• **API Key**: Verify your API key is correctly pasted in **Settings (Ctrl+,) > AI Configuration**.\n• **Provider**: If using a key starting with \`gsk_\`, ensure the provider is set to **Groq**.\n• **Network**: Check your internet connection or proxy settings.\n• **Free Keys**: Groq keys are free at [console.groq.com/keys](https://console.groq.com/keys).`,
        isPlan: false
      };
    }

    // Explicit file or folder scaffolding commands when offline / without key
    const folderMatch = req.prompt.match(/(?:create|make|add)\s+(?:folder|directory|dir)\s+([a-zA-Z0-9_\-\/\\]+)/i);
    if (folderMatch && folderMatch[1]) {
      const folderName = folderMatch[1].trim();
      const fullDir = path.resolve(req.projectPath, folderName);
      try {
        if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `📁 Created folder: \`${folderName}\``
        };
      } catch (e: any) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `❌ Failed to create folder: \`${folderName}\` (${e.message})`
        };
      }
    }

    const fileMatch = req.prompt.match(/(?:create|make|add)\s+file\s+([a-zA-Z0-9_\-\/\\]+\.[a-zA-Z0-9]+)/i);
    if (fileMatch && fileMatch[1]) {
      const fileName = fileMatch[1].trim();
      const fullPath = path.resolve(req.projectPath, fileName);
      try {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const stubContent = fileName.endsWith('.py') 
          ? `# ${fileName}\n` 
          : `// ${fileName}\n`;
        fs.writeFileSync(fullPath, stubContent, 'utf8');
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `📝 Created file: \`${fileName}\``
        };
      } catch (e: any) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `❌ Failed to create file: \`${fileName}\` (${e.message})`
        };
      }
    }

    // No API key configured onboarding response
    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🔑 **AI Provider Key Required**\n\nTo chat with Elix Agent and generate code, connect a free provider key in **Settings (Ctrl+,) > AI Configuration**:\n\n• **Groq (Recommended - Free, Ultra-Fast 500+ tokens/s)**: [console.groq.com/keys](https://console.groq.com/keys) *(starts with \`gsk_\`)*\n• **Google Gemini (Free tier)**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) *(starts with \`AIza\`)*\n• **OpenRouter (Free tier models)**: [openrouter.ai/keys](https://openrouter.ai/keys)\n• **Ollama (100% Offline)**: Run models locally with zero API key!`,
      isPlan: false
    };
  }

  private async handlePracticeMentor(req: AiTaskRequest, config: AiConfig): Promise<AiMessage> {
    const mode = req.mentorMode || config.mentorMode || 'hint';
    const q = req.questionDetails;
    const title = q?.title || 'Current Problem';
    const difficulty = q?.difficulty || 'Medium';
    const topics = q?.topics || ['Algorithms'];
    const timeTarget = q?.timeComplexityTarget || 'O(N)';
    const spaceTarget = q?.spaceComplexityTarget || 'O(1)';
    const specificHints = q?.hints || [];
    const solutionExp = q?.solutionExplanation;

    // 1. Try Live Online AI with Auto-Failover (OpenRouter, Groq, Gemini, NVIDIA, etc.)
    if ((config.apiKey && config.apiKey.trim().length > 6) || config.provider === 'ollama') {
      const sysPrompt = `You are the Elix AI DSA Practice Coach.
Problem: "${title}" (${difficulty})
Topics: ${topics.join(', ')}
Complexity Targets: Time: ${timeTarget}, Space: ${spaceTarget}
Mode: ${mode.toUpperCase()}
Student's Code:
\`\`\`${q?.language || 'python'}
${q?.userCode || ''}
\`\`\`

Instructions:
- Mode 'hint': Give a crisp, 2-3 sentence algorithmic hint or data structure nudge without writing full code solutions.
- Mode 'guided': Break the problem into 3 clear progressive steps with edge cases to watch out for.
- Mode 'explain': Explain the optimal approach, why brute-force is suboptimal, and the exact time/space complexity trade-offs.`;

      const aiRes = await this.callLlm(config, sysPrompt, `User Question: ${req.prompt}`);
      if (aiRes) {
        const autoSwitchNotice = aiRes.wasAutoSwitched ? ' 🔄 (Auto-Switched on Quota Limit)' : '';
        return {
          id: `mentor_${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `✨ **${aiRes.provider} (${aiRes.model}${autoSwitchNotice}):**\n\n${aiRes.text}`
        };
      }
    }

    // 2. Intelligent Offline Algorithmic Engine (Dynamic per question & topic)
    const topicStr = topics.join(' ').toLowerCase();

    // Mode: Quick Hint
    if (mode === 'hint') {
      let topicHint = 'Analyze the inputs and constraints to identify repeating work or redundant iterations.';
      if (topicStr.includes('hash') || topicStr.includes('array')) {
        topicHint = 'Consider using an auxiliary Hash Map or Frequency Set to reduce lookup time from $O(N)$ to $O(1)$.';
      } else if (topicStr.includes('two pointer')) {
        topicHint = 'If the input is sorted or can be sorted, maintain two pointers moving inwards based on condition comparison.';
      } else if (topicStr.includes('sliding window')) {
        topicHint = 'Expand the window with your right pointer until the condition breaks, then shrink from the left to restore invariant.';
      } else if (topicStr.includes('binary search')) {
        topicHint = 'Notice the monotonic property: at any midpoint, can you discard one entire half of the search space?';
      } else if (topicStr.includes('dynamic programming')) {
        topicHint = 'Look for optimal substructure and overlapping subproblems: express state $dp[i]$ in terms of smaller subproblems.';
      } else if (topicStr.includes('tree') || topicStr.includes('bfs') || topicStr.includes('dfs')) {
        topicHint = 'Formulate your recursion base case clearly. For level-by-level traversal use a Queue, for depth-first use recursion or Stack.';
      }

      const specific = specificHints && specificHints.length > 0
        ? `\n\n📌 **Key Insight:** ${specificHints[0]}`
        : '';

      return {
        id: `mentor_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `💡 **AI Practice Mentor — Quick Hint for "${title}"**\n\n` +
          `• **Target Complexity:** Time: \`${timeTarget}\` | Space: \`${spaceTarget}\`\n` +
          `• **Algorithmic Strategy:** ${topicHint}${specific}\n\n` +
          `*Try implementing this nudge in the editor before checking the full solution!*`
      };
    }

    // Mode: Guided Step
    if (mode === 'guided') {
      let step1 = 'Validate input edge cases (empty collection, single element, or invalid bounds).';
      let step2 = 'Iterate through data using the optimal traversal strategy, updating your invariant.';
      let step3 = 'Return the computed result or appropriate fallback if no valid state was reached.';

      if (topicStr.includes('two pointer')) {
        step1 = 'Initialize `left = 0` and `right = len - 1`. Ensure the array is sorted if problem requires sorted order.';
        step2 = 'While `left < right`, evaluate the condition. If sum/value is too large, decrement `right`; if too small, increment `left`.';
        step3 = 'Record or return the matched pair/indices, and handle duplicates to avoid infinite loops or extra answers.';
      } else if (topicStr.includes('sliding window')) {
        step1 = 'Initialize `left = 0`, a frequency map or set, and a variable to track your max/min metric.';
        step2 = 'Iterate `right` across the string/array. Add current element to window state. While window condition is violated, advance `left` and remove elements.';
        step3 = 'Update your global best answer on each valid step and return it after the loop finishes.';
      } else if (topicStr.includes('binary search')) {
        step1 = 'Define search boundaries `left = 0` and `right = n - 1`.';
        step2 = 'Loop `while left <= right`: compute `mid`. If `nums[mid] == target`, return or mark index. Adjust `left` or `right` depending on comparison.';
        step3 = 'If the loop terminates without finding target, return `-1` or insertion position.';
      } else if (topicStr.includes('dynamic programming')) {
        step1 = 'Define your DP state array or variables: `dp[i]` represents the optimal answer up to index `i`.';
        step2 = 'Identify base cases (e.g. `dp[0] = 1`, `dp[1] = 1`) and transition: `dp[i] = transition(dp[i-1], ...)`.';
        step3 = 'Can you optimize space to `O(1)` by only keeping the last 1-2 variables instead of an entire array?';
      } else if (topicStr.includes('hash')) {
        step1 = 'Initialize an empty Hash Map or Hash Set before starting the loop.';
        step2 = 'For each element, check if its required complement or counterpart already exists in the map.';
        step3 = 'If found, return the answer immediately. Otherwise insert the current element into the map and continue.';
      }

      return {
        id: `mentor_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `🧭 **AI Practice Mentor — Guided Breakdown for "${title}"**\n\n` +
          `Follow these 3 structured implementation steps:\n\n` +
          `• **Step 1 (Setup & Base State):** ${step1}\n` +
          `• **Step 2 (Loop Invariant):** ${step2}\n` +
          `• **Step 3 (Result & Boundary Cases):** ${step3}\n\n` +
          `⚠️ **Watch out for edge cases:** Check minimum array lengths, negative values, and duplicate elements.`
      };
    }

    // Mode: Explain Optimal
    const explanationText = solutionExp || (
      `The brute-force approach typically checks all pairs or states in $O(N^2)$ or exponential time, causing Time Limit Exceeded (TLE).\n\n` +
      `By utilizing the optimal algorithmic paradigm for **${topics.join(', ')}**, we reduce redundant computations to achieve the optimal **${timeTarget}** time complexity while keeping space bounded to **${spaceTarget}**.`
    );

    return {
      id: `mentor_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `🎓 **AI Practice Mentor — Optimal Approach for "${title}"**\n\n` +
        `• **Target Time Complexity:** \`${timeTarget}\`\n` +
        `• **Target Space Complexity:** \`${spaceTarget}\`\n\n` +
        `**Algorithmic Analysis:**\n${explanationText}\n\n` +
        `**Engineering Takeaway:** In technical interviews, interviewers evaluate whether you recognize the space-time trade-off and move from a brute-force $O(N^2)$ baseline to an optimal linear or logarithmic solution.`
    };
  }

  public applyFileChange(filePath: string, newContent: string): boolean {
    try {
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    } catch {
      return false;
    }
  }

  public async transcribeAudio(base64Audio: string, mimeType: string = 'audio/webm'): Promise<{ success: boolean; text?: string; error?: string }> {
    const config = this.db.getAiConfig();
    const cleanBase64 = base64Audio.replace(/^data:audio\/[a-z0-9]+;base64,/, '');

    // 1. Try Gemini Multimodal Speech-to-Text (supports audio directly)
    if (config.apiKey && (config.provider === 'gemini' || config.apiKey.startsWith('AIzaSy'))) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey.trim()}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: "Listen carefully to this audio and return only the spoken transcription verbatim without explanations, greetings, or formatting:" },
                { inlineData: { mimeType: mimeType || 'audio/webm', data: cleanBase64 } }
              ]
            }]
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const transcript = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (transcript) {
            return { success: true, text: transcript };
          }
        }
      } catch (err: any) {
        console.warn('Gemini audio transcription error:', err);
      }
    }

    // 2. Try Groq Whisper (ultra-fast Whisper speech-to-text)
    if (config.apiKey && (config.provider === 'groq' || config.apiKey.startsWith('gsk_'))) {
      try {
        const audioBuffer = Buffer.from(cleanBase64, 'base64');
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
        formData.append('file', blob, 'speech.webm');
        formData.append('model', 'whisper-large-v3-turbo');

        const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey.trim()}`
          },
          body: formData
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data?.text) {
            return { success: true, text: data.text.trim() };
          }
        }
      } catch (err: any) {
        console.warn('Groq whisper transcription error:', err);
      }
    }

    return { 
      success: false, 
      error: 'Please add your Gemini or Groq API key in Settings to use Voice Dictation.' 
    };
  }
}
