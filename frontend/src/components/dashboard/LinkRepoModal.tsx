import React, { useState } from 'react';
import { X, Code2, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Glass } from '../ui/Glass';

interface LinkRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoUrl: string) => void;
}

export const LinkRepoModal: React.FC<LinkRepoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [step, setStep] = useState<'input' | 'validating' | 'success' | 'error'>('input');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLink = async () => {
    setStep('validating');
    setError('');

    // Mock validation: In real app, this pings the backend
    setTimeout(() => {
      if (repoUrl.includes('invalid')) {
        setStep('error');
        setError('This repository is not associated with any active client projects on Milestone.');
      } else {
        setStep('success');
        setTimeout(() => {
          onSuccess(repoUrl);
          onClose();
          setStep('input');
          setRepoUrl('');
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Glass className="w-full max-w-md rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 dark:bg-black/20">
          <h2 className="text-xl font-bold">Link Project Repository</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {step === 'input' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                  Enter the GitHub repository URL assigned to your client project. We will verify the link and start background tracking.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Repository URL</label>
                <div className="relative">
                  <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="github.com/username/repo"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                disabled={!repoUrl}
                onClick={handleLink}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                Verify & Link
              </button>
            </div>
          )}

          {step === 'validating' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-lg">Validating Repository</p>
                <p className="text-sm text-gray-500">Checking project associations...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-emerald-600">Link Successful!</p>
                <p className="text-sm text-gray-500">Verification task started in background.</p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-6">
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 flex flex-col items-center text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <p className="font-bold text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button
                onClick={() => setStep('input')}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Try Another Repository
              </button>
            </div>
          )}
        </div>
      </Glass>
    </div>
  );
};
