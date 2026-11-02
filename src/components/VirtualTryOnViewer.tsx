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
  Check,
  Wand2,
  Zap,
  Flame,
  Heart
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

// ----------------------------------------------------------------------------
// SNAPCHAT LENSES SPECIFICATIONS
// ----------------------------------------------------------------------------
export interface SnapchatLens {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  blushColor: string;
  lipColor: string;
  highlighterColor: string;
  foundationTint: string;
  defaultSmoothing: number; // 0.0 to 1.0
  hasLashes: boolean;
  hasEyeliner: boolean;
  hasCheekSparkles: boolean;
  hasNoseHighlight: boolean;
  hasFloatingParticles: boolean;
  particleColor: string;
  particleType: 'stars' | 'diamonds' | 'orbs' | 'cyber';
  lighting: LightingMode;
}

export const SNAPCHAT_LENSES: SnapchatLens[] = [
  {
    id: 'snap_glam',
    name: 'Snap Glam',
    emoji: '✨',
    tagline: 'Airbrushed skin, winged lashes, rosy blush & floating gold stardust',
    blushColor: '#f472b6',
    lipColor: '#b8405e',
    highlighterColor: '#fef08a',
    foundationTint: '#e8be99',
    defaultSmoothing: 0.85,
    hasLashes: true,
    hasEyeliner: true,
    hasCheekSparkles: true,
    hasNoseHighlight: true,
    hasFloatingParticles: true,
    particleColor: '#fef08a',
    particleType: 'stars',
    lighting: 'daylight'
  },
  {
    id: 'sunset_blush',
    name: 'Sunset Glow',
    emoji: '🌸',
    tagline: 'Viral Sunset Blush across cheeks & nose bridge with cute star freckles',
    blushColor: '#fb7185',
    lipColor: '#e07a5f',
    highlighterColor: '#fed7aa',
    foundationTint: '#f5d0b5',
    defaultSmoothing: 0.82,
    hasLashes: true,
    hasEyeliner: true,
    hasCheekSparkles: true,
    hasNoseHighlight: true,
    hasFloatingParticles: true,
    particleColor: '#fda4af',
    particleType: 'diamonds',
    lighting: 'golden_hour'
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour',
    emoji: '🌟',
    tagline: 'Sun-drenched bronzer radiance, golden halo sparkles & caramel lip glaze',
    blushColor: '#f97316',
    lipColor: '#c25a3f',
    highlighterColor: '#fde047',
    foundationTint: '#d8b28a',
    defaultSmoothing: 0.88,
    hasLashes: true,
    hasEyeliner: true,
    hasCheekSparkles: false,
    hasNoseHighlight: true,
    hasFloatingParticles: true,
    particleColor: '#facc15',
    particleType: 'stars',
    lighting: 'golden_hour'
  },
  {
    id: 'glass_skin',
    name: 'Glass Skin',
    emoji: '💎',
    tagline: 'Porcelain dewy glass skin with pearlescent cheekbone reflection & clear gloss',
    blushColor: '#ec4899',
    lipColor: '#a26769',
    highlighterColor: '#ffffff',
    foundationTint: '#fce7f3',
    defaultSmoothing: 0.94,
    hasLashes: false,
    hasEyeliner: false,
    hasCheekSparkles: false,
    hasNoseHighlight: true,
    hasFloatingParticles: true,
    particleColor: '#e0f2fe',
    particleType: 'diamonds',
    lighting: 'daylight'
  },
  {
    id: 'cyber_aura',
    name: 'Cyber Aura',
    emoji: '⚡',
    tagline: 'YouCam holographic neon wireframe mask, glowing eyeliner & HUD lock-on',
    blushColor: '#06b6d4',
    lipColor: '#d946ef',
    highlighterColor: '#22d3ee',
    foundationTint: '#38bdf8',
    defaultSmoothing: 0.70,
    hasLashes: true,
    hasEyeliner: true,
    hasCheekSparkles: true,
    hasNoseHighlight: true,
    hasFloatingParticles: true,
    particleColor: '#06b6d4',
    particleType: 'cyber',
    lighting: 'evening_lounge'
  },
  {
    id: 'clean_natural',
    name: 'Fresh Clean',
    emoji: '🌿',
    tagline: 'Effortless no-makeup beauty mode: even tone, soft satin lips & eye brighten',
    blushColor: '#fca5a5',
    lipColor: '#e17055',
    highlighterColor: '#fef3c7',
    foundationTint: '#f5d0b5',
    defaultSmoothing: 0.65,
    hasLashes: false,
    hasEyeliner: false,
    hasCheekSparkles: false,
    hasNoseHighlight: false,
    hasFloatingParticles: false,
    particleColor: '#fef08a',
    particleType: 'orbs',
    lighting: 'daylight'
  }
];

