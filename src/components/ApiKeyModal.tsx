import React, { useState } from 'react';
import { Key, ShieldCheck, Cpu, ExternalLink, X, Check } from 'lucide-react';
import { YouCamGatewayWorker } from '../agent-core/YouCamGatewayWorker';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave }) => {
  const worker = YouCamGatewayWorker.getInstance();
  const [apiKey, setApiKey] = useState(worker.getApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    worker.setApiKey(apiKey);
    onSave(apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    worker.setApiKey('');
    setApiKey('');
    onSave('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              YouCam API Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Perfect Corp Developer Gateway
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Enter your <strong>Perfect Corp YouCam API Key</strong> to connect live server-to-server endpoints (<code>/task/skin-analysis</code> and <code>/task/makeup-vto</code>).
        </p>

        {/* Sponsor API Guard Badge */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Built-In Zero-Crash Guard:</strong> If no API key is provided, the system automatically runs in <em>Demo Simulation Mode</em> with real diagnostic telemetry so live presentations never crash.
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <label className="block text-xs font-semibold text-slate-200">
            YouCam Bearer API Key
          </label>
          <input
            type="password"
            placeholder="Paste your YouCam API key..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <a
            href="https://yce.makeupar.com/api-console/en/api-keys/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            <span>Get Free Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center space-x-2">
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-lg shadow-pink-500/20 flex items-center space-x-1.5 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
