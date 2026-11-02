import { PRODUCT_CATALOG } from '../data/catalog';
import { generateReplenishmentPlan } from '../data/demoSeed';
import { BaseAgent } from './BaseAgent';
import { AgentEventBus } from './eventBus';
import { AgentMessage, ProductItem, SmartBundle } from './types';

export class CommerceSpecialist extends BaseAgent {
  constructor(bus: AgentEventBus) {
    super('agent.specialist.commerce', 2, 'Commercial & Cart Concierge Agent', bus);
  }

  public async handleMessage(msg: AgentMessage): Promise<void> {
    const state = this.bus.getState();
    const budgetCeiling = state.maxBudget !== undefined ? state.maxBudget : 55;

    // 1. Initial product assembly from unified proposal
    if (msg.topic === 'COMPLETE_LOOK_AND_ROUTINE_PROPOSAL') {
      const bundle = this.assembleInitialBundle(state.diagnostics, budgetCeiling);
      this.bus.updateState(() => ({ cart: bundle }));

      // Check budget condition
      if (bundle.total > budgetCeiling) {
        const delta = bundle.total - budgetCeiling;
        const candidates = this.generateSubstitutionCandidates(bundle.items);

        // Peer Negotiation Loop: Commerce -> Formulation
        await this.sendPeer(
          'agent.specialist.formulation',
          'Pharmacology Formulation Agent',
          'NEGOTIATE',
          'BUDGET_EXCEEDED_SUBSTITUTION_REQUEST',
          {
            currentTotal: bundle.total,
            budgetCeiling,
            delta,
            candidates
          },
          `Budget Threshold Exceeded: Selected bundle is $${bundle.total.toFixed(2)}, exceeding budget of $${budgetCeiling.toFixed(2)} by $${delta.toFixed(2)}. Proposing ${candidates.length} substitution candidates to Formulation Agent for clinical review.`,
          msg
        );
      } else {
        await this.finalizeConsensus(bundle, msg);
      }
    }

    // 2. Process negotiation agreement from Formulation Specialist
    else if (msg.topic === 'INGREDIENT_SUBSTITUTION_APPROVED') {
      const { fromId, toId, name, saving } = msg.payload;

      const currentCart = this.bus.getState().cart;
      if (!currentCart) return;

      const replacementItem = PRODUCT_CATALOG.find(p => p.id === toId);
      if (!replacementItem) return;

      const updatedItems = currentCart.items.map(item => {
        if (item.id === fromId) {
          return replacementItem;
        }
        return item;
      });

      const subtotal = updatedItems.reduce((sum, i) => sum + i.price, 0);
      const discount = subtotal * 0.15; // 15% bundle discount
      const total = subtotal - discount;

      const optimizedBundle: SmartBundle = {
        items: updatedItems,
        subtotal,
        bundleDiscount: discount,
        total,
        budgetCeiling,
        savings: (currentCart.subtotal - subtotal) + discount,
        isWithinBudget: total <= budgetCeiling,
        substitutionHistory: [
          ...currentCart.substitutionHistory,
          `Peer Tradeoff Approved: ${name} (Saved $${saving.toFixed(2)})`
        ]
      };

      this.bus.updateState(() => ({
        cart: optimizedBundle,
        currentStep: 'CONSENSUS_REACHED'
      }));

      // Broadcast Consensus
      await this.finalizeConsensus(optimizedBundle, msg);
    }

    // 3. Process What-If Active Trade-off
    else if (msg.topic === 'WHAT_IF_TRADE_OFF_APPLIED') {
      const { swap, applied } = msg.payload;
      const currentCart = this.bus.getState().cart;
      if (!currentCart) return;

      const fromId = swap.id === 'swap_retinol_bakuchiol'
        ? (applied ? 'prod_retinol_encap' : 'prod_retinol_dupe')
        : (applied ? 'prod_vto_tint_olive' : 'prod_tint_budget');
      const toId = swap.id === 'swap_retinol_bakuchiol'
        ? (applied ? 'prod_retinol_dupe' : 'prod_retinol_encap')
        : (applied ? 'prod_tint_budget' : 'prod_vto_tint_olive');

      const replacementItem = PRODUCT_CATALOG.find(p => p.id === toId);
      if (replacementItem) {
        const updatedItems = currentCart.items.map(item => item.id === fromId ? replacementItem : item);
        const subtotal = updatedItems.reduce((sum, i) => sum + i.price, 0);
        const discount = subtotal * 0.15;
        const total = subtotal - discount;

        const updatedBundle: SmartBundle = {
          items: updatedItems,
          subtotal,
          bundleDiscount: discount,
          total,
          budgetCeiling,
          savings: discount,
          isWithinBudget: total <= budgetCeiling,
          substitutionHistory: [
            ...currentCart.substitutionHistory,
            `What-If Swap ${applied ? 'Applied' : 'Reverted'}: ${swap.currentActive} ⇄ ${swap.targetActive}`
          ]
        };

        const replenishment = generateReplenishmentPlan(updatedItems);
        this.bus.updateState(() => ({
          cart: updatedBundle,
          replenishment
        }));
      }
    }
  }

