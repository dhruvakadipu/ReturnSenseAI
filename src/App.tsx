/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { SAMPLE_FEEDBACK } from './data/sampleFeedback';
import { CACHED_EXTRACTED, CACHED_ROOT_CAUSES, CACHED_FIXES } from './data/cachedIntelligence';
import { Product, FeedbackRecord, RootCause, FixRecommendation, ExtractedFeedback } from './types';
import { Navbar, ActiveTab, SellerSummaryLanguage } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AnalyzeView } from './components/AnalyzeView';
import { RootCausesView } from './components/RootCausesView';
import { FixesView } from './components/FixesView';
import { ImpactView } from './components/ImpactView';
import { ImageCheckView } from './components/ImageCheckView';
import { BenchmarkView } from './components/BenchmarkView';
import { AboutModal } from './components/AboutModal';
import { CsvModal } from './components/CsvModal';
import { Sparkles, ShieldCheck, Database } from 'lucide-react';

export default function App() {
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>(SAMPLE_FEEDBACK);
  const [rootCausesMap, setRootCausesMap] = useState<Record<string, RootCause[]>>(CACHED_ROOT_CAUSES);
  const [fixesMap, setFixesMap] = useState<Record<string, FixRecommendation[]>>(CACHED_FIXES);
  const [extractedFeedback, setExtractedFeedback] = useState<ExtractedFeedback[]>(CACHED_EXTRACTED);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [summaryLang, setSummaryLang] = useState<SellerSummaryLanguage>('en');
  const [useCached, setUseCached] = useState<boolean>(true);

  const [reverseLogisticsCost, setReverseLogisticsCost] = useState<number>(150);
  const [restockingCost, setRestockingCost] = useState<number>(50);

  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isCsvOpen, setIsCsvOpen] = useState<boolean>(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string | null>(new Date().toISOString());

  const handleAnalysisComplete = (
    extracted: ExtractedFeedback[],
    rootCauses: Record<string, RootCause[]>,
    fixes: Record<string, FixRecommendation[]>
  ) => {
    setExtractedFeedback(extracted);
    setRootCausesMap(rootCauses);
    setFixesMap(fixes);
    setLastAnalysisTimestamp(new Date().toISOString());
  };

  const handleUpdateFeedback = (records: FeedbackRecord[]) => {
    setFeedback(records);
  };

  const handleResetFeedback = () => {
    setFeedback(SAMPLE_FEEDBACK);
    setRootCausesMap(CACHED_ROOT_CAUSES);
    setFixesMap(CACHED_FIXES);
    setExtractedFeedback(CACHED_EXTRACTED);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Synthetic Demo Data Notice Top Strip */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-200">ReturnSense AI Active:</span>
            <span className="text-slate-400">
              Demo loaded with 3 ethnic wear products & 90 multilingual feedback records (Hindi, Gujarati, Hinglish, English)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-amber-300 font-medium">Synthetic Demo Data</span>
            <button
              onClick={() => setIsCsvOpen(true)}
              className="text-indigo-300 hover:text-white underline cursor-pointer"
            >
              Upload Custom CSV
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Pipeline Docs
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedProductId={selectedProductId}
        setSelectedProductId={setSelectedProductId}
        products={products}
        summaryLang={summaryLang}
        setSummaryLang={setSummaryLang}
        useCached={useCached}
        setUseCached={setUseCached}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenCsv={() => setIsCsvOpen(true)}
      />

      {/* Screen View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            products={products}
            feedback={feedback}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            setActiveTab={setActiveTab}
            summaryLang={summaryLang}
            reverseLogisticsCost={reverseLogisticsCost}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeView
            products={products}
            feedback={feedback}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            setActiveTab={setActiveTab}
            useCached={useCached}
            onAnalysisComplete={handleAnalysisComplete}
            lastAnalysisTimestamp={lastAnalysisTimestamp}
          />
        )}

        {activeTab === 'rootcauses' && (
          <RootCausesView
            products={products}
            feedback={feedback}
            rootCausesMap={rootCausesMap}
            extractedFeedback={extractedFeedback}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'fixes' && (
          <FixesView
            products={products}
            fixesMap={fixesMap}
            rootCausesMap={rootCausesMap}
            feedback={feedback}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactView
            products={products}
            fixesMap={fixesMap}
            rootCausesMap={rootCausesMap}
            feedback={feedback}
            reverseLogisticsCost={reverseLogisticsCost}
            setReverseLogisticsCost={setReverseLogisticsCost}
            restockingCost={restockingCost}
            setRestockingCost={setRestockingCost}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'imagecheck' && (
          <ImageCheckView products={products} useCached={useCached} />
        )}

        {activeTab === 'benchmark' && <BenchmarkView />}
      </main>

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <CsvModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        currentFeedback={feedback}
        onUpdateFeedback={handleUpdateFeedback}
        onResetFeedback={handleResetFeedback}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ReturnSense AI</span>
            <span>•</span>
            <span>Evidence-backed retail returns prevention copilot for Indian fashion sellers</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini on Google Cloud
            </span>
            <span>•</span>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              Synthetic Demo Data
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
