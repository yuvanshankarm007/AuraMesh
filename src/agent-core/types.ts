/**
 * Bidirectional Multi-Agent Architecture Types
 * Vertical Tiers: Tier 1 (Executive/Governance), Tier 2 (Domain Specialist Peer Web), Tier 3 (Execution Workers)
 */

export type AgentTier = 1 | 2 | 3;

export type AgentRole =
  | 'agent.executive.ceo'
  | 'agent.governance.monitor'
  | 'agent.specialist.derma'
  | 'agent.specialist.formulation'
  | 'agent.specialist.stylist'
  | 'agent.specialist.commerce'
  | 'agent.worker.youcam'
  | 'agent.worker.catalog';

export type MessageIntent =
  | 'DELEGATE'     // Downward vertical command
  | 'INFORM'       // Telemetry broadcast or factual update
  | 'PROPOSE'      // Horizontal initiation of a cross-domain bundle
  | 'NEGOTIATE'    // Horizontal peer dispute/tradeoff resolution
  | 'ESCALATE'     // Upward vertical exception or deadlock flag
  | 'ACKNOWLEDGE'  // Confirmation receipt
  | 'CONSENSUS';   // Final state agreement reached

export interface AgentMessage<T = any> {
  messageId: string;
  correlationId: string;
  parentId?: string;
  timestamp: number;
  hopCount: number;
  sender: {
    role: AgentRole;
    tier: AgentTier;
    label: string;
  };
  recipient: {
    role: AgentRole | 'BROADCAST';
    tier?: AgentTier;
    label: string;
  };
  intent: MessageIntent;
  topic: string;
  payload: T;
  explanation: string;
}

// Domain Telemetry: YouCam Skin Diagnostics
export interface SkinDiagnosticScores {
  overallScore: number;
  acne: number;          // 0 (severe) - 100 (clean)
  pores: number;         // 0 (enlarged) - 100 (tight)
  texture: number;       // 0 (rough) - 100 (smooth)
  wrinkles: number;      // 0 (deep) - 100 (youthful)
  spots: number;         // 0 (hyperpigmentation) - 100 (even)
  darkCircles: number;   // 0 (dark) - 100 (bright)
  redness: number;       // 0 (erythema) - 100 (calm)
  skinAge: number;
  undertone: 'warm' | 'cool' | 'neutral' | 'olive';
  fitzpatrickScale: 1 | 2 | 3 | 4 | 5 | 6;
  barrierHealth: 'intact' | 'sensitized' | 'severely_compromised';
}

// Domain Telemetry: Pharmacology Active Formulation
export interface FormulationIngredient {
  id: string;
  name: string;
  role: 'PRIMARY_ACTIVE' | 'SOOTHING_BARRIER' | 'HYDRATOR' | 'UV_DEFENSE';
  concentration: string;
  scientificRationale: string;
  timeOfDay: 'AM' | 'PM' | 'BOTH';
  safeWithMakeup: boolean;
  prescribedFor: string;
}

export interface FormulationPlan {
  barrierProtocol: string;
  morningRoutine: FormulationIngredient[];
  eveningRoutine: FormulationIngredient[];
  contraindicationsAvoided: string[];
  vehicleTextureRequirement: 'lightweight_water_gel' | 'rich_ceramide_cream' | 'calming_fluid';
}

// Domain Telemetry: Aesthetic & Virtual Try-On
export interface VTOEffect {
  category: 'foundation' | 'lipstick' | 'blush' | 'eyeshadow';
  shadeName: string;
  hexColor: string;
  finish: 'matte' | 'dewy' | 'satin' | 'sheer';
  matchConfidence: number;
  isFormulationCompliant: boolean;
}

export interface AestheticPlan {
  undertoneDetected: string;
  recommendedPalette: string;
  vtoLooks: VTOEffect[];
  selectedLookId: string;
  simulationConfidence: number;
}

// Domain Telemetry: Commercial & Cart
export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: 'skincare' | 'makeup' | 'hybrid';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  activeIngredients: string[];
  matchesCondition: string;
  inStock: boolean;
  shades?: string[];
  selectedShade?: string;
}

export interface SmartBundle {
  items: ProductItem[];
  subtotal: number;
  bundleDiscount: number;
  total: number;
  budgetCeiling: number;
  savings: number;
  isWithinBudget: boolean;
  substitutionHistory: string[];
}

// Governance & Health Invariants
export interface GovernanceMetrics {
  totalMessagesAudited: number;
  invariantsPassed: number;
  maxHopRecorded: number;
  deadlocksPrevented: number;
  safetyVetoesIssued: number;
  vectorClock: number;
}

// Global Multi-Agent Shared Session State
export interface MultiAgentState {
  sessionId: string;
  currentStep: 'IDLE' | 'ANALYZING' | 'NEGOTIATING' | 'CONSENSUS_REACHED' | 'CHECKOUT_READY';
  userGoal: string;
  maxBudget: number;
  userImage: string;
  executionSpeed: 'realistic' | 'instant';
  diagnostics?: SkinDiagnosticScores;
  formulation?: FormulationPlan;
  aesthetic?: AestheticPlan;
  cart?: SmartBundle;
  negotiationRounds: number;
  governance: GovernanceMetrics;
  activeEdges: Array<{ from: AgentRole; to: AgentRole; intent: MessageIntent; timestamp: number }>;
  messageHistory: AgentMessage[];
}
