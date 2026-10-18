import React, { useState } from 'react';
import {
  Wrench,
  Copy,
  Check,
  Table,
  FileText,
  Camera,
  ClipboardCheck,
  Sparkles,
  Quote,
  Languages,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Product, FixRecommendation, RootCause, FeedbackRecord } from '../types';
import { ActiveTab } from './Navbar';

interface FixesViewProps {
  products: Product[];
  fixesMap: Record<string, FixRecommendation[]>;
  rootCausesMap: Record<string, RootCause[]>;
  feedback: FeedbackRecord[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const FixesView: React.FC<FixesViewProps> = ({
  products,
  fixesMap,
  rootCausesMap,
  feedback,
  selectedProductId,
  setSelectedProductId,
  setActiveTab,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyLangTab, setCopyLangTab] = useState<'english' | 'hindi' | 'gujarati'>('english');
  const [selectedFixType, setSelectedFixType] = useState<string>('all');

  const feedbackById = new Map<string, FeedbackRecord>();
  feedback.forEach((f) => feedbackById.set(f.id, f));

  // Collect all fixes to display
  let fixesToDisplay: { fix: FixRecommendation; product: Product; rootCause?: RootCause }[] = [];

  const targetProducts =
    selectedProductId === 'all'
      ? products
      : products.filter((p) => p.id === selectedProductId);

  targetProducts.forEach((prod) => {
    const fixes = fixesMap[prod.id] || [];
    const causes = rootCausesMap[prod.id] || [];
    fixes.forEach((f) => {
      const matchedCause = causes.find((c) => c.id === f.root_cause_id);
      fixesToDisplay.push({ fix: f, product: prod, rootCause: matchedCause });
    });
  });

  if (selectedFixType !== 'all') {
    fixesToDisplay = fixesToDisplay.filter((item) => item.fix.fix_type === selectedFixType);
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header and Type Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <span>Actionable Return Prevention Fixes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Concrete seller artifacts: calibrated size charts, multi-lingual listing copy, photo reshoot specs, and QC checklists
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Fixes' },
            { id: 'size_chart', label: 'Size Charts' },
            { id: 'listing_copy', label: 'Rewritten Copy (EN/HI/GU)' },
            { id: 'photo_reshoot', label: 'Photo Reshoot' },
            { id: 'qc_checklist', label: 'QC Checklists' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedFixType(type.id)}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
                selectedFixType === type.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fixes List */}
      <div className="space-y-6">
        {fixesToDisplay.map(({ fix, product, rootCause }) => {
          return (
            <div
              key={fix.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Fix Card Header */}
              <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50/50 to-indigo-50/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {fix.fix_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">•</span>
                    <span className="text-xs font-bold text-slate-800">
                      {product.name.split('-')[0].trim()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      Estimated Return Reduction:{' '}
                      <strong className="text-emerald-700">
                        {Math.round(fix.effectiveness_range.low * 100)}% – {Math.round(fix.effectiveness_range.high * 100)}%
                      </strong>
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{fix.title}</h3>
              </div>

              {/* Fix Content Body */}
              <div className="p-5 space-y-5">
                {/* 1. Size Chart Artifact */}
                {fix.size_chart_table && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Table className="w-4 h-4 text-indigo-600" />
                        <span>Calibrated Size Chart with 3-Inch Comfort Ease Allowance</span>
                      </div>
                      <button
                        onClick={() => {
                          const csv = [
                            fix.size_chart_table!.headers.join(','),
                            ...fix.size_chart_table!.rows.map((r) =>
                              fix.size_chart_table!.headers.map((h) => r[h] || '').join(',')
                            ),
                          ].join('\n');
                          handleCopy(`size-chart-${fix.id}`, csv);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        {copiedId === `size-chart-${fix.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied CSV</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Table</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[11px] border-b border-slate-200">
                          <tr>
                            {fix.size_chart_table.headers.map((h) => (
                              <th key={h} className="p-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fix.size_chart_table.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/30 font-medium">
                              {fix.size_chart_table!.headers.map((h) => (
                                <td key={h} className="p-2.5">
                                  {row[h]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium leading-relaxed">
                      💡 {fix.size_chart_table.fit_guidance}
                    </div>
                  </div>
                )}

                {/* 2. Rewritten Listing Copy (Multi-Dialect Tabs: English, Hindi, Gujarati) */}
                {fix.rewritten_copy && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>High-Converting Listing Copy (Transparent Fabric Framing)</span>
                      </div>

                      {/* Language tabs */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                        <button
                          onClick={() => setCopyLangTab('english')}
                          className={`px-3 py-1 rounded-md font-semibold transition ${
                            copyLangTab === 'english'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => setCopyLangTab('hindi')}
                          className={`px-3 py-1 rounded-md font-semibold transition ${
                            copyLangTab === 'hindi'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          हिन्दी
                        </button>
                        <button
                          onClick={() => setCopyLangTab('gujarati')}
                          className={`px-3 py-1 rounded-md font-semibold transition ${
                            copyLangTab === 'gujarati'
                              ? 'bg-white text-indigo-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ગુજરાતી
                        </button>
                      </div>
                    </div>

                    {/* Copy Content Box */}
                    {(() => {
                      const copy = fix.rewritten_copy[copyLangTab];
                      const fullCopyText = `${copy.title}\n\nBullet Points:\n${copy.bullets.map((b) => `• ${b}`).join('\n')}\n\nDescription:\n${copy.description}`;

                      return (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Title</span>
                              <p className="text-sm font-bold text-slate-900 mt-0.5">{copy.title}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(`copy-${fix.id}-${copyLangTab}`, fullCopyText)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shrink-0 shadow-xs"
                            >
                              {copiedId === `copy-${fix.id}-${copyLangTab}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy All</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Key Features</span>
                            <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-1">
                              {copy.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Catalog Description</span>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{copy.description}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. Photo Reshoot Protocol */}
                {fix.photo_instructions && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Camera className="w-4 h-4 text-indigo-600" />
                        <span>Studio Photography & Color Calibration Protocol</span>
                      </div>
                      <button
                        onClick={() => {
                          const text = `Lighting: ${fix.photo_instructions!.lighting_spec}\n\nColor Tips:\n${fix.photo_instructions!.color_accuracy_tips.join('\n')}\n\nRequired Angles:\n${fix.photo_instructions!.required_angles.join('\n')}\n\nDisclaimer: ${fix.photo_instructions!.customer_expectation_note}`;
                          handleCopy(`photo-${fix.id}`, text);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        {copiedId === `photo-${fix.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Spec</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-900 block">Lighting & Sensor Calibration</span>
                        <p className="text-xs text-slate-700">{fix.photo_instructions.lighting_spec}</p>
                        <div className="pt-2 border-t border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Studio Checkpoints</span>
                          {fix.photo_instructions.color_accuracy_tips.map((tip, idx) => (
                            <p key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">•</span>
                              <span>{tip}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-900 block">Required Gallery Angles</span>
                        <div className="space-y-1">
                          {fix.photo_instructions.required_angles.map((ang, idx) => (
                            <p key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                              <span>{ang}</span>
                            </p>
                          ))}
                        </div>
                        <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 mt-2 font-medium">
                          {fix.photo_instructions.customer_expectation_note}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Supplier QC Checklist */}
                {fix.qc_checklist && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                        <span>Factory Production & Warehouse QC Checklist</span>
                      </div>
                      <button
                        onClick={() => {
                          const text = `Checkpoints:\n${fix.qc_checklist!.critical_checkpoints.join('\n')}\n\nContainment Action: ${fix.qc_checklist!.batch_containment_action}\n\nAudit Spec: ${fix.qc_checklist!.factory_audit_spec}`;
                          handleCopy(`qc-${fix.id}`, text);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                      >
                        {copiedId === `qc-${fix.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Checklist</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-900 block mb-1">
                          Critical Manufacturing Checkpoints
                        </span>
                        <div className="space-y-1.5">
                          {fix.qc_checklist.critical_checkpoints.map((pt, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                          <span className="font-bold block text-[11px] flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Immediate Warehouse Containment
                          </span>
                          <span className="text-[11px]">{fix.qc_checklist.batch_containment_action}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                          <span className="font-bold block text-[11px]">Factory Audit SLA</span>
                          <span className="text-[11px]">{fix.qc_checklist.factory_audit_spec}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Grounding Link / "Why this fix works" */}
                <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs text-indigo-950">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-900 mb-1">
                    <Quote className="w-3.5 h-3.5 text-indigo-600" /> Why this fix works (Evidence Grounding):
                  </span>
                  <p className="leading-relaxed text-slate-700">{fix.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
