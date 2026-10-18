import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Languages,
  ShieldCheck,
  TrendingUp,
  Cpu,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { BENCHMARK_ITEMS } from '../data/cachedIntelligence';
import { BenchmarkItem } from '../types';

export const BenchmarkView: React.FC = () => {
  const [filterMode, setFilterMode] = useState<'all' | 'failures_a' | 'code_mixed' | 'native_scripts'>('all');

  // Compute metrics dynamically from the 40 labelled benchmark dataset
  const total = BENCHMARK_ITEMS.length;

  const aCorrectCount = BENCHMARK_ITEMS.filter((i) => i.approach_a_correct).length;
  const bCorrectCount = BENCHMARK_ITEMS.filter((i) => i.approach_b_correct).length;
  const aAccuracy = Math.round((aCorrectCount / total) * 100);
  const bAccuracy = Math.round((bCorrectCount / total) * 100);

  // Code-mixed subset (Hinglish & Roman Gujarati)
  const codeMixed = BENCHMARK_ITEMS.filter(
    (i) => i.language === 'Hinglish' || i.language === 'Roman Gujarati'
  );
  const aCodeMixedCorrect = codeMixed.filter((i) => i.approach_a_correct).length;
  const bCodeMixedCorrect = codeMixed.filter((i) => i.approach_b_correct).length;
  const aCodeMixedPct = Math.round((aCodeMixedCorrect / codeMixed.length) * 100);
  const bCodeMixedPct = Math.round((bCodeMixedCorrect / codeMixed.length) * 100);

  // Native scripts subset (Hindi Devanagari & Gujarati script)
  const nativeScripts = BENCHMARK_ITEMS.filter(
    (i) => i.language === 'Hindi' || i.language === 'Gujarati'
  );
  const aNativeCorrect = nativeScripts.filter((i) => i.approach_a_correct).length;
  const bNativeCorrect = nativeScripts.filter((i) => i.approach_b_correct).length;
  const aNativePct = Math.round((aNativeCorrect / nativeScripts.length) * 100);
  const bNativePct = Math.round((bNativeCorrect / nativeScripts.length) * 100);

  // Filter items for table
  let displayItems = BENCHMARK_ITEMS;
  if (filterMode === 'failures_a') {
    displayItems = BENCHMARK_ITEMS.filter((i) => !i.approach_a_correct && i.approach_b_correct);
  } else if (filterMode === 'code_mixed') {
    displayItems = codeMixed;
  } else if (filterMode === 'native_scripts') {
    displayItems = nativeScripts;
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Multilingual Approach Benchmark</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rigorous evaluation on {total} labelled ground-truth records across Hindi, Gujarati, Hinglish, Roman Gujarati, and English
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
          Ground-Truth Validated
        </span>
      </div>

      {/* Accuracy Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Categorization Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Overall Issue Categorization
          </span>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Approach A: Translate-First</span>
                <span className="text-rose-600">{aAccuracy}% ({aCorrectCount}/{total})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${aAccuracy}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-indigo-900">Approach B: Gemini Native Multilingual</span>
                <span className="text-emerald-600">{bAccuracy}% ({bCorrectCount}/{total})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${bAccuracy}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-emerald-800 font-semibold pt-2 border-t border-slate-100">
            +{bAccuracy - aAccuracy}% Accuracy Advantage with Direct Gemini
          </p>
        </div>

        {/* Card 2: Code-Mixed Indian Text (Hinglish & Roman Gujarati) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Code-Mixed Text (Hinglish, Roman Guj.)
          </span>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Approach A: Translate-First</span>
                <span className="text-rose-600">{aCodeMixedPct}% ({aCodeMixedCorrect}/{codeMixed.length})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${aCodeMixedPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-indigo-900">Approach B: Direct Gemini</span>
                <span className="text-emerald-600">{bCodeMixedPct}% ({bCodeMixedCorrect}/{codeMixed.length})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${bCodeMixedPct}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            Standard MT breaks on colloquial Romanized spellings like <em>"pateli jevu"</em> or <em>"chhota aaya"</em>.
          </p>
        </div>

        {/* Card 3: Architecture & Pipeline Simplicity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pipeline Architecture
          </span>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100">
              <strong className="text-rose-900 block font-bold">Approach A: 2-Hop Pipeline</strong>
              <span className="text-[11px] text-rose-700">
                Text → MT Translate API → Clustered LLM (High latency, lost colloquial idioms)
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <strong className="text-emerald-900 block font-bold">Approach B: 1-Hop Zero-Shot</strong>
              <span className="text-[11px] text-emerald-700">
                Direct Gemini 2.5 Flash reasoning with native multilingual context (Fast, preserves nuance)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Idiom Case Studies Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Why Intermediate Translation Fails: Case Study Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real examples where Approach A misclassified customer returns while Gemini Zero-Shot succeeded
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Case 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Case 1: Roman Gujarati Idiom</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1 mb-2">
                "kapdu pateli jevu nathi..."
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                <strong>Approach A Translation:</strong> "Cloth is not like thin vessel..."
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach A: Defect/Quality (Wrong)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach B: Fabric Mismatch (Correct)</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              Gemini understood native Gujarati fashion idiom <em>"pateli jevu"</em> (meaning lacking fine handloom quality).
            </p>
          </div>

          {/* Case 2 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Case 2: Color Words in Change of Mind</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1 mb-2">
                "Mummy ko yellow pasand nahi aaya... Product me kami nahi hai"
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                <strong>Approach A Translation:</strong> "Mother did not like yellow, wanted red..."
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach A: Color Mismatch (Wrong)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach B: Non-Product (Correct)</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              Translation picked up color words but missed explicit sentiment <em>"Product me kami nahi hai"</em>.
            </p>
          </div>

          {/* Case 3 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase">Case 3: Comparative Size Phrasing</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1 mb-2">
                "size chart ma L lakhyu che pan M jevu lage che"
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                <strong>Approach A Translation:</strong> "L written is but M like looks is..."
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-rose-600 font-semibold">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach A: Wrong Item Sent (Wrong)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Approach B: Sizing Fit Error (Correct)</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              Gemini correctly grasped that the customer received size L, but it fit tight like a size M.
            </p>
          </div>
        </div>
      </div>

      {/* Filterable 40 Labelled Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Labelled Ground-Truth Dataset ({displayItems.length} records)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side categorization predictions vs human ground truth
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All Records (40)' },
              { id: 'failures_a', label: 'Approach A Failures' },
              { id: 'code_mixed', label: 'Code-Mixed Only' },
              { id: 'native_scripts', label: 'Native Scripts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as any)}
                className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
                  filterMode === tab.id
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">ID / Lang</th>
                <th className="p-3">Customer Feedback Text</th>
                <th className="p-3">Ground Truth</th>
                <th className="p-3">Approach A (Translate First)</th>
                <th className="p-3">Approach B (Direct Gemini)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayItems.map((item) => (
                <tr key={item.record_id} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                    <span className="font-bold text-slate-900 block">{item.record_id}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{item.language}</span>
                  </td>
                  <td className="p-3 max-w-xs sm:max-w-md">
                    <p className="text-xs text-slate-900 font-medium">"{item.original_text}"</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">MT translation: "{item.approach_a_translation}"</p>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {item.ground_truth_category}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {item.approach_a_correct ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className={`text-[11px] font-semibold ${item.approach_a_correct ? 'text-slate-800' : 'text-rose-700'}`}>
                        {item.approach_a_prediction}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {item.approach_b_correct ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span className="text-[11px] font-bold text-emerald-700">
                        {item.approach_b_prediction}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
