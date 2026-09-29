import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import {
  ProjectCategory,
  ProjectMetadata,
  ActivityEvent,
  StreakData,
  PracticeQuestion,
  UserPracticeGoal,
  UserSubmission,
  HackathonItem,
  TimeMachineSnapshot,
  AiConfig
} from '../../src/types';

interface DatabaseSchema {
  categories: ProjectCategory[];
  projects: ProjectMetadata[];
  activities: ActivityEvent[];
  streaks: Record<string, StreakData>;
  questions: PracticeQuestion[];
  goals: UserPracticeGoal[];
  submissions: UserSubmission[];
  hackathons: HackathonItem[];
  snapshots: TimeMachineSnapshot[];
  aiConfig: AiConfig;
  settings: Record<string, any>;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private dbPath: string;
  private data: DatabaseSchema;

  private constructor() {
    const userDataPath = app?.getPath ? app.getPath('userData') : path.join(process.cwd(), '.elix-storage');
    if (!fs.existsSync(userDataPath)) {
      try {
        fs.mkdirSync(userDataPath, { recursive: true });
      } catch (e) {
        console.error('Failed to create storage directory:', e);
      }
    }
    this.dbPath = path.join(userDataPath, 'elix-database.json');
    this.data = this.loadDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private getDefaultCategories(): ProjectCategory[] {
    return [
      { id: 'web', name: 'Web Development', icon: 'Globe', description: 'HTML, CSS, JS, TS, React, Next.js, Vue, Angular, Node', order: 1 },
      { id: 'python', name: 'Python & AI', icon: 'Terminal', description: 'Python, FastAPI, Django, Flask, PyTorch, Pandas', order: 2 },
      { id: 'java', name: 'Java Ecosystem', icon: 'Coffee', description: 'Java, Spring Boot, Quarkus, Maven, Gradle', order: 3 },
      { id: 'cpp', name: 'C / C++', icon: 'Cpu', description: 'C, C++, GCC, Clang, CMake, Qt, High-performance systems', order: 4 },
      { id: 'rust', name: 'Rust', icon: 'Shield', description: 'Rust, Cargo, Tokio, Axum, Tauri, Systems programming', order: 5 },
      { id: 'go', name: 'Go', icon: 'Zap', description: 'Go, Gin, Fiber, Microservices, Cloud-native services', order: 6 },
      { id: 'dotnet', name: '.NET / C#', icon: 'Layers', description: 'C#, .NET, ASP.NET Core, Blazor, Enterprise apps', order: 7 },
      { id: 'mobile', name: 'Mobile Development', icon: 'Smartphone', description: 'Expo, React Native, Flutter, Kotlin, Android', order: 8 },
      { id: 'gamedev', name: 'Game Development', icon: 'Gamepad2', description: 'Godot, Bevy, Raylib, Canvas, 2D/3D Games', order: 9 },
      { id: 'desktop', name: 'Desktop Apps', icon: 'Monitor', description: 'Electron, Tauri, Cross-platform GUI applications', order: 10 },
      { id: 'backend', name: 'Backend & APIs', icon: 'Server', description: 'REST APIs, GraphQL, Microservices, Databases', order: 11 },
      { id: 'aiml', name: 'AI / Machine Learning', icon: 'BrainCircuit', description: 'Data Science, PyTorch, Transformers, Computer Vision', order: 12 },
      { id: 'practice', name: 'Practice & Career', icon: 'Target', description: 'DSA, Competitive Programming, System Design, Interviews', order: 13 },
      { id: 'hackathons', name: 'Hackathons', icon: 'Trophy', description: 'Hackathon sprints, teams, problem statements & milestones', order: 14 }
    ];
  }

  private getDefaultHackathons(): HackathonItem[] {
    return [
      {
        id: 'hack_genai_2026',
        name: 'Global GenAI & Agentic Sprint 2026',
        problemStatement: 'Build an autonomous multimodal agent or intelligent developer tool that enhances developer productivity and automates complex multi-step workflows.',
        eventDate: '2026-10-24',
        submissionDeadline: '2026-10-26T23:59:00',
        team: {
          name: 'Elix Innovators',
          members: ['You (Lead Architect)', 'Alex (Frontend)', 'Maya (AI / ML)']
        },
        techStack: ['TypeScript', 'React', 'Python', 'Gemini API', 'TailwindCSS'],
        tasks: [
          { id: 't_ai_1', title: 'Define agent architecture & workflow graph', completed: true },
          { id: 't_ai_2', title: 'Implement tool execution engine & API integration', completed: true },
          { id: 't_ai_3', title: 'Build modern Monaco-powered UI & prompt panel', completed: false },
          { id: 't_ai_4', title: 'Record 3-minute video demo & publish repository', completed: false }
        ],
        milestones: [
          { id: 'm_ai_1', title: 'Architecture Proposal & Design Doc', dueDate: '2026-10-24', completed: true },
          { id: 'm_ai_2', title: 'Working Prototype & Tool Validation', dueDate: '2026-10-25', completed: false },
          { id: 'm_ai_3', title: 'Final Pitch & Project Submission', dueDate: '2026-10-26', completed: false }
        ],
        status: 'In Progress',
        demoUrl: 'https://github.com/SubhamMukhopadhyay/elix-ide'
      },
      {
        id: 'hack_fullstack_2026',
        name: 'Next-Gen Cloud & Real-Time Web Sprint',
        problemStatement: 'Design and deploy a resilient real-time web application featuring collaborative editing, live state synchronization, and zero-latency performance.',
        eventDate: '2026-11-12',
        submissionDeadline: '2026-11-14T18:00:00',
        team: {
          name: 'Async Core',
          members: ['You', 'Dev Team']
        },
        techStack: ['Next.js', 'Go', 'WebSockets', 'PostgreSQL', 'Docker'],
        tasks: [
          { id: 't_fs_1', title: 'Database schema & WebSocket pub/sub design', completed: false },
          { id: 't_fs_2', title: 'Frontend collaboration client & optimistic UI', completed: false },
          { id: 't_fs_3', title: 'Benchmarking & deployment on Cloud Run', completed: false }
        ],
        milestones: [
          { id: 'm_fs_1', title: 'MVP Deployment', dueDate: '2026-11-13', completed: false },
          { id: 'm_fs_2', title: 'Final Demo Video', dueDate: '2026-11-14', completed: false }
        ],
        status: 'Upcoming'
      }
    ];
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        const projects = (parsed.projects || []).map((p: any) => {
          if (p.runCommand && p.runCommand.includes('./main')) {
            p.runCommand = (p.categories?.includes('cpp') || p.language === 'C++') ? 'cpp-run' : 'c-run';
          }
          return p;
        });

        return {
          categories: parsed.categories?.length ? parsed.categories : this.getDefaultCategories(),
          projects,
          activities: parsed.activities || [],
          streaks: parsed.streaks || {},
          questions: parsed.questions || [],
          goals: parsed.goals || [],
          submissions: parsed.submissions || [],
          hackathons: (parsed.hackathons && parsed.hackathons.length > 0) ? parsed.hackathons : this.getDefaultHackathons(),
          snapshots: parsed.snapshots || [],
          aiConfig: parsed.aiConfig || {
            provider: 'gemini',
            apiKey: '',
            model: 'gemini-1.5-flash',
            permissionLevel: 'full_agent',
            mentorMode: 'guided'
          },
          settings: parsed.settings || {
            theme: 'dark',
            reduceAnimations: false,
            executionMode: 'auto',
            autoSave: true
          }
        };
      } catch (err) {
        console.error('Failed to parse database file, restoring defaults:', err);
      }
    }

