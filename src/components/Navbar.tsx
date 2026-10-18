import React from 'react';
import {
  Layers,
  Sparkles,
  BarChart3,
  SearchCheck,
  AlertTriangle,
  Wrench,
  TrendingDown,
  Image as ImageIcon,
  FileSpreadsheet,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Product } from '../types';

export type ActiveTab = 'dashboard' | 'analyze' | 'rootcauses' | 'fixes' | 'impact' | 'imagecheck' | 'benchmark';
export type SellerSummaryLanguage = 'en' | 'hi' | 'gu';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedProductId: string; // 'all' or product id
  setSelectedProductId: (id: string) => void;
  products: Product[];
  summaryLang: SellerSummaryLanguage;
  setSummaryLang: (lang: SellerSummaryLanguage) => void;
  useCached: boolean;
  setUseCached: (val: boolean) => void;
  onOpenAbout: () => void;
  onOpenCsv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedProductId,
  setSelectedProductId,
  products,
  summaryLang,
  setSummaryLang,
  useCached,
  setUseCached,
  onOpenAbout,
  onOpenCsv,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analyze', label: 'Analyze', icon: SearchCheck },
    { id: 'rootcauses', label: 'Root Causes', icon: AlertTriangle },
    { id: 'fixes', label: 'Actionable Fixes', icon: Wrench },
    { id: 'impact', label: 'Impact Calculator', icon: TrendingDown },
    { id: 'imagecheck', label: 'Photo Checker', icon: ImageIcon },
    { id: 'benchmark', label: 'Benchmark', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3 border-b border-slate-100">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-50">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">ReturnSense AI</span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  Fashion Copilot
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Multilingual returns intelligence for Indian ethnic wear & fashion sellers
              </p>
            </div>
          </div>

          {/* Controls: Product Filter, Language Toggle, Demo Cache, CSV & About */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Product Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <span className="text-slate-500 px-2 font-medium">Product:</span>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="bg-white text-slate-800 font-medium py-1 px-2 rounded-md border-none focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
              >
                <option value="all">All Catalog (3 Products)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.split('-')[0].trim()} ({p.category.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle for Seller Insights */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 px-1.5 font-medium text-[11px]">Lang:</span>
              <button
                onClick={() => setSummaryLang('en')}
                className={`px-2 py-1 rounded-md font-semibold transition ${
                  summaryLang === 'en'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setSummaryLang('hi')}
                className={`px-2 py-1 rounded-md font-semibold transition font-hindi ${
                  summaryLang === 'hi'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setSummaryLang('gu')}
                className={`px-2 py-1 rounded-md font-semibold transition font-gujarati ${
                  summaryLang === 'gu'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ગુજરાતી
              </button>
            </div>

            {/* Cached Demo Toggle */}
            <button
              onClick={() => setUseCached(!useCached)}
              title={
                useCached
                  ? 'Cached Demo Active: Instant demonstration with zero latency.'
                  : 'Live Gemini API Mode: Calls Gemini API endpoints on server.'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                useCached
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-300'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${useCached ? 'text-emerald-600' : 'text-indigo-600'}`} />
              <span className="font-semibold">{useCached ? 'Demo Cache (Instant)' : 'Live Gemini 2.5'}</span>
            </button>

            {/* CSV Manager */}
            <button
              onClick={onOpenCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">CSV Data</span>
            </button>

            {/* About Modal */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">About</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
