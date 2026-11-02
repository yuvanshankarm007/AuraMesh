import { AgentMessage, AgentRole, MultiAgentState } from './types';

export type MessageSubscriber = (msg: AgentMessage) => void | Promise<void>;
export type StateSubscriber = (state: MultiAgentState) => void;

export class AgentEventBus {
  private static instance: AgentEventBus;
  private messageSubscribers: Map<string, Set<MessageSubscriber>> = new Map();
  private globalSubscribers: Set<MessageSubscriber> = new Set();
  private stateSubscribers: Set<StateSubscriber> = new Set();

  private state: MultiAgentState = {
    sessionId: 'session_' + Math.random().toString(36).substring(2, 9),
    currentStep: 'IDLE',
    userGoal: 'Clear acne and find non-comedogenic foundation under $55',
    maxBudget: 55,
    userImage: '',
    executionSpeed: 'instant',
    negotiationRounds: 0,
    governance: {
      totalMessagesAudited: 0,
      invariantsPassed: 0,
      maxHopRecorded: 0,
      deadlocksPrevented: 0,
      safetyVetoesIssued: 0,
      vectorClock: 0
    },
    activeEdges: [],
    messageHistory: []
  };

  private constructor() {}

  public static getInstance(): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus();
    }
    return AgentEventBus.instance;
  }

  public getState(): MultiAgentState {
    return { ...this.state };
  }

  public clearSubscribers() {
    this.messageSubscribers.clear();
    this.globalSubscribers.clear();
  }

  public setExecutionSpeed(speed: 'realistic' | 'instant') {
    this.state.executionSpeed = speed;
    this.notifyState();
  }

  public updateState(updater: (prev: MultiAgentState) => Partial<MultiAgentState>) {
    const changes = updater(this.state);
    this.state = { ...this.state, ...changes };
    this.notifyState();
  }

  public subscribe(role: AgentRole | 'GLOBAL', callback: MessageSubscriber): () => void {
    if (role === 'GLOBAL') {
      this.globalSubscribers.add(callback);
      return () => this.globalSubscribers.delete(callback);
    }
    if (!this.messageSubscribers.has(role)) {
      this.messageSubscribers.set(role, new Set());
    }
    this.messageSubscribers.get(role)!.add(callback);
    return () => this.messageSubscribers.get(role)?.delete(callback);
  }

  public subscribeState(callback: StateSubscriber): () => void {
    this.stateSubscribers.add(callback);
    callback(this.state);
    return () => this.stateSubscribers.delete(callback);
  }

  public async publish(msg: AgentMessage): Promise<void> {
    // 1. Vector Clock & Governance metric updates
    this.state.governance.vectorClock += 1;
    this.state.governance.totalMessagesAudited += 1;
    if (msg.hopCount > this.state.governance.maxHopRecorded) {
      this.state.governance.maxHopRecorded = msg.hopCount;
    }
    this.state.governance.invariantsPassed += 1;

    // 2. Add to message history
    this.state.messageHistory.push(msg);

    // 3. Track active edge for UI graph rendering
    if (msg.recipient.role !== 'BROADCAST') {
      this.state.activeEdges.push({
        from: msg.sender.role,
        to: msg.recipient.role as AgentRole,
        intent: msg.intent,
        timestamp: Date.now()
      });
      if (this.state.activeEdges.length > 8) {
        this.state.activeEdges.shift();
      }
    }

    this.notifyState();

    // 4. Staggered execution delay if in 'realistic' speed mode for visual comprehension
    if (this.state.executionSpeed === 'realistic') {
      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    const promises: Promise<any>[] = [];

    // 5. Dispatch to targeted recipient
    if (msg.recipient.role === 'BROADCAST') {
      this.messageSubscribers.forEach((subs) => {
        subs.forEach((sub) => {
          const res = sub(msg);
          if (res && typeof (res as any).then === 'function') {
            promises.push(res);
          }
        });
      });
    } else {
      const targeted = this.messageSubscribers.get(msg.recipient.role);
      if (targeted) {
        targeted.forEach((sub) => {
          const res = sub(msg);
          if (res && typeof (res as any).then === 'function') {
            promises.push(res);
          }
        });
      }
    }

    // 6. Dispatch to global watchers (UI logs, auditor)
    this.globalSubscribers.forEach((sub) => {
      const res = sub(msg);
      if (res && typeof (res as any).then === 'function') {
        promises.push(res);
      }
    });

    await Promise.all(promises);
  }

  public resetSession(goal?: string, budget?: number, userImage?: string) {
    this.state = {
      sessionId: 'session_' + Math.random().toString(36).substring(2, 9),
      currentStep: 'IDLE',
      userGoal: goal || 'Clear acne and find non-comedogenic foundation under $55',
      maxBudget: budget !== undefined ? budget : 55,
      userImage: userImage || '',
      executionSpeed: this.state.executionSpeed,
      negotiationRounds: 0,
      governance: {
        totalMessagesAudited: 0,
        invariantsPassed: 0,
        maxHopRecorded: 0,
        deadlocksPrevented: 0,
        safetyVetoesIssued: 0,
        vectorClock: 0
      },
      activeEdges: [],
      messageHistory: []
    };
    this.notifyState();
  }

  private notifyState() {
    this.stateSubscribers.forEach((sub) => sub({ ...this.state }));
  }
}