    const defaultData: DatabaseSchema = {
      categories: this.getDefaultCategories(),
      projects: [],
      activities: [],
      streaks: {},
      questions: [],
      goals: [],
      submissions: [],
      hackathons: this.getDefaultHackathons(),
      snapshots: [],
      aiConfig: {
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-1.5-flash',
        permissionLevel: 'full_agent',
        mentorMode: 'guided'
      },
      settings: {
        theme: 'dark',
        reduceAnimations: false,
        executionMode: 'auto',
        autoSave: true
      }
    };

    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(data: DatabaseSchema = this.data): void {
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (e) {
      console.error('Failed to save database atomically:', e);
    }
  }

  // --- Categories ---
  public getCategories(): ProjectCategory[] {
    return this.data.categories;
  }

  public addCategory(cat: Omit<ProjectCategory, 'id'>): ProjectCategory {
    const id = `custom_${Date.now()}`;
    const newCategory: ProjectCategory = {
      ...cat,
      id,
      isCustom: true,
      order: this.data.categories.length + 1
    };
    this.data.categories.push(newCategory);
    this.saveDatabase();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<ProjectCategory>): ProjectCategory | null {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.saveDatabase();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex(c => c.id === id && c.isCustom);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- Projects ---
  public getProjects(): ProjectMetadata[] {
    return this.data.projects;
  }

  public saveProject(project: ProjectMetadata): void {
    const idx = this.data.projects.findIndex(p => p.id === project.id || p.path === project.path);
    if (idx >= 0) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...project, lastOpenedAt: new Date().toISOString() };
    } else {
      this.data.projects.unshift(project);
    }
    this.saveDatabase();
    this.recordActivity({
      type: 'project_created',
      category: project.categories[0] || 'general',
      projectId: project.id,
      projectName: project.name,
      description: `Created project ${project.name}`
    });
  }

  // --- Activity & Streak Engine ---
  public recordActivity(activity: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
    const newActivity: ActivityEvent = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.data.activities.unshift(newActivity);
    if (this.data.activities.length > 500) {
      this.data.activities.pop();
    }

    // Update streak for category and overall
    this.updateStreak('overall');
    if (activity.category) {
      this.updateStreak(activity.category);
    }
    if (activity.type === 'dsa_solved') {
      this.updateStreak('dsa');
    }
    if (activity.type === 'hackathon_milestone') {
      this.updateStreak('hackathon');
    }

    this.saveDatabase();
    return newActivity;
  }

  public getActivities(filter?: { category?: string; projectId?: string; limit?: number }): ActivityEvent[] {
    let result = this.data.activities;
    if (filter?.category) {
      result = result.filter(a => a.category === filter.category);
    }
    if (filter?.projectId) {
      result = result.filter(a => a.projectId === filter.projectId);
    }
    return result.slice(0, filter?.limit || 100);
  }

  private updateStreak(category: string): void {
    const today = new Date().toISOString().split('T')[0];
    let streak = this.data.streaks[category];
    if (!streak) {
      streak = {
        category,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        activeDaysCount: 1,
        historyDates: [today]
      };
      this.data.streaks[category] = streak;
      return;
    }

    if (streak.lastActiveDate === today) {
      return; // Already counted today
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      streak.currentStreak = 1;
    }

    streak.lastActiveDate = today;
    streak.activeDaysCount += 1;
    if (!streak.historyDates.includes(today)) {
      streak.historyDates.push(today);
    }
  }

  public getStreaks(): Record<string, StreakData> {
    return this.data.streaks;
  }

  // --- Questions & Practice ---
  public getQuestions(): PracticeQuestion[] {
    return this.data.questions;
  }

  public setQuestions(questions: PracticeQuestion[]): void {
    this.data.questions = questions;
    this.saveDatabase();
  }

  public addQuestion(question: PracticeQuestion): void {
    const idx = this.data.questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      this.data.questions[idx] = question;
    } else {
      this.data.questions.push(question);
    }
    this.saveDatabase();
  }

  // --- Goals ---
  public getGoals(): UserPracticeGoal[] {
    return this.data.goals;
  }

  public setGoal(goal: Omit<UserPracticeGoal, 'id' | 'createdAt'>): UserPracticeGoal {
    const id = `goal_${Date.now()}`;
    const newGoal: UserPracticeGoal = {
      ...goal,
      id,
      createdAt: new Date().toISOString()
    };
    const existingIdx = this.data.goals.findIndex(g => g.category === goal.category);
    if (existingIdx >= 0) {
      this.data.goals[existingIdx] = newGoal;
    } else {
      this.data.goals.push(newGoal);
    }
    this.saveDatabase();
    return newGoal;
  }

  // --- Submissions ---
  public recordSubmission(sub: Omit<UserSubmission, 'id' | 'timestamp'>): UserSubmission {
    const newSub: UserSubmission = {
      ...sub,
      id: `sub_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.submissions.unshift(newSub);

    if (newSub.status === 'Accepted') {
      const q = this.data.questions.find(item => item.id === sub.questionId);
      this.recordActivity({
        type: 'dsa_solved',
        category: 'dsa',
        description: `Solved problem "${q ? q.title : sub.questionId}" in ${sub.language}`
      });
    } else {
      this.recordActivity({
        type: 'dsa_attempt',
        category: 'dsa',
        description: `Attempted problem (${sub.status}) in ${sub.language}`
      });
    }

    this.saveDatabase();
    return newSub;
  }

  public getSubmissions(questionId?: string): UserSubmission[] {
    if (questionId) {
      return this.data.submissions.filter(s => s.questionId === questionId);
    }
    return this.data.submissions;
  }

  // --- Hackathons ---
  public getHackathons(): HackathonItem[] {
    return this.data.hackathons;
  }

  public saveHackathon(hackathon: HackathonItem): void {
    const idx = this.data.hackathons.findIndex(h => h.id === hackathon.id);
    if (idx >= 0) {
      this.data.hackathons[idx] = hackathon;
    } else {
      this.data.hackathons.unshift(hackathon);
    }
    this.saveDatabase();
  }

  public deleteHackathon(id: string): boolean {
    const idx = this.data.hackathons.findIndex(h => h.id === id);
    if (idx >= 0) {
      this.data.hackathons.splice(idx, 1);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Time Machine ---
  public getSnapshots(projectId: string): TimeMachineSnapshot[] {
    return this.data.snapshots.filter(s => s.projectId === projectId);
  }

  public createSnapshot(snap: Omit<TimeMachineSnapshot, 'id' | 'timestamp'>): TimeMachineSnapshot {
    const newSnap: TimeMachineSnapshot = {
      ...snap,
      id: `snap_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.data.snapshots.unshift(newSnap);
    if (this.data.snapshots.length > 50) {
      this.data.snapshots.pop();
    }
    this.saveDatabase();
    return newSnap;
  }

  // --- Settings & AI Config ---
  public getAiConfig(): AiConfig {
    return this.data.aiConfig;
  }

  public updateAiConfig(config: Partial<AiConfig>): AiConfig {
    this.data.aiConfig = { ...this.data.aiConfig, ...config };
    this.saveDatabase();
    return this.data.aiConfig;
  }

  public getSettings(): Record<string, any> {
    return this.data.settings;
  }

  public updateSettings(settings: Record<string, any>): Record<string, any> {
    this.data.settings = { ...this.data.settings, ...settings };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Reset Engine ---
  public resetProgress(): { success: boolean; message: string } {
    this.data.submissions = [];
    this.data.activities = [];
    this.data.streaks = {};
    this.saveDatabase();
    return { success: true, message: 'Practice history, activities, and streaks reset successfully.' };
  }
}
