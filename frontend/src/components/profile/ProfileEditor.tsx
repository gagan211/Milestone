import React, { useState } from 'react';
import { useUpdateProfile, useDashboardData } from '../../api/queries';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Loader2, Eye, Edit2, GripVertical, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

interface ProfileEditorProps {
  userId: string;
  initialLayout: any[];
  onSave: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ userId, initialLayout, onSave }) => {
  const [layout, setLayout] = useState(initialLayout || []);
  const [activeTabs, setActiveTabs] = useState<Record<string, 'write' | 'preview'>>({});
  
  const updateProfileMutation = useUpdateProfile(userId);
  const { data: dashboardData, isLoading: isLoadingDashboard } = useDashboardData();

  const isDirty = JSON.stringify(layout) !== JSON.stringify(initialLayout);
  const availableProjects = dashboardData?.activeProjects || [];

  const handleSave = async () => {
    if (!isDirty) {
      onSave();
      return;
    }
    await updateProfileMutation.mutateAsync({ profile_data: { layout } });
    onSave();
  };

  const updateBlockContent = (id: string, updatedContent: any) => {
    setLayout(layout.map(b => b.id === id ? { ...b, content: { ...b.content, ...updatedContent } } : b));
  };

  const removeBlock = (id: string) => {
    setLayout(layout.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= layout.length) return;
    const newLayout = [...layout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[nextIndex];
    newLayout[nextIndex] = temp;
    setLayout(newLayout);
  };

  const addBlock = (type: 'hero' | 'markdown' | 'project_showcase') => {
    // Prevent duplicate heroes
    if (type === 'hero' && layout.some(b => b.type === 'hero')) {
      toast.error("You can only have one Hero block on your profile!");
      return;
    }

    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      content: type === 'hero' 
        ? { headline: 'New Headline', tagline: 'Tell the world what you do.' }
        : type === 'markdown' 
          ? { body: '### New Block\nType markdown content here...' } 
          : { projects: [] }
    };
    setLayout([...layout, newBlock]);
  };

  // --- Project Showcase Helper Functions ---
  const toggleProjectInShowcase = (blockId: string, project: any, currentProjects: any[]) => {
    const isAlreadySelected = currentProjects.some(p => p.id === project.id);
    let updatedProjects;
    
    if (isAlreadySelected) {
      updatedProjects = currentProjects.filter(p => p.id !== project.id);
    } else {
      updatedProjects = [...currentProjects, {
        id: project.id,
        name: project.name,
        description: project.description || 'No description provided.',
        tags: project.tags || ['Milestone'],
        verified: project.status === 'verified' || project.progress === 100
      }];
    }
    updateBlockContent(blockId, { projects: updatedProjects });
  };

  const moveProjectInShowcase = (blockId: string, projects: any[], projectIndex: number, direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? projectIndex - 1 : projectIndex + 1;
    if (nextIndex < 0 || nextIndex >= projects.length) return;
    
    const updated = [...projects];
    const temp = updated[projectIndex];
    updated[projectIndex] = updated[nextIndex];
    updated[nextIndex] = temp;
    updateBlockContent(blockId, { projects: updated });
  };

  return (
    <div className="space-y-8 glass p-6 md:p-8 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl backdrop-blur-md">
      {/* Editor Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Customize Layout
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag, edit, and style your public developer landing page.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isDirty 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-600/20' 
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isDirty ? 'Save Changes' : 'Dismiss / Exit'}
        </button>
      </div>

      {/* Dynamic Blocks Container */}
      <div className="space-y-6">
        {layout.map((block, index) => {
          const writeTab = activeTabs[block.id] !== 'preview';
          return (
            <div 
              key={block.id} 
              className="relative p-6 bg-white/70 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Block Drag & Reorder Control Bar */}
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                  {block.type.replace('_', ' ')} Block
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveBlock(index, 'up')} 
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors" 
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveBlock(index, 'down')} 
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-gray-900 dark:hover:text-white transition-colors" 
                    disabled={index === layout.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeBlock(block.id)} 
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 hover:text-red-700 transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Contents Input Fields */}

              {/* HERO BLOCK EDITOR */}
              {block.type === 'hero' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Headline</label>
                    <input
                      type="text"
                      placeholder="Headline text..."
                      value={block.content?.headline || ''}
                      onChange={(e) => updateBlockContent(block.id, { headline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Tagline</label>
                    <input
                      type="text"
                      placeholder="Tagline text..."
                      value={block.content?.tagline || ''}
                      onChange={(e) => updateBlockContent(block.id, { tagline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* MARKDOWN BLOCK EDITOR (WITH TABBED PREVIEW) */}
              {block.type === 'markdown' && (
                <div className="space-y-3">
                  <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <button
                      onClick={() => setActiveTabs({ ...activeTabs, [block.id]: 'write' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                        writeTab 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setActiveTabs({ ...activeTabs, [block.id]: 'preview' })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                        !writeTab 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>

                  {writeTab ? (
                    <textarea
                      rows={6}
                      placeholder="Markdown format supported (headers, bullet points, code blocks)..."
                      value={block.content?.body || ''}
                      onChange={(e) => updateBlockContent(block.id, { body: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="prose prose-blue dark:prose-invert max-w-none p-4 bg-gray-50/30 dark:bg-gray-950/20 rounded-xl border border-gray-200/50 dark:border-gray-800/50 min-h-[120px]">
                      <Markdown>{block.content?.body || '*No content to preview yet.*'}</Markdown>
                    </div>
                  )}
                </div>
              )}

              {/* PROJECT SHOWCASE EDITOR */}
              {block.type === 'project_showcase' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                      Featured Sequence (Drag/Move to reorder cards)
                    </label>
                    
                    {/* Display currently selected/featured project cards with order buttons */}
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                      {(block.content?.projects || []).length === 0 ? (
                        <div className="w-full py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400 text-sm">
                          No projects featured in this block yet. Select them from the list below.
                        </div>
                      ) : (
                        block.content.projects.map((proj: any, idx: number) => (
                          <div key={proj.id} className="min-w-[280px] p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl relative space-y-2 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{proj.name}</h4>
                                {proj.verified && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{proj.description}</p>
                            </div>
                            
                            {/* Card ordering and deletion buttons */}
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-900/60">
                              <span className="text-[10px] font-bold text-gray-400">Position {idx + 1}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveProjectInShowcase(block.id, block.content.projects, idx, 'left')}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveProjectInShowcase(block.id, block.content.projects, idx, 'right')}
                                  disabled={idx === block.content.projects.length - 1}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5 rotate-90" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Active List to Select/Feature from */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase block">
                      Select Linked Repositories to Showcase
                    </label>
                    {isLoadingDashboard ? (
                      <div className="text-xs text-gray-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading linked projects...</div>
                    ) : availableProjects.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No linked projects found on dashboard. Go link a repository first!</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableProjects.map((project: any) => {
                          const featuredProjects = block.content?.projects || [];
                          const isFeatured = featuredProjects.some((p: any) => p.id === project.id);
                          return (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => toggleProjectInShowcase(block.id, project, featuredProjects)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                                isFeatured 
                                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400' 
                                  : 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold">{project.name}</span>
                                <span className="text-xs font-normal text-gray-400 line-clamp-1">{project.status} • {project.progress}%</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isFeatured 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'border-gray-300 dark:border-gray-700'
                              }`}>
                                {isFeatured && <Plus className="w-3.5 h-3.5 rotate-45" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Add Blocks Selector Footer */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Add Page Component</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => addBlock('hero')}
            className="px-4 py-3 border-2 border-dashed border-gray-200 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-600/40 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-all justify-center"
          >
            <Plus className="w-4 h-4" /> Hero Banner
          </button>
          
          <button
            onClick={() => addBlock('markdown')}
            className="px-4 py-3 border-2 border-dashed border-gray-200 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-600/40 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-all justify-center"
          >
            <Plus className="w-4 h-4" /> Markdown Writeup
          </button>

          <button
            onClick={() => addBlock('project_showcase')}
            className="px-4 py-3 border-2 border-dashed border-gray-200 hover:border-blue-500 dark:border-gray-800 dark:hover:border-blue-600/40 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-all justify-center"
          >
            <Plus className="w-4 h-4" /> Project Showcase
          </button>
        </div>
      </div>
    </div>
  );
};
