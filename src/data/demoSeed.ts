import {
  ClimateContext,
  ActiveInteraction,
  WhatIfSwapOption,
  DepletionTimelineItem,
  ReplenishmentPlan,
  ProductItem
} from '../agent-core/types';

// ============================================================================
// 1. Environmental & Climate Presets (Realistic geographical stress models)
// ============================================================================
export const DEMO_CLIMATES: ClimateContext[] = [
  {
    id: 'climate_desert_arid',
    name: 'High UV Desert (Arid Summer)',
    city: 'Phoenix / Dubai',
    uvIndex: 11,
    humidity: 16,
    aqi: 48,
    temperatureC: 39,
    season: 'arid_heat',
    description: 'Extreme solar radiation with severe trans-epidermal water loss (TEWL) risk. Mandates 100% mineral photostability.',
    stressLevel: 'critical'
  },
  {
    id: 'climate_monsoon_humid',
    name: 'Tropical Monsoon (High Sebum)',
    city: 'Mumbai / Bangkok',
    uvIndex: 8,
    humidity: 89,
    aqi: 142,
    temperatureC: 32,
    season: 'monsoon',
    description: 'High humidity triggers follicular pore blockage and micro-bacterial proliferation. Mandates ultra-light water-gel vehicles.',
    stressLevel: 'high'
  },
  {
    id: 'climate_urban_smog',
    name: 'Urban Megacity (High Pollution)',
    city: 'London / New York',
    uvIndex: 4,
    humidity: 58,
    aqi: 168,
    temperatureC: 19,
    season: 'winter',
    description: 'PM2.5 particulate oxidizes skin surface squalene. Mandates anti-pollution ectoin shield and evening double cleanse.',
    stressLevel: 'moderate'
  },
  {
    id: 'climate_polar_dry',
    name: 'Sub-Zero Polar (Damaged Barrier)',
    city: 'Seoul / Chicago',
    uvIndex: 2,
    humidity: 22,
    aqi: 65,
    temperatureC: -4,
    season: 'winter',
    description: 'Freezing winds strip inter-corneocyte lipid bilayers, inducing severe erythema. Mandates physiological 3:1:1 ceramides.',
    stressLevel: 'high'
  }
];

// ============================================================================
// 2. Clinical Actives Interaction Matrix (Scientific pairing facts)
// ============================================================================
export const ACTIVE_INTERACTIONS_MATRIX: ActiveInteraction[] = [
  {
    ingredientA: 'Niacinamide 10%',
    ingredientB: 'Zinc PCA 1%',
    type: 'SYNERGY',
    severity: 'optimal',
    clinicalDescription: 'Zinc PCA accelerates epidermal barrier recovery while Niacinamide downregulates sebocyte lipid synthesis by 32%.',
    actionTaken: 'BOOST_SCORE'
  },
  {
    ingredientA: 'Encapsulated Retinal 0.05%',
    ingredientB: 'Salicylic Acid 2%',
    type: 'CONFLICT',
    severity: 'severe',
    clinicalDescription: 'Simultaneous low pH BHA with retinoids compromises stratum corneum integrity, inducing severe contact dermatitis.',
    actionTaken: 'PROHIBIT_SIMULTANEOUS'
  },
  {
    ingredientA: 'Botanical Bakuchiol 2%',
    ingredientB: 'Azelaic Acid 10%',
    type: 'SYNERGY',
    severity: 'optimal',
    clinicalDescription: 'Safe, non-irritating alternative to retinoids; suppresses tyrosinase while boosting collagen with zero photosensitivity.',
    actionTaken: 'BOOST_SCORE'
  },
  {
    ingredientA: 'Pure L-Ascorbic Acid (Vit C)',
    ingredientB: 'Invisible Mineral SPF 50+',
    type: 'SYNERGY',
    severity: 'optimal',
    clinicalDescription: 'Antioxidant network neutralizes free radicals that penetrate UV filters, boosting photo-protection by 4x.',
    actionTaken: 'BOOST_SCORE'
  },
  {
    ingredientA: 'Encapsulated Retinal 0.05%',
    ingredientB: 'Direct UV Sunlight',
    type: 'PHOTO_SENSITIZING',
    severity: 'moderate',
    clinicalDescription: 'Degrades under direct sunlight and thins stratum corneum. Strictly prohibited in AM routine.',
    actionTaken: 'MANDATE_DAYTIME_SPF'
  },
  {
    ingredientA: 'Bio-Identical Ceramides NP/AP/EOP',
    ingredientB: 'Phytosphingosine',
    type: 'SYNERGY',
    severity: 'optimal',
    clinicalDescription: 'Reconstructs lamellar liquid crystal lipid bilayers, reducing Trans-Epidermal Water Loss (TEWL) by 64%.',
    actionTaken: 'BOOST_SCORE'
  }
];

