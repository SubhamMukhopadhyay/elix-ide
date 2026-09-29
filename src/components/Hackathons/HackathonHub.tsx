import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  GitBranch, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Flag, 
  Code,
  Sparkles,
  ChevronRight,
  X,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Share2
} from 'lucide-react';
import { HackathonItem } from '../../types';

export const HackathonHub: React.FC = () => {
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newProblem, setNewProblem] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('2026-10-15');
  const [newTeam, setNewTeam] = useState<string>('My Team');

  // Task & Editing states
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [demoUrlInput, setDemoUrlInput] = useState<string>('');
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    if (window.elix) {
      const list = await window.elix.getHackathons();
      setHackathons(list || []);
      if (list && list.length > 0) {
        if (!selectedHackathon || !list.some(h => h.id === selectedHackathon.id)) {
          setSelectedHackathon(list[0]);
          setDemoUrlInput(list[0].demoUrl || '');
        }
      } else {
        setSelectedHackathon(null);
      }
    }
  };

  const handleSelect = (h: HackathonItem) => {
    setSelectedHackathon(h);
    setDemoUrlInput(h.demoUrl || '');
    setIsEditingUrl(false);
    setIsAddingMember(false);
  };

  const handleCreateHackathon = async () => {
    if (!newTitle.trim()) return;
    const item: HackathonItem = {
      id: `hack_${Date.now()}`,
      name: newTitle.trim(),
      problemStatement: newProblem.trim() || 'Custom sprint project',
      eventDate: newDate,
      submissionDeadline: `${newDate}T23:59:00`,
      team: {
        name: newTeam.trim() || 'My Team',
        members: ['You']
      },
      techStack: ['TypeScript', 'React', 'Node'],
      tasks: [
        { id: `t_${Date.now()}_1`, title: 'Brainstorm architecture & scope', completed: false },
        { id: `t_${Date.now()}_2`, title: 'Set up repository & scaffold UI', completed: false }
      ],
      milestones: [
        { id: 'm1', title: 'Kickoff & Prototype', dueDate: newDate, completed: false }
      ],
      status: 'In Progress',
      demoUrl: ''
    };

    if (window.elix) {
      await window.elix.saveHackathon(item);
      setNewTitle('');
      setNewProblem('');
      setShowCreateModal(false);
      await loadHackathons();
      setSelectedHackathon(item);
    }
  };

  const handleDeleteHackathon = async (id: string) => {
    if (!window.elix) return;
    if (confirm('Are you sure you want to delete this hackathon sprint?')) {
      await window.elix.deleteHackathon(id);
      await loadHackathons();
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!selectedHackathon || !window.elix) return;
    const updated = {
      ...selectedHackathon,
      tasks: (selectedHackathon.tasks || []).map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    };
    await window.elix.saveHackathon(updated);
    setSelectedHackathon(updated);
    setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedHackathon || !window.elix) return;
    const newTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false
    };
    const updated = {
      ...selectedHackathon,
      tasks: [...(selectedHackathon.tasks || []), newTask]
    };
    await window.elix.saveHackathon(updated);
    setSelectedHackathon(updated);
    setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
    setNewTaskTitle('');
  };

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedHackathon || !window.elix) return;
    const updated = {
      ...selectedHackathon,
      tasks: (selectedHackathon.tasks || []).filter(t => t.id !== taskId)
    };
    await window.elix.saveHackathon(updated);
    setSelectedHackathon(updated);
    setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
  };

  const handleSaveDemoUrl = async () => {
    if (!selectedHackathon || !window.elix) return;
    const updated = {
      ...selectedHackathon,
      demoUrl: demoUrlInput.trim()
    };
    await window.elix.saveHackathon(updated);
    setSelectedHackathon(updated);
    setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
    setIsEditingUrl(false);
  };

  const handleAddTeamMember = async () => {
    if (!newMemberName.trim() || !selectedHackathon || !window.elix) return;
    const currentMembers = selectedHackathon.team.members || [];
    if (!currentMembers.includes(newMemberName.trim())) {
      const updated = {
        ...selectedHackathon,
        team: {
          ...selectedHackathon.team,
          members: [...currentMembers, newMemberName.trim()]
        }
      };
      await window.elix.saveHackathon(updated);
      setSelectedHackathon(updated);
      setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
    }
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const handleRemoveTeamMember = async (member: string) => {
    if (!selectedHackathon || !window.elix) return;
    const updated = {
      ...selectedHackathon,
      team: {
        ...selectedHackathon.team,
        members: (selectedHackathon.team.members || []).filter(m => m !== member)
      }
    };
    await window.elix.saveHackathon(updated);
    setSelectedHackathon(updated);
    setHackathons(prev => prev.map(h => (h.id === updated.id ? updated : h)));
  };

  const totalTasks = selectedHackathon?.tasks?.length || 0;
  const completedTasks = selectedHackathon?.tasks?.filter(t => t.completed).length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 h-full flex overflow-hidden bg-[var(--ide-bg)] text-[var(--ide-text)] select-none">
      {/* Hackathons List Column (VS Code Sidebar style) */}
      <div className="w-72 bg-[var(--ide-sidebar-bg)] border-r border-[var(--ide-border)] flex flex-col justify-between shrink-0">
        <div className="h-9 px-3 border-b border-[var(--ide-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-[#007acc]" />
            <span className="font-semibold text-xs text-[var(--ide-text)] uppercase tracking-wider">
              Hackathons ({hackathons.length})
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs transition-colors"
            title="Create new Hackathon Sprint"
          >
            <Plus size={12} />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {hackathons.map(h => {
            const isSelected = selectedHackathon?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => handleSelect(h)}
                className={`p-2.5 rounded-md cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-[#007acc]/15 border-[#007acc] text-[var(--ide-text)]'
                    : 'bg-transparent border-transparent hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-medium text-xs text-[var(--ide-text)] truncate">
                    {h.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-medium bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] border border-[var(--ide-border)] shrink-0">
                    {h.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[var(--ide-text-muted)] font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{h.eventDate}</span>
                  </div>
                  <span>{h.tasks?.filter(t => t.completed).length || 0}/{h.tasks?.length || 0} done</span>
                </div>
              </div>
            );
          })}

          {hackathons.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--ide-text-muted)]">
              No hackathon sprints yet. Click <strong>+ New</strong> above to create one.
            </div>
          )}
        </div>
      </div>

      {/* Hackathon Workspace details */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-5 scrollbar-thin">
        {selectedHackathon ? (
          <>
            {/* Header banner */}
            <div className="p-5 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                  STATUS: {selectedHackathon.status}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--ide-text-muted)] font-mono flex items-center gap-1.5">
                    <Clock size={12} className="text-[#007acc]" />
                    <span>Deadline: {selectedHackathon.submissionDeadline}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteHackathon(selectedHackathon.id)}
                    className="p-1 text-[var(--ide-text-muted)] hover:text-rose-400 hover:bg-[var(--ide-hover-bg)] rounded transition-colors"
                    title="Delete Hackathon Sprint"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h1 className="text-xl font-bold text-[var(--ide-text)] tracking-tight">
                {selectedHackathon.name}
              </h1>
              <p className="text-xs text-[var(--ide-text-muted)] leading-relaxed">
                {selectedHackathon.problemStatement}
              </p>

              {/* Tech Stack pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--ide-border)]">
                {selectedHackathon.techStack.map((tech, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[var(--ide-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team and Demo Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Team Members Card */}
              <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--ide-text)] mb-2.5">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#007acc]" />
                    <span>Team: {selectedHackathon.team.name}</span>
                  </div>
                  {!isAddingMember && (
                    <button
                      onClick={() => setIsAddingMember(true)}
                      className="text-[10px] text-[#007acc] hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={11} /> Add Member
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  {selectedHackathon.team.members.map((m, i) => (
                    <span 
                      key={i} 
                      className="text-xs px-2.5 py-1 bg-[var(--ide-bg)] rounded text-[var(--ide-text)] border border-[var(--ide-border)] font-mono flex items-center gap-1.5 group"
                    >
                      <span>{m}</span>
                      {selectedHackathon.team.members.length > 1 && (
                        <button
                          onClick={() => handleRemoveTeamMember(m)}
                          className="text-[var(--ide-text-muted)] hover:text-rose-400 opacity-60 group-hover:opacity-100"
                          title="Remove Member"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  ))}

                  {isAddingMember && (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        placeholder="Name..."
                        onKeyDown={e => e.key === 'Enter' && handleAddTeamMember()}
                        className="px-2 py-0.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] w-24 focus:outline-none focus:border-[#007acc]"
                      />
                      <button
                        onClick={handleAddTeamMember}
                        className="p-1 bg-[#007acc] text-white rounded text-xs"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        onClick={() => setIsAddingMember(false)}
                        className="p-1 text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Demo URL Card */}
              <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[var(--ide-text-muted)] mb-1">
                  <span>Demo / Submission Link</span>
                  {!isEditingUrl ? (
                    <button
                      onClick={() => setIsEditingUrl(true)}
                      className="text-[10px] text-[#007acc] hover:underline flex items-center gap-1"
                    >
                      <Edit2 size={10} /> Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSaveDemoUrl}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        <Check size={11} /> Save
                      </button>
                      <button
                        onClick={() => setIsEditingUrl(false)}
                        className="text-[10px] text-[var(--ide-text-muted)] hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isEditingUrl ? (
                  <input
                    type="url"
                    value={demoUrlInput}
                    onChange={e => setDemoUrlInput(e.target.value)}
                    placeholder="https://my-project-demo.com"
                    onKeyDown={e => e.key === 'Enter' && handleSaveDemoUrl()}
                    className="w-full px-2.5 py-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs font-mono text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                  />
                ) : (
                  selectedHackathon.demoUrl ? (
                    <a
                      href={selectedHackathon.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#007acc] flex items-center gap-1 hover:underline truncate"
                    >
                      <span className="truncate">{selectedHackathon.demoUrl}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  ) : (
                    <span className="text-xs text-[var(--ide-text-muted)] italic">
                      No URL configured. Click 'Edit' to set your demo link.
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Sprint Task Board */}
            <div className="p-4 bg-[var(--ide-panel-bg)] border border-[var(--ide-border)] rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
                    Sprint Task Board
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-[var(--ide-text-muted)]">
                  {completedTasks} of {totalTasks} completed ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-[var(--ide-input-bg)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Tasks List */}
              <div className="space-y-1.5">
                {(selectedHackathon.tasks || []).map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center justify-between p-2.5 bg-[var(--ide-bg)] border border-[var(--ide-border)] rounded-md cursor-pointer hover:border-[#007acc]/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="rounded accent-[#007acc] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={`text-xs ${task.completed ? 'line-through text-[var(--ide-text-muted)]' : 'text-[var(--ide-text)]'}`}>
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={e => handleDeleteTask(task.id, e)}
                      className="p-1 text-[var(--ide-text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Task"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Type a new sprint task and press Enter..."
                  className="flex-1 px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                >
                  <Plus size={12} />
                  <span>Add Task</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-[var(--ide-text-muted)] text-xs space-y-2 border border-dashed border-[var(--ide-border)] rounded-md">
            <Trophy size={28} className="mx-auto text-[var(--ide-text-muted)]" />
            <p>No hackathon sprint selected or available.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-medium"
            >
              Create New Hackathon Sprint
            </button>
          </div>
        )}
      </div>

      {/* Create Hackathon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--ide-border)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
                Create Hackathon Sprint
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">Hackathon Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Smart India Hackathon 2026"
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam}
                  onChange={e => setNewTeam(e.target.value)}
                  placeholder="e.g. Code Ninjas"
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">Problem Statement</label>
                <textarea
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  placeholder="Describe the challenge & objectives"
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc] h-20"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--ide-border)]">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="px-3 py-1 text-xs text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateHackathon} 
                disabled={!newTitle.trim()}
                className="px-4 py-1 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
              >
                Create Sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
