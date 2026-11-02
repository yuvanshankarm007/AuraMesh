import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AgentMessage, SkinDiagnosticScores } from './types';
import { YouCamGatewayWorker } from './YouCamGatewayWorker';

export class DermaSpecialist extends BaseAgent {
  private youcamWorker = YouCamGatewayWorker.getInstance();

  constructor(bus: AgentEventBus) {
    super('agent.specialist.derma', 2, 'Dermatology Diagnostic Agent', bus);
  }

  public async handleMessage(msg: AgentMessage): Promise<void> {
    if (msg.topic === 'INITIATE_DIAGNOSTIC_SESSION') {
      const { userImage, personaDiagnostics, maxBudget } = msg.payload;

      // 1. Call Tier 3 YouCam API Gateway with Sponsor Guard
      const scores: SkinDiagnosticScores = await this.youcamWorker.analyzeSkin(userImage, personaDiagnostics);

      // 2. Commit diagnostic scores to shared session state
      this.bus.updateState(() => ({
        diagnostics: scores,
        currentStep: 'NEGOTIATING'
      }));

      // 3. Horizontal Bidirectional Web Handshake: Derma -> Formulation Specialist
      await this.sendPeer(
        'agent.specialist.formulation',
        'Pharmacology Formulation Agent',
        'INFORM',
        'CLINICAL_SKIN_METRICS_DISPATCH',
        {
          scores,
          barrierStatus: scores.barrierHealth,
          primaryConcerns: this.extractTopConcerns(scores),
          maxBudget
        },
        `Clinical Findings: Acne score ${scores.acne}/100, Redness ${scores.redness}/100, Pores ${scores.pores}/100. Barrier is ${scores.barrierHealth}. Dispatching active ingredient requirements.`,
        msg
      );
    }
  }

  private extractTopConcerns(scores: SkinDiagnosticScores): string[] {
    const list: Array<{ name: string; score: number }> = [
      { name: 'Active Acne & Papules', score: scores.acne },
      { name: 'Erythema & Redness', score: scores.redness },
      { name: 'Enlarged Pores', score: scores.pores },
      { name: 'Surface Texture Roughness', score: scores.texture },
      { name: 'Expression Wrinkles', score: scores.wrinkles },
      { name: 'Periorbital Dark Circles', score: scores.darkCircles }
    ];
    return list.sort((a, b) => a.score - b.score).slice(0, 3).map(c => `${c.name} (Severity: ${100 - c.score}%)`);
  }
}
