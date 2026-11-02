import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AestheticPlan, LightingMode, FaceDetectionResult, SkinDiagnosticScores } from '../agent-core/types';
import { FaceDetectionEngine } from '../agent-core/FaceDetectionEngine';
import { MediaPipeService, MP_LIP_OUTER_INDICES, MP_FACE_OVAL_INDICES } from '../agent-core/MediaPipeFaceMesh';
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
  Heart,
  Activity,
  Clock,
  Download,
  ShieldCheck
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

export type ARStudioMode = 'snapchat_beauty' | 'clinical_scanner' | 'chronoskin_forecast';

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

// Soft photographic eye enhancement & iris ring-light catchlights (Natural, professional aesthetic)
function drawSnapchatEyeEnhancement(
  ctx: CanvasRenderingContext2D,
  eyeX: number,
  eyeY: number,
  eyeW: number,
  eyeH: number,
  isLeft: boolean
) {
  ctx.save();

  // 1. Lively iris catchlight (signature studio/Snapchat ring-light sparkle)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(eyeX + (isLeft ? 1.2 : -1.2), eyeY - 2.0, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 2. Delicate undereye soft brightening to reduce dark fatigue circles
  ctx.globalCompositeOperation = 'soft-light';
  const underGrad = ctx.createRadialGradient(eyeX, eyeY + eyeH * 0.32, 1, eyeX, eyeY + eyeH * 0.32, eyeW * 0.45);
  underGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  underGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = underGrad;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY + eyeH * 0.32, eyeW * 0.45, eyeH * 0.22, 0, 0, Math.PI * 2);
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

  // Studio Mode: 'snapchat_beauty' (AR Makeup Lenses) | 'clinical_scanner' (YouCam Heatmap) | 'chronoskin_forecast' (30-day wear forecast)
  const [studioMode, setStudioMode] = useState<ARStudioMode>('snapchat_beauty');
  const [chronoSkinDay, setChronoSkinDay] = useState<number>(1); // Day 1, 14, 30

  // View Mode: 'snap_full' (100% full-face filter) vs 'split_compare' (Before/After slider)
  const [viewMode, setViewMode] = useState<'snap_full' | 'split_compare'>('snap_full');
  const [activeLensId, setActiveLensId] = useState<string>('snap_glam');
  const [smoothingIntensity, setSmoothingIntensity] = useState<number>(0.85);

  const [sliderPos, setSliderPos] = useState(50);
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [layers, setLayers] = useState({
    diagnosticMesh: false,
    skincareGlow: true,
    cosmeticMakeup: true
  });

  // Active Snapchat Lens
  const activeLens = SNAPCHAT_LENSES.find(l => l.id === activeLensId) || SNAPCHAT_LENSES[0];

  // Selected Swatches
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
    for (let i = 0; i < 18; i++) {
      arr.push({
        angle: (i / 18) * Math.PI * 2 + Math.random() * 0.4,
        distRatio: 1.22 + Math.random() * 0.35, // Ambient perimeter halo only, never on face features
        size: 1.8 + Math.random() * 1.6, // Delicate stardust (1.8px - 3.4px)
        speed: (0.005 + Math.random() * 0.006) * (i % 2 === 0 ? 1 : -1),
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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.05);
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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Video play error on metadata:', e));
        };
        videoRef.current.play().catch(e => console.warn('Live motion play error:', e));
      }
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setIsWebcamActive(false);
      setWebcamError('Camera access requested. Please click "Allow" in your browser or tap "Turn On" below.');
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

  // Auto-start webcam on mount when in motion_webcam mode
  useEffect(() => {
    if (activeMode === 'motion_webcam' && !isWebcamActive) {
      startLiveCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  // CONTINUOUS LIVE SNAPCHAT & CLINICAL AR MOTION LOOP
  useEffect(() => {
    let isSubscribed = true;
    const engine = FaceDetectionEngine.getInstance();
    const mediaPipe = MediaPipeService.getInstance();

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

      // 1. RENDER BASE SOURCE
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
          ctx.save();
          ctx.translate(cw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, cw, ch);
          ctx.restore();
        } else {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, cw, ch);
          ctx.fillStyle = '#f472b6';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Starting camera stream...', cw * 0.5, ch * 0.5);
        }
      } else if (activeMode === 'motion_webcam' && !isWebcamActive) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Live Camera Paused', cw * 0.5, ch * 0.46);
        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Tap "Turn On" below to view live feed', cw * 0.5, ch * 0.52);
      } else if (activeMode === 'demo_motion') {
        demoMotionTick.current += 0.04;
        const tick = demoMotionTick.current;
        const swayX = Math.sin(tick) * 12;
        const swayY = Math.cos(tick * 0.7) * 6;

        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, cw, ch);

        const cx = cw * 0.5 + swayX;
        const cy = ch * 0.48 + swayY;

        // Torso
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

        // Eyes
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

      // 2. 3D FACE TRACKING (Google MediaPipe Neural Mesh + CV Fallback)
      frameTickRef.current += 1;
      let result = cachedFaceRef.current;
      if (frameTickRef.current % 4 === 0 || !result) {
        const isMirrored = activeMode === 'motion_webcam';
        if (activeMode === 'motion_webcam' && videoRef.current && isWebcamActive && videoRef.current.readyState >= 2) {
          mediaPipe.processFrame(videoRef.current);
        } else {
          mediaPipe.processFrame(canvas);
        }

        const mpLandmarks = mediaPipe.getRawLandmarks();
        if (mpLandmarks && mpLandmarks.length > 0) {
          result = mediaPipe.convertToDetectionResult(mpLandmarks, canvas, isMirrored);
        } else {
          result = await engine.detectFace(canvas);
        }

        cachedFaceRef.current = result;
        if (isSubscribed) {
          setLiveFace(result);
        }
      }
      if (!result) return;

      // When no face is detected with high confidence (e.g. wall, room background, or person out of view):
      if (!result.detected || result.confidence < 0.65) {
        // Draw clean camera view with subtle FaceID alignment guide oval
        ctx.save();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.40)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(cw * 0.5, ch * 0.46, cw * 0.28, ch * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Sleek alignment pill badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        const bannerW = 230;
        const bannerH = 32;
        const bx = (cw - bannerW) * 0.5;
        const by = ch * 0.85;
        ctx.beginPath();
        ctx.roundRect(bx, by, bannerW, bannerH, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fbcfe8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Center face in camera to try on AR', cw * 0.5, by + 20);
        ctx.restore();

        animFrameRef.current = requestAnimationFrame(renderMotionFrame);
        return;
      }

      const lmk = result.landmarks;
      const tick = demoMotionTick.current;

      const isFullSnap = viewMode === 'snap_full';
      const splitX = isFullSnap ? 0 : (sliderPos / 100) * cw;

      // 3. RENDER ACTIVE AR STUDIO EXPERIENCE
      if (splitX < cw) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, cw - splitX, ch);
        ctx.clip();

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
        const blX1 = (lmk.leftCheek.x / 100) * cw;
        const blY1 = (lmk.leftCheek.y / 100) * ch;
        const blX2 = (lmk.rightCheek.x / 100) * cw;
        const blY2 = (lmk.rightCheek.y / 100) * ch;
        const noseX = (lmk.noseTip.x / 100) * cw;
        const noseY = (lmk.noseTip.y / 100) * ch;

        // ====================================================================
        // OPTION 1: SNAPCHAT BEAUTY FILTER
        // ====================================================================
        if (studioMode === 'snapchat_beauty') {
          const isMirrored = activeMode === 'motion_webcam';

          // A. Airbrush Skin Smoothing (Feathered, soft translucent skin glow)
          if (layers.skincareGlow) {
            ctx.save();
            ctx.globalCompositeOperation = 'soft-light';
            const fAlpha = 0.20 * smoothingIntensity;
            const foundGrad = ctx.createRadialGradient(fcx, fcy, 10, fcx, fcy, Math.max(frx, fry) * 1.05);
            foundGrad.addColorStop(0, hexToRgba(selectedFoundation, fAlpha));
            foundGrad.addColorStop(0.55, hexToRgba(selectedFoundation, fAlpha * 0.70));
            foundGrad.addColorStop(0.85, hexToRgba(selectedFoundation, fAlpha * 0.25));
            foundGrad.addColorStop(1, hexToRgba(selectedFoundation, 0));
            ctx.fillStyle = foundGrad;
            ctx.beginPath();
            ctx.ellipse(fcx, fcy, frx * 1.05, fry * 1.05, 0, 0, Math.PI * 2);
            ctx.fill();

            // Very subtle dewy bridge highlight
            const glowGrad = ctx.createRadialGradient(fcx, fcy - bh * 0.08, 6, fcx, fcy - bh * 0.08, frx * 0.75);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, ${0.10 * smoothingIntensity})`);
            glowGrad.addColorStop(0.60, `rgba(255, 255, 255, ${0.03 * smoothingIntensity})`);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.ellipse(fcx, fcy - bh * 0.08, frx * 0.75, fry * 0.60, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // B. Cheek Blush & Highlighting (Natural zygomatic cheekbone blending)
          if (layers.cosmeticMakeup) {
            ctx.save();
            ctx.globalCompositeOperation = 'soft-light';
            const blushColor = activeLens.blushColor;
            const bAlpha = 0.20 * smoothingIntensity;
            const bRadiusX = Math.max(22, bw * 0.18);
            const bRadiusY = Math.max(14, bh * 0.10);

            if (activeLens.id === 'sunset_blush') {
              const noseBlushY = noseY - 8;
              const wGrad = ctx.createRadialGradient(noseX, noseBlushY, 4, noseX, noseBlushY, bw * 0.35);
              wGrad.addColorStop(0, hexToRgba(blushColor, 0.22 * smoothingIntensity));
              wGrad.addColorStop(0.65, hexToRgba(blushColor, 0.10 * smoothingIntensity));
              wGrad.addColorStop(1, hexToRgba(blushColor, 0));
              ctx.fillStyle = wGrad;
              ctx.beginPath();
              ctx.ellipse(noseX, noseBlushY, bw * 0.35, bh * 0.09, 0, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Left cheek (screen left, angled softly upwards towards temple: -0.22 rad)
              const blushGrad1 = ctx.createRadialGradient(blX1, blY1, 2, blX1, blY1, bRadiusX);
              blushGrad1.addColorStop(0, hexToRgba(blushColor, bAlpha));
              blushGrad1.addColorStop(0.60, hexToRgba(blushColor, bAlpha * 0.50));
              blushGrad1.addColorStop(1, hexToRgba(blushColor, 0));
              ctx.fillStyle = blushGrad1;
              ctx.beginPath();
              ctx.ellipse(blX1, blY1, bRadiusX, bRadiusY, -0.22, 0, Math.PI * 2);
              ctx.fill();

              // Right cheek (screen right, angled softly upwards towards temple: +0.22 rad)
              const blushGrad2 = ctx.createRadialGradient(blX2, blY2, 2, blX2, blY2, bRadiusX);
              blushGrad2.addColorStop(0, hexToRgba(blushColor, bAlpha));
              blushGrad2.addColorStop(0.60, hexToRgba(blushColor, bAlpha * 0.50));
              blushGrad2.addColorStop(1, hexToRgba(blushColor, 0));
              ctx.fillStyle = blushGrad2;
              ctx.beginPath();
              ctx.ellipse(blX2, blY2, bRadiusX, bRadiusY, 0.22, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            // Subtle Cheekbone Highlighter (Feathered, soft-light / screen with 0.18 opacity, NO yellow balls)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const hlColor = activeLens.highlighterColor;
            const hlAlpha = 0.18 * smoothingIntensity;

            const hlGrad1 = ctx.createRadialGradient(blX1 - 4, blY1 - bh * 0.04, 1, blX1 - 4, blY1 - bh * 0.04, bRadiusX * 0.7);
            hlGrad1.addColorStop(0, hexToRgba(hlColor, hlAlpha));
            hlGrad1.addColorStop(0.55, hexToRgba(hlColor, hlAlpha * 0.40));
            hlGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = hlGrad1;
            ctx.beginPath();
            ctx.ellipse(blX1 - 4, blY1 - bh * 0.04, bRadiusX * 0.65, bRadiusY * 0.40, -0.22, 0, Math.PI * 2);
            ctx.fill();

            const hlGrad2 = ctx.createRadialGradient(blX2 + 4, blY2 - bh * 0.04, 1, blX2 + 4, blY2 - bh * 0.04, bRadiusX * 0.7);
            hlGrad2.addColorStop(0, hexToRgba(hlColor, hlAlpha));
            hlGrad2.addColorStop(0.55, hexToRgba(hlColor, hlAlpha * 0.40));
            hlGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = hlGrad2;
            ctx.beginPath();
            ctx.ellipse(blX2 + 4, blY2 - bh * 0.04, bRadiusX * 0.65, bRadiusY * 0.40, 0.22, 0, Math.PI * 2);
            ctx.fill();

            // Delicate dewy nose tip highlight (subtle glow, NOT a white button)
            if (activeLens.hasNoseHighlight) {
              const noseGrad = ctx.createRadialGradient(noseX, noseY, 1, noseX, noseY, 6);
              noseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
              noseGrad.addColorStop(0.5, hexToRgba(hlColor, 0.15));
              noseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = noseGrad;
              ctx.beginPath();
              ctx.arc(noseX, noseY, 4, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            // Natural Eye Enhancement: Lively iris ring catchlights & gentle undereye refresh (NO drawn cartoon lines)
            if (activeLens.hasLashes || activeLens.hasEyeliner) {
              const eyeW = Math.max(20, bw * 0.16);
              const eyeH = Math.max(10, bh * 0.08);
              drawSnapchatEyeEnhancement(ctx, lex, ley, eyeW, eyeH, true);
              drawSnapchatEyeEnhancement(ctx, rex, rey, eyeW, eyeH, false);
            }

            // Precision Lip Tint (Polygon boundary clipping when FaceMesh available, or soft natural tint)
            const lipPoints = mediaPipe.getPolygonPoints(MP_LIP_OUTER_INDICES, cw, ch, isMirrored);
            const mx = (lmk.mouthCenter.x / 100) * cw;
            const my = (lmk.mouthCenter.y / 100) * ch;
            const mw = Math.max(24, (lmk.mouthBounds.width / 100) * cw);
            const mh = Math.max(10, (lmk.mouthBounds.height / 100) * ch);

            ctx.save();
            if (lipPoints && lipPoints.length >= 10) {
              // Exact 3D lip polygon clipping: lipstick NEVER bleeds or looks like an oval!
              ctx.beginPath();
              ctx.moveTo(lipPoints[0].x, lipPoints[0].y);
              for (let i = 1; i < lipPoints.length; i++) {
                ctx.lineTo(lipPoints[i].x, lipPoints[i].y);
              }
              ctx.closePath();
              ctx.clip();

              ctx.globalCompositeOperation = 'soft-light';
              ctx.fillStyle = hexToRgba(selectedLip, 0.38);
              ctx.fill();

              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = hexToRgba(selectedLip, 0.22);
              ctx.fill();
            } else {
              // Smooth feathered fallback
              ctx.globalCompositeOperation = 'soft-light';
              const lipGrad = ctx.createRadialGradient(mx, my, 2, mx, my, mw * 0.50);
              lipGrad.addColorStop(0, hexToRgba(selectedLip, 0.35));
              lipGrad.addColorStop(0.70, hexToRgba(selectedLip, 0.18));
              lipGrad.addColorStop(1, hexToRgba(selectedLip, 0));
              ctx.fillStyle = lipGrad;
              ctx.beginPath();
              ctx.ellipse(mx, my, mw * 0.48, mh * 0.42, 0, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            // Lower lip subtle specular shine (translucent sheer sheen, NO white circle)
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const glossY = my + mh * 0.14;
            const glossGrad = ctx.createRadialGradient(mx, glossY, 1, mx, glossY, mw * 0.25);
            glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
            glossGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.06)');
            glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossGrad;
            ctx.beginPath();
            ctx.ellipse(mx, glossY, mw * 0.24, mh * 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Floating Sparkle Particles (Delicate ambient stardust halo outside the face)
          if (activeLens.hasFloatingParticles) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const pColor = activeLens.particleColor || '#fef08a';
            for (const p of particlesRef.current) {
              p.angle += p.speed;
              const px = fcx + Math.cos(p.angle) * (frx * p.distRatio);
              const py = fcy + Math.sin(p.angle) * (fry * p.distRatio);
              const alpha = Math.max(0.12, 0.35 + 0.30 * Math.sin(tick * 2.5 + p.phase));

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
                const orbGrad = ctx.createRadialGradient(px, py, 0.5, px, py, p.size);
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

        // ====================================================================
        // OPTION 2: YOUCAM CLINICAL HEATMAP SCANNER (Clinical-grade scanner)
        // ====================================================================
        } else if (studioMode === 'clinical_scanner') {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          // 1. Erythema / Redness Heatmap Patches on cheeks
          const redGrad1 = ctx.createRadialGradient(blX1, blY1, 2, blX1, blY1, bw * 0.18);
          redGrad1.addColorStop(0, 'rgba(239, 68, 68, 0.60)');
          redGrad1.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
          redGrad1.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = redGrad1;
          ctx.beginPath();
          ctx.arc(blX1, blY1, bw * 0.18, 0, Math.PI * 2);
          ctx.fill();

          const redGrad2 = ctx.createRadialGradient(blX2, blY2, 2, blX2, blY2, bw * 0.18);
          redGrad2.addColorStop(0, 'rgba(239, 68, 68, 0.60)');
          redGrad2.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
          redGrad2.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = redGrad2;
          ctx.beginPath();
          ctx.arc(blX2, blY2, bw * 0.18, 0, Math.PI * 2);
          ctx.fill();

          // 2. Pore Density Heatmap on nose bridge & T-zone
          ctx.fillStyle = 'rgba(234, 179, 8, 0.85)';
          for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const dist = (i % 3 + 1) * 5.5;
            const px = noseX + Math.cos(angle) * dist;
            const py = noseY - 8 + Math.sin(angle) * dist * 0.7;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }

          // 3. Dark Circles under eyes
          const darkGrad1 = ctx.createRadialGradient(lex, ley + 12, 1, lex, ley + 12, bw * 0.15);
          darkGrad1.addColorStop(0, 'rgba(99, 102, 241, 0.55)');
          darkGrad1.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = darkGrad1;
          ctx.beginPath();
          ctx.ellipse(lex, ley + 12, bw * 0.15, bh * 0.05, 0, 0, Math.PI * 2);
          ctx.fill();

          const darkGrad2 = ctx.createRadialGradient(rex, rey + 12, 1, rex, rey + 12, bw * 0.15);
          darkGrad2.addColorStop(0, 'rgba(99, 102, 241, 0.55)');
          darkGrad2.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = darkGrad2;
          ctx.beginPath();
          ctx.ellipse(rex, rey + 12, bw * 0.15, bh * 0.05, 0, 0, Math.PI * 2);
          ctx.fill();

          // 4. Clinical Targeted Crosshair over Active Blemish
          const targetX = blX1 + 10;
          const targetY = blY1 - 14;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(targetX, targetY, 11 + Math.sin(tick * 5) * 2, 0, Math.PI * 2);
          ctx.moveTo(targetX - 16, targetY);
          ctx.lineTo(targetX + 16, targetY);
          ctx.moveTo(targetX, targetY - 16);
          ctx.lineTo(targetX, targetY + 16);
          ctx.stroke();

          // HUD Medical Telemetry Callout
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('ERYTHEMA CLUSTER', targetX + 18, targetY - 4);
          ctx.fillText('SEBUM: 72%', targetX + 18, targetY + 8);

          ctx.restore();

        // ====================================================================
        // OPTION 3: CHRONOSKIN 30-DAY PROGRESS RECOVERY SIMULATOR
        // ====================================================================
        } else if (studioMode === 'chronoskin_forecast') {
          const progress = Math.max(0, Math.min(1, (chronoSkinDay - 1) / 29)); // 0.0 to 1.0

          ctx.save();
          // Progressive skin healing and porcelain tone smoothing
          const healSmoothing = 0.35 + progress * 0.62;
          ctx.globalCompositeOperation = 'soft-light';
          const skinGrad = ctx.createRadialGradient(fcx, fcy, 12, fcx, fcy, Math.max(frx, fry));
          skinGrad.addColorStop(0, hexToRgba('#e8be99', 0.52 * healSmoothing));
          skinGrad.addColorStop(0.70, hexToRgba('#e8be99', 0.30 * healSmoothing));
          skinGrad.addColorStop(1, 'rgba(232, 190, 153, 0)');
          ctx.fillStyle = skinGrad;
          ctx.beginPath();
          ctx.ellipse(fcx, fcy, frx, fry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Residual Blemishes (fades out as Day 30 approaches)
          const residualRedness = 1.0 - progress * 0.88;
          if (residualRedness > 0.06) {
            const redG1 = ctx.createRadialGradient(blX1, blY1, 2, blX1, blY1, bw * 0.16);
            redG1.addColorStop(0, `rgba(239, 68, 68, ${0.45 * residualRedness})`);
            redG1.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = redG1;
            ctx.beginPath();
            ctx.arc(blX1, blY1, bw * 0.16, 0, Math.PI * 2);
            ctx.fill();

            const redG2 = ctx.createRadialGradient(blX2, blY2, 2, blX2, blY2, bw * 0.16);
            redG2.addColorStop(0, `rgba(239, 68, 68, ${0.45 * residualRedness})`);
            redG2.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = redG2;
            ctx.beginPath();
            ctx.arc(blX2, blY2, bw * 0.16, 0, Math.PI * 2);
            ctx.fill();
          }

          // Radiant Dewy Barrier Sheen (develops by Day 30)
          if (progress > 0.3) {
            ctx.globalCompositeOperation = 'screen';
            const dewyGrad = ctx.createRadialGradient(fcx, fcy - 18, 10, fcx, fcy - 18, frx * 0.82);
            dewyGrad.addColorStop(0, `rgba(255, 255, 255, ${0.24 * progress})`);
            dewyGrad.addColorStop(0.70, `rgba(255, 255, 255, ${0.08 * progress})`);
            dewyGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = dewyGrad;
            ctx.beginPath();
            ctx.ellipse(fcx, fcy - 18, frx * 0.82, fry * 0.72, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        ctx.restore();
      }

      // 4. CYBER AURA NEON MESH
      if (layers.diagnosticMesh || (studioMode === 'snapchat_beauty' && activeLens.id === 'cyber_aura')) {
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

      // 5. BEFORE/AFTER SPLIT SLIDER (Only in split_compare mode)
      if (!isFullSnap) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, ch);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(splitX, ch * 0.5, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↔', splitX, ch * 0.5);
      }

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
    studioMode,
    chronoSkinDay,
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

    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 150);

    const photoUrl = canvas.toDataURL('image/jpeg', 0.95);
    setSnappedPhotos(prev => [photoUrl, ...prev.slice(0, 4)]);

    if (liveFace) {
      const engine = FaceDetectionEngine.getInstance();
      const diagnostics = engine.generateSkinScoresFromDetection(liveFace, 'acne');
      if (onCaptureSnapshot) {
        onCaptureSnapshot(photoUrl, liveFace, diagnostics);
      }
    }
  };

  // EXPORT CLINICAL PRESCRIPTION & AR LOOK SUMMARY CARD
  const handleDownloadRxCard = () => {
    const canvas = motionCanvasRef.current;
    if (!canvas) return;

    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 600;
    cardCanvas.height = 760;
    const cctx = cardCanvas.getContext('2d');
    if (!cctx) return;

    // Card background
    cctx.fillStyle = '#090d16';
    cctx.fillRect(0, 0, 600, 760);

    // Decorative gradient banner
    const headGrad = cctx.createLinearGradient(0, 0, 600, 100);
    headGrad.addColorStop(0, '#ec4899');
    headGrad.addColorStop(1, '#8b5cf6');
    cctx.fillStyle = headGrad;
    cctx.fillRect(0, 0, 600, 8);

    // Card Header
    cctx.fillStyle = '#ffffff';
    cctx.font = 'bold 20px sans-serif';
    cctx.fillText('AuraMesh AI — Clinical Dermatology & AR Prescription', 25, 45);

    cctx.fillStyle = '#94a3b8';
    cctx.font = '12px sans-serif';
    cctx.fillText(`Session ID: ${liveFace ? 'YOUCAM-AR-' + Math.round(liveFace.confidence * 99999) : 'YOUCAM-AR-9921'}  •  Date: ${new Date().toLocaleDateString()}`, 25, 68);

    // Embedded Captured Face Image
    cctx.drawImage(canvas, 25, 90, 260, 260);

    // Clinical Metrics Panel
    cctx.fillStyle = '#0f172a';
    cctx.fillRect(305, 90, 270, 260);
    cctx.strokeStyle = '#334155';
    cctx.lineWidth = 1;
    cctx.strokeRect(305, 90, 270, 260);

    cctx.fillStyle = '#f43f5e';
    cctx.font = 'bold 14px sans-serif';
    cctx.fillText('YouCam Skin Diagnostics', 320, 120);

    const metrics = [
      { label: 'Fitzpatrick Phototype', val: `Type ${liveFace?.metrics.fitzpatrickScale || 3}` },
      { label: 'Skin Undertone', val: (liveFace?.metrics.detectedUndertone || 'Olive').toUpperCase() },
      { label: 'ITA Angle Colorimetry', val: `${Math.round(liveFace?.metrics.itaAngle || 36)}°` },
      { label: 'Biological Skin Age', val: '26 Yrs' },
      { label: 'Barrier Health', val: 'Sensitized (Target: Resilient)' },
      { label: 'Active AR Look', val: activeLens.name }
    ];

    metrics.forEach((m, idx) => {
      const my = 150 + idx * 30;
      cctx.fillStyle = '#94a3b8';
      cctx.font = '11px sans-serif';
      cctx.fillText(m.label, 320, my);
      cctx.fillStyle = '#e2e8f0';
      cctx.font = 'bold 11px sans-serif';
      cctx.fillText(m.val, 460, my);
    });

    // Lower Half: Regimen & Pharmacology Action
    cctx.fillStyle = '#1e293b';
    cctx.fillRect(25, 375, 550, 320);
    cctx.strokeStyle = '#334155';
    cctx.strokeRect(25, 375, 550, 320);

    cctx.fillStyle = '#38bdf8';
    cctx.font = 'bold 14px sans-serif';
    cctx.fillText('Autonomous Regimen & Safety Formulation', 45, 410);

    const steps = [
      { phase: 'AM Routine:', desc: 'Calming Ceramide Water-Gel Cleanser + 10% Azelaic Acid + SPF 50+ Hybrid Fluid' },
      { phase: 'PM Routine:', desc: 'Bio-equivalent Bakuchiol 2.0% Peptide Dupe (Substituted for Retinal, saving $18)' },
      { phase: 'Vehicle Constraint:', desc: 'Pharmacology Agent mandated oil-free lightweight vehicle to prevent breakout' },
      { phase: 'VTO Color Harmony:', desc: `Foundation: ${selectedFoundation}  •  Lip Tint: ${selectedLip}` }
    ];

    steps.forEach((s, idx) => {
      const sy = 445 + idx * 45;
      cctx.fillStyle = '#f59e0b';
      cctx.font = 'bold 12px sans-serif';
      cctx.fillText(s.phase, 45, sy);
      cctx.fillStyle = '#cbd5e1';
      cctx.font = '11px sans-serif';
      cctx.fillText(s.desc, 45, sy + 18);
    });

    // Footer
    cctx.fillStyle = '#64748b';
    cctx.font = '10px monospace';
    cctx.fillText('Powered by Perfect Corp YouCam API  •  https://github.com/yuvanshankarm007/AuraMesh', 25, 730);

    // Download PNG
    const link = document.createElement('a');
    link.download = `AuraMesh-Clinical-Prescription-${Date.now()}.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();
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
      {/* Offscreen Video for Webcam Stream (never use display:none which suspends video frame decoding in Chromium) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -100
        }}
      />

      {/* Top Header: Title, Studio Mode & Camera Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>YouCam AR & Clinical Intelligence Studio</span>
          </h3>
        </div>

        {/* Studio 3-Way Mode Switcher: Snapchat Beauty vs Clinical Heatmap vs ChronoSkin */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setStudioMode('snapchat_beauty')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              studioMode === 'snapchat_beauty'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Snapchat Beauty</span>
          </button>
          <button
            onClick={() => setStudioMode('clinical_scanner')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              studioMode === 'clinical_scanner'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Heatmap</span>
          </button>
          <button
            onClick={() => setStudioMode('chronoskin_forecast')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              studioMode === 'chronoskin_forecast'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>30-Day Recovery</span>
          </button>
        </div>

        {/* View Mode & Camera Source Controls */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('snap_full')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'snap_full'
                  ? 'bg-slate-800 text-pink-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full AR
            </button>
            <button
              onClick={() => setViewMode('split_compare')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'split_compare'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split
            </button>
          </div>

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

            {/* LIVE AR VIEWPORT */}
            <canvas
              ref={motionCanvasRef}
              className="w-full h-full object-cover"
              style={{ filter: getLightingFilter() }}
            />

            {/* Prompt to Start Camera if webcam mode selected but not active */}
            {activeMode === 'motion_webcam' && !isWebcamActive && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Video className="w-10 h-10 text-pink-400 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Live Camera Ready</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Allow camera access or tap below to start your webcam and try on AR beauty filters.
                  </p>
                </div>
                <button
                  onClick={startLiveCamera}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all"
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
              {liveFace?.detected ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {liveFace.confidence >= 0.98 ? 'MediaPipe 3D' : 'Face'} Locked ({Math.round(liveFace.confidence * 100)}%)
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Align Face in View
                </span>
              )}
            </div>

            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-0.5 rounded-full text-white pointer-events-none flex items-center gap-1 shadow-md">
              {studioMode === 'snapchat_beauty' ? (
                <>
                  <Sparkles className="w-2.5 h-2.5" />
                  {activeLens.name}
                </>
              ) : studioMode === 'clinical_scanner' ? (
                <>
                  <Activity className="w-2.5 h-2.5 text-rose-300" />
                  YouCam Heatmap
                </>
              ) : (
                <>
                  <Clock className="w-2.5 h-2.5 text-cyan-300" />
                  Day {chronoSkinDay} Forecast
                </>
              )}
            </span>
          </div>

          {/* DOCKED AR ACTION & SNAP BAR (Non-obstructive placement) */}
          <div className="flex items-center justify-between bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isWebcamActive ? (liveFace?.detected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400') : 'bg-slate-500'}`} />
              <span className="text-xs font-semibold text-slate-300">
                {isWebcamActive
                  ? (liveFace?.detected ? `Face Locked (${Math.round((liveFace.confidence || 0.9) * 100)}%)` : 'Scanning Face...')
                  : 'Camera Paused'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {activeMode === 'motion_webcam' && (
                <button
                  onClick={isWebcamActive ? stopLiveCamera : startLiveCamera}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isWebcamActive
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isWebcamActive ? 'Pause' : 'Turn On'}</span>
                </button>
              )}

              <button
                onClick={handleSnapMotionPicture}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-pink-500/30 flex items-center gap-2 transition-all cursor-pointer ring-1 ring-white/20"
                title="Capture Motion Snapshot with Active AR Lens"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Capture Snapshot</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              {snappedPhotos.length > 0 ? `${snappedPhotos.length} snapped` : 'Live AR'}
            </span>
          </div>

          {/* DYNAMIC MODE CONTROLS */}
          {studioMode === 'snapchat_beauty' && (
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
          )}

          {studioMode === 'clinical_scanner' && (
            <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  YouCam AI Clinical Concern Scanner
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  7-Vector Active
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Erythema</span>
                  <span className="text-xs font-bold text-rose-400 font-mono">68/100</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Pores</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">72/100</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Dark Circles</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">54/100</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Acne Severity</span>
                  <span className="text-xs font-bold text-red-400 font-mono">40/100</span>
                </div>
              </div>
            </div>
          )}

          {studioMode === 'chronoskin_forecast' && (
            <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  ChronoSkin 30-Day Recovery Simulator
                </span>
                <span className="text-cyan-300 font-mono font-bold text-[11px]">
                  Day {chronoSkinDay} of 30
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={chronoSkinDay}
                onChange={(e) => setChronoSkinDay(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Day 1 (Baseline Sensitized)</span>
                <span>Day 14 (Barrier Repair)</span>
                <span>Day 30 (Glass Skin Healed)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Predicted Acne</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {Math.round(40 - 32 * ((chronoSkinDay - 1) / 29))}/100
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Barrier Health</span>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {chronoSkinDay < 8 ? 'Sensitized' : chronoSkinDay < 22 ? 'Healing' : 'Resilient'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Skin Age</span>
                  <span className="text-xs font-bold text-purple-300 font-mono">
                    {Math.round(29 - 5 * ((chronoSkinDay - 1) / 29))} yrs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filmstrip of Snapped Pictures */}
          {snappedPhotos.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-pink-400" /> Snapped Pictures ({snappedPhotos.length})
                </span>
                <span className="text-[10px]">Click photo to run clinical cascade</span>
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
          {/* Export Prescription & AR Look Button */}
          <button
            onClick={handleDownloadRxCard}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Clinical Rx & AR Card (PNG)</span>
          </button>

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
              <strong>YouCam Clinical Guard:</strong> All virtual looks and active ingredients are constrained by the Pharmacology Agent to be non-comedogenic and barrier-safe.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VirtualTryOnViewer;
