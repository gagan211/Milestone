import { Lock, AlertTriangle } from 'lucide-react';

export interface ApiError {
  error: string;
  message: string;
  action?: 'reauthorize' | 'retry' | null;
  redirect_url?: string | null;
}

interface ApiErrorCardProps {
  errorObj: ApiError;
  onReauthorize: (url: string) => void;
  onRetry?: () => void;
}

export function ApiErrorCard({ errorObj, onReauthorize, onRetry }: ApiErrorCardProps) {
  if (errorObj.action === 'reauthorize' && errorObj.redirect_url) {
    return (
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col items-center text-center space-y-4">
        <Lock className="w-10 h-10 text-blue-500" />
        <div>
          <p className="font-bold text-blue-800 dark:text-blue-300">Authorization Required</p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{errorObj.message}</p>
        </div>
        <button 
          onClick={() => onReauthorize(errorObj.redirect_url!)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
        >
          Grant Access on GitHub
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 flex flex-col items-center text-center space-y-4">
      <AlertTriangle className="w-10 h-10 text-red-500" />
      <div>
        <p className="font-bold text-red-700 dark:text-red-400">Action Failed</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorObj.message}</p>
      </div>
      {errorObj.action === 'retry' && onRetry && (
        <button 
          onClick={onRetry}
          className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
