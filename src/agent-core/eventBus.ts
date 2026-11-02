import { AgentMessage, AgentRole, MultiAgentState } from './types';
import { DEMO_CLIMATES, ACTIVE_INTERACTIONS_MATRIX, WHAT_IF_SWAP_OPTIONS } from '../data/demoSeed';

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
    climate: DEMO_CLIMATES[0],
    whatIfEngine: {
      activeSwaps: WHAT_IF_SWAP_OPTIONS,
      activeConflicts: ACTIVE_INTERACTIONS_MATRIX,
      synergyScore: 92,
      selectedSwapId: undefined
    },
    vtoComparison: {
      sliderPosition: 50,
      activeLayers: {
        showDiagnosticHeatmap: true,
        showSkincareSmoothing: true,
        showCosmeticMakeup: true
      },
      lightingMode: 'daylight',
      deltaEConfidence: 0.96
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
    this.updateState(() => ({ executionSpeed: speed }));
  }

  public updateState(updater: (prev: MultiAgentState) => Partial<MultiAgentState>) {
    const changes = updater(this.state);
    this.state = {
      ...this.state,
      ...changes,
      governance: changes.governance
        ? { ...this.state.governance, ...changes.governance }
        : this.state.governance
    };
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
    return () => {
      this.messageSubscribers.get(role)?.delete(callback);
    };
  }

  public subscribeState(callback: StateSubscriber): () => void {
    this.stateSubscribers.add(callback);
    callback(this.state);
    return () => this.stateSubscribers.delete(callback);
  }

  public async publish(msg: AgentMessage): Promise<void> {
    // 1. Immutable State Update: Vector Clock & Governance Metrics
    const activeEdges = msg.recipient.role !== 'BROADCAST'
      ? [
          ...this.state.activeEdges,
          {
            from: msg.sender.role,
            to: msg.recipient.role as AgentRole,
            intent: msg.intent,
            timestamp: Date.now()
          }
        ].slice(-8)
      : this.state.activeEdges;

    // Cap messageHistory to latest 100 items to avoid unbounded memory growth
    const messageHistory = [...this.state.messageHistory, msg].slice(-100);

    this.state = {
      ...this.state,
      governance: {
        ...this.state.governance,
        vectorClock: this.state.governance.vectorClock + 1,
        totalMessagesAudited: this.state.governance.totalMessagesAudited + 1,
        maxHopRecorded: Math.max(this.state.governance.maxHopRecorded, msg.hopCount),
        invariantsPassed: this.state.governance.invariantsPassed + 1
      },
      activeEdges,
      messageHistory
    };

    this.notifyState();

    // 2. Staggered execution delay if in 'realistic' speed mode for visual comprehension
    if (this.state.executionSpeed === 'realistic') {
      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    const promises: Promise<any>[] = [];

    // 3. Dispatch to targeted recipient
    if (msg.recipient.role === 'BROADCAST') {
      this.messageSubscribers.forEach((subs) => {
        subs.forEach((sub) => {
          try {
            const res = sub(msg);
            if (res && typeof (res as any).then === 'function') {
              promises.push(res);
            }
          } catch (err) {
            console.error('[AgentEventBus] Broadcast handler threw error:', err);
          }
        });
      });
    } else {
      const targeted = this.messageSubscribers.get(msg.recipient.role);
      if (targeted) {
        targeted.forEach((sub) => {
          try {
            const res = sub(msg);
            if (res && typeof (res as any).then === 'function') {
              promises.push(res);
            }
          } catch (err) {
            console.error(`[AgentEventBus] Handler for ${msg.recipient.role} threw error:`, err);
          }
        });
      }
    }

    // 4. Dispatch to global watchers (UI logs, auditor)
    this.globalSubscribers.forEach((sub) => {
      try {
        const res = sub(msg);
        if (res && typeof (res as any).then === 'function') {
          promises.push(res);
        }
      } catch (err) {
        console.error('[AgentEventBus] Global subscriber threw error:', err);
      }
    });

    // 5. Isolate subscriber promises with allSettled so individual failures don't halt the bus
    await Promise.allSettled(promises);
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
      climate: this.state.climate || DEMO_CLIMATES[0],
      whatIfEngine: {
        activeSwaps: WHAT_IF_SWAP_OPTIONS,
        activeConflicts: ACTIVE_INTERACTIONS_MATRIX,
        synergyScore: 92,
        selectedSwapId: undefined
      },
      vtoComparison: {
        sliderPosition: 50,
        activeLayers: {
          showDiagnosticHeatmap: true,
          showSkincareSmoothing: true,
          showCosmeticMakeup: true
        },
        lightingMode: 'daylight',
        deltaEConfidence: 0.96
      },
      activeEdges: [],
      messageHistory: []
    };
    this.notifyState();
  }

  private notifyState() {
    const snapshot = { ...this.state };
    this.stateSubscribers.forEach((sub) => sub(snapshot));
  }
}