  private generateSubstitutionCandidates(items: ProductItem[]): any[] {
    const candidates: any[] = [];

    // Check if high-cost retinol is in cart
    const hasRetinol = items.find(i => i.id === 'prod_retinol_encap');
    if (hasRetinol) {
      candidates.push({
        fromId: 'prod_retinol_encap',
        name: 'Encapsulated Retinaldehyde Night Serum',
        price: 34.00,
        suggestedDupe: 'prod_retinol_dupe',
        dupePrice: 18.00,
        potentialSaving: 16.00
      });
    }

    // Check if premium skin tint is in cart
    const hasTint = items.find(i => i.id === 'prod_vto_tint_olive' || i.id === 'prod_vto_tint_satin');
    if (hasTint) {
      candidates.push({
        fromId: hasTint.id,
        name: hasTint.name,
        price: hasTint.price,
        suggestedDupe: 'prod_tint_budget',
        dupePrice: 13.50,
        potentialSaving: hasTint.price - 13.50
      });
    }

    // Add hazardous option (to demonstrate Formulation Agent's clinical Veto)
    candidates.push({
      type: 'DROP_SPF',
      name: 'Omit Daily Mineral Sunscreen',
      potentialSaving: 16.50
    });

    return candidates;
  }

  private assembleInitialBundle(diagnostics: any, budgetCeiling: number): SmartBundle {
    const isAcne = (diagnostics?.acne || 50) < 60;
    const isMature = (diagnostics?.wrinkles || 80) < 65;

    const rawCandidates = [
      PRODUCT_CATALOG.find(p => p.id === 'prod_niacinamide_10'),
      PRODUCT_CATALOG.find(p => p.id === 'prod_spf_fluid'),
      PRODUCT_CATALOG.find(p => p.id === (diagnostics?.undertone === 'warm' ? 'prod_vto_tint_satin' : 'prod_vto_tint_olive')),
      isAcne ? PRODUCT_CATALOG.find(p => p.id === 'prod_azelaic_10') : null,
      isMature ? PRODUCT_CATALOG.find(p => p.id === 'prod_retinol_encap') : null
    ];

    const items: ProductItem[] = rawCandidates.filter((item): item is ProductItem => Boolean(item));

    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const bundleDiscount = subtotal * 0.12; // 12% initial discount
    const total = subtotal - bundleDiscount;

    return {
      items,
      subtotal,
      bundleDiscount,
      total,
      budgetCeiling,
      savings: bundleDiscount,
      isWithinBudget: total <= budgetCeiling,
      substitutionHistory: []
    };
  }

  private async finalizeConsensus(bundle: SmartBundle, parentMsg: AgentMessage) {
    const replenishment = generateReplenishmentPlan(bundle.items);
    this.bus.updateState(() => ({
      currentStep: 'CONSENSUS_REACHED',
      replenishment
    }));

    await this.broadcast(
      'CONSENSUS',
      'MULTI_AGENT_CONSENSUS_ATTAINED',
      {
        totalPrice: bundle.total,
        itemCount: bundle.items.length,
        savings: bundle.savings,
        withinBudget: bundle.isWithinBudget
      },
      `Consensus Finalized: Reached multi-agent agreement across clinical efficacy, cosmetic harmony, and financial constraints. Final total: $${bundle.total.toFixed(2)} (Target Budget: $${bundle.budgetCeiling.toFixed(2)}).`,
      parentMsg
    );
  }
}
