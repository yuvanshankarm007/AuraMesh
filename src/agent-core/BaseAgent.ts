import { AgentEventBus } from './eventBus';
import { AgentMessage, AgentRole, AgentTier, MessageIntent } from './types';

export abstract class BaseAgent {
  constructor(
    public readonly role: AgentRole,
    public readonly tier: AgentTier,
    public readonly label: string,
    protected readonly bus: AgentEventBus
  ) {
    this.bus.subscribe(this.role, (msg) => this.handleMessage(msg));
  }

  abstract handleMessage(msg: AgentMessage): Promise<void>;

  /**
   * Horizontal Peer-to-Peer Communication
   */
  protected async sendPeer<T = any>(
    recipientRole: AgentRole,
    recipientLabel: string,
    intent: MessageIntent,
    topic: string,
    payload: T,
    explanation: string,
    parentMsg?: AgentMessage
  ): Promise<void> {
    const hop = parentMsg ? parentMsg.hopCount + 1 : 1;

    // Cycle prevention & hop-count monitor (bounds max end-to-end deliberation to 7 hops)
    if (hop > 7) {
      await this.escalate(
        'CYCLE_DETECTED_MAX_HOPS_EXCEEDED',
        { originalTopic: topic, payload, offendingHop: hop },
        `Interrupted cyclical loop at hop ${hop}. Escalating to Tier 1 CEO for decisive arbitration.`,
        parentMsg
      );
      return;
    }

    const msg: AgentMessage<T> = {
      messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
      correlationId: parentMsg?.correlationId || this.bus.getState().sessionId,
      parentId: parentMsg?.messageId,
      timestamp: Date.now(),
      hopCount: hop,
      sender: {
        role: this.role,
        tier: this.tier,
        label: this.label
      },
      recipient: {
        role: recipientRole,
        tier: 2,
        label: recipientLabel
      },
      intent,
      topic,
      payload,
      explanation
    };

    await this.bus.publish(msg);
  }

  /**
   * Downward Vertical Delegation (e.g. Tier 1 -> Tier 2, or Tier 2 -> Tier 3)
   */
  protected async delegate<T = any>(
    recipientRole: AgentRole,
    recipientLabel: string,
    topic: string,
    payload: T,
    explanation: string,
    parentMsg?: AgentMessage
  ): Promise<void> {
    const msg: AgentMessage<T> = {
      messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
      correlationId: parentMsg?.correlationId || this.bus.getState().sessionId,
      parentId: parentMsg?.messageId,
      timestamp: Date.now(),
      hopCount: parentMsg ? parentMsg.hopCount + 1 : 1,
      sender: {
        role: this.role,
        tier: this.tier,
        label: this.label
      },
      recipient: {
        role: recipientRole,
        label: recipientLabel
      },
      intent: 'DELEGATE',
      topic,
      payload,
      explanation
    };

    await this.bus.publish(msg);
  }

  /**
   * Upward Vertical Escalation (e.g. Tier 2 -> Tier 1)
   */
  protected async escalate<T = any>(
    topic: string,
    payload: T,
    explanation: string,
    parentMsg?: AgentMessage
  ): Promise<void> {
    const msg: AgentMessage<T> = {
      messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
      correlationId: parentMsg?.correlationId || this.bus.getState().sessionId,
      parentId: parentMsg?.messageId,
      timestamp: Date.now(),
      hopCount: parentMsg ? parentMsg.hopCount + 1 : 1,
      sender: {
        role: this.role,
        tier: this.tier,
        label: this.label
      },
      recipient: {
        role: 'agent.executive.ceo',
        tier: 1,
        label: 'Chief Experience Orchestrator (CEO)'
      },
      intent: 'ESCALATE',
      topic,
      payload,
      explanation
    };

    await this.bus.publish(msg);
  }

  /**
   * Broadcast Telemetry or State
   */
  protected async broadcast<T = any>(
    intent: MessageIntent,
    topic: string,
    payload: T,
    explanation: string,
    parentMsg?: AgentMessage
  ): Promise<void> {
    const msg: AgentMessage<T> = {
      messageId: 'msg_' + Math.random().toString(36).substring(2, 9),
      correlationId: parentMsg?.correlationId || this.bus.getState().sessionId,
      parentId: parentMsg?.messageId,
      timestamp: Date.now(),
      hopCount: parentMsg ? parentMsg.hopCount + 1 : 1,
      sender: {
        role: this.role,
        tier: this.tier,
        label: this.label
      },
      recipient: {
        role: 'BROADCAST',
        label: 'All Specialist Peers'
      },
      intent,
      topic,
      payload,
      explanation
    };

    await this.bus.publish(msg);
  }
}
