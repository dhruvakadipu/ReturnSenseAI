import React from 'react';
import { X, ShieldCheck, Cpu, Languages, Calculator, Sparkles, Database } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-linear-to-r from-indigo-50/70 to-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">About ReturnSense AI</h2>
              <p className="text-xs text-indigo-700 font-medium">Evidence-Backed Retail Returns Copilot for Indian Fashion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-slate-600 leading-relaxed">
          {/* Synthetic Data Notice */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Synthetic Demo Dataset Notice</p>
              <p className="text-xs mt-1 text-amber-800 leading-normal">
                All 3 ethnic wear products (Kurti, Saree, Kurta) and ~90 feedback records are realistic synthetic samples designed to model actual Indian e-commerce marketplace dynamics (Myntra, Flipkart, Ajio, Meesho). You can also upload your own real CSV data.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" /> The Multilingual Returns Pipeline
            </h3>
            <p>
              Online fashion sellers in India suffer 25%–35% return rates, with huge reverse logistics costs (~₹150–₹250 per return). Crucially, customer feedback arrives in mixed dialects—Hindi in Devanagari, Gujarati, Hinglish, and Roman-script Gujarati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                <Languages className="w-4 h-4" /> 1. Native Extraction
              </div>
              <p className="text-xs text-slate-600">
                Gemini processes Hindi, Gujarati, Hinglish, and English without lossy intermediate translation, preserving cultural idioms like <em>"kapdu pateli jevu nathi"</em> or <em>"chhota pad raha hai"</em>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" /> 2. Evidence Verification
              </div>
              <p className="text-xs text-slate-600">
                Strict zero-hallucination policy: Every synthesized root cause and recommendation is rigorously verified in code against existing customer record IDs. Any unverified claim is dropped.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                <Calculator className="w-4 h-4" /> 3. Code-Computed Impact
              </div>
              <p className="text-xs text-slate-600">
                The AI never generates counts or percentages. Financial savings and return reduction ranges are calculated deterministically in TypeScript code based on real logistics cost variables.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-1">
                <Sparkles className="w-4 h-4" /> 4. Actionable Artifacts
              </div>
              <p className="text-xs text-slate-600">
                Generates concrete solutions ready for instant deployment: calibrated size chart tables, multi-dialect listing copy (English, हिन्दी, ગુજરાતી), photo studio specs, and factory QC checklists.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by Gemini on Google Cloud</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
