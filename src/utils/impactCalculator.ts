import { Product, RootCause, FixRecommendation, FeedbackRecord } from '../types';

export interface CalculatedImpact {
  rootCauseId: string;
  fixId: string;
  title: string;
  productId: string;
  productName: string;
  fixType: string;
  attributableReturnsMonthly: number;
  shareOfProductReturns: number; // e.g. 0.45
  effectiveness: {
    low: number;
    expected: number;
    high: number;
  };
  monthlyReturnsPrevented: {
    low: number;
    expected: number;
    high: number;
  };
  monthlySavings: {
    low: number;
    expected: number;
    high: number;
  };
  annualSavings: {
    low: number;
    expected: number;
    high: number;
  };
}

export function computeFixImpact(
  fix: FixRecommendation,
  rootCause: RootCause,
  product: Product,
  allProductFeedback: FeedbackRecord[],
  reverseLogisticsCost: number = 150,
  restockingCost: number = 50
): CalculatedImpact {
  const totalReverseCostPerReturn = reverseLogisticsCost + restockingCost;

  // Total monthly orders and returns for this product
  const monthlyOrders = product.monthly_orders || 1000;
  const currentReturnRate = product.current_return_rate || 0.28;
  const totalMonthlyReturns = monthlyOrders * currentReturnRate;

  // Feedback records breakdown for this product
  const productFeedback = allProductFeedback.filter((f) => f.product_id === product.id);
  const totalFeedbackCount = productFeedback.length || 1;
  const productCausedFeedbackCount =
    productFeedback.filter((f) => f.ground_truth_product_caused).length || 1;

  // Fraction of product's returns that are product-caused
  const productCausedRatio = productCausedFeedbackCount / totalFeedbackCount;

  // Number of feedback records linked to this root cause
  const causeRecordCount = rootCause.record_ids.length;
  // Share of product-caused returns attributable to this cause
  const causeShareOfProductReturns =
    productCausedFeedbackCount > 0 ? causeRecordCount / productCausedFeedbackCount : 0.3;

  // Total monthly returns attributable to this root cause:
  // total monthly returns * product_caused_ratio * cause_share
  const attributableMonthlyReturns =
    totalMonthlyReturns * productCausedRatio * Math.min(causeShareOfProductReturns, 1.0);

  const eff = fix.effectiveness_range || { low: 0.2, expected: 0.3, high: 0.4 };

  const lowPrevented = Math.round(attributableMonthlyReturns * eff.low);
  const expPrevented = Math.round(attributableMonthlyReturns * eff.expected);
  const highPrevented = Math.round(attributableMonthlyReturns * eff.high);

  return {
    rootCauseId: rootCause.id,
    fixId: fix.id,
    title: fix.title,
    productId: product.id,
    productName: product.name,
    fixType: fix.fix_type,
    attributableReturnsMonthly: Math.round(attributableMonthlyReturns),
    shareOfProductReturns: causeShareOfProductReturns,
    effectiveness: eff,
    monthlyReturnsPrevented: {
      low: lowPrevented,
      expected: expPrevented,
      high: highPrevented,
    },
    monthlySavings: {
      low: lowPrevented * totalReverseCostPerReturn,
      expected: expPrevented * totalReverseCostPerReturn,
      high: highPrevented * totalReverseCostPerReturn,
    },
    annualSavings: {
      low: lowPrevented * totalReverseCostPerReturn * 12,
      expected: expPrevented * totalReverseCostPerReturn * 12,
      high: highPrevented * totalReverseCostPerReturn * 12,
    },
  };
}

export function computeCombinedImpact(
  selectedImpacts: CalculatedImpact[],
  totalCatalogOrders: number,
  baselineAvgReturnRate: number,
  reverseLogisticsCost: number = 150,
  restockingCost: number = 50
) {
  const totalCostPerReturn = reverseLogisticsCost + restockingCost;

  let totalMonthlyPreventedLow = 0;
  let totalMonthlyPreventedExp = 0;
  let totalMonthlyPreventedHigh = 0;

  for (const imp of selectedImpacts) {
    totalMonthlyPreventedLow += imp.monthlyReturnsPrevented.low;
    totalMonthlyPreventedExp += imp.monthlyReturnsPrevented.expected;
    totalMonthlyPreventedHigh += imp.monthlyReturnsPrevented.high;
  }

  const baselineMonthlyReturns = totalCatalogOrders * baselineAvgReturnRate;

  const newReturnRateLow = Math.max(
    0.05,
    (baselineMonthlyReturns - totalMonthlyPreventedHigh) / totalCatalogOrders
  );
  const newReturnRateExp = Math.max(
    0.05,
    (baselineMonthlyReturns - totalMonthlyPreventedExp) / totalCatalogOrders
  );
  const newReturnRateHigh = Math.max(
    0.05,
    (baselineMonthlyReturns - totalMonthlyPreventedLow) / totalCatalogOrders
  );

  return {
    monthlyReturnsPrevented: {
      low: totalMonthlyPreventedLow,
      expected: totalMonthlyPreventedExp,
      high: totalMonthlyPreventedHigh,
    },
    monthlySavings: {
      low: totalMonthlyPreventedLow * totalCostPerReturn,
      expected: totalMonthlyPreventedExp * totalCostPerReturn,
      high: totalMonthlyPreventedHigh * totalCostPerReturn,
    },
    annualSavings: {
      low: totalMonthlyPreventedLow * totalCostPerReturn * 12,
      expected: totalMonthlyPreventedExp * totalCostPerReturn * 12,
      high: totalMonthlyPreventedHigh * totalCostPerReturn * 12,
    },
    newReturnRate: {
      best: newReturnRateLow, // highest prevention
      expected: newReturnRateExp,
      conservative: newReturnRateHigh,
    },
    baselineMonthlyReturns: Math.round(baselineMonthlyReturns),
  };
}
