import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AestheticPlan, AgentMessage, VTOEffect } from './types';
import { YouCamGatewayWorker } from './YouCamGatewayWorker';

export class StylistSpecialist extends BaseAgent {
  private youcamWorker = YouCamGatewayWorker.getInstance();

  constructor(bus: AgentEventBus) {
    super('agent.specialist.stylist', 2, 'Aesthetic & VTO Stylist Agent', bus);
  }

  public async handleMessage(msg: AgentMessage): Promise<void> {
    if (msg.topic === 'FOUNDATION_VEHICLE_AND_TEXTURE_CONSTRAINTS') {
      const { scores, maxBudget } = msg.payload;
      const undertone = scores?.undertone || this.bus.getState().diagnostics?.undertone || 'warm';

      const aestheticPlan = this.generateAestheticPlan(undertone, scores?.barrierHealth);
      this.bus.updateState(() => ({ aesthetic: aestheticPlan }));

      // Call YouCam VTO Gateway
      await this.youcamWorker.renderMakeupVTO(this.bus.getState().userImage, aestheticPlan.vtoLooks);

      // Horizontal Link: Stylist -> Commerce Specialist
      await this.sendPeer(
        'agent.specialist.commerce',
        'Commercial & Cart Concierge Agent',
        'PROPOSE',
        'COMPLETE_LOOK_AND_ROUTINE_PROPOSAL',
        {
          selectedLooks: aestheticPlan.vtoLooks,
          shadeSelected: aestheticPlan.vtoLooks.find(l => l.category === 'foundation')?.shadeName,
          undertone,
          maxBudget
        },
        `Aesthetic Look Lock: Selected ${undertone.toUpperCase()} shade match (${aestheticPlan.vtoLooks[0].shadeName}) and terracotta multi-tint blush. Passing to cart for stock & bundle pricing.`,
        msg
      );
    } else if (msg.topic === 'CLIMATE_FORMULATION_OVERRIDE') {
      const { finishRecommendation } = msg.payload;
      this.bus.updateState((prev) => {
        if (!prev.aesthetic) return {};
        const updatedLooks = prev.aesthetic.vtoLooks.map(l =>
          l.category === 'foundation' ? { ...l, finish: finishRecommendation } : l
        );
        return {
          aesthetic: {
            ...prev.aesthetic,
            vtoLooks: updatedLooks
          }
        };
      });
    }
  }

  private generateAestheticPlan(undertone: string, barrierHealth?: string): AestheticPlan {
    const isOlive = undertone === 'olive';
    const isCool = undertone === 'cool';
    const isNeutral = undertone === 'neutral';

    const foundationHex = isOlive ? '#D6B38A' : isCool ? '#E8C5AC' : isNeutral ? '#DFBA9C' : '#E0B99B';
    const lipHex = isOlive ? '#B35D4D' : isCool ? '#C4516E' : isNeutral ? '#B85368' : '#C25A3F';
    const blushHex = isOlive ? '#D07A65' : isCool ? '#D8849D' : isNeutral ? '#D47E84' : '#DF826C';

    const looks: VTOEffect[] = [
      {
        category: 'foundation',
        shadeName: isOlive ? '#03 Warm Olive Tint' : isCool ? '#01 Cool Ivory Luminous' : isNeutral ? '#02 Neutral Beige' : '#02 Golden Warm Glow',
        hexColor: foundationHex,
        finish: (barrierHealth === 'sensitized' || barrierHealth === 'severely_compromised') ? 'dewy' : 'satin',
        matchConfidence: 0.96,
        isFormulationCompliant: true
      },
      {
        category: 'lipstick',
        shadeName: isOlive ? 'Warm Terracotta Velvet' : isCool ? 'Rose Quartz Glaze' : isNeutral ? 'Soft Mauve Nectar' : 'Spiced Coral Dew',
        hexColor: lipHex,
        finish: 'satin',
        matchConfidence: 0.94,
        isFormulationCompliant: true
      },
      {
        category: 'blush',
        shadeName: isOlive ? 'Sun-Drenched Apricot' : isCool ? 'Soft Peony Flush' : isNeutral ? 'Petal Bloom' : 'Golden Nectar',
        hexColor: blushHex,
        finish: 'sheer',
        matchConfidence: 0.92,
        isFormulationCompliant: true
      }
    ];

    return {
      undertoneDetected: undertone.toUpperCase(),
      recommendedPalette: isOlive ? 'Warm Earth & Muted Terracotta' : isCool ? 'Cool Berry & Rosy Quartz' : isNeutral ? 'Balanced Mauve & Petal' : 'Golden Sunlit Coral',
      vtoLooks: looks,
      selectedLookId: 'look_flawless_balance',
      simulationConfidence: 0.95
    };
  }
}
