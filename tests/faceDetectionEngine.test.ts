import { describe, it, expect } from 'vitest';
import { FaceDetectionEngine } from '../src/agent-core/FaceDetectionEngine';

describe('FaceDetectionEngine — Photometric & Landmark Analysis', () => {
  it('converts RGB to CIE-L*a*b* accurately', () => {
    // Pure neutral white
    const labWhite = FaceDetectionEngine.rgbToLab(255, 255, 255);
    expect(labWhite.L).toBeCloseTo(100, 0);

    // Medium skin tone
    const labSkin = FaceDetectionEngine.rgbToLab(215, 175, 140);
    expect(labSkin.L).toBeGreaterThan(60);
    expect(labSkin.L).toBeLessThan(85);
    expect(labSkin.a).toBeGreaterThan(0);
    expect(labSkin.b).toBeGreaterThan(0);
  });

  it('classifies Fitzpatrick phototypes from ITA angles correctly', () => {
    // Very light skin: ITA > 55 -> Type 1
    const t1 = FaceDetectionEngine.calculateITA(85, 10);
    expect(t1.fitzpatrick).toBe(1);

    // Light / Fair: 41 < ITA <= 55 -> Type 2
    const t2 = FaceDetectionEngine.calculateITA(74, 23);
    expect(t2.fitzpatrick).toBe(2);

    // Intermediate / Medium: 28 < ITA <= 41 -> Type 3
    const t3 = FaceDetectionEngine.calculateITA(65, 25);
    expect(t3.fitzpatrick).toBe(3);

    // Dark / Deep: ITA <= -30 -> Type 6
    const t6 = FaceDetectionEngine.calculateITA(25, 20);
    expect(t6.fitzpatrick).toBe(6);
  });

  it('determines skin undertones accurately from a* and b* chrominance', () => {
    expect(FaceDetectionEngine.determineUndertone(10, 22)).toBe('warm');
    expect(FaceDetectionEngine.determineUndertone(18, 12)).toBe('cool');
    expect(FaceDetectionEngine.determineUndertone(8, 14)).toBe('olive');
  });

  it('generates clinical scores conforming to Fitzpatrick and barrier rules', () => {
    const engine = FaceDetectionEngine.getInstance();
    const mockResult = {
      detected: true,
      confidence: 0.96,
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
        itaAngle: 36,
        fitzpatrickScale: 3 as const,
        detectedUndertone: 'olive' as const,
        brightnessLux: 75,
        contrastScore: 90
      }
    };

    const scores = engine.generateSkinScoresFromDetection(mockResult, 'acne');
    expect(scores.undertone).toBe('olive');
    expect(scores.fitzpatrickScale).toBe(3);
    expect(scores.acne).toBe(40);
    expect(scores.barrierHealth).toBe('sensitized');
    expect(scores.overallScore).toBeGreaterThan(0);
    expect(scores.overallScore).toBeLessThanOrEqual(100);
  });

  it('rejects flat background wall / cupboard surfaces without false positives', () => {
    const engine = FaceDetectionEngine.getInstance();
    // Verify that createFallbackResult returns detected: false with confidence: 0
    const fallback = (engine as any).createFallbackResult(false, 80);
    expect(fallback.detected).toBe(false);
    expect(fallback.confidence).toBe(0);
    expect(fallback.metrics.brightnessLux).toBe(80);

    // Verify isSkinPixel rejects beige painted wall / furniture wood colors (where r ~= g)
    // Wall paint: r=210, g=205, b=165 (r-g = 5 < 10) -> false
    expect((engine as any).isSkinPixel(210, 205, 165)).toBe(false);
    // Dark shadow wall: y < 35 -> false
    expect((engine as any).isSkinPixel(25, 20, 15)).toBe(false);
    // Real human skin: r=215, g=165, b=130 (r-g = 50 >= 10, cb=102, cr=156) -> true
    expect((engine as any).isSkinPixel(215, 165, 130)).toBe(true);
  });
});
