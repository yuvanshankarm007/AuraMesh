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
  },
  {
    id: 'chloe_melasma',
    name: 'Chloe Dubois',
    subtitle: 'High UV Melasma & Sun Damage',
    age: 36,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Suppress melanogenesis & photo-aging under high UV index with mineral tint under $70',
    budget: 70,
    diagnostics: {
      overallScore: 68,
      acne: 85,
      pores: 60,
      texture: 66,
      wrinkles: 64,
      spots: 41,          // High UV dark spots & hyperpigmentation
      darkCircles: 62,
      redness: 72,
      skinAge: 38,
      undertone: 'neutral',
      fitzpatrickScale: 4,
      barrierHealth: 'intact'
    }
  },
  {
    id: 'marcus_sebum',
    name: 'Marcus Vance',
    subtitle: 'High Sebum, Pores & Razor Folliculitis',
    age: 28,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Control extreme T-zone oiliness and razor bump erythema with sheer matte coverage under $45',
    budget: 45,
    diagnostics: {
      overallScore: 59,
      acne: 50,
      pores: 36,          // Severely dilated sebaceous pores
      texture: 52,
      wrinkles: 88,
      spots: 70,
      darkCircles: 55,
      redness: 44,        // High irritation / razor burn
      skinAge: 27,
      undertone: 'warm',
      fitzpatrickScale: 5,
      barrierHealth: 'sensitized'
    }
  },
  {
    id: 'sophia_smog',
    name: 'Sophia Kim',
    subtitle: 'Atmospheric Smog Defense & Glass Skin',
    age: 22,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    userGoal: 'Protect skin barrier from urban PM2.5 pollution and achieve dewy glass finish under $65',
    budget: 65,
    diagnostics: {
      overallScore: 78,
      acne: 75,
      pores: 70,
      texture: 72,
      wrinkles: 95,
      spots: 76,
      darkCircles: 60,
      redness: 68,
      skinAge: 20,
      undertone: 'cool',
      fitzpatrickScale: 2,
      barrierHealth: 'intact'
    }
  }
];
