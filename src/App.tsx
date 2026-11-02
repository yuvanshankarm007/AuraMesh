import React, { useEffect, useRef, useState } from 'react';
import { AgentEventBus } from './agent-core/eventBus';
import { CeoOrchestrator } from './agent-core/CeoOrchestrator';
import { ConvergenceMonitor } from './agent-core/ConvergenceMonitor';
import { DermaSpecialist } from './agent-core/DermaSpecialist';
import { FormulationSpecialist } from './agent-core/FormulationSpecialist';
import { StylistSpecialist } from './agent-core/StylistSpecialist';
import { CommerceSpecialist } from './agent-core/CommerceSpecialist';
import { YouCamGatewayWorker } from './agent-core/YouCamGatewayWorker';
import { MultiAgentState } from './agent-core/types';
import { DEMO_PERSONAS, DemoPersona } from './data/personas';

import { Header } from './components/Header';
import { PersonaSelector } from './components/PersonaSelector';
import { AgentWebVisualizer } from './components/AgentWebVisualizer';
import { LiveAgentLog } from './components/LiveAgentLog';
import { SkinAnalysisRadar } from './components/SkinAnalysisRadar';
import { VirtualTryOnViewer } from './components/VirtualTryOnViewer';
import { FormulationRoutineView } from './components/FormulationRoutineView';
import { SmartCartView } from './components/SmartCartView';
import { ApiKeyModal } from './components/ApiKeyModal';

export const App: React.FC = () => {
  const bus = useRef(AgentEventBus.getInstance()).current;
  const worker = useRef(YouCamGatewayWorker.getInstance()).current;

  // Initialize Agents
  const ceoRef = useRef<CeoOrchestrator | null>(null);
  const monitorRef = useRef<ConvergenceMonitor | null>(null);
  const dermaRef = useRef<DermaSpecialist | null>(null);
  const formulaRef = useRef<FormulationSpecialist | null>(null);
  const stylistRef = useRef<StylistSpecialist | null>(null);
  const commerceRef = useRef<CommerceSpecialist | null>(null);

  const [agentState, setAgentState] = useState<MultiAgentState>(bus.getState());
  const [selectedPersona, setSelectedPersona] = useState<DemoPersona | null>(DEMO_PERSONAS[0]);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isSimulated, setIsSimulated] = useState(worker.isMockMode());

  useEffect(() => {
    if (!ceoRef.current) {
      ceoRef.current = new CeoOrchestrator(bus);
      monitorRef.current = new ConvergenceMonitor(bus);
      dermaRef.current = new DermaSpecialist(bus);
      formulaRef.current = new FormulationSpecialist(bus);
      stylistRef.current = new StylistSpecialist(bus);
      commerceRef.current = new CommerceSpecialist(bus);
    }

    const unsubscribe = bus.subscribeState((newState) => {
      setAgentState(newState);
    });

    triggerPersonaRun(DEMO_PERSONAS[0]);

    return () => unsubscribe();
  }, []);

  const triggerPersonaRun = async (persona: DemoPersona) => {
    setSelectedPersona(persona);
    if (ceoRef.current) {
      await ceoRef.current.startMission(
        persona.userGoal,
        persona.budget,
        persona.avatarUrl,
        persona.diagnostics
      );
    }
  };

  const handleCustomScenario = async (image: string, goal: string, budget: number, diagnostics?: any) => {
    setSelectedPersona(null);
    if (ceoRef.current) {
      await ceoRef.current.startMission(goal, budget, image, diagnostics);
    }
  };

  const handleReset = () => {
    if (selectedPersona) {
      triggerPersonaRun(selectedPersona);
    } else {
      triggerPersonaRun(DEMO_PERSONAS[0]);
    }
  };

  const handleToggleSpeed = () => {
    const nextSpeed = agentState.executionSpeed === 'realistic' ? 'instant' : 'realistic';
    bus.setExecutionSpeed(nextSpeed);
  };

  const handleSaveApiKey = (_key: string) => {
    setIsSimulated(worker.isMockMode());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onReset={handleReset}
        isSimulated={isSimulated}
        executionSpeed={agentState.executionSpeed}
        onToggleSpeed={handleToggleSpeed}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Row 1: Persona Switcher & Custom Scenario Arbitrator */}
        <PersonaSelector
          selectedPersona={selectedPersona}
          onSelectPersona={triggerPersonaRun}
          onCustomScenario={handleCustomScenario}
          isRunning={agentState.currentStep === 'ANALYZING'}
        />

        {/* Row 2: Bidirectional Web Topology Visualizer & Message Bus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AgentWebVisualizer state={agentState} />
          </div>
          <div className="lg:col-span-5">
            <LiveAgentLog messages={agentState.messageHistory} />
          </div>
        </div>

        {/* Row 3: YouCam AI Skin Diagnostic Telemetry & Virtual Try-On (VTO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <SkinAnalysisRadar
              scores={agentState.diagnostics}
              avatarUrl={agentState.userImage || selectedPersona?.avatarUrl}
            />
          </div>
          <div className="lg:col-span-6">
            <VirtualTryOnViewer
              aesthetic={agentState.aesthetic}
              avatarUrl={agentState.userImage || selectedPersona?.avatarUrl}
            />
          </div>
        </div>

        {/* Row 4: Pharmacological Regimen & Smart Optimized Basket */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <FormulationRoutineView formulation={agentState.formulation} />
          </div>
          <div className="lg:col-span-6">
            <SmartCartView cart={agentState.cart} />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          Built for the <strong>YouCam API Skin AI & eCommerce Challenge</strong> • Powered by Perfect Corp YouCam APIs & Bidirectional Multi-Agent Web Architecture.
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};
export default App;