// Interactive Color Swatches for Custom Swatch Selection
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

// Draw 4-point star sparkle (✦) on canvas
function drawStarSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    const diag = angle + Math.PI / 4;
    ctx.lineTo(x + Math.cos(diag) * (r * 0.32), y + Math.sin(diag) * (r * 0.32));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw realistic fluttery eyelashes and cat-eye winged liner
function drawSnapchatEyelashes(
  ctx: CanvasRenderingContext2D,
  eyeX: number,
  eyeY: number,
  eyeW: number,
  eyeH: number,
  isLeft: boolean
) {
  ctx.save();
  const dir = isLeft ? -1 : 1;

  // 1. Sleek upper lash line
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(eyeX - eyeW * 0.45, eyeY);
  ctx.quadraticCurveTo(eyeX, eyeY - eyeH * 0.85, eyeX + eyeW * 0.45, eyeY);

  // Winged cat-eye flick extending outward
  const wingX = eyeX + dir * eyeW * 0.76;
  const wingY = eyeY - eyeH * 0.92;
  ctx.quadraticCurveTo(eyeX + dir * eyeW * 0.52, eyeY - eyeH * 0.55, wingX, wingY);
  ctx.stroke();

  // 2. Fluttery curved individual lash strokes
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = '#27272a';
  for (let i = 0; i < 4; i++) {
    const t = 0.22 + i * 0.20;
    const lx = eyeX - eyeW * 0.35 + eyeW * 0.7 * t;
    const ly = eyeY - eyeH * 0.55 * Math.sin(t * Math.PI);
    const lashTipX = lx + dir * (3.5 + i * 2.2);
    const lashTipY = ly - (6.5 + i * 2.4);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + dir * 2, ly - 4.5, lashTipX, lashTipY);
    ctx.stroke();
  }

  // 3. Bright sparkling iris catchlight
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(eyeX + 1.8, eyeY - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export const VirtualTryOnViewer: React.FC<VTOViewerProps> = React.memo(({
  aesthetic,
  avatarUrl,
  faceDetection,
  onCaptureSnapshot
}) => {
  // Mode: 'motion_webcam' (Live Camera), 'demo_motion' (Animated Motion Feed), 'still_photo' (Static)
  const [activeMode, setActiveMode] = useState<'motion_webcam' | 'demo_motion' | 'still_photo'>('motion_webcam');

  // Snapchat Filter Experience: 'snap_full' (100% full-face Snapchat filter) vs 'split_compare' (Before/After slider)
  const [viewMode, setViewMode] = useState<'snap_full' | 'split_compare'>('snap_full');
  const [activeLensId, setActiveLensId] = useState<string>('snap_glam');
  const [smoothingIntensity, setSmoothingIntensity] = useState<number>(0.85);

  const [sliderPos, setSliderPos] = useState(50);
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [layers, setLayers] = useState({
    diagnosticMesh: false, // Default off in Snapchat beauty mode
    skincareGlow: true,
    cosmeticMakeup: true
  });

  // Active Snapchat Lens
  const activeLens = SNAPCHAT_LENSES.find(l => l.id === activeLensId) || SNAPCHAT_LENSES[0];

  // Selected Swatches (synced with active lens)
  const [selectedFoundation, setSelectedFoundation] = useState(activeLens.foundationTint);
  const [selectedLip, setSelectedLip] = useState(activeLens.lipColor);

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

  // 20 Floating Halo Particles for Snapchat AR Lenses
  const particlesRef = useRef<Array<{
    angle: number;
    distRatio: number;
    size: number;
    speed: number;
    phase: number;
    type: 'star' | 'diamond' | 'orb';
  }>>([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        angle: (i / 20) * Math.PI * 2 + Math.random() * 0.4,
        distRatio: 0.95 + Math.random() * 0.65,
        size: 3.5 + Math.random() * 4,
        speed: (0.006 + Math.random() * 0.008) * (i % 2 === 0 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        type: (i % 3 === 0 ? 'star' : i % 3 === 1 ? 'diamond' : 'orb') as 'star' | 'diamond' | 'orb'
      });
    }
    particlesRef.current = arr;
  }, []);

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

  // Audio synthesis: Camera shutter click sound
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

  // Audio synthesis: Snapchat lens switch chime
  const playLensChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.05); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      }
    } catch {
      // Audio optional
    }
  }, []);

  // Switch Snapchat Lens
  const handleSelectLens = (lens: SnapchatLens) => {
    setActiveLensId(lens.id);
    setSelectedFoundation(lens.foundationTint);
    setSelectedLip(lens.lipColor);
    setSmoothingIntensity(lens.defaultSmoothing);
    setLighting(lens.lighting);
    if (lens.id === 'cyber_aura') {
      setLayers(prev => ({ ...prev, diagnosticMesh: true }));
    } else {
      setLayers(prev => ({ ...prev, diagnosticMesh: false }));
    }
    playLensChime();
  };

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
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
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
      setWebcamError('Camera blocked or not found. Switched to Motion Video so you can still try on filters!');
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

  // CONTINUOUS LIVE SNAPCHAT AR MOTION LOOP
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
          // Mirrored selfie view like Snapchat
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
        // Animated Motion Picture Simulation (Subtle Head Sway + Natural Face Motion)
        demoMotionTick.current += 0.04;
        const tick = demoMotionTick.current;
        const swayX = Math.sin(tick) * 12;
        const swayY = Math.cos(tick * 0.7) * 6;

        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, cw, ch);

        // Portrait Head & Neck
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
      const tick = demoMotionTick.current;

      // Calculate Split vs Full AR bounds
      // In Snapchat Full mode: splitX = 0 (Filter covers 100% of face!)
      // In Split Compare mode: splitX = (sliderPos / 100) * cw
      const isFullSnap = viewMode === 'snap_full';
      const splitX = isFullSnap ? 0 : (sliderPos / 100) * cw;

      // 3. RENDER SNAPCHAT BEAUTY AR FILTER
      if (splitX < cw) {
        ctx.save();
        // Clip to right of slider line (or full canvas if snap_full)
        ctx.beginPath();
        ctx.rect(splitX, 0, cw - splitX, ch);
        ctx.clip();

        // Facial Geometry
        const bx = (result.boundingBox.x / 100) * cw;
        const by = (result.boundingBox.y / 100) * ch;
        const bw = (result.boundingBox.width / 100) * cw;
        const bh = (result.boundingBox.height / 100) * ch;
        const fcx = bx + bw * 0.5;
        const fcy = by + bh * 0.52;
        const frx = bw * 0.44;
        const fry = bh * 0.52;

        const lex = (lmk.leftEye.x / 100) * cw;
        const ley = (lmk.leftEye.y / 100) * ch;
        const rex = (lmk.rightEye.x / 100) * cw;
        const rey = (lmk.rightEye.y / 100) * ch;

        // A. SNAPCHAT SKIN AIRBRUSH & PORE SMOOTHING
        if (layers.skincareGlow) {
          ctx.save();
          // Feathered foundation tone wash with soft-light blend
          ctx.globalCompositeOperation = 'soft-light';
          const foundGrad = ctx.createRadialGradient(fcx, fcy, 12, fcx, fcy, Math.max(frx, fry));
          const fAlpha = 0.55 * smoothingIntensity;
          foundGrad.addColorStop(0, hexToRgba(selectedFoundation, fAlpha));
          foundGrad.addColorStop(0.70, hexToRgba(selectedFoundation, fAlpha * 0.65));
          foundGrad.addColorStop(1, hexToRgba(selectedFoundation, 0));
          ctx.fillStyle = foundGrad;
          ctx.beginPath();
          ctx.ellipse(fcx, fcy, frx, fry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Luminous inner-face T-zone radiance
          const glowGrad = ctx.createRadialGradient(fcx, fcy - bh * 0.08, 10, fcx, fcy - bh * 0.08, frx * 0.85);
          glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.16 * smoothingIntensity})`);
          glowGrad.addColorStop(0.65, `rgba(255, 255, 255, ${0.06 * smoothingIntensity})`);
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.ellipse(fcx, fcy - bh * 0.08, frx * 0.85, fry * 0.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // B. CHEEK BLUSH (Classic Diffused or Viral Sunset W-Blush)
        if (layers.cosmeticMakeup) {
          const blX1 = (lmk.leftCheek.x / 100) * cw;
          const blY1 = (lmk.leftCheek.y / 100) * ch;
          const blX2 = (lmk.rightCheek.x / 100) * cw;
          const blY2 = (lmk.rightCheek.y / 100) * ch;
          const blushRadius = Math.max(24, bw * 0.16);

          ctx.save();
          ctx.globalCompositeOperation = 'soft-light';
          const blushColor = activeLens.blushColor;

          if (activeLens.id === 'sunset_blush') {
            // Sunset Blush: horizontal gradient wash connecting cheeks across nose bridge
            const noseX = (lmk.noseTip.x / 100) * cw;
            const noseY = (lmk.noseTip.y / 100) * ch - 12;
            const wGrad = ctx.createRadialGradient(noseX, noseY, 4, noseX, noseY, bw * 0.38);
            wGrad.addColorStop(0, hexToRgba(blushColor, 0.45 * smoothingIntensity));
            wGrad.addColorStop(0.70, hexToRgba(blushColor, 0.22 * smoothingIntensity));
            wGrad.addColorStop(1, hexToRgba(blushColor, 0));
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            ctx.ellipse(noseX, noseY, bw * 0.40, bh * 0.11, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Standard diffused cheek blush apples
            const bAlpha = 0.48 * smoothingIntensity;
            const blushGrad1 = ctx.createRadialGradient(blX1, blY1, 2, blX1, blY1, blushRadius);
            blushGrad1.addColorStop(0, hexToRgba(blushColor, bAlpha));
            blushGrad1.addColorStop(0.65, hexToRgba(blushColor, bAlpha * 0.45));
            blushGrad1.addColorStop(1, hexToRgba(blushColor, 0));
            ctx.fillStyle = blushGrad1;
            ctx.beginPath();
            ctx.arc(blX1, blY1, blushRadius, 0, Math.PI * 2);
            ctx.fill();

            const blushGrad2 = ctx.createRadialGradient(blX2, blY2, 2, blX2, blY2, blushRadius);
            blushGrad2.addColorStop(0, hexToRgba(blushColor, bAlpha));
            blushGrad2.addColorStop(0.65, hexToRgba(blushColor, bAlpha * 0.45));
            blushGrad2.addColorStop(1, hexToRgba(blushColor, 0));
            ctx.fillStyle = blushGrad2;
            ctx.beginPath();
            ctx.arc(blX2, blY2, blushRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // C. CHEEKBONE & NOSE TIP HIGHLIGHTER
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const hlColor = activeLens.highlighterColor;

          // Left Cheekbone Highlighter Crescent
          const hlGrad1 = ctx.createRadialGradient(blX1 - 2, blY1 - bh * 0.04, 1, blX1 - 2, blY1 - bh * 0.04, blushRadius * 0.7);
          hlGrad1.addColorStop(0, hexToRgba(hlColor, 0.60 * smoothingIntensity));
          hlGrad1.addColorStop(0.5, hexToRgba(hlColor, 0.22 * smoothingIntensity));
          hlGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = hlGrad1;
          ctx.beginPath();
          ctx.ellipse(blX1 - 2, blY1 - bh * 0.04, blushRadius * 0.65, blushRadius * 0.32, -0.22, 0, Math.PI * 2);
          ctx.fill();

          // Right Cheekbone Highlighter Crescent
          const hlGrad2 = ctx.createRadialGradient(blX2 + 2, blY2 - bh * 0.04, 1, blX2 + 2, blY2 - bh * 0.04, blushRadius * 0.7);
          hlGrad2.addColorStop(0, hexToRgba(hlColor, 0.60 * smoothingIntensity));
          hlGrad2.addColorStop(0.5, hexToRgba(hlColor, 0.22 * smoothingIntensity));
          hlGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = hlGrad2;
          ctx.beginPath();
          ctx.ellipse(blX2 + 2, blY2 - bh * 0.04, blushRadius * 0.65, blushRadius * 0.32, 0.22, 0, Math.PI * 2);
          ctx.fill();

          // Cute Pearl Nose Tip Highlighter
          if (activeLens.hasNoseHighlight) {
            const noseX = (lmk.noseTip.x / 100) * cw;
            const noseY = (lmk.noseTip.y / 100) * ch;
            const noseGrad = ctx.createRadialGradient(noseX, noseY, 1, noseX, noseY, 8);
            noseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
            noseGrad.addColorStop(0.5, hexToRgba(hlColor, 0.40));
            noseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = noseGrad;
            ctx.beginPath();
            ctx.arc(noseX, noseY, 6.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // D. FLUTTERY EYELASHES & WINGED EYELINER
          if (activeLens.hasLashes || activeLens.hasEyeliner) {
            const eyeW = Math.max(22, bw * 0.17);
            const eyeH = Math.max(10, bh * 0.09);
            drawSnapchatEyelashes(ctx, lex, ley, eyeW, eyeH, true);
            drawSnapchatEyelashes(ctx, rex, rey, eyeW, eyeH, false);
          }

          // E. CHEEK SPARKLES / STAR FRECKLES
          if (activeLens.hasCheekSparkles) {
            drawStarSparkle(ctx, blX1 - 12, blY1 - 8, 4.2, '#ffffff');
            drawStarSparkle(ctx, blX1 + 10, blY1 + 10, 3.2, '#ffffff');
            drawStarSparkle(ctx, blX2 + 12, blY2 - 8, 4.2, '#ffffff');
            drawStarSparkle(ctx, blX2 - 10, blY2 + 10, 3.2, '#ffffff');
          }

          // F. PLUMP GLOSSY LIPS WITH 3D SPECULAR HIGHLIGHT
          const mx = (lmk.mouthCenter.x / 100) * cw;
          const my = (lmk.mouthCenter.y / 100) * ch;
          const mw = Math.max(26, (lmk.mouthBounds.width / 100) * cw);
          const mh = Math.max(11, (lmk.mouthBounds.height / 100) * ch);

          ctx.save();
          // Rich pigment with multiply blend
          ctx.globalCompositeOperation = 'multiply';
          const lipGrad = ctx.createRadialGradient(mx, my, 2, mx, my, mw * 0.55);
          lipGrad.addColorStop(0, hexToRgba(selectedLip, 0.82));
          lipGrad.addColorStop(0.7, hexToRgba(selectedLip, 0.56));
          lipGrad.addColorStop(1, hexToRgba(selectedLip, 0.15));
          ctx.fillStyle = lipGrad;
          ctx.beginPath();
          ctx.ellipse(mx, my, mw * 0.53, mh * 0.60, 0, 0, Math.PI * 2);
          ctx.fill();

          // Juicy lip gloss specular reflection
          ctx.globalCompositeOperation = 'screen';
          const glossGrad = ctx.createRadialGradient(mx, my + mh * 0.12, 1, mx, my + mh * 0.12, mw * 0.36);
          glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
          glossGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.18)');
          glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glossGrad;
          ctx.beginPath();
          ctx.ellipse(mx, my + mh * 0.12, mw * 0.34, mh * 0.28, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // G. FLOATING AR STARDUST / SPARKLE HALO
        if (activeLens.hasFloatingParticles) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const pColor = activeLens.particleColor || '#fef08a';
          for (const p of particlesRef.current) {
            p.angle += p.speed;
            const px = fcx + Math.cos(p.angle) * (frx * p.distRatio);
            const py = fcy + Math.sin(p.angle) * (fry * p.distRatio);
            const alpha = Math.max(0.18, 0.55 + 0.45 * Math.sin(tick * 3 + p.phase));

            if (p.type === 'star') {
              drawStarSparkle(ctx, px, py, p.size, hexToRgba(pColor, alpha));
            } else if (p.type === 'diamond') {
              ctx.fillStyle = hexToRgba('#ffffff', alpha);
              ctx.beginPath();
              ctx.moveTo(px, py - p.size);
              ctx.lineTo(px + p.size * 0.6, py);
              ctx.lineTo(px, py + p.size);
              ctx.lineTo(px - p.size * 0.6, py);
              ctx.closePath();
              ctx.fill();
            } else {
              const orbGrad = ctx.createRadialGradient(px, py, 1, px, py, p.size);
              orbGrad.addColorStop(0, hexToRgba(pColor, alpha));
              orbGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = orbGrad;
              ctx.beginPath();
              ctx.arc(px, py, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }

        ctx.restore();
      }

      // 4. CYBER AURA NEON MESH (Only when Cyber Aura lens or Mesh toggle is on)
      if (layers.diagnosticMesh || activeLens.id === 'cyber_aura') {
        ctx.save();
        if (!isFullSnap) {
          ctx.beginPath();
          ctx.rect(0, 0, splitX, ch);
          ctx.clip();
        }

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

        // Glowing neon triangulation lines
        ctx.strokeStyle = activeLens.id === 'cyber_aura' ? '#22d3ee' : '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;

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

        // Glowing Cyber Nodes
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

      // 5. DRAW BEFORE/AFTER SPLIT SLIDER (Only in split_compare mode)
      if (!isFullSnap) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, ch);
        ctx.stroke();

        // Drag Handle Circle
        ctx.fillStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(splitX, ch * 0.5, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↔', splitX, ch * 0.5);
      }

      // Loop frame
      animFrameRef.current = requestAnimationFrame(renderMotionFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderMotionFrame);

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    activeMode,
    isWebcamActive,
    viewMode,
    activeLensId,
    sliderPos,
    selectedFoundation,
    selectedLip,
    smoothingIntensity,
    layers
  ]);

  // CAPTURE PICTURE WITH FLASH AND SOUND
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
        return 'sepia(24%) saturate(135%) hue-rotate(-8deg) brightness(106%)';
      case 'office_fluorescent':
        return 'contrast(106%) saturate(94%) brightness(102%)';
      case 'evening_lounge':
        return 'brightness(92%) contrast(114%) sepia(16%)';
      case 'daylight':
      default:
        return 'saturate(106%) contrast(100%)';
    }
  };

  return (
    <div id="live-ar-studio" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4 scroll-mt-6">
      {/* Hidden Video for Webcam Stream */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Top Header: Title, Mode & Snapchat AR Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <span>YouCam Snapchat AR Studio</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold border border-pink-500/30">
              {activeLens.emoji} {activeLens.name}
            </span>
          </h3>
        </div>

        {/* View Mode Toggle: Snapchat Full AR vs Split Comparison */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('snap_full')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'snap_full'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Snapchat AR</span>
            </button>
            <button
              onClick={() => setViewMode('split_compare')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'split_compare'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Split Compare</span>
            </button>
          </div>

          {/* Camera Feed Mode */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleSelectMode('motion_webcam')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                activeMode === 'motion_webcam' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Camera"
            >
              <Video className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSelectMode('demo_motion')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                activeMode === 'demo_motion' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Motion Video Demo"
            >
              <Film className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSelectMode('still_photo')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                activeMode === 'still_photo' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Still Photo"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </div>
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
        {/* Left Side: Live AR Camera Viewport + Snapchat Lens Carousel */}
        <div className="sm:col-span-7 space-y-3">
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

            {/* SNAPCHAT CIRCULAR SHUTTER BUTTON */}
            <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-30 pointer-events-none">
              <button
                onClick={handleSnapMotionPicture}
                className="pointer-events-auto relative w-16 h-16 rounded-full border-4 border-white bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 hover:scale-110 active:scale-95 shadow-2xl shadow-pink-500/50 flex items-center justify-center transition-all group ring-4 ring-white/30"
                title="Take Picture with Active Lens"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white/80 flex items-center justify-center bg-black/20 backdrop-blur-xs">
                  <Camera className="w-6 h-6 text-white group-hover:rotate-12 transition-transform drop-shadow" />
                </div>
              </button>
            </div>

            {/* Prompt to Start Camera if webcam mode selected but not active */}
            {activeMode === 'motion_webcam' && !isWebcamActive && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Video className="w-10 h-10 text-pink-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Ready for Live Snapchat AR Try-On</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Turn on your camera to experience real-time airbrushed skin, winged lashes, glossy lips, and floating sparkles.
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

            {/* Drag Range Slider Overlay (ONLY in split_compare mode) */}
            {viewMode === 'split_compare' && (
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            )}

            {/* Corner Badges */}
            <div className="absolute top-3 left-3 flex items-center space-x-2 z-10 pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                {activeMode === 'motion_webcam' ? 'Live Camera' : activeMode === 'demo_motion' ? 'Motion Feed' : 'Still'}
              </span>
              {liveFace?.detected && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Locked ({Math.round(liveFace.confidence * 100)}%)
                </span>
              )}
            </div>

            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-0.5 rounded-full text-white pointer-events-none flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" />
              Snapchat AR
            </span>
          </div>

          {/* SNAPCHAT LENSES HORIZONTAL CAROUSEL (The Iconic Snapchat Lens Switcher!) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-pink-400" /> Snapchat Lenses Carousel
              </span>
              <span className="text-[10px] text-pink-300 font-mono">Tap any lens to apply</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {SNAPCHAT_LENSES.map((lens) => {
                const isActive = lens.id === activeLensId;
                return (
                  <button
                    key={lens.id}
                    onClick={() => handleSelectLens(lens)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all shrink-0 w-20 border text-center ${
                      isActive
                        ? 'bg-pink-500/20 border-pink-500 text-white shadow-lg shadow-pink-500/20 scale-105 ring-2 ring-pink-400/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
                      isActive ? 'bg-gradient-to-tr from-pink-500 to-rose-400 shadow-md scale-110' : 'bg-slate-900'
                    }`}>
                      {lens.emoji}
                    </div>
                    <span className="text-[10px] font-bold mt-1.5 truncate max-w-[70px]">{lens.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 italic px-1">{activeLens.tagline}</p>
          </div>

          {/* Filmstrip of Snapped Pictures */}
          {snappedPhotos.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-pink-400" /> Snapped Pictures ({snappedPhotos.length})
                </span>
                <span className="text-[10px]">Click any photo to run full clinical diagnosis</span>
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

        {/* Right Side: Snapchat AR Customizer & Swatch Palette */}
        <div className="sm:col-span-5 space-y-4">
          {/* Beauty Airbrush / Smoothing Slider */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                Airbrush Skin Smoothing
              </span>
              <span className="text-pink-300 font-mono font-bold text-[11px]">
                {Math.round(smoothingIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(smoothingIntensity * 100)}
              onChange={(e) => setSmoothingIntensity(Number(e.target.value) / 100)}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Natural</span>
              <span>Porcelain Soft</span>
              <span>Ultra Glam</span>
            </div>
          </div>

          {/* Swatch Category 1: Lipstick Shades */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Plump Lip Gloss Tint
              </span>
              <span className="text-[10px] text-pink-300 font-mono">
                {LIPSTICK_SWATCHES.find(s => s.hex === selectedLip)?.name || 'Custom'}
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

          {/* Swatch Category 2: Foundation & Undertone Complexion */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                Complexion & Undertone
              </span>
              <span className="text-[10px] text-amber-300 font-mono">
                {FOUNDATION_SWATCHES.find(s => s.hex === selectedFoundation)?.name || 'Custom'}
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
                AR Layer Toggles
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
                  Airbrush
                </button>
                <button
                  onClick={() => setLayers(prev => ({ ...prev, cosmeticMakeup: !prev.cosmeticMakeup }))}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-mono border transition-all ${
                    layers.cosmeticMakeup ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Glam
                </button>
              </div>
            </div>

            {/* Ambient Lighting Presets */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Lighting:</span>
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
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-xs text-emerald-300/90 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>YouCam Clinical Guard:</strong> All Snapchat AR looks are cross-verified with your skin barrier scores to prescribe non-comedogenic, oil-free clinical formulations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VirtualTryOnViewer;
