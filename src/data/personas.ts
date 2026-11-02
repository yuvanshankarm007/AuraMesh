import { SkinDiagnosticScores } from '../agent-core/types';

export interface DemoPersona {
  id: string;
  name: string;
  subtitle: string;
  age: number;
  avatarUrl: string;
  userGoal: string;
  budget: number;
  diagnostics: SkinDiagnosticScores;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'maya_acne',
    name: 'Maya Lin',
    subtitle: 'Acne-Prone & Inflamed Redness',
    age: 23,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Soothe inflammatory acne & redness, find lightweight non-comedogenic foundation under $55',
    budget: 55,
    diagnostics: {
      overallScore: 64,
      acne: 42,          // Significant acne breakout
      pores: 54,         // Congested T-zone pores
      texture: 58,       // Uneven texture
      wrinkles: 92,      // Very few wrinkles
      spots: 68,         // Post-inflammatory erythema
      darkCircles: 72,
      redness: 45,       // High redness / inflammation
      skinAge: 21,
      undertone: 'olive',
      fitzpatrickScale: 3,
      barrierHealth: 'sensitized'
    }
  },
  {
    id: 'elena_mature',
    name: 'Elena Rostova',
    subtitle: 'Fine Lines & Hyperpigmentation',
    age: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Target collagen loss, crow’s feet and sun spots with luminous satin finish under $85',
    budget: 85,
    diagnostics: {
      overallScore: 71,
      acne: 88,          // Clean skin
      pores: 62,
      texture: 65,
      wrinkles: 51,      // Moderate fine lines & expression lines
      spots: 53,         // Sun-induced hyperpigmentation
      darkCircles: 58,   // Periorbital darkening
      redness: 82,       // Normal vascularity
      skinAge: 46,
      undertone: 'warm',
      fitzpatrickScale: 2,
      barrierHealth: 'intact'
    }
  },
  {
    id: 'jordan_barrier',
    name: 'Jordan Avery',
    subtitle: 'Compromised Barrier & Severe Dehydration',
    age: 31,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Restore damaged lipid barrier after harsh chemical peeling under $60',
    budget: 60,
    diagnostics: {
      overallScore: 52,
      acne: 60,
      pores: 48,
      texture: 44,       // Flaking, textured
      wrinkles: 76,
      spots: 74,
      darkCircles: 66,
      redness: 34,       // Severe trans-epidermal water loss & erythema
      skinAge: 35,
      undertone: 'cool',
      fitzpatrickScale: 2,
      barrierHealth: 'severely_compromised'
    }
  }
];
