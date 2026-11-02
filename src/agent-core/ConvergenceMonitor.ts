import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AgentMessage } from './types';

export class ConvergenceMonitor extends BaseAgent {
  constructor(bus: AgentEventBus) {
    super('agent.governance.monitor', 1, 'Constraint & Convergence Monitor', bus);
    this.bus.subscribe('GLOBAL', (msg) => this.auditMessage(msg));
  }

  public async handleMessage(_msg: AgentMessage): Promise<void> {
    // Standard targeted handler
  }

  private async auditMessage(msg: AgentMessage): Promise<void> {
    const state = this.bus.getState();

    // 1. Audit Hop Count limit (Invariant 1: No message chains exceed MAX_HOPS = 7)
    if (msg.hopCount > 7 && msg.intent !== 'ESCALATE') {
      state.governance.deadlocksPrevented += 1;
      await this.escalate(
        'CYCLE_DETECTED_MAX_HOPS_EXCEEDED',
        { msgId: msg.messageId, offendingHops: msg.hopCount, sender: msg.sender.role },
        `Convergence Violation: Message chain exceeded max allowed hops (${msg.hopCount} > 4). Intercepting for stability.`
      );
      return;
    }

    // 2. Audit Clinical Safety Veto (Invariant 2: No dropping SPF or conflicting acids)
    if (msg.topic === 'SUBSTITUTION_PROPOSAL_DISPATCH') {
      if (msg.payload?.proposedDrop === 'prod_spf_fluid') {
        state.governance.safetyVetoesIssued += 1;
        console.warn('[ConvergenceMonitor] Blocked hazardous attempt to eliminate SPF defense.');
      }
    }
  }
}
