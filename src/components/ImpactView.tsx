import React, { useState } from 'react';
import {
  TrendingDown,
  Calculator,
  Sliders,
  DollarSign,
  CheckSquare,
  Square,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Product, FixRecommendation, RootCause, FeedbackRecord } from '../types';
import { computeFixImpact, computeCombinedImpact, CalculatedImpact } from '../utils/impactCalculator';
import { ActiveTab } from './Navbar';

interface ImpactViewProps {
  products: Product[];
  fixesMap: Record<string, FixRecommendation[]>;
  rootCausesMap: Record<string, RootCause[]>;
  feedback: FeedbackRecord[];
  reverseLogisticsCost: number;
  setReverseLogisticsCost: (val: number) => void;
  restockingCost: number;
  setRestockingCost: (val: number) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  products,
  fixesMap,
  rootCausesMap,
  feedback,
  reverseLogisticsCost,
  setReverseLogisticsCost,
  restockingCost,
  setRestockingCost,
  setActiveTab,
}) => {
  // Build all calculated impacts for all available fixes
  const allImpacts: CalculatedImpact[] = [];

  products.forEach((prod) => {
    const prodFixes = fixesMap[prod.id] || [];
    const prodCauses = rootCausesMap[prod.id] || [];
    prodFixes.forEach((fix) => {
      const cause = prodCauses.find((c) => c.id === fix.root_cause_id);
      if (cause) {
        allImpacts.push(
          computeFixImpact(fix, cause, prod, feedback, reverseLogisticsCost, restockingCost)
        );
      }
    });
  });

  // State for What-If selection (all active by default)
  const [selectedFixIds, setSelectedFixIds] = useState<string[]>(
    allImpacts.map((i) => i.fixId)
  );

  const toggleFix = (fixId: string) => {
    if (selectedFixIds.includes(fixId)) {
      setSelectedFixIds(selectedFixIds.filter((id) => id !== fixId));
    } else {
      setSelectedFixIds([...selectedFixIds, fixId]);
    }
  };

  const selectAll = () => setSelectedFixIds(allImpacts.map((i) => i.fixId));
  const clearAll = () => setSelectedFixIds([]);
  const selectSingle = (fixId: string) => setSelectedFixIds([fixId]);

  // Baseline catalog calculations
  let totalCatalogOrders = 0;
  let totalBaselineReturns = 0;
  products.forEach((p) => {
    totalCatalogOrders += p.monthly_orders;
    totalBaselineReturns += p.monthly_orders * p.current_return_rate;
  });
  const baselineReturnRate = totalCatalogOrders > 0 ? totalBaselineReturns / totalCatalogOrders : 0.285;

  // Compute combined impact for selected scenario
  const activeImpacts = allImpacts.filter((i) => selectedFixIds.includes(i.fixId));
  const combined = computeCombinedImpact(
    activeImpacts,
    totalCatalogOrders,
    baselineReturnRate,
    reverseLogisticsCost,
    restockingCost
  );

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <span>Deterministic Return Reduction & Financial Impact Simulator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Computed 100% in TypeScript code (not AI generated) using verifiable logistics formulas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
            Exact Code Computation
          </span>
        </div>
      </div>

      {/* Assumptions & Formula Bar */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
            <Sliders className="w-4 h-4 text-indigo-700" />
            <span>Operational Assumptions & Cost Parameters (Editable)</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">Updates calculations dynamically in real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Reverse Logistics Courier Cost (₹)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="50"
                max="500"
                step="10"
                value={reverseLogisticsCost}
                onChange={(e) => setReverseLogisticsCost(Number(e.target.value) || 150)}
                className="w-full text-sm font-bold text-slate-900 border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Average return 2-way freight charge</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Restocking & Packaging Inspection (₹)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                max="200"
                step="10"
                value={restockingCost}
                onChange={(e) => setRestockingCost(Number(e.target.value) || 50)}
                className="w-full text-sm font-bold text-slate-900 border border-slate-200 rounded-lg p-1.5 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Warehouse QC, ironing, re-polybagging</p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="block text-[11px] font-semibold text-slate-600">Total Drain Per Return</span>
              <div className="text-lg font-black text-rose-600 mt-0.5">
                ₹{reverseLogisticsCost + restockingCost}
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Total Catalog Volume: <strong>{totalCatalogOrders.toLocaleString()} orders/mo</strong>
            </p>
          </div>
        </div>

        {/* Formula Box */}
        <div className="p-3 bg-white/80 rounded-xl border border-indigo-100 text-[11px] text-slate-600 space-y-1">
          <span className="font-bold text-slate-800">Verifiable Impact Formula:</span>
          <p className="font-mono text-indigo-900 text-[10px]">
            Attributable Returns = Monthly Orders × Current Return Rate × Product-Caused Share × Cause Share
          </p>
          <p className="font-mono text-indigo-900 text-[10px]">
            Financial Savings Range = Attributable Returns × Fix Effectiveness Range (Low / Expected / High) × (Reverse Logistics + Restocking)
          </p>
        </div>
      </div>

      {/* What-If Scenario Range Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monthly Returns Prevented Range */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Returns Prevented (Monthly)</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="text-3xl font-black text-emerald-600">
            {combined.monthlyReturnsPrevented.expected} <span className="text-sm font-semibold text-slate-500">units</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Conservative (Low)</span>
              <strong className="text-slate-800">{combined.monthlyReturnsPrevented.low} units</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Optimistic (High)</span>
              <strong className="text-emerald-700">{combined.monthlyReturnsPrevented.high} units</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Financial Savings Range */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Freight Savings</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="text-3xl font-black text-indigo-700">
            ₹{(combined.monthlySavings.expected / 1000).toFixed(1)}k
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Low Range</span>
              <strong className="text-slate-800">₹{(combined.monthlySavings.low / 1000).toFixed(1)}k</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">High Range</span>
              <strong className="text-indigo-800">₹{(combined.monthlySavings.high / 1000).toFixed(1)}k</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Annualized Profit Protection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Profit Protected</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="text-3xl font-black text-slate-900">
            ₹{(combined.annualSavings.expected / 100000).toFixed(2)} Lakh
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Range</span>
              <strong className="text-slate-800">
                ₹{(combined.annualSavings.low / 100000).toFixed(2)}L – ₹{(combined.annualSavings.high / 100000).toFixed(2)}L
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Return Rate</span>
              <span className="text-emerald-700 font-bold">
                {(baselineReturnRate * 100).toFixed(1)}% → {(combined.newReturnRate.expected * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Scenario Toggles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Interactive What-If Scenario Planner</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select one fix or multiple to simulate cumulative impact on catalog returns
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition"
            >
              Select All Fixes
            </button>
            <button
              onClick={clearAll}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {allImpacts.map((impact) => {
            const isChecked = selectedFixIds.includes(impact.fixId);

            return (
              <div
                key={impact.fixId}
                onClick={() => toggleFix(impact.fixId)}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-2xs ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-65'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600 fill-indigo-50" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {impact.fixType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-indigo-900">
                        {impact.productName.split('-')[0].trim()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{impact.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Attributable volume: ~{impact.attributableReturnsMonthly} returns/mo • Effectiveness range:{' '}
                      {Math.round(impact.effectiveness.low * 100)}%–{Math.round(impact.effectiveness.high * 100)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Prevents</span>
                    <strong className="text-emerald-700 text-sm">
                      {impact.monthlyReturnsPrevented.expected} units/mo
                    </strong>
                    <span className="text-[10px] text-slate-400 block">
                      ({impact.monthlyReturnsPrevented.low}–{impact.monthlyReturnsPrevented.high})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Annual Savings</span>
                    <strong className="text-slate-900 text-sm">
                      ₹{(impact.annualSavings.expected / 1000).toFixed(0)}k/yr
                    </strong>
                    <span className="text-[10px] text-slate-400 block">
                      ₹{(impact.annualSavings.low / 1000).toFixed(0)}k–₹{(impact.annualSavings.high / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
