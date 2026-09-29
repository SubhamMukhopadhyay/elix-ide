import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Flame, 
  Award, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  FileDown, 
  Star,
  Target,
  Code2,
  Clock,
  Sparkles,
  ChevronRight,
  Activity,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { UserSubmission } from '../../types';

export const CareerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [streaks, setStreaks] = useState<Record<string, any>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    loadCareerData();
    const handleReset = () => loadCareerData();
    window.addEventListener('elix-progress-reset', handleReset);
    return () => window.removeEventListener('elix-progress-reset', handleReset);
  }, []);

  const loadCareerData = async () => {
    if (window.elix) {
      const pStats = await window.elix.getPracticeStats();
      setStats(pStats);
      const strk = await window.elix.getStreaks();
      setStreaks(strk || {});
      const acts = await window.elix.getActivities({ limit: 200 });
      setActivities(acts || []);
      const subs = await window.elix.getSubmissions();
      setSubmissions(subs || []);
    }
  };

  const handleConfirmReset = async () => {
    if (!window.elix) return;
    setIsResetting(true);
    await window.elix.resetPracticeProgress();
    window.dispatchEvent(new CustomEvent('elix-progress-reset'));
    await loadCareerData();
    setIsResetting(false);
    setShowResetModal(false);
  };

  const overallStreak = streaks['overall']?.currentStreak || streaks['dsa']?.currentStreak || 0;
  const longestStreak = streaks['overall']?.longestStreak || streaks['dsa']?.longestStreak || 0;
  const historyDates: string[] = streaks['overall']?.historyDates || [];

  // Generate 28-day streak heatmap from ACTUAL user activity timestamps
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // Filter actual logged activities for this exact date
    const dayActivities = activities.filter(a => a.timestamp && a.timestamp.startsWith(isoDate));
    const isRecordedInHistory = historyDates.includes(isoDate);
    const count = dayActivities.length;
    const active = count > 0 || isRecordedInHistory;

    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isoDate,
      active,
      count
    };
  });

  // Calculate live skills STRICTLY based on languages the user actually solved problems in
  const solvedCount = stats?.solvedCount || 0;
  const accuracy = stats?.accuracy || (solvedCount > 0 ? 100 : 0);

  const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
  const pySolves = acceptedSubmissions.filter(s => s.language === 'python').length;
  const cppSolves = acceptedSubmissions.filter(s => s.language === 'cpp').length;
  const javaSolves = acceptedSubmissions.filter(s => s.language === 'java').length;
  const cSolves = acceptedSubmissions.filter(s => s.language === 'c').length;
  const jsSolves = acceptedSubmissions.filter(s => s.language === 'javascript').length;

  const dsaScore = solvedCount > 0 ? Math.min(100, Math.max(15, Math.round((solvedCount * 12) + (accuracy * 0.08)))) : 0;
  const dsaLevel = stats?.userLevel || (dsaScore >= 80 ? 'Advanced' : dsaScore >= 45 ? 'Intermediate' : 'Beginner');

  const getLangLevel = (score: number) => score >= 75 ? 'Advanced' : score >= 40 ? 'Intermediate' : 'Beginner';

  const cppScore = cppSolves > 0 ? Math.min(100, Math.max(20, Math.round(20 + (cppSolves / 20) * 60))) : 0;
  const pyScore = pySolves > 0 ? Math.min(100, Math.max(20, Math.round(20 + (pySolves / 20) * 60))) : 0;
  const javaScore = javaSolves > 0 ? Math.min(100, Math.max(20, Math.round(20 + (javaSolves / 20) * 60))) : 0;
  const cScore = cSolves > 0 ? Math.min(100, Math.max(20, Math.round(20 + (cSolves / 20) * 60))) : 0;
  const jsScore = jsSolves > 0 ? Math.min(100, Math.max(20, Math.round(20 + (jsSolves / 20) * 60))) : 0;
  const gitScore = activities.length > 0 ? Math.min(100, Math.max(15, Math.round(15 + (activities.length / 50) * 45))) : 0;

  // STRICT Verified Skills list: Only shows languages where user has actual solved questions!
  const dynamicSkills: Array<{ name: string; level: string; score: number; countLabel: string }> = [];

  if (solvedCount > 0) {
    dynamicSkills.push({
      name: 'Data Structures & Algorithms',
      level: dsaLevel,
      score: dsaScore,
      countLabel: `${solvedCount} Problem${solvedCount > 1 ? 's' : ''} Solved`
    });
  }

  if (cppSolves > 0) {
    dynamicSkills.push({
      name: 'C++ Systems & STL',
      level: getLangLevel(cppScore),
      score: cppScore,
      countLabel: `${cppSolves} Verified Solve${cppSolves > 1 ? 's' : ''}`
    });
  }

  if (pySolves > 0) {
    dynamicSkills.push({
      name: 'Python Development & Algorithms',
      level: getLangLevel(pyScore),
      score: pyScore,
      countLabel: `${pySolves} Verified Solve${pySolves > 1 ? 's' : ''}`
    });
  }

  if (javaSolves > 0) {
    dynamicSkills.push({
      name: 'Java Ecosystem & Execution',
      level: getLangLevel(javaScore),
      score: javaScore,
      countLabel: `${javaSolves} Verified Solve${javaSolves > 1 ? 's' : ''}`
    });
  }

  if (cSolves > 0) {
    dynamicSkills.push({
      name: 'C Programming & Memory',
      level: getLangLevel(cScore),
      score: cScore,
      countLabel: `${cSolves} Verified Solve${cSolves > 1 ? 's' : ''}`
    });
  }

  if (jsSolves > 0) {
    dynamicSkills.push({
      name: 'JavaScript / Node.js',
      level: getLangLevel(jsScore),
      score: jsScore,
      countLabel: `${jsSolves} Verified Solve${jsSolves > 1 ? 's' : ''}`
    });
  }

  if (activities.length > 0) {
    dynamicSkills.push({
      name: 'Git & Workflow Execution',
      level: gitScore >= 70 ? 'Advanced' : 'Foundational',
      score: gitScore,
      countLabel: `${activities.length} Recorded Runs`
    });
  }

  // Dynamic Interview Readiness score
  const interviewReadiness = solvedCount > 0
    ? Math.min(100, Math.max(10, Math.round((solvedCount * 8) + ((accuracy / 100) * 12) + (overallStreak * 4))))
    : 0;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[var(--ide-bg)] text-[var(--ide-text)] p-6 md:p-8 select-none scrollbar-thin">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* VS Code Breadcrumb & Header Banner */}
        <div className="border-b border-[var(--ide-border)] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--ide-text-muted)] mb-1">
              <span>Workbench</span>
              <ChevronRight size={12} />
              <span className="text-[var(--ide-text)] font-medium">Developer Career Hub</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--ide-text)]">
              Career Readiness & Analytics
            </h1>
            <p className="text-xs text-[var(--ide-text-muted)] mt-1">
              Quantified progress metrics calculated strictly from your verified code executions, DSA submissions, and development projects.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Reset Progress Button */}
            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ide-input-bg)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)] hover:text-rose-400 border border-[var(--ide-border)] hover:border-rose-500/40 rounded-md text-xs font-medium transition-colors"
              title="Reset all stats and streaks back to zero"
            >
              <RotateCcw size={13} />
              <span>Reset Progress</span>
            </button>

            {/* Export Portfolio Data */}
            <button
              onClick={() => {
                const summary = `Elix Developer Portfolio:\n- Problems Solved: ${solvedCount}\n- Current Streak: ${overallStreak} Days\n- Verified Level: ${stats?.userLevel || 'Beginner'}\n- Interview Readiness: ${interviewReadiness}%\n- Total Verified Executions: ${activities.length}`;
                navigator.clipboard.writeText(summary);
                alert('Copied verified developer portfolio summary to clipboard!');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              <FileDown size={13} />
              <span>Export Portfolio Data</span>
            </button>
          </div>
        </div>

        {/* Primary Metrics Grid (VS Code Card Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--ide-text-muted)] font-medium block mb-1">Current Streak</span>
              <div className="text-xl font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                <Flame size={18} fill="currentColor" />
                <span>{overallStreak} Days</span>
              </div>
              <span className="text-[10px] text-[var(--ide-text-muted)] mt-1 block font-mono">Longest: {longestStreak} days</span>
            </div>
            <Activity size={24} className="text-amber-400/20" />
          </div>

          <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--ide-text-muted)] font-medium block mb-1">Problems Solved</span>
              <div className="text-xl font-bold text-[#007acc] font-mono">
                {solvedCount}
              </div>
              <span className="text-[10px] text-[var(--ide-text-muted)] mt-1 block font-mono">Accuracy: {accuracy}%</span>
            </div>
            <Target size={24} className="text-[#007acc]/20" />
          </div>

          <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--ide-text-muted)] font-medium block mb-1">Verified Skill Level</span>
              <div className="text-xl font-bold text-violet-400">
                {stats?.userLevel || 'Beginner'}
              </div>
              <span className="text-[10px] text-[var(--ide-text-muted)] mt-1 block">Live sandbox verified</span>
            </div>
            <Award size={24} className="text-violet-400/20" />
          </div>

          <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[var(--ide-text-muted)] font-medium block mb-1">Interview Readiness</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {interviewReadiness}%
              </div>
              <span className="text-[10px] text-[var(--ide-text-muted)] mt-1 block">DSA + Core benchmark</span>
            </div>
            <TrendingUp size={24} className="text-emerald-400/20" />
          </div>
        </div>

        {/* Developer Activity Heatmap (100% Real User Execution Data) */}
        <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)] flex items-center gap-2">
              <Calendar size={14} className="text-[#007acc]" />
              <span>Developer Activity Heatmap (Last 4 Weeks)</span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-[var(--ide-text-muted)] font-mono">
              <span>Inactive</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ide-bg)] border border-[var(--ide-border)]" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/40" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Active</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                title={`${day.date}: ${day.count} activities logged`}
                className={`h-9 rounded p-1.5 flex flex-col justify-between text-[10px] font-mono transition-colors border ${
                  day.active
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-medium'
                    : 'bg-[var(--ide-bg)] border-[var(--ide-border)] text-[var(--ide-text-muted)]'
                }`}
              >
                <span>{day.date}</span>
                <span className="text-right text-[8px]">
                  {day.active ? (day.count > 0 ? `● ${day.count} act` : '● Active') : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Competency Matrix (STRICTLY Verified Languages) */}
        <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)] flex items-center gap-2">
              <Code2 size={14} className="text-[#007acc]" />
              <span>Verified Skill Competency Matrix</span>
            </h2>
            <span className="text-[10px] text-[var(--ide-text-muted)] font-mono">
              Shows only languages with verified problem submissions
            </span>
          </div>

          {dynamicSkills.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--ide-text-muted)] border border-dashed border-[var(--ide-border)] rounded">
              Solve problems in Python, C++, Java, or JavaScript in the Practice Hub to verify and unlock language competencies here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dynamicSkills.map((skill, i) => (
                <div key={i} className="p-3 bg-[var(--ide-bg)] rounded-md border border-[var(--ide-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--ide-text)]">{skill.name}</span>
                    <span className="text-[var(--ide-text-muted)] font-mono text-[11px]">{skill.level} ({skill.score}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--ide-input-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#007acc] transition-all duration-500"
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#007acc] font-mono text-right">
                    {skill.countLabel}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline (Real Event Stream) */}
        <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)] flex items-center gap-2">
            <Clock size={14} className="text-[#007acc]" />
            <span>Recent Activity Timeline ({activities.length} Recorded Events)</span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {activities.length === 0 ? (
              <div className="text-[var(--ide-text-muted)] text-xs italic py-4">No activities recorded yet.</div>
            ) : (
              activities.slice(0, 10).map((act, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-[var(--ide-bg)] rounded border border-[var(--ide-border)] text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007acc] shrink-0" />
                  <span className="flex-1 text-[var(--ide-text)] truncate">{act.description}</span>
                  <span className="text-[10px] text-[var(--ide-text-muted)] shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--ide-border)]">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>Reset All Developer Progress?</span>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-[var(--ide-text-muted)] leading-relaxed">
              This will clear all verified submissions, execution activity logs, and streak counters, resetting your score and solved count back to <strong>0</strong> so you can start a fresh, verified streak.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--ide-border)]">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-4 py-1.5 bg-[#d83b01] hover:bg-[#c43501] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
