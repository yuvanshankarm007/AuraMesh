import { describe, it, expect, beforeEach } from 'vitest';
import { AgentEventBus } from '../src/agent-core/eventBus';
import { CeoOrchestrator } from '../src/agent-core/CeoOrchestrator';
import { ConvergenceMonitor } from '../src/agent-core/ConvergenceMonitor';
import { DermaSpecialist } from '../src/agent-core/DermaSpecialist';
import { FormulationSpecialist } from '../src/agent-core/FormulationSpecialist';
import { StylistSpecialist } from '../src/agent-core/StylistSpecialist';
import { CommerceSpecialist } from '../src/agent-core/CommerceSpecialist';
import { YouCamGatewayWorker } from '../src/agent-core/YouCamGatewayWorker';
import { DEMO_PERSONAS } from '../src/data/personas';

describe('Multi-Agent Bidirectional Web Architecture — Comprehensive Test Suite', () => {
  let bus: AgentEventBus;
  let ceo: CeoOrchestrator;
  let monitor: ConvergenceMonitor;
  let derma: DermaSpecialist;
  let formula: FormulationSpecialist;
  let stylist: StylistSpecialist;
  let commerce: CommerceSpecialist;
  let worker: YouCamGatewayWorker;

  beforeEach(() => {
    bus = AgentEventBus.getInstance();
    bus.clearSubscribers(); // Prevent duplicate subscribers across tests
    bus.setExecutionSpeed('instant'); // 0ms execution for test speed
    bus.resetSession();

    worker = YouCamGatewayWorker.getInstance();
    worker.setApiKey(''); // Run in zero-crash mode
    worker.setFastMode(true); // 0ms for instant testing

    ceo = new CeoOrchestrator(bus);
    monitor = new ConvergenceMonitor(bus);
    derma = new DermaSpecialist(bus);
    formula = new FormulationSpecialist(bus);
    stylist = new StylistSpecialist(bus);
    commerce = new CommerceSpecialist(bus);
  });

  // ==========================================
  // SUITE 1: Standard Persona Test Cases
  // ==========================================
  describe('Suite 1: Standard Persona Workflows', () => {
    it('Case 1.1: Maya Lin (Acne-prone, Sensitized Barrier, $55 budget)', async () => {
      const maya = DEMO_PERSONAS[0];
      await ceo.startMission(maya.userGoal, maya.budget, maya.avatarUrl, maya.diagnostics);

      const state = bus.getState();

      // Verify Tier 1 State Progression
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);
      expect(state.messageHistory.length).toBeGreaterThanOrEqual(4);

      // Verify Tier 2 Derma Diagnostics
      expect(state.diagnostics).toBeDefined();
      expect(state.diagnostics?.acne).toBe(42);
      expect(state.diagnostics?.barrierHealth).toBe('sensitized');
      expect(state.diagnostics?.undertone).toBe('olive');

      // Verify Tier 2 Formulation Regimen
      expect(state.formulation).toBeDefined();
      expect(state.formulation?.vehicleTextureRequirement).toBe('lightweight_water_gel');
      const hasNiacinamide = state.formulation?.morningRoutine.some(i => i.name.includes('Niacinamide'));
      const hasAzelaic = state.formulation?.eveningRoutine.some(i => i.name.includes('Azelaic'));
      expect(hasNiacinamide).toBe(true);
      expect(hasAzelaic).toBe(true);

      // Verify Tier 2 Stylist Look Matching
      expect(state.aesthetic).toBeDefined();
      expect(state.aesthetic?.undertoneDetected).toBe('OLIVE');
      const foundation = state.aesthetic?.vtoLooks.find(l => l.category === 'foundation');
      expect(foundation?.hexColor).toBe('#D6B38A'); // Olive Hex
      expect(foundation?.isFormulationCompliant).toBe(true);

      // Verify Tier 2 Commerce Cart within Budget
      expect(state.cart).toBeDefined();
      expect(state.cart?.isWithinBudget).toBe(true);
      expect(state.cart?.total).toBeLessThanOrEqual(maya.budget);
    });

    it('Case 1.2: Elena Rostova (Mature, Fine Lines, $85 budget)', async () => {
      const elena = DEMO_PERSONAS[1];
      await ceo.startMission(elena.userGoal, elena.budget, elena.avatarUrl, elena.diagnostics);

      const state = bus.getState();
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);

      // Verify Diagnostics & Retinol inclusion
      expect(state.diagnostics?.wrinkles).toBe(51);
      expect(state.diagnostics?.undertone).toBe('warm');

      // Verify Retinaldehyde or Bakuchiol formulated for lines
      const pmActives = state.formulation?.eveningRoutine.map(i => i.name) || [];
      const hasCollagenStimulator = pmActives.some(n => n.includes('Retin') || n.includes('Bakuchiol'));
      expect(hasCollagenStimulator).toBe(true);

      // Cart within Elena's $85 budget
      expect(state.cart?.isWithinBudget).toBe(true);
      expect(state.cart?.total).toBeLessThanOrEqual(elena.budget);
    });

    it('Case 1.3: Jordan Avery (Compromised Barrier, Erythema/Redness, $60 budget)', async () => {
      const jordan = DEMO_PERSONAS[2];
      await ceo.startMission(jordan.userGoal, jordan.budget, jordan.avatarUrl, jordan.diagnostics);

      const state = bus.getState();
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);

      // Verify barrier protocol
      expect(state.diagnostics?.barrierHealth).toBe('severely_compromised');
      const pmActives = state.formulation?.eveningRoutine.map(i => i.name) || [];
      const hasCeramides = pmActives.some(n => n.includes('Ceramide'));
      expect(hasCeramides).toBe(true);

      // Verify finish recommendation adapts to compromised barrier
      const foundationLook = state.aesthetic?.vtoLooks.find(l => l.category === 'foundation');
      expect(foundationLook?.finish).toBe('dewy');
    });
  });

  // ==========================================
  // SUITE 2: Edge Cases: Financial Constraints
  // ==========================================
  describe('Suite 2: Financial Boundary Edge Cases', () => {
    it('Edge Case 2.1: Ultra-Low Budget ($30.00)', async () => {
      const customDiagnostics = {
        overallScore: 60,
        acne: 45,
        pores: 50,
        texture: 55,
        wrinkles: 85,
        spots: 65,
        darkCircles: 70,
        redness: 48,
        skinAge: 24,
        undertone: 'olive' as const,
        fitzpatrickScale: 3 as const,
        barrierHealth: 'sensitized' as const
      };

      await ceo.startMission('Extreme budget constraints routine', 30.00, 'https://test.com/face.jpg', customDiagnostics);

      const state = bus.getState();
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);

      const cart = state.cart;
      expect(cart).toBeDefined();
      expect(cart?.substitutionHistory.length).toBeGreaterThan(0);
      expect(cart?.items.some(i => i.id === 'prod_tint_budget')).toBe(true);
    });

    it('Edge Case 2.2: Luxury / High Budget ($150.00)', async () => {
      const customDiagnostics = {
        overallScore: 75,
        acne: 80,
        pores: 70,
        texture: 72,
        wrinkles: 55,
        spots: 60,
        darkCircles: 68,
        redness: 80,
        skinAge: 42,
        undertone: 'warm' as const,
        fitzpatrickScale: 2 as const,
        barrierHealth: 'intact' as const
      };

      await ceo.startMission('High-end luxury routine', 150.00, 'https://test.com/face.jpg', customDiagnostics);

      const state = bus.getState();
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);

      const cart = state.cart;
      expect(cart?.total).toBeLessThanOrEqual(150.00);
      expect(cart?.items.some(i => i.id === 'prod_retinol_encap')).toBe(true);
      expect(cart?.substitutionHistory.length).toBe(0); // Zero downgrades needed
    });

    it('Edge Case 2.3: Zero or Baseline Budget Guard', async () => {
      await ceo.startMission('Zero budget test', 35, 'https://test.com/face.jpg', DEMO_PERSONAS[0].diagnostics);

      const state = bus.getState();
      expect(['CONSENSUS_REACHED', 'CHECKOUT_READY']).toContain(state.currentStep);
      expect(state.cart).toBeDefined();
    });
  });

  // ==========================================
  // SUITE 3: Clinical Safety & Veto Invariants
  // ==========================================
  describe('Suite 3: Clinical Safety & Veto Invariants', () => {
    it('Edge Case 3.1: Sunscreen (SPF) Protection is Non-Negotiable', async () => {
      await ceo.startMission('Acne routine', 40.00, 'https://test.com/face.jpg', DEMO_PERSONAS[0].diagnostics);

      const state = bus.getState();
      const hasSpf = state.cart?.items.some(i => i.id === 'prod_spf_fluid');
      expect(hasSpf).toBe(true);
      expect(state.governance.invariantsPassed).toBeGreaterThan(0);
    });

    it('Edge Case 3.2: Contraindications are Filtered Out for Sensitized Skin', async () => {
      await ceo.startMission('Sensitized skin', 60.00, 'https://test.com/face.jpg', DEMO_PERSONAS[2].diagnostics);

      const state = bus.getState();
      const avoided = state.formulation?.contraindicationsAvoided || [];
      expect(avoided.some(a => a.toLowerCase().includes('glycolic'))).toBe(true);
      expect(avoided.some(a => a.toLowerCase().includes('scrub'))).toBe(true);
    });
  });

  // ==========================================
  // SUITE 4: Convergence & Max Hop Invariant
  // ==========================================
  describe('Suite 4: Convergence & Loop Protection', () => {
    it('Edge Case 4.1: Message Hop Count is strictly bounded by MAX_HOPS = 7', async () => {
      await ceo.startMission('Loop check', 55.00, 'https://test.com/face.jpg', DEMO_PERSONAS[0].diagnostics);

      const state = bus.getState();
      const maxHop = state.governance.maxHopRecorded;
      expect(maxHop).toBeLessThanOrEqual(7);
    });

    it('Edge Case 4.2: Artificial Runaway Loop is Intercepted by Monitor without Crashing', async () => {
      await bus.publish({
        messageId: 'test_loop_msg',
        correlationId: 'test_corr',
        timestamp: Date.now(),
        hopCount: 8, // Exceeds limit 7
        sender: { role: 'agent.specialist.commerce', tier: 2, label: 'Commerce' },
        recipient: { role: 'agent.specialist.formulation', tier: 2, label: 'Formulation' },
        intent: 'NEGOTIATE',
        topic: 'ENDLESS_LOOP_PROPOSAL',
        payload: { loop: true },
        explanation: 'Simulating artificial cyclical deadlock'
      });

      const state = bus.getState();
      expect(state.governance.deadlocksPrevented).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // SUITE 5: YouCam Gateway Zero-Crash Resilience
  // ==========================================
  describe('Suite 5: YouCam Gateway Resilience', () => {
    it('Edge Case 5.1: Missing API Key serves calibrated mock without crashing', async () => {
      worker.setApiKey('');
      expect(worker.isMockMode()).toBe(true);

      const scores = await worker.analyzeSkin('https://example.com/missing-key.jpg');
      expect(scores).toBeDefined();
      expect(scores.overallScore).toBeGreaterThan(0);
      expect(scores.acne).toBeDefined();
      expect(scores.undertone).toBeDefined();
    });

    it('Edge Case 5.2: Empty / Invalid Image URL falls back gracefully', async () => {
      const emptyScores = await worker.analyzeSkin('');
      expect(emptyScores).toBeDefined();
      expect(emptyScores.overallScore).toBe(65);

      const vtoResult = await worker.renderMakeupVTO('', []);
      expect(vtoResult).toBeDefined();
      expect(vtoResult.status).toBe('simulated');
    });

    it('Edge Case 5.3: Base64 Data URL Image ingestion', async () => {
      const dummyBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
      const scores = await worker.analyzeSkin(dummyBase64);
      expect(scores).toBeDefined();
    });
  });

  // ==========================================
  // SUITE 6: Complexion Undertones & Fitzpatrick Coverage
  // ==========================================
  describe('Suite 6: Undertones & Fitzpatrick Coverage', () => {
    const undertones: Array<'warm' | 'cool' | 'neutral' | 'olive'> = ['warm', 'cool', 'neutral', 'olive'];

    undertones.forEach((tone) => {
      it(`Edge Case 6.${undertones.indexOf(tone) + 1}: Harmonizes palette for ${tone.toUpperCase()} undertone`, async () => {
        const diagnostics = {
          ...DEMO_PERSONAS[0].diagnostics,
          undertone: tone
        };

        await ceo.startMission(`Tone test for ${tone}`, 65, 'https://test.com/face.jpg', diagnostics);

        const state = bus.getState();
        expect(state.aesthetic?.undertoneDetected).toBe(tone.toUpperCase());
        const foundation = state.aesthetic?.vtoLooks.find(l => l.category === 'foundation');
        expect(foundation).toBeDefined();
        expect(foundation?.hexColor).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});
