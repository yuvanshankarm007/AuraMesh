/**
 * Tier 3 Worker: YouCam API Gateway
 * Implements the sponsor-api-guard pattern with 6-second timeout,
 * automatic fallback, and task-polling abstraction.
 */

import { SkinDiagnosticScores, VTOEffect } from './types';

export class YouCamGatewayWorker {
  private static instance: YouCamGatewayWorker;
  private apiKey: string = '';
  private baseUrl: string = 'https://yce.makeupar.com/s2s/v2.0';
  private mockMode: boolean = true;
  private fastMode: boolean = false;

  private constructor() {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('YOUCAM_API_KEY') : '';
    this.apiKey = savedKey || '';
    this.mockMode = !this.apiKey;
  }

  public static getInstance(): YouCamGatewayWorker {
    if (!YouCamGatewayWorker.instance) {
      YouCamGatewayWorker.instance = new YouCamGatewayWorker();
    }
    return YouCamGatewayWorker.instance;
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    this.mockMode = !this.apiKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem('YOUCAM_API_KEY', this.apiKey);
    }
  }

  public setFastMode(fast: boolean) {
    this.fastMode = fast;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Run YouCam Skin Analysis API with Sponsor Guard Fallback
   */
  public async analyzeSkin(imageUrl: string, fallbackScores?: SkinDiagnosticScores): Promise<SkinDiagnosticScores> {
    // 1. Guard against missing key during demos or mock mode
    if (!this.apiKey || this.mockMode) {
      if (!this.fastMode) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      return fallbackScores || this.generateDefaultMockScores();
    }

    try {
      // 2. Timeout protection (6 seconds max)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${this.baseUrl}/task/skin-analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          src_file_url: imageUrl,
          dst_actions: ['wrinkle', 'pore', 'texture', 'acne', 'spots', 'dark_circle', 'redness'],
          miniserver_args: { enable_mask_overlay: true },
          format: 'json'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`YouCam API error ${response.status}: ${response.statusText}`);
      }

      const taskData = await response.json();
      
      if (taskData.task_id) {
        return await this.pollTaskResult(taskData.task_id, fallbackScores);
      }

      return this.normalizeSkinScores(taskData, fallbackScores);
    } catch (err) {
      console.warn('[YouCamGatewayWorker] API call failed or timed out. Serving resilient mock fallback:', err);
      return fallbackScores || this.generateDefaultMockScores();
    }
  }

  /**
   * Poll async task status
   */
  private async pollTaskResult(taskId: string, fallbackScores?: SkinDiagnosticScores): Promise<SkinDiagnosticScores> {
    const maxPolls = 5;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      try {
        const res = await fetch(`${this.baseUrl}/task/skin-analysis/${taskId}`, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            return this.normalizeSkinScores(data.result, fallbackScores);
          }
        }
      } catch (e) {
        break;
      }
    }
    return fallbackScores || this.generateDefaultMockScores();
  }

  private normalizeSkinScores(raw: any, fallbackScores?: SkinDiagnosticScores): SkinDiagnosticScores {
    if (!raw) return fallbackScores || this.generateDefaultMockScores();
    return {
      overallScore: raw.overall_score || 68,
      acne: raw.acne_score || fallbackScores?.acne || 55,
      pores: raw.pore_score || fallbackScores?.pores || 60,
      texture: raw.texture_score || fallbackScores?.texture || 62,
      wrinkles: raw.wrinkle_score || fallbackScores?.wrinkles || 85,
      spots: raw.spot_score || fallbackScores?.spots || 70,
      darkCircles: raw.dark_circle_score || fallbackScores?.darkCircles || 72,
      redness: raw.redness_score || fallbackScores?.redness || 50,
      skinAge: raw.skin_age || fallbackScores?.skinAge || 24,
      undertone: raw.undertone || fallbackScores?.undertone || 'olive',
      fitzpatrickScale: raw.fitzpatrick || fallbackScores?.fitzpatrickScale || 3,
      barrierHealth: (raw.redness_score < 45 || raw.acne_score < 45) ? 'sensitized' : 'intact'
    };
  }

  private generateDefaultMockScores(): SkinDiagnosticScores {
    return {
      overallScore: 65,
      acne: 45,
      pores: 52,
      texture: 56,
      wrinkles: 90,
      spots: 65,
      darkCircles: 70,
      redness: 48,
      skinAge: 22,
      undertone: 'olive',
      fitzpatrickScale: 3,
      barrierHealth: 'sensitized'
    };
  }

  /**
   * Render Virtual Try-On Effects
   */
  public async renderMakeupVTO(imageUrl: string, effects: VTOEffect[]): Promise<{ renderedUrl: string; status: 'live' | 'simulated' }> {
    if (!this.apiKey || this.mockMode) {
      if (!this.fastMode) {
        await new Promise((res) => setTimeout(res, 200));
      }
      return { renderedUrl: imageUrl, status: 'simulated' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${this.baseUrl}/task/makeup-vto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          src_file_url: imageUrl,
          effects: effects.map(e => ({
            category: e.category === 'foundation' ? 'face_foundation' : 'lip_color',
            palettes: [{ color: e.hexColor, texture: e.finish, colorIntensity: 80 }]
          }))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('VTO rendering error');
      const data = await response.json();
      return { renderedUrl: data.result_url || imageUrl, status: 'live' };
    } catch (e) {
      return { renderedUrl: imageUrl, status: 'simulated' };
    }
  }
}
