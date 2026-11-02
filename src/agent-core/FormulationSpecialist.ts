import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AgentMessage, FormulationIngredient, FormulationPlan } from './types';

export class FormulationSpecialist extends BaseAgent {
  constructor(bus: AgentEventBus) {
    super('agent.specialist.formulation', 2, 'Pharmacology Formulation Agent', bus);
  }

  public async handleMessage(msg: AgentMessage): Promise<void> {
    // 1. Process diagnostic report from Dermatology Specialist
    if (msg.topic === 'CLINICAL_SKIN_METRICS_DISPATCH') {
      const { scores, maxBudget } = msg.payload;

      const plan = this.generateTargetedFormulation(scores);
      this.bus.updateState(() => ({ formulation: plan }));

      // Horizontal Link: Formulation -> Stylist Specialist
      await this.sendPeer(
        'agent.specialist.stylist',
        'Aesthetic & VTO Stylist Agent',
        'PROPOSE',
        'FOUNDATION_VEHICLE_AND_TEXTURE_CONSTRAINTS',
        {
          scores,
          vehicleRequirement: plan.vehicleTextureRequirement,
          prohibitedIngredients: ['isopropyl_myristate', 'denatured_alcohol', 'heavy_dimethicone'],
          recommendedCoverage: scores.acne < 50 ? 'breathable_medium_coverage' : 'sheer_luminous_tint',
          finishRecommendation: scores.barrierHealth === 'sensitized' ? 'hydrating_dewy' : 'soft_natural_matte',
          maxBudget
        },
        `Pharmacological Constraint: Due to active ${scores.barrierHealth} barrier, cosmetic vehicle MUST be ${plan.vehicleTextureRequirement}. Avoid pore-clogging occlusives.`,
        msg
      );
    }

    // 2. Negotiate dynamic cost tradeoffs with Commercial Specialist
    else if (msg.topic === 'BUDGET_EXCEEDED_SUBSTITUTION_REQUEST') {
      const { candidates } = msg.payload;

      let approvedSubstitution: {
        fromId: string;
        toId: string;
        name: string;
        saving: number;
        clinicalRationale: string;
      } | null = null;

      for (const candidate of candidates) {
        // Clinical Veto Check 1: Never drop SPF or Barrier Ceramides
        if (candidate.type === 'DROP_SPF') {
          await this.sendPeer(
            'agent.specialist.commerce',
            'Commercial & Cart Concierge Agent',
            'NEGOTIATE',
            'CLINICAL_SAFETY_VETO',
            { candidate, reason: 'UV mineral barrier is non-negotiable for skin recovery.' },
            `Clinical Safety Veto: Dropping UV sunshield is strictly prohibited under dermatological protocol.`,
            msg
          );
          continue;
        }

        // Active Dupe 1: Encapsulated Retinol -> Botanical Bakuchiol
        if (candidate.fromId === 'prod_retinol_encap') {
          approvedSubstitution = {
            fromId: 'prod_retinol_encap',
            toId: 'prod_retinol_dupe',
            name: 'Encapsulated Retinal -> Bio-Retinol Peptide Booster',
            saving: 16.00,
            clinicalRationale: 'Identical cellular renewal pathway as retinol without retinoid dermatitis or high formulation licensing cost.'
          };
          break;
        }

        // Active Dupe 2: Premium Tint -> CleanHydra Mineral BB
        if (candidate.fromId === 'prod_vto_tint_olive' || candidate.fromId === 'prod_vto_tint_satin') {
          approvedSubstitution = {
            fromId: candidate.fromId,
            toId: 'prod_tint_budget',
            name: `${candidate.name} -> CleanHydra Mineral BB Sheer Fluid`,
            saving: candidate.price - 13.50,
            clinicalRationale: 'Retains certified non-comedogenic physical vehicle, preserving acne safety while saving cost.'
          };
          break;
        }
      }

      if (approvedSubstitution) {
        await this.sendPeer(
          'agent.specialist.commerce',
          'Commercial & Cart Concierge Agent',
          'NEGOTIATE',
          'INGREDIENT_SUBSTITUTION_APPROVED',
          approvedSubstitution,
          `Negotiation Accepted: Approved ${approvedSubstitution.name} (Saving $${approvedSubstitution.saving.toFixed(2)}). Pharmacological integrity preserved.`,
          msg
        );
      } else {
        await this.sendPeer(
          'agent.specialist.commerce',
          'Commercial & Cart Concierge Agent',
          'NEGOTIATE',
          'INGREDIENT_SUBSTITUTION_APPROVED',
          {
            fromId: 'prod_vto_tint_olive',
            toId: 'prod_tint_budget',
            name: 'Standardized Mineral BB Tint substitution',
            saving: 7.50,
            clinicalRationale: 'Non-comedogenic vehicle verified.'
          },
          `Negotiation Concession: Approved budget mineral skin tint to satisfy ceiling.`,
          msg
        );
      }
    }
  }

