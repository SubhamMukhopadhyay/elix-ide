import { PracticeQuestion, UserSubmission, TopicPerformance } from '../../src/types';
import { DatabaseService } from './DatabaseService';
import { STARTER_QUESTIONS } from './QuestionBankData';
import comprehensiveQuestions from './comprehensive_questions.json';

export class QuestionBankService {
  private static instance: QuestionBankService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.ensureQuestionsInitialized();
  }

  public static getInstance(): QuestionBankService {
    if (!QuestionBankService.instance) {
      QuestionBankService.instance = new QuestionBankService();
    }
    return QuestionBankService.instance;
  }

  private ensureQuestionsInitialized(): void {
    const existing = this.db.getQuestions() || [];
    const existingMap = new Map(existing.map(q => [q.id, q]));
    let updated = false;

    // 1. Seed complete 1,313 curated LeetCode & GeeksforGeeks questions
    const dataset = (comprehensiveQuestions as unknown as PracticeQuestion[]) || [];
    for (const q of dataset) {
      if (!existingMap.has(q.id)) {
        existingMap.set(q.id, q);
        updated = true;
      }
    }

    // 2. Ensure starter questions are present
    for (const sq of STARTER_QUESTIONS) {
      if (!existingMap.has(sq.id)) {
        existingMap.set(sq.id, sq);
        updated = true;
      }
    }

    // If existing database was previous version with only 9 questions, update to full bank
    if (updated || existing.length < 1000) {
      this.db.setQuestions(Array.from(existingMap.values()));
    }
  }

  public getQuestions(filter?: { category?: string; topic?: string; difficulty?: string; search?: string }): PracticeQuestion[] {
    let list = this.db.getQuestions();
    if (filter?.category && filter.category !== 'All') {
      const catLower = filter.category.toLowerCase();
      list = list.filter(q => q.categories.some(c => c.toLowerCase() === catLower));
    }
    if (filter?.topic && filter.topic !== 'All') {
      const topicLower = filter.topic.toLowerCase();
      list = list.filter(q => q.topics.some(t => t.toLowerCase() === topicLower));
    }
    if (filter?.difficulty && filter.difficulty !== 'All') {
      list = list.filter(q => q.difficulty === filter.difficulty);
    }
    if (filter?.search) {
      const s = filter.search.toLowerCase().trim();
      list = list.filter(q => 
        q.title.toLowerCase().includes(s) || 
        q.topics.some(t => t.toLowerCase().includes(s)) ||
        q.categories.some(c => c.toLowerCase().includes(s))
      );
    }
    return list;
  }

  public getQuestionById(id: string): PracticeQuestion | undefined {
    return this.db.getQuestions().find(q => q.id === id);
  }

  public calculateUserStats() {
    const questions = this.db.getQuestions();
    const submissions = this.db.getSubmissions();
    const goals = this.db.getGoals();

    const solvedIds = new Set<string>();
    const attemptedIds = new Set<string>();

    let totalRuntime = 0;

    submissions.forEach(s => {
      attemptedIds.add(s.questionId);
      if (s.status === 'Accepted') {
        solvedIds.add(s.questionId);
      }
      totalRuntime += s.runtimeMs;
    });

    const solvedList = questions.filter(q => solvedIds.has(q.id));
    const easyCount = solvedList.filter(q => q.difficulty === 'Easy').length;
    const mediumCount = solvedList.filter(q => q.difficulty === 'Medium').length;
    const hardCount = solvedList.filter(q => q.difficulty === 'Hard').length;

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    // Topic Performance calculation
    const topicMap: Record<string, { solved: number; attempted: number; total: number }> = {};
    questions.forEach(q => {
      q.topics.forEach(t => {
        if (!topicMap[t]) topicMap[t] = { solved: 0, attempted: 0, total: 0 };
        topicMap[t].total += 1;
        if (attemptedIds.has(q.id)) topicMap[t].attempted += 1;
        if (solvedIds.has(q.id)) topicMap[t].solved += 1;
      });
    });

    const topicPerformances: TopicPerformance[] = Object.keys(topicMap).map(topic => {
      const data = topicMap[topic];
      const acc = data.attempted > 0 ? (data.solved / data.attempted) * 100 : 0;
      let status: TopicPerformance['status'] = 'Insufficient Data';
      if (data.attempted >= 2) {
        if (acc >= 75) status = 'Strong';
        else if (acc >= 45) status = 'Intermediate';
        else status = 'Needs Practice';
      } else if (data.solved >= 1) {
        status = 'Intermediate';
      }
      return {
        topic,
        solvedCount: data.solved,
        attemptedCount: data.attempted,
        accuracy: Math.round(acc),
        status
      };
    });

    // Level Engine
    let userLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = 'Beginner';
    if (solvedIds.size >= 25 || hardCount >= 5) userLevel = 'Expert';
    else if (solvedIds.size >= 10 || mediumCount >= 5) userLevel = 'Advanced';
    else if (solvedIds.size >= 3) userLevel = 'Intermediate';

    return {
      availableQuestionsCount: questions.length,
      localQuestionsCount: questions.length,
      solvedCount: solvedIds.size,
      attemptedCount: attemptedIds.size,
      easyCount,
      mediumCount,
      hardCount,
      accuracy,
      userLevel,
      topicPerformances,
      goals
    };
  }
}
