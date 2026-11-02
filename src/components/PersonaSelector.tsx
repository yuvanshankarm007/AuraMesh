import React, { useEffect, useRef, useState } from 'react';
import { DEMO_PERSONAS, DemoPersona } from '../data/personas';
import { Camera, DollarSign, Sliders, UserCheck, Play, Video, X, Upload } from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersona: DemoPersona | null;
  onSelectPersona: (persona: DemoPersona) => void;
  onCustomScenario: (image: string, goal: string, budget: number, diagnostics?: any) => void;
  isRunning: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
  onCustomScenario,
  isRunning
}) => {
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);
  const [customGoal, setCustomGoal] = useState('Clear acne & redness with non-comedogenic foundation');
  const [customBudget, setCustomBudget] = useState(48);
  const [customConcern, setCustomConcern] = useState<'acne' | 'mature' | 'barrier'>('acne');
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamNotice, setWebcamNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream tracks on unmount to prevent resource leak
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCustomScenario(
          reader.result as string,
          customGoal,
          customBudget
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      setIsWebcamOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn('Webcam playback error:', err));
        }
      }, 50);
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setIsWebcamOpen(false);
      setWebcamNotice('Webcam unavailable in this environment — please use Upload Photo or select a Demo Persona.');
      setTimeout(() => setWebcamNotice(null), 4500);
    }
  };

  const captureWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopWebcam();
        onCustomScenario(dataUrl, customGoal, customBudget);
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamOpen(false);
  };

  const handleRunCustom = () => {
    const fallbackImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    const simulatedDiagnostics = {
      overallScore: customConcern === 'acne' ? 62 : customConcern === 'mature' ? 70 : 54,
      acne: customConcern === 'acne' ? 40 : 85,
      pores: 52,
      texture: 56,
      wrinkles: customConcern === 'mature' ? 50 : 88,
      spots: 64,
      darkCircles: 70,
      redness: customConcern === 'barrier' ? 35 : 55,
      skinAge: customConcern === 'mature' ? 48 : 23,
      undertone: 'olive' as const,
      fitzpatrickScale: 3 as const,
      barrierHealth: (customConcern === 'barrier' ? 'severely_compromised' : 'sensitized') as any
    };

    onCustomScenario(fallbackImage, customGoal, customBudget, simulatedDiagnostics);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Select Test Subject or Simulate Custom Scenario
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCustomDrawer(!showCustomDrawer)}
            className="text-xs flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-pink-400" />
            <span>{showCustomDrawer ? 'Close Slider' : 'Custom Budget Slider'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRunning}
            className="text-xs flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            title="Upload Custom Image"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={startWebcam}
            disabled={isRunning}
            className="text-xs flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Camera</span>
          </button>
        </div>
      </div>

      {webcamNotice && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>{webcamNotice}</span>
          <button onClick={() => setWebcamNotice(null)} className="text-amber-400 hover:text-amber-200 text-xs font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Preset Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_PERSONAS.map((p) => {
          const isSelected = selectedPersona?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => (!isRunning ? onSelectPersona(p) : undefined)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                isSelected
                  ? 'bg-slate-850 border-pink-500/60 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              } ${isRunning ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <img
                src={p.avatarUrl}
                alt={p.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 truncate">
                    {p.name}, {p.age}
                  </h4>
                  <span className="text-[10px] font-mono font-medium text-emerald-400 flex items-center">
                    <DollarSign className="w-3 h-3" />
                    {p.budget}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-pink-400 mt-0.5 truncate">
                  {p.subtitle}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.userGoal}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Custom Scenario & Budget Slider Drawer */}
      {showCustomDrawer ? (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> Custom Budget & Goal Arbitrator
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Budget Ceiling: ${customBudget}.00
            </span>
          </div>

          <div className="space-y-1">
            <input
              type="range"
              min="25"
              max="120"
              step="5"
              value={customBudget}
              onChange={(e) => setCustomBudget(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$25 (Extreme Budget)</span>
              <span>$55 (Target)</span>
              <span>$120 (Luxury)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Primary Target Concern</label>
              <div className="flex gap-2">
                {(['acne', 'mature', 'barrier'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomConcern(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize border transition-all ${
                      customConcern === c
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-semibold'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end justify-end">
              <button
                onClick={handleRunCustom}
                disabled={isRunning}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate Multi-Agent Mesh (${customBudget})</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Live Webcam Modal */}
      {isWebcamOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-4 relative shadow-2xl">
            <button
              onClick={stopWebcam}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-400" /> Live Webcam Snapshot
            </h4>
            <div className="rounded-xl overflow-hidden aspect-square border border-slate-700 bg-black relative mb-3">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <button
              onClick={captureWebcam}
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Analyze</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
