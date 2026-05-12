import { CheckCircle2, ShieldAlert, GitCommit, Loader2 } from 'lucide-react';
import { useProjectData } from '../api/queries';
import { useParams } from 'react-router-dom';

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{data.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                {data.description}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 dark:text-gray-400">Project Status</span>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-sm font-semibold mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {data.status}
              </span>
            </div>
          </div>
        </div>

        {/* Milestones / Logs */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" /> Verification Logs
          </h2>
          
          <div className="space-y-6">
            {data.logs.map((log, i) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                    <GitCommit className="w-4 h-4 text-blue-600" />
                  </div>
                  {i !== data.logs.length - 1 && <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-2"></div>}
                </div>
                <div className="pb-6">
                  {log.completedAt && <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{new Date(log.completedAt).toLocaleString()}</p>}
                  <h3 className="font-medium mt-1">{log.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{log.description}</p>
                  {log.status === 'completed' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium border border-emerald-100 dark:border-emerald-800/30">
                      <CheckCircle2 className="w-3 h-3" /> Code verified
                    </div>
                  )}
                  {log.status === 'failed' && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs font-medium border border-red-100 dark:border-red-800/30">
                      <ShieldAlert className="w-3 h-3" /> Verification failed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
