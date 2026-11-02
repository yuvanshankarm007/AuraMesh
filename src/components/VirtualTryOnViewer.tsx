import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AestheticPlan, LightingMode, FaceDetectionResult, SkinDiagnosticScores } from '../agent-core/types';
import { FaceDetectionEngine } from '../agent-core/FaceDetectionEngine';
import {
  Palette,
  CheckCircle2,
  Sliders,
  Sparkles,
  Sun,
  Lamp,
  Moon,
  Layers,
  Camera,
  Video,
  Film,
  Image as ImageIcon,
  RefreshCw,
  Scan,
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';

interface VTOViewerProps {
  aesthetic?: AestheticPlan;
  avatarUrl?: string;
  faceDetection?: FaceDetectionResult;
  onCaptureSnapshot?: (
    photoUrl: string,
    faceResult: FaceDetectionResult,
    diagnostics: SkinDiagnosticScores
  ) => void;
}

// Interactive Color Swatches for Live "Try It Out" Testing
const LIPSTICK_SWATCHES = [
  { id: 'lip_terracotta', name: 'Terracotta Velvet', hex: '#c25a3f' },
  { id: 'lip_rose_berry', name: 'Rose Berry Satin', hex: '#b8405e' },
  { id: 'lip_mauve_nude', name: 'Mauve Nude', hex: '#a26769' },
  { id: 'lip_ruby_red', name: 'Ruby Crimson', hex: '#990011' },
  { id: 'lip_coral_pink', name: 'Spiced Coral', hex: '#e07a5f' },
  { id: 'lip_plum_luxe', name: 'Plum Gloss', hex: '#6b2d5c' }
];

const FOUNDATION_SWATCHES = [
  { id: 'fd_fair_100', name: 'Fair 100 Neutral', hex: '#f5d0b5' },
  { id: 'fd_light_120', name: 'Light 120 Warm', hex: '#e8bc99' },
  { id: 'fd_olive_140', name: 'Olive 140 Medium', hex: '#d8b28a' },
  { id: 'fd_tan_220', name: 'Tan 220 Golden', hex: '#c49266' },
  { id: 'fd_deep_310', name: 'Deep 310 Caramel', hex: '#9c6644' },
  { id: 'fd_rich_400', name: 'Rich 400 Espresso', hex: '#58311d' }
];

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const VirtualTryOnViewer: React.FC<VTOViewerProps> = React.memo(({
  aesthetic,
  avatarUrl,
  faceDetection,
  onCaptureSnapshot
}) => {
  // Mode: 'motion_webcam' (Live Camera), 'demo_motion' (Animated Motion Feed), 'still_photo' (Static)
  const [activeMode, setActiveMode] = useState<'motion_webcam' | 'demo_motion' | 'still_photo'>('motion_webcam');
  const [sliderPos, setSliderPos] = useState(50);
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [layers, setLayers] = useState({
    diagnosticMesh: true,
    skincareGlow: true,
    cosmeticMakeup: true
  });

  // Selected Swatches (defaults to agent's aesthetic or first swatch)
  const initialFoundationHex = aesthetic?.vtoLooks.find(l => l.category === 'foundation')?.hexColor || '#d8b28a';
  const initialLipHex = aesthetic?.vtoLooks.find(l => l.category === 'lipstick')?.hexColor || '#c25a3f';

  const [selectedFoundation, setSelectedFoundation] = useState(initialFoundationHex);
  const [selectedLip, setSelectedLip] = useState(initialLipHex);

  // Live Motion Webcam State
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [snappedPhotos, setSnappedPhotos] = useState<string[]>([]);
  const [liveFace, setLiveFace] = useState<FaceDetectionResult | null>(faceDetection || null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stillImgRef = useRef<HTMLImageElement | null>(null);
  const cachedFaceRef = useRef<FaceDetectionResult | null>(faceDetection || null);
  const frameTickRef = useRef(0);

  // Demo motion simulation tick
  const demoMotionTick = useRef(0);

  // Preload still avatar image for canvas rendering
  useEffect(() => {
    if (!avatarUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      stillImgRef.current = img;
    };
    img.src = avatarUrl;
  }, [avatarUrl]);

  // Synthesize camera shutter click sound with Web Audio API
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    } catch {
      // Audio optional
    }
  }, []);

  // Sync selected swatches with new aesthetic recommendation
  useEffect(() => {
    if (aesthetic) {
      const f = aesthetic.vtoLooks.find(l => l.category === 'foundation');
      const lp = aesthetic.vtoLooks.find(l => l.category === 'lipstick');
      if (f) setSelectedFoundation(f.hexColor);
      if (lp) setSelectedLip(lp.hexColor);
    }
  }, [aesthetic]);

  // Clean up media streams and animation frames on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // START LIVE CAMERA WITH ROBUST FALLBACK
  const startLiveCamera = async () => {
    setWebcamError(null);
    try {
      let stream: MediaStream | null = null;
      try {
        // Ideal user camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
        // Broad universal camera driver fallback
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsWebcamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Live motion play error:', e));
      }
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setIsWebcamActive(false);
      setWebcamError('Camera blocked or not found. Switched to Demo Motion Video so you can still try on in full motion!');
      setActiveMode('demo_motion');
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // Switch modes
  const handleSelectMode = (mode: 'motion_webcam' | 'demo_motion' | 'still_photo') => {
    setActiveMode(mode);
    if (mode === 'motion_webcam') {
      if (!isWebcamActive) {
        startLiveCamera();
      }
    } else {
      stopLiveCamera();
    }
  };

  // CONTINUOUS LIVE MOTION AR LOOP
  useEffect(() => {
    let isSubscribed = true;
    const engine = FaceDetectionEngine.getInstance();

    const renderMotionFrame = async () => {
      if (!isSubscribed) return;

      const canvas = motionCanvasRef.current;
      if (!canvas) {
        animFrameRef.current = requestAnimationFrame(renderMotionFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cw = 480;
      const ch = 480;
      if (canvas.width !== cw || canvas.height !== cw) {
        canvas.width = cw;
        canvas.height = ch;
      }

      // 1. RENDER BASE SOURCE (Live Webcam vs Demo Motion Simulation vs Still Photo)
      if (activeMode === 'still_photo') {
        if (stillImgRef.current && stillImgRef.current.complete) {
          ctx.drawImage(stillImgRef.current, 0, 0, cw, ch);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, cw, ch);
        }
      } else if (activeMode === 'motion_webcam' && videoRef.current && isWebcamActive) {
        const video = videoRef.current;
        if (video.readyState >= 2) {
          // Mirrored selfie view
          ctx.save();
          ctx.translate(cw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, cw, ch);
          ctx.restore();
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, cw, ch);
        }
      } else if (activeMode === 'demo_motion') {
        // Animated Motion Picture Simulation (Subtle Head Sway + Real Face Feature Motion)
        demoMotionTick.current += 0.04;
        const tick = demoMotionTick.current;
        const swayX = Math.sin(tick) * 12;
        const swayY = Math.cos(tick * 0.7) * 6;

        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, cw, ch);

        // Simulated Portrait Head & Neck
        const cx = cw * 0.5 + swayX;
        const cy = ch * 0.48 + swayY;

        // Shoulder / Torso
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(cx, ch * 0.95, cw * 0.45, ch * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.fillStyle = '#d4a373';
        ctx.fillRect(cx - 30, cy + 70, 60, 80);

        // Head Oval
        ctx.fillStyle = '#e8be99';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 95, 125, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair Cap
        ctx.fillStyle = '#261b17';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 65, 105, 75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated Eyes (Blink every few seconds)
        const isBlinking = Math.sin(tick * 0.5) > 0.94;
        ctx.fillStyle = '#1e293b';
        if (isBlinking) {
          ctx.fillRect(cx - 45, cy - 20, 26, 3);
          ctx.fillRect(cx + 19, cy - 20, 26, 3);
        } else {
          ctx.beginPath();
          ctx.arc(cx - 32, cy - 20, 10, 0, Math.PI * 2);
          ctx.arc(cx + 32, cy - 20, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nose
        ctx.strokeStyle = '#b07d58';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx, cy + 18);
        ctx.lineTo(cx + 8, cy + 18);
        ctx.stroke();

        // Lips
        ctx.fillStyle = '#c25a3f';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 50, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. RUN REAL-TIME COMPUTER VISION (Throttled every 5 frames for buttery smooth 60 FPS)
      frameTickRef.current += 1;
      let result = cachedFaceRef.current;
      if (frameTickRef.current % 5 === 0 || !result) {
        result = await engine.detectFace(canvas);
        cachedFaceRef.current = result;
        if (isSubscribed) {
          setLiveFace(result);
        }
      }
      if (!result) return;

      const lmk = result.landmarks;
      const splitX = (sliderPos / 100) * cw;

      // 3. RENDER AR MAKEUP IN MOTION ON THE RIGHT SIDE OF SPLIT SLIDER
      if (sliderPos < 100) {
        ctx.save();
        // Clip to right of slider line
        ctx.beginPath();
        ctx.rect(splitX, 0, cw - splitX, ch);
        ctx.clip();

        // Accurate Facial Geometry
        const bx = (result.boundingBox.x / 100) * cw;
        const by = (result.boundingBox.y / 100) * ch;
        const bw = (result.boundingBox.width / 100) * cw;
        const bh = (result.boundingBox.height / 100) * ch;
        const fcx = bx + bw * 0.5;
        const fcy = by + bh * 0.52;
        const frx = bw * 0.44;
        const fry = bh * 0.52;

        // Skincare Glow Boost (Subtle inner facial luminescence)
        if (layers.skincareGlow) {
          const glowGrad = ctx.createRadialGradient(fcx, fcy, 10, fcx, fcy, Math.max(frx, fry));
          glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
          glowGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.ellipse(fcx, fcy, frx, fry, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        if (layers.cosmeticMakeup) {
          // 1. Natural Feathered Foundation Tone Wash (Soft-light blend on face oval ONLY)
          ctx.save();
          ctx.globalCompositeOperation = 'soft-light';
          const foundGrad = ctx.createRadialGradient(fcx, fcy, 10, fcx, fcy, Math.max(frx, fry));
          foundGrad.addColorStop(0, hexToRgba(selectedFoundation, 0.55));
          foundGrad.addColorStop(0.7, hexToRgba(selectedFoundation, 0.35));
          foundGrad.addColorStop(1, hexToRgba(selectedFoundation, 0));
          ctx.fillStyle = foundGrad;
          ctx.beginPath();
          ctx.ellipse(fcx, fcy, frx, fry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Subtle undertone tinting via 'color' blend mode inside face oval
          ctx.globalCompositeOperation = 'color';
          ctx.fillStyle = hexToRgba(selectedFoundation, 0.20);
          ctx.beginPath();
          ctx.ellipse(fcx, fcy, frx * 0.9, fry * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 2. AR Cheek Blush (Left & Right cheeks with soft radial blend)
          const blX1 = (lmk.leftCheek.x / 100) * cw;
          const blY1 = (lmk.leftCheek.y / 100) * ch;
          const blX2 = (lmk.rightCheek.x / 100) * cw;
          const blY2 = (lmk.rightCheek.y / 100) * ch;
          const blushRadius = Math.max(22, bw * 0.15);

          ctx.save();
          ctx.globalCompositeOperation = 'soft-light';
          const blushGrad1 = ctx.createRadialGradient(blX1, blY1, 2, blX1, blY1, blushRadius);
          blushGrad1.addColorStop(0, 'rgba(244, 114, 182, 0.45)');
          blushGrad1.addColorStop(0.6, 'rgba(244, 114, 182, 0.22)');
          blushGrad1.addColorStop(1, 'rgba(244, 114, 182, 0)');
          ctx.fillStyle = blushGrad1;
          ctx.beginPath();
          ctx.arc(blX1, blY1, blushRadius, 0, Math.PI * 2);
          ctx.fill();

          const blushGrad2 = ctx.createRadialGradient(blX2, blY2, 2, blX2, blY2, blushRadius);
          blushGrad2.addColorStop(0, 'rgba(244, 114, 182, 0.45)');
          blushGrad2.addColorStop(0.6, 'rgba(244, 114, 182, 0.22)');
          blushGrad2.addColorStop(1, 'rgba(244, 114, 182, 0)');
          ctx.fillStyle = blushGrad2;
          ctx.beginPath();
          ctx.arc(blX2, blY2, blushRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Natural Feathered Lipstick (Multiply blend for rich pigment + Screen highlight for gloss)
          const mx = (lmk.mouthCenter.x / 100) * cw;
          const my = (lmk.mouthCenter.y / 100) * ch;
          const mw = Math.max(24, (lmk.mouthBounds.width / 100) * cw);
          const mh = Math.max(10, (lmk.mouthBounds.height / 100) * ch);

          ctx.save();
          // Base pigment with multiply blend
          ctx.globalCompositeOperation = 'multiply';
          const lipGrad = ctx.createRadialGradient(mx, my, 2, mx, my, mw * 0.55);
          lipGrad.addColorStop(0, hexToRgba(selectedLip, 0.78));
          lipGrad.addColorStop(0.7, hexToRgba(selectedLip, 0.52));
          lipGrad.addColorStop(1, hexToRgba(selectedLip, 0.15));
          ctx.fillStyle = lipGrad;
          ctx.beginPath();
          ctx.ellipse(mx, my, mw * 0.52, mh * 0.58, 0, 0, Math.PI * 2);
          ctx.fill();

          // Realistic lip gloss center specular sheen
          ctx.globalCompositeOperation = 'screen';
          const glossGrad = ctx.createRadialGradient(mx, my + mh * 0.1, 1, mx, my + mh * 0.1, mw * 0.35);
          glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
          glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glossGrad;
          ctx.beginPath();
          ctx.ellipse(mx, my + mh * 0.12, mw * 0.32, mh * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // 4. RENDER DIAGNOSTIC LANDMARK MESH (Tracks moving face)
      if (layers.diagnosticMesh) {
        ctx.save();
        // Clip to left of slider
        ctx.beginPath();
        ctx.rect(0, 0, splitX, ch);
        ctx.clip();

        const fx = (lmk.forehead.x / 100) * cw;
        const fy = (lmk.forehead.y / 100) * ch;
        const lex = (lmk.leftEye.x / 100) * cw;
        const ley = (lmk.leftEye.y / 100) * ch;
        const rex = (lmk.rightEye.x / 100) * cw;
        const rey = (lmk.rightEye.y / 100) * ch;
        const nx = (lmk.noseTip.x / 100) * cw;
        const ny = (lmk.noseTip.y / 100) * ch;
        const lcx = (lmk.leftCheek.x / 100) * cw;
        const lcy = (lmk.leftCheek.y / 100) * ch;
        const rcx = (lmk.rightCheek.x / 100) * cw;
        const rcy = (lmk.rightCheek.y / 100) * ch;
        const mx = (lmk.mouthCenter.x / 100) * cw;
        const my = (lmk.mouthCenter.y / 100) * ch;
        const chx = (lmk.chin.x / 100) * cw;
        const chy = (lmk.chin.y / 100) * ch;

        // Triangulation lines
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 6;

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
        ctx.lineTo(chx, chy);
        ctx.stroke();

        // Glowing Nodes
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 8;
        const nodes = [[fx, fy], [lex, ley], [rex, rey], [nx, ny], [lcx, lcy], [rcx, rcy], [mx, my], [chx, chy]];
        nodes.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 5. DRAW SPLIT SLIDER DIVIDER LINE & HANDLE OVER VIDEO
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, ch);
      ctx.stroke();

      // Drag Handle Circle
      ctx.fillStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(splitX, ch * 0.5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Loop frame
      animFrameRef.current = requestAnimationFrame(renderMotionFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderMotionFrame);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeMode, isWebcamActive, sliderPos, selectedFoundation, selectedLip, layers]);

  // CAPTURE STILL PICTURE DIRECTLY FROM MOTION STREAM
  const handleSnapMotionPicture = () => {
    const canvas = motionCanvasRef.current;
    if (!canvas) return;

    // Flash animation and shutter sound
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 150);

    // Capture still JPEG data URL
    const photoUrl = canvas.toDataURL('image/jpeg', 0.95);
    setSnappedPhotos(prev => [photoUrl, ...prev.slice(0, 4)]);

    // Trigger full diagnostic and formulation cascade with captured picture
    if (liveFace) {
      const engine = FaceDetectionEngine.getInstance();
      const diagnostics = engine.generateSkinScoresFromDetection(liveFace, 'acne');
      if (onCaptureSnapshot) {
        onCaptureSnapshot(photoUrl, liveFace, diagnostics);
      }
    }
  };

  const getLightingFilter = () => {
    switch (lighting) {
      case 'golden_hour':
        return 'sepia(22%) saturate(130%) hue-rotate(-8deg) brightness(105%)';
      case 'office_fluorescent':
        return 'contrast(106%) saturate(94%) brightness(102%)';
      case 'evening_lounge':
        return 'brightness(92%) contrast(114%) sepia(16%)';
      case 'daylight':
      default:
        return 'saturate(105%) contrast(100%)';
    }
  };

  return (
    <div id="live-ar-studio" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4 scroll-mt-6">
      {/* Hidden Video for Webcam Stream */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Top Header & Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            YouCam Live Motion AR & Try-On Studio
          </h3>
        </div>

        {/* Studio Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleSelectMode('motion_webcam')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'motion_webcam'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => handleSelectMode('demo_motion')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'demo_motion'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Motion Video</span>
          </button>

          <button
            onClick={() => handleSelectMode('still_photo')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'still_photo'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Still Photo</span>
          </button>
        </div>
      </div>

      {/* Camera Notice if needed */}
      {webcamError && (
        <div className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
          <span>{webcamError}</span>
          <button onClick={() => setWebcamError(null)} className="font-bold text-amber-400 ml-2">✕</button>
        </div>
      )}

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
        {/* Left Side: Live Motion Viewport or Still Image Viewer */}
        <div className="sm:col-span-6 space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 bg-black select-none shadow-2xl group">
            {/* White Camera Flash Overlay */}
            <div
              className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${
                isFlashing ? 'opacity-90' : 'opacity-0'
              }`}
            />

            {/* LIVE AR VIEWPORT (Universal Canvas for Webcam, Demo Motion & Still Photo) */}
            <canvas
              ref={motionCanvasRef}
              className="w-full h-full object-cover"
              style={{ filter: getLightingFilter() }}
            />

            {/* Shutter Button Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center z-30 pointer-events-none">
              <button
                onClick={handleSnapMotionPicture}
                className="pointer-events-auto w-14 h-14 rounded-full border-4 border-white bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 active:scale-95 shadow-xl shadow-pink-500/30 flex items-center justify-center transition-all group"
                title="Snap Picture from Motion Stream"
              >
                <Camera className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Prompt to Start Camera if webcam mode selected but not active */}
            {activeMode === 'motion_webcam' && !isWebcamActive && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Video className="w-10 h-10 text-pink-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Ready for Live Motion AR Try-On</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Turn on your camera to test foundation, lip shades, and clinical mesh in real time on your moving face.
                  </p>
                </div>
                <button
                  onClick={startLiveCamera}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Live AR Camera</span>
                </button>
              </div>
            )}

            {/* Drag Range Slider Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            {/* Corner Badges */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded text-slate-300 pointer-events-none border border-slate-800">
              Bare {activeMode === 'motion_webcam' ? 'Motion' : 'Skin'}
            </span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider bg-pink-500/90 px-2 py-0.5 rounded text-white pointer-events-none flex items-center gap-1 shadow">
              <Sparkles className="w-2.5 h-2.5" />
              YouCam AR
            </span>

            {/* Live Tracking HUD Pill */}
            {liveFace?.detected && (
              <div className="absolute top-2.5 left-24 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 z-10 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Locked ({Math.round(liveFace.confidence * 100)}%)
              </div>
            )}
          </div>

          {/* Filmstrip of Snapped Pictures */}
          {snappedPhotos.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-pink-400" /> Snapped Pictures ({snappedPhotos.length})
                </span>
                <span className="text-[10px]">Click any photo to inspect</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {snappedPhotos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo}
                    alt={`Snap ${i}`}
                    onClick={() => {
                      if (onCaptureSnapshot && liveFace) {
                        const engine = FaceDetectionEngine.getInstance();
                        const diagnostics = engine.generateSkinScoresFromDetection(liveFace, 'acne');
                        onCaptureSnapshot(photo, liveFace, diagnostics);
                      }
                    }}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700 hover:border-pink-500 cursor-pointer transition-all shrink-0 hover:scale-105"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Live Shade Controls ("Try It Out There") */}
        <div className="sm:col-span-6 space-y-4">
          {/* Swatch Category 1: Lipstick Shades */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Live Lipstick Shade Switcher
              </span>
              <span className="text-[10px] text-pink-300 font-mono">
                {LIPSTICK_SWATCHES.find(s => s.hex === selectedLip)?.name}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-1">
              {LIPSTICK_SWATCHES.map((swatch) => {
                const isSelected = selectedLip === swatch.hex;
                return (
                  <button
                    key={swatch.id}
                    onClick={() => setSelectedLip(swatch.hex)}
                    style={{ backgroundColor: swatch.hex }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white ring-2 ring-pink-500 scale-105 shadow-md'
                        : 'border-white/20 opacity-80 hover:opacity-100 hover:scale-100'
                    }`}
                    title={swatch.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swatch Category 2: Foundation & Complexion */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Live Foundation Shade & Complexion
              </span>
              <span className="text-[10px] text-amber-300 font-mono">
                {FOUNDATION_SWATCHES.find(s => s.hex === selectedFoundation)?.name}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-1">
              {FOUNDATION_SWATCHES.map((swatch) => {
                const isSelected = selectedFoundation === swatch.hex;
                return (
                  <button
                    key={swatch.id}
                    onClick={() => setSelectedFoundation(swatch.hex)}
                    style={{ backgroundColor: swatch.hex }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white ring-2 ring-amber-500 scale-105 shadow-md'
                        : 'border-white/20 opacity-80 hover:opacity-100'
                    }`}
                    title={swatch.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Layer & Lighting Simulator */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Live AR Layer Toggles
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => setLayers(prev => ({ ...prev, diagnosticMesh: !prev.diagnosticMesh }))}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-mono border transition-all ${
                    layers.diagnosticMesh ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Mesh
                </button>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, skincareGlow: !prev.skincareGlow }))}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-mono border transition-all ${
                    layers.skincareGlow ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Glow
                </button>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, cosmeticMakeup: !prev.cosmeticMakeup }))}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-mono border transition-all ${
                    layers.cosmeticMakeup ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Makeup
                </button>
              </div>
            </div>

            {/* Ambient Lighting Presets */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Ambient Lighting:</span>
              <div className="flex space-x-1">
                {(['daylight', 'golden_hour', 'office_fluorescent', 'evening_lounge'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setLighting(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize transition-all ${
                      lighting === mode
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'golden_hour' ? 'Golden' : mode === 'office_fluorescent' ? 'Office' : mode === 'evening_lounge' ? 'Evening' : 'Daylight'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rx Formulation Consensus Note */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-xs text-emerald-300/90 leading-relaxed">
            <strong>Clinical Safety Guarantee:</strong> All virtual try-on vehicles are dynamically constrained by the Pharmacology Agent to be oil-free and non-comedogenic for your detected skin barrier.
          </div>
        </div>
      </div>
    </div>
  );
});

export default VirtualTryOnViewer;
