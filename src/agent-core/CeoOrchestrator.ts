import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AgentMessage } from './types';

export class CeoOrchestrator extends BaseAgent {
  constructor(bus: AgentEventBus) {
    super('agent.executive.ceo', 1, 'Chief Experience Orchestrator (CEO)', bus);
  }

  public async startMission(
    userGoal: string,
    budget: number,
    userImage: string,
    personaDiagnostics?: any,
    faceDetection?: import('./types').FaceDetectionResult
  ) {
    this.bus.resetSession(userGoal, budget, userImage, faceDetection);
    this.bus.updateState(() => ({ currentStep: 'ANALYZING', faceDetection: faceDetection || undefined }));

    // Tier 1 -> Tier 2 Vertical Delegation
    await this.delegate(
      'agent.specialist.derma',
      'Dermatology Diagnostic Agent',
      'INITIATE_DIAGNOSTIC_SESSION',
      {
        userGoal,
        maxBudget: budget,
        userImage,
        personaDiagnostics,
        faceDetection
      },
      `Executive Directive: Begin clinical skin analysis for goal "${userGoal}" with a strict budget ceiling of $${budget.toFixed(2)}.`
    );
  }

  public async handleMessage(msg: AgentMessage): Promise<void> {
    // Handle upward vertical escalations or completion flags
    if (msg.intent === 'ESCALATE') {
      if (msg.topic === 'CYCLE_DETECTED_MAX_HOPS_EXCEEDED') {
        // Executive arbitration
        this.bus.updateState(() => ({ currentStep: 'CONSENSUS_REACHED' }));
        await this.broadcast(
          'CONSENSUS',
          'EXECUTIVE_ARBITRATION_DECREE',
          { decision: 'Approved balanced compromise bundle to prevent stagnation.' },
          'Executive Decision: Peer debate exceeded threshold. Approved current balanced formulation and cosmetic bundle.'
        );
      }
    } else if (msg.intent === 'CONSENSUS') {
      this.bus.updateState(() => ({ currentStep: 'CHECKOUT_READY' }));
    }
  }
}
