export type ExecutionMode = 'local' | 'cloud' | 'auto';
export type ConnectionState = 'online' | 'local' | 'offline';

export interface ExecutionEvent {
  type: 'stdout' | 'stderr' | 'exit' | 'status' | 'error';
  data: string;
  code?: number | null;
  pid?: number;
  timestamp: string;
}

export interface ProjectCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isCustom?: boolean;
  order: number;
  tags?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  framework?: string;
  description: string;
  icon: string;
  defaultExecutionMode: ExecutionMode;
  files: Record<string, string>;
  runCommand: string;
  buildCommand?: string;
  testCommand?: string;
  devServer?: {
    port: number;
    urlPattern: string;
    isWebPreview: boolean;
  };
}

export interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  categories: string[];
  language: string;
  framework?: string;
  createdAt: string;
  lastOpenedAt: string;
  runCommand?: string;
  buildCommand?: string;
  activeFile?: string;
  isHackathon?: boolean;
  hackathonId?: string;
  gitRepoUrl?: string;
  memoryNotes?: string[];
}

export interface EditorTab {
  id: string;
  name: string;
  path?: string;
  content: string;
  isDirty?: boolean;
  isWelcome?: boolean;
  isSettings?: boolean;
  settingsCategory?: string;
}

export interface ActivityEvent {
  id: string;
  projectId?: string;
  projectName?: string;
  category: string;
  type: 
    | 'project_created' 
    | 'project_opened' 
    | 'file_modified' 
    | 'code_run' 
    | 'build_success' 
    | 'build_failure' 
    | 'git_commit' 
    | 'git_push' 
    | 'dsa_solved' 
    | 'dsa_attempt' 
    | 'hackathon_milestone' 
    | 'ai_task_completed';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StreakData {
  category: string; // 'overall', 'dsa', 'hackathon', 'interview', or specific category id
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activeDaysCount: number;
  historyDates: string[]; // YYYY-MM-DD
}

export interface EnvironmentInfo {
  id: string;
  name: string;
  category: string;
  status: 'ready' | 'not_installed' | 'downloading' | 'error' | 'cloud_ready';
  version?: string;
  isBundled: boolean;
  path?: string;
  downloadSize?: string;
  canExecuteOffline: boolean;
  description: string;
  officialUrl?: string;
  wingetId?: string;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categories: string[]; // 'DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++', etc.
  topics: string[]; // 'Arrays', 'Trees', 'Dynamic Programming', 'OOP', 'SQL', etc.
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: Record<string, string>; // language -> code template
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  timeComplexityTarget?: string;
  spaceComplexityTarget?: string;
  hints: string[];
  solutionExplanation?: string;
  tags?: string[];
  version: number;
}

export interface UserPracticeGoal {
  id: string;
  category: string; // 'DSA', 'Python', 'Interview Prep'
  targetProblems: number;
  timeframe: 'all-time' | 'daily' | 'weekly' | 'monthly';
  deadline?: string;
  createdAt: string;
}

export interface UserSubmission {
  id: string;
  questionId: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  runtimeMs: number;
  memoryMb: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  timestamp: string;
  hintsUsedCount: number;
  notes?: string;
}

export interface TopicPerformance {
  topic: string;
  solvedCount: number;
  attemptedCount: number;
  accuracy: number;
  status: 'Strong' | 'Intermediate' | 'Needs Practice' | 'Insufficient Data';
}

export interface HackathonItem {
  id: string;
  name: string;
  problemStatement: string;
  eventDate: string;
  submissionDeadline: string;
  team: {
    name: string;
    members: string[];
  };
  projectId?: string;
  repoUrl?: string;
  techStack: string[];
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }[];
  status: 'Upcoming' | 'In Progress' | 'Submitted' | 'Won' | 'Archived';
  demoUrl?: string;
  notes?: string;
}

export interface TimeMachineSnapshot {
  id: string;
  projectId: string;
  title: string;
  description: string;
  timestamp: string;
  trigger: 'manual' | 'before_ai' | 'before_run' | 'git_commit';
  files: Record<string, string>;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: {
    name: string;
    type: 'file' | 'folder' | 'log' | 'image';
    content: string;
  }[];
  proposedChanges?: {
    filePath: string;
    oldContent: string;
    newContent: string;
    status: 'pending' | 'accepted' | 'rejected';
  }[];
  isPlan?: boolean;
  planSteps?: {
    id: string;
    title: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }[];
}

export type AiPermissionLevel = 
  | 'read_only' 
  | 'read_analyze' 
  | 'edit_files' 
  | 'run_commands' 
  | 'install_deps' 
  | 'git_ops' 
  | 'full_agent';

export type AiProviderType = 
  | 'gemini' 
  | 'groq' 
  | 'openrouter' 
  | 'nvidia' 
  | 'ollama' 
  | 'openai' 
  | 'anthropic' 
  | 'mistral' 
  | 'custom_api';

export interface AiConfig {
  provider: AiProviderType;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  permissionLevel: AiPermissionLevel;
  mentorMode: 'hint' | 'guided' | 'explain' | 'full' | 'interview';
}
