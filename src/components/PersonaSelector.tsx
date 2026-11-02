import React, { useEffect, useRef, useState } from 'react';
import { DEMO_PERSONAS, DemoPersona } from '../data/personas';
import { Camera, DollarSign, Sliders, UserCheck, Play, Video, X, Upload, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersona: DemoPersona | null;
  onSelectPersona: (persona: DemoPersona) => void;
  onCustomScenario: (image: string, goal: string, budget: number, diagnostics?: any) => void;
  isRunning: boolean;
  currentUserImage?: string;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
  onCustomScenario,
  isRunning,
  currentUserImage
}) => {
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);
  const [customGoal, setCustomGoal] = useState('Clear acne & redness with non-comedogenic foundation');
  const [customBudget, setCustomBudget] = useState(48);
  const [customConcern, setCustomConcern] = useState<'acne' | 'mature' | 'barrier' | 'glow'>('acne');
  const [customSelfieUrl, setCustomSelfieUrl] = useState<string | null>(currentUserImage || null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamNotice, setWebcamNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom selfie with props
  useEffect(() => {
    if (currentUserImage && !selectedPersona) {
      setCustomSelfieUrl(currentUserImage);
    }
  }, [currentUserImage, selectedPersona]);

  // Clean up camera stream tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const getSimulatedDiagnostics = (concern: 'acne' | 'mature' | 'barrier' | 'glow') => {
    switch (concern) {
      case 'acne':
        return {
          overallScore: 62,
          acne: 38,
          pores: 48,
          texture: 54,
          wrinkles: 88,
          spots: 65,
          darkCircles: 68,
          redness: 42,
          skinAge: 23,
          undertone: 'olive' as const,
          fitzpatrickScale: 3 as const,
          barrierHealth: 'sensitized' as const
        };
      case 'mature':
        return {
          overallScore: 68,
          acne: 85,
          pores: 58,
          texture: 60,
          wrinkles: 44,
          spots: 52,
          darkCircles: 62,
          redness: 70,
          skinAge: 46,
          undertone: 'neutral' as const,
          fitzpatrickScale: 2 as const,
          barrierHealth: 'intact' as const
        };
      case 'barrier':
        return {
          overallScore: 50,
          acne: 60,
          pores: 55,
          texture: 45,
          wrinkles: 75,
          spots: 70,
          darkCircles: 65,
          redness: 30,
          skinAge: 27,
          undertone: 'warm' as const,
          fitzpatrickScale: 4 as const,
          barrierHealth: 'severely_compromised' as const
        };
      case 'glow':
      default:
        return {
          overallScore: 78,
          acne: 80,
          pores: 72,
          texture: 75,
          wrinkles: 82,
          spots: 68,
          darkCircles: 60,
          redness: 75,
          skinAge: 25,
          undertone: 'cool' as const,
          fitzpatrickScale: 2 as const,
          barrierHealth: 'intact' as const
        };
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setWebcamNotice('Please select an image file (JPG, PNG, WebP).');
      setTimeout(() => setWebcamNotice(null), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setCustomSelfieUrl(dataUrl);
      const diagnostics = getSimulatedDiagnostics(customConcern);
      onCustomScenario(dataUrl, customGoal, customBudget, diagnostics);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const startWebcam = async () => {
    try {
      setIsWebcamOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn('Webcam playback error:', err));
        }
      }, 50);
    } catch (err: any) {
      console.warn('Webcam permission denied or unavailable:', err);
      setIsWebcamOpen(false);
      setWebcamNotice('Webcam access was denied or not found. Please click "Upload Photo" to select any selfie from your files!');
      setTimeout(() => setWebcamNotice(null), 6000);
    }
  };

  const captureWebcam = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const w = videoRef.current.videoWidth || 480;
      const h = videoRef.current.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the webcam frame horizontally for a natural selfie look
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        stopWebcam();
        setCustomSelfieUrl(dataUrl);
        const diagnostics = getSimulatedDiagnostics(customConcern);
        onCustomScenario(dataUrl, customGoal, customBudget, diagnostics);
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

  const handleSelectConcern = (concern: 'acne' | 'mature' | 'barrier' | 'glow') => {
    setCustomConcern(concern);
    const goalMap = {
      acne: 'Clear inflammatory acne & refine pores with oil-free water gel',
      mature: 'Firm expression lines, boost collagen & restore radiance',
      barrier: 'Soothe redness and repair sensitized barrier with ceramides',
      glow: 'Glass skin hydration, antioxidant brightening & dewy finish'
    };
    setCustomGoal(goalMap[concern]);
    if (customSelfieUrl) {
      const diagnostics = getSimulatedDiagnostics(concern);
      onCustomScenario(customSelfieUrl, goalMap[concern], customBudget, diagnostics);
    }
  };

  const handleReRunCustomSelfie = () => {
    if (customSelfieUrl) {
      const diagnostics = getSimulatedDiagnostics(customConcern);
      onCustomScenario(customSelfieUrl, customGoal, customBudget, diagnostics);
    } else {
      fileInputRef.current?.click();
    }
  };

  const isCustomActive = !selectedPersona && !!customSelfieUrl;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Subject Selection & Personal Face Try-On
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCustomDrawer(!showCustomDrawer)}
            className={`text-xs flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showCustomDrawer
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-pink-400" />
            <span>{showCustomDrawer ? 'Close Settings' : 'Budget & Goal Settings'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {webcamNotice && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <span>{webcamNotice}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              Upload Photo
            </button>
            <button onClick={() => setWebcamNotice(null)} className="text-amber-400 hover:text-amber-200 font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Primary Row: Prominent "Try Your Own Face" Feature Card + Preset Personas */}
      <div className="space-y-3">
        {/* PROMINENT USER FACE CARD */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
            isCustomActive
              ? 'bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border-pink-500/70 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50'
              : isDragging
              ? 'bg-cyan-950/40 border-cyan-400 border-dashed ring-2 ring-cyan-400/50'
              : 'bg-gradient-to-r from-cyan-950/25 via-slate-900 to-slate-900/90 border-cyan-500/40 hover:border-cyan-400/70'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {/* Photo Thumbnail or Upload Placeholder */}
              <div className="relative shrink-0">
                {customSelfieUrl ? (
                  <div className="relative">
                    <img
                      src={customSelfieUrl}
                      alt="Your Face"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-pink-400 shadow-md"
                    />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-cyan-400/60 bg-cyan-950/30 flex flex-col items-center justify-center text-cyan-300">
                    <Camera className="w-6 h-6 text-cyan-400" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {customSelfieUrl ? 'Your Face (Active Subject)' : 'Try Your Own Face'}
                  </h4>
                  {customSelfieUrl ? (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
                      Loaded in AI Mesh
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Live Diagnostic
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {customSelfieUrl
                    ? 'Your photo is active in the YouCam Clinical Diagnostic & AR Try-On engine.'
                    : 'Upload any selfie or use your live webcam to run skin diagnostics & virtual try-on on yourself!'}
                </p>

                {/* Quick Target Concern Badges */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Target Concern:</span>
                  {(['acne', 'glow', 'barrier', 'mature'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSelectConcern(c)}
                      className={`text-[10px] px-2 py-0.5 rounded-md capitalize font-medium transition-all ${
                        customConcern === c
                          ? 'bg-pink-500 text-white font-bold shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c === 'acne' ? 'Acne & Pores' : c === 'glow' ? 'Glass Skin Glow' : c === 'barrier' ? 'Barrier Repair' : 'Anti-Aging'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRunning}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{customSelfieUrl ? 'Upload New Photo' : 'Upload Selfie'}</span>
              </button>

              <button
                onClick={startWebcam}
                disabled={isRunning}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/20"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{customSelfieUrl ? 'Retake Live Selfie' : 'Use Live Camera'}</span>
              </button>

              {customSelfieUrl && (
                <button
                  onClick={handleReRunCustomSelfie}
                  disabled={isRunning}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  title="Re-run Multi-Agent Analysis"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">Analyze</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* OR DIVIDER */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Or select clinical benchmark personas
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* PRESET PERSONAS GRID */}
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
              <span>$25 (Strict Drugstore)</span>
              <span>$55 (Target Clinical)</span>
              <span>$120 (Luxury Medical-Grade)</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-slate-300">
              <span className="text-slate-400">Current Objective:</span> <strong className="text-pink-300">{customGoal}</strong>
            </div>

            <button
              onClick={handleReRunCustomSelfie}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run AI Mesh on {customSelfieUrl ? 'Your Face' : 'Scenario'} (${customBudget})</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Live Webcam Modal with Oval Alignment Guide & Mirrored View */}
      {isWebcamOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 relative shadow-2xl space-y-4">
            <button
              onClick={stopWebcam}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-400" />
              <h4 className="text-sm font-bold text-slate-100">Live Webcam Selfie Capture</h4>
            </div>

            <p className="text-xs text-slate-400">
              Align your face within the frame in even lighting for accurate YouCam facial landmark detection.
            </p>

            {/* Video Container with Oval Face Guide */}
            <div className="rounded-xl overflow-hidden aspect-square border-2 border-slate-700 bg-black relative shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Facial Alignment Target Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[62%] h-[78%] rounded-[50%] border-2 border-dashed border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center">
                  <div className="text-[10px] text-cyan-300 font-mono tracking-wider bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-sm -translate-y-12">
                    CENTER FACE
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={captureWebcam}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Take Snapshot & Run AI Analysis</span>
              </button>
              <button
                onClick={stopWebcam}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
