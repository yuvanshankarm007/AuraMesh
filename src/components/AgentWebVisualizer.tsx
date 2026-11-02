import React, { useMemo } from 'react';
import { MultiAgentState, AgentRole } from '../agent-core/types';
import { Activity, Shield, Sparkles, Beaker, Palette, ShoppingBag, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';

interface VisualizerProps {
  state: MultiAgentState;
}

interface NodeCoord {
  id: AgentRole;
  label: string;
  tier: number;
  x: number;
  y: number;
  icon: any;
  color: string;
  sublabel: string;
}

export const AgentWebVisualizer: React.FC<VisualizerProps> = ({ state }) => {
  const width = 800;
  const height = 320;

  const nodes: NodeCoord[] = useMemo(() => [
    // Tier 1: Executive & Governance
    {
      id: 'agent.executive.ceo',
      label: 'CEO Orchestrator',
      sublabel: 'Tier 1 Executive',
      tier: 1,
      x: 320,
      y: 45,
      icon: Sparkles,
      color: '#ec4899' // Pink
    },
    {
      id: 'agent.governance.monitor',
      label: 'Convergence Auditor',
      sublabel: 'Tier 1 Governance',
      tier: 1,
      x: 480,
      y: 45,
      icon: Shield,
      color: '#8b5cf6' // Purple
    },

    // Tier 2: Horizontal Peer Web
    {
      id: 'agent.specialist.derma',
      label: 'Derma Specialist',
      sublabel: 'Skin AI Diagnostic',
      tier: 2,
      x: 140,
      y: 170,
      icon: Activity,
      color: '#06b6d4' // Cyan
    },
    {
      id: 'agent.specialist.formulation',
      label: 'Formulation Specialist',
      sublabel: 'Active Pharmacology',
      tier: 2,
      x: 310,
      y: 170,
      icon: Beaker,
      color: '#10b981' // Emerald
    },
    {
      id: 'agent.specialist.stylist',
      label: 'Stylist Specialist',
      sublabel: 'VTO & Shade Harmonizer',
      tier: 2,
      x: 490,
      y: 170,
      icon: Palette,
      color: '#f59e0b' // Amber
    },
    {
      id: 'agent.specialist.commerce',
      label: 'Commerce Specialist',
      sublabel: 'Cart & Budget Concierge',
      tier: 2,
      x: 660,
      y: 170,
      icon: ShoppingBag,
      color: '#3b82f6' // Blue
    },

    // Tier 3: Execution Worker
    {
      id: 'agent.worker.youcam',
      label: 'YouCam Gateway Worker',
      sublabel: 'Tier 3 API Bridge',
      tier: 3,
      x: 400,
      y: 275,
      icon: Terminal,
      color: '#f43f5e' // Rose
    }
  ], []);

  const staticEdges: Array<{ from: AgentRole; to: AgentRole; type: 'vertical' | 'horizontal' }> = [
    // Vertical Tier 1 <-> Tier 2
    { from: 'agent.executive.ceo', to: 'agent.specialist.derma', type: 'vertical' },
    { from: 'agent.executive.ceo', to: 'agent.specialist.formulation', type: 'vertical' },
    { from: 'agent.executive.ceo', to: 'agent.specialist.stylist', type: 'vertical' },
    { from: 'agent.executive.ceo', to: 'agent.specialist.commerce', type: 'vertical' },
    { from: 'agent.executive.ceo', to: 'agent.governance.monitor', type: 'vertical' },

    // Horizontal Peer Web (Bidirectional)
    { from: 'agent.specialist.derma', to: 'agent.specialist.formulation', type: 'horizontal' },
    { from: 'agent.specialist.formulation', to: 'agent.specialist.stylist', type: 'horizontal' },
    { from: 'agent.specialist.stylist', to: 'agent.specialist.commerce', type: 'horizontal' },
    { from: 'agent.specialist.commerce', to: 'agent.specialist.formulation', type: 'horizontal' },
    { from: 'agent.specialist.derma', to: 'agent.specialist.stylist', type: 'horizontal' },

    // Vertical Tier 2 <-> Tier 3
    { from: 'agent.specialist.derma', to: 'agent.worker.youcam', type: 'vertical' },
    { from: 'agent.specialist.stylist', to: 'agent.worker.youcam', type: 'vertical' }
  ];

  const nodeMap = useMemo(() => {
    const map = new Map<AgentRole, NodeCoord>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  const isEdgeActive = (from: AgentRole, to: AgentRole) => {
    const now = Date.now();
    return state.activeEdges.some(
      e => ((e.from === from && e.to === to) || (e.from === to && e.to === from)) && (now - e.timestamp < 3500)
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-sm font-semibold text-slate-200">
            Bidirectional Multi-Agent Web Topology
          </h2>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
            Phase: <strong className="text-pink-400">{state.currentStep}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-slate-600 inline-block" /> Vertical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-cyan-500 inline-block" /> Horizontal Peer Web
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500 inline-block animate-pulse" /> Active Transmission
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[680px] select-none"
        >
          <defs>
            <linearGradient id="gradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Static Edges */}
          {staticEdges.map((edge, idx) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const active = isEdgeActive(edge.from, edge.to);

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={active ? 'url(#gradActive)' : '#1e293b'}
                  strokeWidth={active ? 3 : edge.type === 'horizontal' ? 1.5 : 1}
                  strokeDasharray={active ? '6 4' : edge.type === 'horizontal' ? '3 3' : 'none'}
                  filter={active ? 'url(#glow)' : undefined}
                  className={active ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}

          {/* Node Renderers */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isRecentSender = state.activeEdges.some(e => e.from === node.id && Date.now() - e.timestamp < 3000);
            const isRecentRecipient = state.activeEdges.some(e => e.to === node.id && Date.now() - e.timestamp < 3000);
            const isHighlighted = isRecentSender || isRecentRecipient;

            return (
              <g key={node.id} className="cursor-pointer transition-all duration-300">
                {isHighlighted && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    className="animate-ping-slow"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  fill="#0b1120"
                  stroke={isHighlighted ? node.color : '#334155'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                />

                <foreignObject
                  x={node.x - 10}
                  y={node.y - 10}
                  width={20}
                  height={20}
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    <Icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                  </div>
                </foreignObject>

                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  className="text-[11px] font-medium fill-slate-200"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 44}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Governance & Invariants Telemetry Strip */}
      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-slate-500 uppercase tracking-wider">Vector Clock</div>
          <div className="font-mono text-cyan-400 font-bold text-xs mt-0.5">
            VC_{state.governance.vectorClock}
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-slate-500 uppercase tracking-wider">Max Hop Tracked</div>
          <div className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
            {state.governance.maxHopRecorded} / 7 Allowed
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-slate-500 uppercase tracking-wider">Invariants Audited</div>
          <div className="font-mono text-pink-400 font-bold text-xs mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {state.governance.invariantsPassed} Passed
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center">
          <div className="text-slate-500 uppercase tracking-wider">Clinical Vetoes</div>
          <div className="font-mono text-amber-400 font-bold text-xs mt-0.5">
            {state.governance.safetyVetoesIssued} Active Blocked
          </div>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-center col-span-2 sm:col-span-1">
          <div className="text-slate-500 uppercase tracking-wider">Deadlocks</div>
          <div className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
            0 Detected
          </div>
        </div>
      </div>
    </div>
  );
};