  private generateTargetedFormulation(scores: any): FormulationPlan {
    const morning: FormulationIngredient[] = [
      {
        id: 'ing_niacinamide',
        name: 'Niacinamide 10% + Zinc PCA 1%',
        role: 'PRIMARY_ACTIVE',
        concentration: '10%',
        scientificRationale: 'Downregulates sebaceous gland lipid output by 32%, tightens pore margins, and inhibits inflammatory cytokine cascades.',
        timeOfDay: 'AM',
        safeWithMakeup: true,
        prescribedFor: 'Excess sebum & enlarged pore diameter'
      },
      {
        id: 'ing_mineral_spf',
        name: 'Invisible Mineral Zinc Oxide SPF 50+',
        role: 'UV_DEFENSE',
        concentration: '12% Non-Nano',
        scientificRationale: 'Broad-spectrum physical photon reflection without heat generation or micro-inflammation in acne lesions.',
        timeOfDay: 'AM',
        safeWithMakeup: true,
        prescribedFor: 'UV shielding & preventing post-inflammatory hyperpigmentation'
      }
    ];

    const evening: FormulationIngredient[] = [
      {
        id: 'ing_azelaic',
        name: 'Azelaic Acid 10% + Centella Asiatica',
        role: 'SOOTHING_BARRIER',
        concentration: '10%',
        scientificRationale: 'Selective antimicrobial action against C. acnes and suppresses tyrosinase to rapidly fade red marks.',
        timeOfDay: 'PM',
        safeWithMakeup: false,
        prescribedFor: 'Inflammatory erythema & persistent bumps'
      },
      {
        id: 'ing_ceramides',
        name: 'Bio-Identical Ceramides NP/AP/EOP + Phytosphingosine',
        role: 'HYDRATOR',
        concentration: '3:1:1 Physiological Ratio',
        scientificRationale: 'Repairs lipid bilayer lamellae to lock in moisture and prevent trans-epidermal water loss (TEWL).',
        timeOfDay: 'PM',
        safeWithMakeup: false,
        prescribedFor: 'Compromised stratum corneum'
      }
    ];

    if (scores.wrinkles < 65) {
      evening.unshift({
        id: 'ing_retinal',
        name: 'Encapsulated Retinaldehyde 0.05% Night Serum',
        role: 'PRIMARY_ACTIVE',
        concentration: '0.05%',
        scientificRationale: 'Requires only 1 conversion step to retinoic acid, stimulating fibroblasts and collagen synthesis 11x faster than retinol.',
        timeOfDay: 'PM',
        safeWithMakeup: false,
        prescribedFor: 'Fine lines & cellular turnover'
      });
    }

    return {
      barrierProtocol: scores.barrierHealth === 'sensitized' ? 'Calming anti-inflammatory protocol' : 'Active cellular turnover & sebum regulation',
      morningRoutine: morning,
      eveningRoutine: evening,
      contraindicationsAvoided: ['High-strength Glycolic Acid (pH < 3.2)', 'Physical walnut scrubs', 'Essential fragrance oils'],
      vehicleTextureRequirement: scores.acne < 50 ? 'lightweight_water_gel' : 'calming_fluid'
    };
  }
}
