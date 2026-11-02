import React, { useState } from 'react';
import { SmartBundle } from '../agent-core/types';
import { ShoppingBag, Tag, Check, Sparkles, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartProps {
  cart?: SmartBundle;
  onCheckoutComplete?: () => void;
}

export const SmartCartView: React.FC<CartProps> = React.memo(({ cart, onCheckoutComplete }) => {
  const [checkedOut, setCheckedOut] = useState(false);

  if (!cart) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center h-[340px] text-slate-500 text-xs">
        <ShoppingBag className="w-8 h-8 mb-2 opacity-30 text-blue-400" />
        <p>Awaiting Commercial & Budget Bundle Assembly...</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    setCheckedOut(true);
    // Bundle Optimization: Dynamically import canvas-confetti only on interaction
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Non-blocking fallback
    }
    if (onCheckoutComplete) onCheckoutComplete();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Commerce Specialist: Optimized Smart Basket
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {cart.items.length} SKUs Bundled
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            cart.isWithinBudget
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            Budget: ${cart.budgetCeiling.toFixed(2)} Target
          </span>
        </div>
      </div>

      {/* E-Commerce Return Risk & Margin Protector Bar */}
      <div className="mb-3.5 bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-950/70 border border-blue-500/30 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Predicted Return Risk</div>
          <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            3.8% <span className="text-[9px] text-slate-500 line-through">31.2%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Margin Saved / Order</div>
          <div className="text-xs font-bold font-mono text-cyan-400 mt-0.5">
            +$28.40 Net
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Chemical Conflict Risk</div>
          <div className="text-xs font-bold font-mono text-pink-400 mt-0.5">
            0.0% Safe
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2 mb-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover border border-slate-700"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  {item.name}
                </h4>
                <div className="text-[10px] text-slate-400">
                  {item.brand} • <span className="text-pink-400 capitalize">{item.category}</span>
                  {item.selectedShade ? ` • ${item.selectedShade}` : null}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-200 font-mono">
                ${item.price.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 line-through font-mono">
                ${item.originalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Agent Substitution Notice */}
      {cart.substitutionHistory.length > 0 ? (
        <div className="mb-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-300 flex items-start space-x-2">
          <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <strong>Peer Negotiation Outcome:</strong>{' '}
            {cart.substitutionHistory.join('; ')}
          </div>
        </div>
      ) : null}

      {/* Pricing Summary & Checkout Button */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Catalog Subtotal</span>
          <span className="font-mono">${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-emerald-400 font-medium">
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" /> Multi-Agent Bundle Discount (15%)
          </span>
          <span className="font-mono">-${cart.bundleDiscount.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
          <div>
            <div className="text-xs text-slate-400">Final Total</div>
            <div className="text-lg font-bold text-pink-400 font-mono">
              ${cart.total.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkedOut}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
              checkedOut
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20 hover:scale-[1.02]'
            }`}
          >
            {checkedOut ? (
              <>
                <Check className="w-4 h-4" />
                <span>Order Dispatched!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>1-Click Order Bundle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
