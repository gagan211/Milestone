import React from 'react';
import Markdown from 'react-markdown';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import type { ProfileData } from '../../api/queries';

interface ProfileRendererProps {
  layout: ProfileData['profile_data']['layout'];
}

const HeroBlock: React.FC<{ content: any }> = ({ content }) => (
  <div className="py-12 md:py-20 text-center space-y-6">
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
      {content.headline || 'Developer Extraordinaire'}
    </h1>
    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
      {content.tagline || 'Building the future, one line of code at a time.'}
    </p>
  </div>
);

const MarkdownBlock: React.FC<{ content: any }> = ({ content }) => (
  <div className="prose prose-blue dark:prose-invert max-w-none glass p-8 rounded-2xl border border-white/20 dark:border-white/10">
    <Markdown>{content.body || ''}</Markdown>
  </div>
);

const ProjectShowcaseBlock: React.FC<{ content: any }> = ({ content }) => {
  const projects = content.projects || [];
  
  if (projects.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        Featured Projects
      </h2>
      <div className="flex overflow-x-auto pb-6 gap-6 snap-x hide-scrollbar">
        {projects.map((project: any) => (
          <div key={project.id} className="snap-start min-w-[300px] md:min-w-[400px] glass rounded-2xl p-6 group cursor-pointer hover:border-blue-500/50 transition-colors border border-white/20 dark:border-white/10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                {project.name} <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              {project.verified && (
                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow line-clamp-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.tags?.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileRenderer: React.FC<ProfileRendererProps> = ({ layout }) => {
  return (
    <div className="space-y-12">
      {layout.map((block) => {
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} content={block.content} />;
          case 'markdown':
            return <MarkdownBlock key={block.id} content={block.content} />;
          case 'project_showcase':
            return <ProjectShowcaseBlock key={block.id} content={block.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
};
