import React, { useState } from 'react';
import { SmartBundle, ReplenishmentPlan } from '../agent-core/types';
import {
  ShoppingBag,
  Tag,
  Check,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Clock,
  Calendar,
  Percent,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface CartProps {
  cart?: SmartBundle;
  replenishment?: ReplenishmentPlan;
  onCheckoutComplete?: () => void;
}

export const SmartCartView: React.FC<CartProps> = React.memo(({ cart, replenishment, onCheckoutComplete }) => {
  const [checkedOut, setCheckedOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'subscription'>('cart');
  const [isSubscribed, setIsSubscribed] = useState(true);

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

  const schedule = replenishment?.schedule || [];
  const finalPrice = isSubscribed ? cart.total * 0.85 : cart.total;
  const extraSubDiscount = isSubscribed ? cart.total * 0.15 : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Commerce Specialist: Smart Cart & Adherence
          </h3>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === 'cart'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Optimized Basket ({cart.items.length})
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'subscription'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Refill & ROI</span>
          </button>
        </div>
      </div>

      {activeTab === 'cart' ? (
        <>
          {/* Item List */}
          <div className="space-y-2 mb-3 max-h-[175px] overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>{item.brand}</span>
                      <span>•</span>
                      <span className="text-emerald-400 capitalize">{item.category}</span>
                      {item.selectedShade && (
                        <span className="text-pink-300 bg-pink-500/10 px-1 rounded">
                          {item.selectedShade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
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
            <div className="mb-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2 text-[10px] text-emerald-300 flex items-start space-x-1.5">
              <TrendingDown className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <strong>Peer Tradeoff Applied:</strong>{' '}
                {cart.substitutionHistory.join('; ')}
              </div>
            </div>
          ) : null}

          {/* Pricing Summary & Checkout Button */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Catalog Subtotal</span>
              <span className="font-mono">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" /> Multi-Agent Bundle Discount
              </span>
              <span className="font-mono">-${cart.bundleDiscount.toFixed(2)}</span>
            </div>

            {/* Subscribe & Save 15% Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscribed}
                  onChange={(e) => setIsSubscribed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-pink-500 focus:ring-0"
                />
                <span className="text-slate-300 font-medium flex items-center gap-1 text-[11px]">
                  <Percent className="w-3 h-3 text-pink-400" />
                  Subscribe &amp; Save (Extra 15% Off Refills)
                </span>
              </label>
              {isSubscribed && (
                <span className="text-pink-400 font-mono text-[11px] font-bold">
                  -${extraSubDiscount.toFixed(2)}
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <div>
                <div className="text-[10px] text-slate-400">Total Due Today</div>
                <div className="text-lg font-bold text-pink-400 font-mono">
                  ${finalPrice.toFixed(2)}
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
        </>
      ) : (
        /* Subscription & Replenishment Adherence Predictor */
        <div className="space-y-3">
          <p className="text-[11px] text-slate-400">
            Pharmacological Depletion Model: Automated replenishment based on 0.5ml daily dosage curves prevents clinical barrier relapses.
          </p>

          {/* Depletion Timeline Cards */}
          <div className="space-y-2 max-h-[165px] overflow-y-auto pr-1">
            {schedule.map((item) => {
              const pct = Math.max(10, Math.min(100, Math.round((item.daysToDepletion / 90) * 100)));
              return (
                <div
                  key={item.productId}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-xs"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-slate-200 line-clamp-1">
                      {item.productName}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      item.urgency === 'refill_approaching'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {item.depletionDateStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Volume: {item.bottleVolumeMl}ml ({item.dailyDosageMl}ml/day)</span>
                    <span className="text-cyan-400 font-mono">Cadence: Every {item.suggestedRefillCadenceDays}d</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.urgency === 'refill_approaching' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* eCommerce LTV & Clinic Avoidance ROI */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">Annual Savings</div>
              <div className="font-mono text-emerald-400 font-bold text-xs mt-0.5">
                ${replenishment?.annualSavings?.toFixed(2) || '114.00'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">Clinic Avoidance</div>
              <div className="font-mono text-pink-400 font-bold text-xs mt-0.5">
                $380.00
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">Relapse Risk</div>
              <div className="font-mono text-cyan-400 font-bold text-xs mt-0.5">
                4.8% <span className="text-[9px] text-slate-500">(vs 44%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default SmartCartView;
