import { CheckCircle2, Loader2, ExternalLink, Code2 } from 'lucide-react';
import { useProjectData } from '../api/queries';
import { useParams } from 'react-router-dom';
import { ProjectTimeline } from '../components/dashboard/ProjectTimeline';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProjectData(id ?? '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 font-semibold p-6 glass max-w-md rounded-2xl border border-red-500/20 text-center">
          Failed to load project details. Please try again.
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>Projects</span>
            <span>/</span>
            <span className="text-blue-600 font-medium">{data.name}</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {data.name}
              </h1>
              {data.repoUrl && (
                <a href={data.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-2 font-mono bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg w-fit transition-colors">
                  <Code2 className="w-4 h-4" /> {data.repoUrl.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl">
                {data.description}
              </p>
            </div>
            
            <div className="flex flex-col md:items-end w-full md:w-auto">
              <div className="flex items-center justify-between md:justify-end gap-4 w-full">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                <span className="text-lg font-bold text-blue-600">{data.progress}%</span>
              </div>
              <div className="w-full md:w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                  data.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {data.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
            Project Milestones
          </h2>
          <ProjectTimeline milestones={data.milestones} />
        </div>
      </div>
    </div>
  );
}
