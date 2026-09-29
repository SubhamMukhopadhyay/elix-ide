import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileCode, 
  Terminal, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  LayoutGrid, 
  Plus, 
  Trash2,
  Boxes,
  Code,
  Globe,
  Database,
  Smartphone,
  Server,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { ProjectMetadata, ProjectTemplate } from '../../types';

interface HomeScreenProps {
  onOpenFolder: () => void;
  onNewFile: () => void;
  recentProjects: ProjectMetadata[];
  onOpenProject: (project: ProjectMetadata) => void;
  templates: ProjectTemplate[];
  onCreateFromTemplate: (template: ProjectTemplate) => void;
  onSelectPractice: () => void;
  onSelectHackathon: () => void;
  onSelectCareer: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenFolder,
  onNewFile,
  recentProjects,
  onOpenProject,
  templates,
  onCreateFromTemplate,
  onSelectPractice,
  onSelectHackathon,
  onSelectCareer
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('fullstack');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');

  const [categories, setCategories] = useState<Array<{ id: string; name: string; description: string; icon: string }>>([
    { id: 'fullstack', name: 'Web & Fullstack', description: 'React, Next.js, Node.js, Vite', icon: 'globe' },
    { id: 'python', name: 'AI & Data Science', description: 'Python, PyTorch, Pandas, Scikit-learn', icon: 'cpu' },
    { id: 'mobile', name: 'Mobile Apps', description: 'React Native, Expo, Fast Refresh simulator', icon: 'smartphone' },
    { id: 'systems', name: 'Systems & C/C++', description: 'C++20, C, Rust, Embedded & OS tooling', icon: 'server' },
    { id: 'backend', name: 'Backend & APIs', description: 'Java Spring Boot, FastAPI, Go, Express', icon: 'database' },
    { id: 'practice', name: 'DSA & Interviews', description: '1,300+ LeetCode problems & AI mentor', icon: 'code' },
    { id: 'hackathons', name: 'Hackathon Sprints', description: 'Sprint planner, milestones & demo submission', icon: 'trophy' }
  ]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe': return <Globe size={18} className="text-[#007acc]" />;
      case 'cpu': return <Cpu size={18} className="text-violet-400" />;
      case 'smartphone': return <Smartphone size={18} className="text-emerald-400" />;
      case 'server': return <Server size={18} className="text-amber-400" />;
      case 'database': return <Database size={18} className="text-sky-400" />;
      case 'code': return <Code size={18} className="text-cyan-400" />;
      case 'trophy': return <Trophy size={18} className="text-amber-400" />;
      default: return <Boxes size={18} className="text-[#007acc]" />;
    }
  };

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setNewProjectName(`${template.id}-app`);
    setShowCreateModal(true);
  };

  const handleCreateProject = () => {
    if (!selectedTemplate) return;
    const finalTemplate: ProjectTemplate = {
      ...selectedTemplate,
      name: newProjectName || selectedTemplate.name
    };
    onCreateFromTemplate(finalTemplate);
    setShowCreateModal(false);
  };

  const handleCreateCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    const id = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      id,
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim() || 'Custom user workflows',
      icon: 'boxes'
    };
    setCategories(prev => [...prev, newCat]);
    setSelectedCategory(id);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setShowAddCategoryModal(false);
  };

  const filteredTemplates = templates.filter(t => t.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 bg-[var(--ide-bg)] text-[var(--ide-text)] select-none scrollbar-thin">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--ide-border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-[#007acc]/15 text-[#007acc] border border-[#007acc]/30 text-[10px] font-semibold tracking-wider uppercase font-mono">
              Universal IDE
            </span>
            <span className="text-xs text-[var(--ide-text-muted)]">• Zero-Config Runtimes</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--ide-text)]">
            Welcome to <span className="text-[#007acc]">Elix IDE</span>
          </h1>
          <p className="text-[var(--ide-text-muted)] text-xs mt-1">
            Choose a development category or open an existing directory to start coding.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-medium transition-colors shadow-xs"
          >
            <FolderOpen size={14} />
            <span>Open Folder</span>
          </button>
        </div>
      </div>

      {/* Continue where you left off / Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)] flex items-center gap-2">
              <Clock size={13} className="text-[#007acc]" />
              <span>Continue Where You Left Off</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {recentProjects.slice(0, 3).map(proj => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="p-3.5 bg-[var(--ide-panel-bg)] hover:bg-[var(--ide-hover-bg)] border border-[var(--ide-border)] hover:border-[#007acc]/50 rounded-md cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-[var(--ide-text)] group-hover:text-[#007acc] transition-colors truncate">
                      {proj.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--ide-input-bg)] text-[var(--ide-text-muted)] border border-[var(--ide-border)] font-mono">
                      {proj.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ide-text-muted)] font-mono truncate">{proj.path}</p>
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-[var(--ide-text-muted)]">
                  <span>Recently active</span>
                  <ArrowRight size={12} className="text-[var(--ide-text-muted)] group-hover:text-[#007acc] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
            Development Categories
          </h2>
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center gap-1 text-xs text-[#007acc] hover:underline transition-colors"
          >
            <Plus size={13} />
            <span>Add Custom Category</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'practice') {
                    onSelectPractice();
                  } else if (cat.id === 'hackathons') {
                    onSelectHackathon();
                  } else {
                    setSelectedCategory(cat.id);
                  }
                }}
                className={`flex flex-col items-start p-3 rounded-md border text-left transition-all ${
                  isSelected
                    ? 'bg-[#007acc]/15 border-[#007acc] text-[var(--ide-text)]'
                    : 'bg-[var(--ide-panel-bg)] border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-[var(--ide-text-muted)]'
                }`}
              >
                <div className="p-1.5 rounded bg-[var(--ide-bg)] border border-[var(--ide-border)] mb-2">
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="font-semibold text-xs text-[var(--ide-text)] truncate w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-[var(--ide-text-muted)] line-clamp-1 mt-0.5">
                  {cat.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Framework & Templates for Selected Category */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
            Available Templates ({filteredTemplates.length})
          </h2>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="p-6 border border-dashed border-[var(--ide-border)] rounded-md text-center bg-[var(--ide-panel-bg)] space-y-2">
            <Sparkles size={24} className="mx-auto text-[var(--ide-text-muted)]" />
            <p className="text-xs text-[var(--ide-text-muted)]">
              No pre-bundled templates for this category yet.
            </p>
            <button
              onClick={onOpenFolder}
              className="px-3 py-1 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] hover:bg-[var(--ide-hover-bg)] text-xs text-[var(--ide-text)] rounded"
            >
              Open any existing directory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                className="p-4 bg-[var(--ide-panel-bg)] hover:border-[#007acc]/50 border border-[var(--ide-border)] rounded-md flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ide-input-bg)] text-[var(--ide-text)] border border-[var(--ide-border)] font-mono">
                      {tmpl.language}
                    </span>
                    {tmpl.framework && (
                      <span className="text-[10px] text-[var(--ide-text-muted)] font-mono">
                        {tmpl.framework}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-xs text-[var(--ide-text)] group-hover:text-[#007acc] transition-colors">
                    {tmpl.name}
                  </h3>
                  <p className="text-[11px] text-[var(--ide-text-muted)] mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--ide-border)] flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 size={11} /> Ready to Run
                  </span>
                  <button
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white font-medium rounded text-xs transition-colors"
                  >
                    <span>Create</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Creation Modal */}
      {showCreateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--ide-border)]">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
                  Create New Project
                </h3>
                <p className="text-[11px] text-[var(--ide-text-muted)] mt-0.5">
                  Template: {selectedTemplate.name} ({selectedTemplate.language})
                </p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                  placeholder="e.g. my-awesome-app"
                />
              </div>

              <div className="p-3 bg-[var(--ide-bg)] rounded border border-[var(--ide-border)] text-xs text-[var(--ide-text-muted)] space-y-1 font-mono">
                <div>⚡ Execution: Auto (Local bundled runtimes)</div>
                <div>📁 Target: D:/Engineering/Project/{newProjectName}</div>
                <div>▶ Run command: {selectedTemplate.runCommand}</div>
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
                onClick={handleCreateProject}
                className="px-4 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-medium transition-colors"
              >
                Create & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--ide-sidebar-bg)] border border-[var(--ide-border)] rounded-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--ide-border)]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--ide-text)]">
                Create Custom Category
              </h3>
              <button 
                onClick={() => setShowAddCategoryModal(false)}
                className="text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                  placeholder="e.g. Placement Prep, Freelancing, AI Research"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--ide-text)] mb-1">Description</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--ide-input-bg)] border border-[var(--ide-border)] rounded text-xs text-[var(--ide-text)] focus:outline-none focus:border-[#007acc]"
                  placeholder="Short summary for this category"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--ide-border)]">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-3 py-1 text-xs text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomCategory}
                className="px-4 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded text-xs font-medium transition-colors"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
