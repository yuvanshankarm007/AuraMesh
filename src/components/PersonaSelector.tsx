import React, { useEffect, useRef, useState } from 'react';
import { DEMO_PERSONAS, DemoPersona } from '../data/personas';
import { FaceDetectionEngine } from '../agent-core/FaceDetectionEngine';
import { FaceDetectionResult, SkinDiagnosticScores } from '../agent-core/types';
import {
  Camera,
  DollarSign,
  Sliders,
  UserCheck,
  Play,
  Video,
  X,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Scan,
  AlertCircle
} from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersona: DemoPersona | null;
  onSelectPersona: (persona: DemoPersona) => void;
  onCustomScenario: (
    image: string,
    goal: string,
    budget: number,
    diagnostics?: SkinDiagnosticScores,
    faceDetection?: FaceDetectionResult
  ) => void;
  isRunning: boolean;
  currentUserImage?: string;
  activeFaceDetection?: FaceDetectionResult;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onSelectPersona,
  onCustomScenario,
  isRunning,
  currentUserImage,
  activeFaceDetection
}) => {
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);
  const [customGoal, setCustomGoal] = useState('Clear acne & redness with non-comedogenic foundation');
  const [customBudget, setCustomBudget] = useState(48);
  const [customConcern, setCustomConcern] = useState<'acne' | 'mature' | 'barrier' | 'glow'>('acne');
  const [customSelfieUrl, setCustomSelfieUrl] = useState<string | null>(currentUserImage || null);
  const [faceDetectionState, setFaceDetectionState] = useState<FaceDetectionResult | null>(activeFaceDetection || null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamNotice, setWebcamNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Live Webcam Face Tracking State
  const [liveFaceDetection, setLiveFaceDetection] = useState<FaceDetectionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync custom selfie with props
  useEffect(() => {
    if (currentUserImage && !selectedPersona) {
      setCustomSelfieUrl(currentUserImage);
    }
  }, [currentUserImage, selectedPersona]);

  useEffect(() => {
    if (activeFaceDetection) {
      setFaceDetectionState(activeFaceDetection);
    }
  }, [activeFaceDetection]);

  // Clean up camera stream and animation frames on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Real-Time Computer Vision Tracking Loop when Webcam is Active
  useEffect(() => {
    if (!isWebcamOpen) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    let isSubscribed = true;
    const engine = FaceDetectionEngine.getInstance();

    const runVisionTracking = async () => {
      if (!isSubscribed || !videoRef.current || !trackingCanvasRef.current) return;
      const video = videoRef.current;
      const canvas = trackingCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState >= 2 && ctx) {
        const vw = video.videoWidth || 480;
        const vh = video.videoHeight || 480;
        if (canvas.width !== vw || canvas.height !== vh) {
          canvas.width = vw;
          canvas.height = vh;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Run client-side face & skin analysis
        const result = await engine.detectFace(video);

        if (isSubscribed) {
          setLiveFaceDetection(result);

          if (result.detected) {
            const { boundingBox, landmarks } = result;
            const cw = canvas.width;
            const ch = canvas.height;

            // Compute pixel coordinates
            const bx = (boundingBox.x / 100) * cw;
            const by = (boundingBox.y / 100) * ch;
            const bw = (boundingBox.width / 100) * cw;
            const bh = (boundingBox.height / 100) * ch;

            // Draw Corner HUD Brackets
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;

            const bracketSize = Math.max(16, Math.min(28, bw * 0.18));

            // Top-Left
            ctx.beginPath();
            ctx.moveTo(bx, by + bracketSize);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + bracketSize, by);
            ctx.stroke();

            // Top-Right
            ctx.beginPath();
            ctx.moveTo(bx + bw - bracketSize, by);
            ctx.lineTo(bx + bw, by);
            ctx.lineTo(bx + bw, by + bracketSize);
            ctx.stroke();

            // Bottom-Left
            ctx.beginPath();
            ctx.moveTo(bx, by + bh - bracketSize);
            ctx.lineTo(bx, by + bh);
            ctx.lineTo(bx + bracketSize, by + bh);
            ctx.stroke();

            // Bottom-Right
            ctx.beginPath();
            ctx.moveTo(bx + bw - bracketSize, by + bh);
            ctx.lineTo(bx + bw, by + bh);
            ctx.lineTo(bx + bw, by + bh - bracketSize);
            ctx.stroke();

            // Draw Triangulated Facial Landmark Wireframe
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;

            const fx = (landmarks.forehead.x / 100) * cw;
            const fy = (landmarks.forehead.y / 100) * ch;
            const lex = (landmarks.leftEye.x / 100) * cw;
            const ley = (landmarks.leftEye.y / 100) * ch;
            const rex = (landmarks.rightEye.x / 100) * cw;
            const rey = (landmarks.rightEye.y / 100) * ch;
            const nx = (landmarks.noseTip.x / 100) * cw;
            const ny = (landmarks.noseTip.y / 100) * ch;
            const mx = (landmarks.mouthCenter.x / 100) * cw;
            const my = (landmarks.mouthCenter.y / 100) * ch;
            const lcx = (landmarks.leftCheek.x / 100) * cw;
            const lcy = (landmarks.leftCheek.y / 100) * ch;
            const rcx = (landmarks.rightCheek.x / 100) * cw;
            const rcy = (landmarks.rightCheek.y / 100) * ch;
            const cx = (landmarks.chin.x / 100) * cw;
            const cy = (landmarks.chin.y / 100) * ch;

            // Wireframe Lines
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(lex, ley);
            ctx.lineTo(nx, ny);
            ctx.lineTo(rex, rey);
            ctx.lineTo(fx, fy);

            ctx.moveTo(lex, ley);
            ctx.lineTo(lcx, lcy);
            ctx.lineTo(mx, my);
            ctx.lineTo(rcx, rcy);
            ctx.lineTo(rex, rey);

            ctx.moveTo(nx, ny);
            ctx.lineTo(mx, my);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            // Glowing Landmark Nodes
            ctx.fillStyle = '#ec4899';
            ctx.shadowColor = '#ec4899';
            ctx.shadowBlur = 8;
            const nodes = [
              [fx, fy],
              [lex, ley],
              [rex, rey],
              [nx, ny],
              [lcx, lcy],
              [rcx, rcy],
              [mx, my],
              [cx, cy]
            ];
            nodes.forEach(([px, py]) => {
              ctx.beginPath();
              ctx.arc(px, py, 3.5, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(runVisionTracking);
    };

    animFrameRef.current = requestAnimationFrame(runVisionTracking);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isWebcamOpen]);

  // Process Uploaded or Dropped Image
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setWebcamNotice('Please select an image file (JPG, PNG, WebP).');
      setTimeout(() => setWebcamNotice(null), 3500);
      return;
    }

    setIsDetecting(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setCustomSelfieUrl(dataUrl);

      // Perform Real Face Detection & Colorimetric Analysis
      const engine = FaceDetectionEngine.getInstance();
      const faceResult = await engine.detectFaceFromDataUrl(dataUrl);
      setIsDetecting(false);
      setFaceDetectionState(faceResult);

      const diagnostics = engine.generateSkinScoresFromDetection(faceResult, customConcern);
      onCustomScenario(dataUrl, customGoal, customBudget, diagnostics, faceResult);
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

  const captureWebcam = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const w = videoRef.current.videoWidth || 480;
      const h = videoRef.current.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Natural selfie mirror orientation
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
        stopWebcam();
        setCustomSelfieUrl(dataUrl);

        // Run Detection Engine on captured frame
        setIsDetecting(true);
        const engine = FaceDetectionEngine.getInstance();
        const faceResult = await engine.detectFaceFromDataUrl(dataUrl);
        setIsDetecting(false);
        setFaceDetectionState(faceResult);

        const diagnostics = engine.generateSkinScoresFromDetection(faceResult, customConcern);
        onCustomScenario(dataUrl, customGoal, customBudget, diagnostics, faceResult);
      }
    }
  };

  const stopWebcam = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
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
      const engine = FaceDetectionEngine.getInstance();
      const faceResult = faceDetectionState || {
        detected: true,
        confidence: 0.92,
        boundingBox: { x: 20, y: 15, width: 60, height: 70 },
        landmarks: {
          forehead: { x: 50, y: 22 },
          leftEye: { x: 35, y: 38 },
          rightEye: { x: 65, y: 38 },
          noseTip: { x: 50, y: 54 },
          leftCheek: { x: 28, y: 52 },
          rightCheek: { x: 72, y: 52 },
          mouthCenter: { x: 50, y: 74 },
          mouthBounds: { x: 36, y: 69, width: 28, height: 10 },
          chin: { x: 50, y: 92 }
        },
        metrics: {
          skinToneRgb: { r: 215, g: 175, b: 140 },
          itaAngle: 38,
          fitzpatrickScale: 3 as const,
          detectedUndertone: 'olive' as const,
          brightnessLux: 75,
          contrastScore: 90
        }
      };

      const diagnostics = engine.generateSkinScoresFromDetection(faceResult, concern);
      onCustomScenario(customSelfieUrl, goalMap[concern], customBudget, diagnostics, faceResult);
    }
  };

  const handleReRunCustomSelfie = async () => {
    if (customSelfieUrl) {
      setIsDetecting(true);
      const engine = FaceDetectionEngine.getInstance();
      const faceResult = await engine.detectFaceFromDataUrl(customSelfieUrl);
      setIsDetecting(false);
      setFaceDetectionState(faceResult);
      const diagnostics = engine.generateSkinScoresFromDetection(faceResult, customConcern);
      onCustomScenario(customSelfieUrl, customGoal, customBudget, diagnostics, faceResult);
    } else {
      fileInputRef.current?.click();
    }
  };

  const isCustomActive = !selectedPersona && !!customSelfieUrl;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Subject Selection & Personal Face Detection
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

      {/* FEATURED: PROMINENT PERSONAL FACE DETECTION CARD */}
      <div className="space-y-3">
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
              {/* Photo Thumbnail with Detected Bounding Indicator */}
              <div className="relative shrink-0">
                {customSelfieUrl ? (
                  <div className="relative">
                    <img
                      src={customSelfieUrl}
                      alt="Your Face"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-pink-400 shadow-md"
                    />
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-cyan-400/60 bg-cyan-950/30 flex flex-col items-center justify-center text-cyan-300">
                    <Camera className="w-7 h-7 text-cyan-400" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {customSelfieUrl ? 'Your Face (Active Subject)' : 'Try Your Own Face'}
                  </h4>

                  {customSelfieUrl && faceDetectionState?.detected ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <Scan className="w-3 h-3 text-emerald-400" />
                      Face Detected ({Math.round(faceDetectionState.confidence * 100)}%)
                    </span>
                  ) : isDetecting ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Detecting Face Pixels...
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Live Facial Mesh
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {customSelfieUrl
                    ? faceDetectionState?.detected
                      ? `Phototype: Fitzpatrick Type ${faceDetectionState.metrics.fitzpatrickScale} • ${faceDetectionState.metrics.detectedUndertone.toUpperCase()} Undertone (ITA: ${faceDetectionState.metrics.itaAngle}°)`
                      : 'Selfie loaded. Run analysis below to generate your custom clinical skin routine.'
                    : 'Upload any selfie or use your live webcam with real-time facial landmark tracking!'}
                </p>

                {/* Target Concern Filter Badges */}
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Target Concern:</span>
                  {(['acne', 'glow', 'barrier', 'mature'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSelectConcern(c)}
                      className={`text-[10px] px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
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
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>{customSelfieUrl ? 'Upload New Photo' : 'Upload Selfie'}</span>
              </button>

              <button
                onClick={startWebcam}
                disabled={isRunning}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-500/20"
              >
                <Video className="w-4 h-4" />
                <span>{customSelfieUrl ? 'Retake Live Selfie' : 'Use Live Camera'}</span>
              </button>

              {customSelfieUrl && (
                <button
                  onClick={handleReRunCustomSelfie}
                  disabled={isRunning || isDetecting}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  title="Re-run Multi-Agent Analysis"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunning || isDetecting ? 'animate-spin' : ''}`} />
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
              disabled={isRunning || isDetecting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run AI Mesh on {customSelfieUrl ? 'Your Face' : 'Scenario'} (${customBudget})</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* LIVE WEBCAM MODAL WITH REAL-TIME COMPUTER VISION TRACKING OVERLAY */}
      {isWebcamOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 relative shadow-2xl space-y-4">
            <button
              onClick={stopWebcam}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-400" />
                <h4 className="text-sm font-bold text-slate-100">Live Webcam AI Face Scanner</h4>
              </div>

              {/* Live Detection Status HUD */}
              {liveFaceDetection?.detected ? (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-bold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  FACE LOCKED ({Math.round(liveFaceDetection.confidence * 100)}%)
                </span>
              ) : (
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  ALIGNING FACE...
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              The camera runs client-side computer vision to track your facial landmarks and measure photometric skin tone.
            </p>

            {/* Video Viewport with Live Canvas Overlay */}
            <div className="rounded-xl overflow-hidden aspect-square border-2 border-slate-700 bg-black relative shadow-inner">
              {/* Underlying Mirrored Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Live Face Tracking Canvas Overlay (Mirrored to align with video) */}
              <canvas
                ref={trackingCanvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
              />

              {/* Live Photometrics HUD Bar at Bottom of Video */}
              {liveFaceDetection?.detected && (
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md rounded-xl p-2.5 border border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Detected Undertone</span>
                    <strong className="text-pink-300 capitalize font-mono">
                      {liveFaceDetection.metrics.detectedUndertone} • Type {liveFaceDetection.metrics.fitzpatrickScale}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">ITA Angle</span>
                    <strong className="text-cyan-300 font-mono">
                      {liveFaceDetection.metrics.itaAngle}°
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Lighting Level</span>
                    <strong className="text-emerald-300 font-mono">
                      {liveFaceDetection.metrics.brightnessLux} Lux
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={captureWebcam}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot & Run Skin AI</span>
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
