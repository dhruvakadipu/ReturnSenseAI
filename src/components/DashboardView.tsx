import React from 'react';
import {
  TrendingDown,
  AlertTriangle,
  PackageX,
  Languages,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Product, FeedbackRecord } from '../types';
import { ActiveTab, SellerSummaryLanguage } from './Navbar';

interface DashboardViewProps {
  products: Product[];
  feedback: FeedbackRecord[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  summaryLang: SellerSummaryLanguage;
  reverseLogisticsCost: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  feedback,
  selectedProductId,
  setSelectedProductId,
  setActiveTab,
  summaryLang,
  reverseLogisticsCost,
}) => {
  // Filter feedback if specific product selected
  const activeFeedback =
    selectedProductId === 'all'
      ? feedback
      : feedback.filter((f) => f.product_id === selectedProductId);

  const activeProducts =
    selectedProductId === 'all'
      ? products
      : products.filter((p) => p.id === selectedProductId);

  // Computed metrics
  const totalFeedbackCount = activeFeedback.length;
  const productCausedCount = activeFeedback.filter((f) => f.ground_truth_product_caused).length;
  const nonProductCount = totalFeedbackCount - productCausedCount;
  const productCausedPct = totalFeedbackCount > 0 ? Math.round((productCausedCount / totalFeedbackCount) * 100) : 0;
  const nonProductPct = 100 - productCausedPct;

  // Language breakdown
  const langCounts: Record<string, number> = {
    English: 0,
    Hindi: 0,
    Gujarati: 0,
    Hinglish: 0,
    'Roman Gujarati': 0,
  };
  activeFeedback.forEach((f) => {
    if (langCounts[f.language] !== undefined) {
      langCounts[f.language]++;
    }
  });

  // Issue category breakdown
  const categoryCounts: Record<string, number> = {
    sizing: 0,
    'colour/photo mismatch': 0,
    'fabric/description mismatch': 0,
    'defect/quality': 0,
    'non-product': 0,
    'delivery damage': 0,
    'wrong item': 0,
  };
  activeFeedback.forEach((f) => {
    if (categoryCounts[f.ground_truth_category] !== undefined) {
      categoryCounts[f.ground_truth_category]++;
    }
  });

  // Financial drain computation
  let totalMonthlyOrders = 0;
  let totalMonthlyReturns = 0;
  activeProducts.forEach((p) => {
    totalMonthlyOrders += p.monthly_orders;
    totalMonthlyReturns += Math.round(p.monthly_orders * p.current_return_rate);
  });
  const avgReturnRate =
    totalMonthlyOrders > 0 ? (totalMonthlyReturns / totalMonthlyOrders) * 100 : 28.5;
  const monthlyCostDrain = totalMonthlyReturns * (reverseLogisticsCost + 50);

  // Executive summaries in 3 languages
  const summaries = {
    en: {
      title: 'Executive Seller Diagnosis',
      text: `Across ${totalFeedbackCount} analyzed customer touchpoints, 72% of returns are driven by preventable seller-side discrepancies: inaccurate size charts on Kurtis (1.5" bust tightness), over-saturated studio lighting on Sarees (causing dark navy surprises), and synthetic poly blend hand-feel on Kurtas marketed as 100% Khadi Cotton. Non-product returns (28%) stem from COD cash refusals and bracketing orders.`,
      action: 'Targeting these 3 root causes with ReturnSense fixes can reduce catalog return rates by 8%–13% points.',
    },
    hi: {
      title: 'मुख्य निष्कर्ष व सारांश',
      text: `${totalFeedbackCount} ग्राहक समीक्षाओं के विश्लेषण से पता चलता है कि 72% रिटर्न विक्रेताओं द्वारा सुधारी जा सकने वाली गलतियों के कारण हैं: कुर्ती का साइज चार्ट चेस्ट में 1.5 से 2 इंच टाइट होना, साड़ी की फोटो में स्टूडियो लाइट की वजह से जरूरत से ज्यादा चमक दिखना और कुर्ते में 100% खादी कॉटन लिखने के बावजूद पॉलिस्टर मिक्स महसूस होना। 28% रिटर्न केवल सीओडी कैश न होने या पसंद बदलने के कारण हैं।`,
      action: 'इन मूल कारणों को ठीक करके आप रिटर्न में 8% से 13% तक की सीधी कमी ला सकते हैं।',
    },
    gu: {
      title: 'મુખ્ય તારણ અને વિશ્લેષણ',
      text: `${totalFeedbackCount} ગ્રાહક પ્રતિસાદોના ઊંડાણપૂર્વકના વિશ્લેષણ મુજબ 72% રિટર્ન વેચનારની ભૂલોને કારણે છે: કુર્તીમાં છાતીનું માપ 1.5-2 ઇંચ સાંકડું હોવું, સાડીના ફોટોમાં અતિશય લાઇટિંગથી રિયલ કલર ડાર્ક દેખાવો, અને કુર્તામાં 100% ખાદી કોટન લખવા છતાં પોલિએસ્ટર મિશ્રણનો અનુભવ થવો. 28% રિટર્ન માત્ર COD નાણાં ન હોવા કે ઓર્ડર કેન્સલ થવાને કારણે છે.`,
      action: 'આ મૂળભૂત ખામીઓને સુધારીને તમારા સ્ટોરના રિટર્ન રેશિયોમાં 8% થી 13% નો ઘટાડો કરી શકાય છે.',
    },
  };

  const currentSummary = summaries[summaryLang] || summaries.en;

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Seller Insight Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-200">
              {currentSummary.title}
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-100 leading-relaxed font-normal mb-3">
            {currentSummary.text}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-700/60">
            <span className="text-xs text-amber-300 font-semibold">{currentSummary.action}</span>
            <button
              onClick={() => setActiveTab('rootcauses')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition shadow-xs"
            >
              <span>Examine Evidence & Root Causes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Feedback Analyzed */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Feedback Analyzed</span>
            <Languages className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalFeedbackCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-medium">5 Dialects & Scripts</span>
            <span>across Indian buyers</span>
          </div>
        </div>

        {/* Card 2: Catalog Return Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Avg. Return Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{avgReturnRate.toFixed(1)}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Industry benchmark for ethnic wear: 22%
          </div>
        </div>

        {/* Card 3: Product vs Non-Product Split */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Product-Caused Returns</span>
            <PackageX className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{productCausedPct}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {nonProductPct}% COD refusal / change of mind
          </div>
        </div>

        {/* Card 4: Monthly Reverse Logistics Drain */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Monthly Return Logistics Cost</span>
            <TrendingDown className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{(monthlyCostDrain / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            At ₹{reverseLogisticsCost + 50}/return (freight + restocking)
          </div>
        </div>
      </div>

      {/* Product Risk Ranking Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" /> Products Ranked by Return Risk
            </h3>
            <p className="text-xs text-slate-500">
              Prioritized by return volume, customer severity, and preventable seller defects
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Showing {products.length} catalog products
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;
            const pReturns = Math.round(product.monthly_orders * product.current_return_rate);
            const returnCost = pReturns * (reverseLogisticsCost + 50);

            let riskBadge = 'bg-rose-100 text-rose-800 border-rose-200';
            let riskLevel = 'HIGH RISK';
            let topIssue = 'Size Chart Inaccuracy (Chest/Shoulder Tightness)';

            if (product.id === 'PRD-SAREE-02') {
              riskBadge = 'bg-amber-100 text-amber-800 border-amber-200';
              riskLevel = 'MED RISK';
              topIssue = 'Studio Lighting Saturation Mismatch (Dull Navy)';
            } else if (product.id === 'PRD-KURTA-03') {
              riskBadge = 'bg-amber-100 text-amber-800 border-amber-200';
              riskLevel = 'MED RISK';
              topIssue = '100% Khadi Cotton Claim vs 35% Poly Feel';
            }

            return (
              <div
                key={product.id}
                className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={product.listing_image_url}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge}`}>
                          {riskLevel}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">{product.sku}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">₹{product.price} • {product.category}</p>
                    </div>
                  </div>

                  {/* Return rate bar */}
                  <div className="space-y-1.5 my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Return Rate:</span>
                      <span className="text-rose-600">{(product.current_return_rate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, product.current_return_rate * 250)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>{pReturns} returns / mo</span>
                      <span className="font-semibold text-slate-700">₹{(returnCost / 1000).toFixed(0)}k cost/mo</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 mb-4">
                    <span className="text-slate-400 font-medium block text-[11px]">Primary Return Trigger:</span>
                    <span className="font-semibold text-indigo-900">{topIssue}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setActiveTab('rootcauses');
                    }}
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition text-center"
                  >
                    Diagnose Product
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setActiveTab('fixes');
                    }}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    View Fix
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Mix & Return Drivers Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Mix Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600" /> Multilingual Feedback Ingestion
              </h3>
              <p className="text-xs text-slate-500">Distribution across Indian linguistic dialects</p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
              Native Multilingual
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {[
              { label: 'English', count: langCounts.English, color: 'bg-blue-600', script: 'Standard English' },
              { label: 'Hinglish (Roman Hindi)', count: langCounts.Hinglish, color: 'bg-indigo-600', script: '"chest tight hai"' },
              { label: 'Hindi (हिन्दी)', count: langCounts.Hindi, color: 'bg-emerald-600', script: 'Devanagari Script' },
              { label: 'Gujarati (ગુજરાતી)', count: langCounts.Gujarati, color: 'bg-amber-600', script: 'Gujarati Script' },
              { label: 'Roman Gujarati', count: langCounts['Roman Gujarati'], color: 'bg-purple-600', script: '"kapdu pateli jevu nathi"' },
            ].map((item) => {
              const pct = totalFeedbackCount > 0 ? Math.round((item.count / totalFeedbackCount) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{item.label} <span className="text-slate-400 font-normal">({item.script})</span></span>
                    <span className="text-slate-600">{item.count} records ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            💡 ReturnSense AI analyzes Hindi, Gujarati and code-mixed scripts without intermediate machine translation, preserving nuanced fashion idioms.
          </p>
        </div>

        {/* Return Driver Categories Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Return Drivers Breakdown
              </h3>
              <p className="text-xs text-slate-500">Root cause categorization across analyzed catalog</p>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded-md">
              {productCausedPct}% Product-Caused
            </span>
          </div>

          <div className="space-y-3.5 mt-4">
            {[
              { key: 'sizing', label: 'Sizing & Bust/Armhole Tightness', count: categoryCounts['sizing'], badge: 'bg-rose-500', note: 'Kurti size chart' },
              { key: 'colour/photo mismatch', label: 'Color / Studio Photo Mismatch', count: categoryCounts['colour/photo mismatch'], badge: 'bg-amber-500', note: 'Saree studio saturation' },
              { key: 'fabric/description mismatch', label: 'Fabric / 100% Cotton Mismatch', count: categoryCounts['fabric/description mismatch'], badge: 'bg-indigo-500', note: 'Kurta 35% poly blend' },
              { key: 'defect/quality', label: 'Defect / Seam Stitching (Batch B-204)', count: categoryCounts['defect/quality'], badge: 'bg-purple-500', note: 'Factory lockstitch tension' },
              { key: 'non-product', label: 'Non-Product (Doorstep COD, Bracketing)', count: categoryCounts['non-product'], badge: 'bg-slate-400', note: 'Buyer behaviour / courier' },
            ].map((cat) => {
              const pct = totalFeedbackCount > 0 ? Math.round((cat.count / totalFeedbackCount) * 100) : 0;
              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{cat.label}</span>
                    <span className="text-slate-600">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${cat.badge} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Ready to examine root causes and copy recommendations?</span>
            <button
              onClick={() => setActiveTab('fixes')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Explore Fixes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
