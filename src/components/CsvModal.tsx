import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FeedbackRecord } from '../types';
import { exportFeedbackToCsv, parseFeedbackCsv } from '../utils/csvHelper';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeedback: FeedbackRecord[];
  onUpdateFeedback: (records: FeedbackRecord[]) => void;
  onResetFeedback: () => void;
}

export const CsvModal: React.FC<CsvModalProps> = ({
  isOpen,
  onClose,
  currentFeedback,
  onUpdateFeedback,
  onResetFeedback,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const csv = exportFeedbackToCsv(currentFeedback);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `returnsense_feedback_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg(`Exported ${currentFeedback.length} feedback records to CSV.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseFeedbackCsv(text);
        if (parsed.length === 0) {
          setErrorMsg('No valid feedback records parsed from CSV. Please check column format.');
          return;
        }
        onUpdateFeedback(parsed);
        setSuccessMsg(`Successfully imported ${parsed.length} feedback records!`);
      } catch (err: any) {
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Feedback Data Manager</h2>
            <p className="text-xs text-slate-500">Import custom customer returns CSV or export sample data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 text-center">
            <Upload className="w-8 h-8 mx-auto text-indigo-600 mb-2" />
            <p className="text-xs font-semibold text-slate-800 mb-1">Upload Feedback CSV</p>
            <p className="text-[11px] text-slate-500 mb-3">
              Columns: id, product_id, source, text, language, rating, return_reason_code, payment_mode, pincode, date
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              <Download className="w-3.5 h-3.5" /> Download Current Dataset ({currentFeedback.length} rows)
            </button>

            <button
              onClick={() => {
                onResetFeedback();
                setSuccessMsg('Reset back to default synthetic demo dataset (~90 records).');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