// ============================================================================
// 3. What-If Swap Candidates
// ============================================================================
export const WHAT_IF_SWAP_OPTIONS: WhatIfSwapOption[] = [
  {
    id: 'swap_retinol_bakuchiol',
    currentActive: 'Encapsulated Retinaldehyde 0.05%',
    targetActive: 'Bio-Retinol Bakuchiol 2% + Peptides',
    swapRationale: 'Switch from synthetic retinoid to plant-derived meroterpene to eliminate peeling and save $16.00.',
    costDelta: -16.00,
    barrierSafetyScore: 96,
    targetSkinGoal: 'Gentle anti-aging without flaking or UV sensitivity'
  },
  {
    id: 'swap_salicylic_azelaic',
    currentActive: 'Salicylic Acid 2% Exfoliating BHA',
    targetActive: 'Azelaic Acid 10% Calming Suspension',
    swapRationale: 'Switch from keratolytic BHA to anti-microbial dicarboxylic acid to target erythema and redness.',
    costDelta: -3.50,
    barrierSafetyScore: 92,
    targetSkinGoal: 'Soothe inflamed red papules & rosacea'
  },
  {
    id: 'swap_tint_bbfluid',
    currentActive: 'AirGlow Skin Tint SPF 30',
    targetActive: 'CleanHydra Mineral BB Sheer Fluid',
    swapRationale: 'Budget dupe substitution preserving certified non-comedogenic physical vehicle.',
    costDelta: -7.50,
    barrierSafetyScore: 90,
    targetSkinGoal: 'Breathable complexion match within strict budget'
  }
];

// ============================================================================
// 4. Depletion Timelines & Subscription ROI Generator
// ============================================================================
export function generateReplenishmentPlan(items: ProductItem[]): ReplenishmentPlan {
  const schedule: DepletionTimelineItem[] = items.map((item) => {
    let volume = 30;
    let dailyDosage = 0.5;
    let cadence: 30 | 45 | 60 | 90 = 60;

    if (item.id === 'prod_spf_fluid') {
      volume = 50;
      dailyDosage = 1.5; // 2-finger rule = 1.5ml/day
      cadence = 30;
    } else if (item.id === 'prod_ceramide_barrier') {
      volume = 50;
      dailyDosage = 1.0;
      cadence = 45;
    } else if (item.id.includes('tint') || item.id.includes('vto')) {
      volume = 35;
      dailyDosage = 0.4;
      cadence = 90;
    }

    const daysToDepletion = Math.round(volume / dailyDosage);

    return {
      productId: item.id,
      productName: item.name,
      bottleVolumeMl: volume,
      dailyDosageMl: dailyDosage,
      daysToDepletion,
      depletionDateStr: `In ${daysToDepletion} days`,
      urgency: daysToDepletion <= 35 ? 'refill_approaching' : 'safe',
      suggestedRefillCadenceDays: cadence
    };
  });

  const cartTotal = items.reduce((sum, item) => sum + item.price, 0);
  const subscriptionDiscountPct = 15;
  const recurringMonthlyTotal = Number(((cartTotal * 0.85) / 2).toFixed(2));
  const annualSavings = Number(((cartTotal * 0.15) * 6).toFixed(2));
  const clinicAvoidanceValue = 380.00; // Estimated cost of dermatologist visit + topical prescription
  const churnRelapseRiskPct = 4.8;     // 4.8% relapse risk with automated refills vs 44% unmanaged

  return {
    isSubscriptionActive: true,
    subscriptionDiscountPct,
    recurringMonthlyTotal,
    annualSavings,
    clinicAvoidanceValue,
    churnRelapseRiskPct,
    schedule
  };
}
