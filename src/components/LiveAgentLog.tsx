import React, { useState } from 'react';
import { AgentMessage, MessageIntent } from '../agent-core/types';
import { ChevronDown, ChevronRight, ArrowRight, MessageSquare, Terminal } from 'lucide-react';

interface LiveLogProps {
  messages: AgentMessage[];
}

export const LiveAgentLog: React.FC<LiveLogProps> = ({ messages }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getIntentBadge = (intent: MessageIntent) => {
    switch (intent) {
      case 'DELEGATE':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'INFORM':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'PROPOSE':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'NEGOTIATE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'CONSENSUS':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      case 'ESCALATE':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col h-[380px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Bidirectional Message Bus & Negotiation Log
          </h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {messages.length} Events Logged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
            <p>Select a persona or upload a photo to start multi-agent execution</p>
          </div>
        ) : (
          messages.slice().reverse().map((msg) => {
            const isExpanded = expandedId === msg.messageId;
            return (
              <div
                key={msg.messageId}
                className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 text-xs transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <span className="text-slate-300">{msg.sender.label}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-400">{msg.recipient.label}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Hop {msg.hopCount}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getIntentBadge(msg.intent)}`}>
                      {msg.intent}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs leading-relaxed mb-1.5">
                  {msg.explanation}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500">
                    Topic: {msg.topic}
                  </span>
                  <button
                    onClick={() => toggleExpand(msg.messageId)}
                    className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center space-x-1"
                  >
                    <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON'}</span>
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                </div>

                {isExpanded && (
                  <pre className="mt-2 p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(msg.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
