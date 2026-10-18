import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Languages,
  ShieldCheck,
  Wrench,
  CheckCircle,
  FileText,
  CreditCard,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Product, FeedbackRecord, RootCause, ExtractedFeedback, IssueCategory } from '../types';
import { ActiveTab } from './Navbar';

interface RootCausesViewProps {
  products: Product[];
  feedback: FeedbackRecord[];
  rootCausesMap: Record<string, RootCause[]>;
  extractedFeedback: ExtractedFeedback[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const RootCausesView: React.FC<RootCausesViewProps> = ({
  products,
  feedback,
  rootCausesMap,
  extractedFeedback,
  selectedProductId,
  setSelectedProductId,
  setActiveTab,
}) => {
  const [expandedCauseId, setExpandedCauseId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Map of feedback by ID for fast hydration
  const feedbackById = new Map<string, FeedbackRecord>();
  feedback.forEach((f) => feedbackById.set(f.id, f));

  const extractedById = new Map<string, ExtractedFeedback>();
  extractedFeedback.forEach((e) => extractedById.set(e.record_id, e));

  // Determine list of root causes to display
  let causesToDisplay: { cause: RootCause; product: Product }[] = [];

  const targetProducts =
    selectedProductId === 'all'
      ? products
      : products.filter((p) => p.id === selectedProductId);

  targetProducts.forEach((prod) => {
    const causes = rootCausesMap[prod.id] || [];
    causes.forEach((c) => {
      // Discard any finding with 0 record_ids
      if (c.record_ids && c.record_ids.length > 0) {
        causesToDisplay.push({ cause: c, product: prod });
      }
    });
  });

  // Filter by category if selected
  if (categoryFilter !== 'all') {
    causesToDisplay = causesToDisplay.filter(
      (item) => item.cause.category === categoryFilter
    );
  }

  const categoryColorMap: Record<IssueCategory, { bg: string; text: string; border: string }> = {
    sizing: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'colour/photo mismatch': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'fabric/description mismatch': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'defect/quality': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'delivery damage': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    'wrong item': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'non-product': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Top Banner & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
            <span>Diagnosed Root Causes & Customer Evidence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every finding is grounded in customer quotes with verified record IDs. No hallucinations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
            {['all', 'sizing', 'colour/photo mismatch', 'fabric/description mismatch', 'defect/quality', 'non-product'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md font-semibold capitalize whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Causes' : cat.split('/')[0]}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Root Causes List */}
      {causesToDisplay.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Root Causes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Please run the analysis pipeline or adjust filters to view discovered root causes.
          </p>
          <button
            onClick={() => setActiveTab('analyze')}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            Run Pipeline
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {causesToDisplay.map(({ cause, product }) => {
            const isExpanded = expandedCauseId === cause.id;
            const validRecords = cause.record_ids
              .map((id) => feedbackById.get(id))
              .filter((r): r is FeedbackRecord => r !== undefined);

            const catStyle =
              categoryColorMap[cause.category] || categoryColorMap['non-product'];

            return (
              <div
                key={cause.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Cause Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                        {cause.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {product.name.split('-')[0].trim()}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {validRecords.length} Customer Citations
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {cause.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {cause.summary}
                    </p>

                    {/* Contributing Languages Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                        <Languages className="w-3.5 h-3.5" /> Linguistic sources:
                      </span>
                      {cause.languages_involved.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Badges & Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Severity</span>
                        <span className="text-sm font-black text-rose-600">{cause.severity_score}/5.0</span>
                      </div>
                      <div className="text-right pl-2 border-l border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Confidence</span>
                        <span className="text-sm font-black text-emerald-600">{cause.confidence_score}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setActiveTab('fixes');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Actionable Fix</span>
                      </button>
                      <button
                        onClick={() => setExpandedCauseId(isExpanded ? null : cause.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition cursor-pointer"
                      >
                        <span>Evidence ({validRecords.length})</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Verified Evidence Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200 p-5 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Original Multilingual Citations ({validRecords.length} Verified Records)</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        All records validated against seed customer database
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                      {validRecords.map((rec) => {
                        const extracted = extractedById.get(rec.id);
                        return (
                          <div
                            key={rec.id}
                            className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                                    {rec.id}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 capitalize">
                                    {rec.source.replace('_', ' ')}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {rec.language}
                                </span>
                              </div>

                              {/* Original native text */}
                              <blockquote className="text-xs font-medium text-slate-900 italic border-l-2 border-indigo-400 pl-2 py-0.5 my-1.5 leading-relaxed">
                                "{rec.text}"
                              </blockquote>

                              {/* English Gloss */}
                              {extracted?.english_gloss && (
                                <p className="text-[11px] text-slate-600 mt-1 pl-2">
                                  <span className="font-semibold text-slate-500">English Gloss:</span>{' '}
                                  {extracted.english_gloss}
                                </p>
                              )}

                              {/* Extracted Key phrase */}
                              {extracted?.key_phrase && (
                                <div className="mt-2 text-[10px] text-indigo-900 bg-indigo-50/80 px-2 py-1 rounded inline-block">
                                  <span className="font-bold">Key Indicator:</span> "{extracted.key_phrase}"
                                </div>
                              )}
                            </div>

                            {/* Customer Metadata Footer */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2.5 mt-2 border-t border-slate-100">
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-slate-400" /> {rec.payment_mode}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" /> Pin: {rec.pincode}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {rec.date}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
