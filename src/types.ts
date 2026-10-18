export type LanguageName = 'English' | 'Hindi' | 'Gujarati' | 'Hinglish' | 'Roman Gujarati';

export type IssueCategory =
  | 'sizing'
  | 'colour/photo mismatch'
  | 'fabric/description mismatch'
  | 'defect/quality'
  | 'delivery damage'
  | 'wrong item'
  | 'non-product';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  listing_description: string;
  size_chart: {
    headers: string[];
    rows: Array<Record<string, string>>;
    notes?: string;
  };
  listing_image_url: string;
  fabric_details: string;
  monthly_orders: number;
  current_return_rate: number; // e.g. 0.29 for 29%
}

export interface FeedbackRecord {
  id: string;
  product_id: string;
  source: 'review' | 'return_comment' | 'support_chat';
  text: string;
  language: LanguageName;
  rating: number; // 1 to 5
  return_reason_code?: string;
  payment_mode: 'COD' | 'prepaid';
  pincode: string;
  date: string;
  ground_truth_category: IssueCategory;
  ground_truth_product_caused: boolean;
}

export interface ExtractedFeedback {
  record_id: string;
  language: string;
  issue_category: IssueCategory;
  sub_issue: string;
  severity: number; // 1-5
  is_product_caused: boolean;
  english_gloss: string;
  key_phrase: string;
}

export interface RootCause {
  id: string;
  product_id: string;
  title: string;
  category: IssueCategory;
  summary: string;
  record_ids: string[];
  severity_score: number;
  confidence_score: number;
  languages_involved: LanguageName[];
  evidence_records?: FeedbackRecord[];
}

export interface FixRecommendation {
  id: string;
  root_cause_id: string;
  product_id: string;
  fix_type: 'size_chart' | 'listing_copy' | 'photo_reshoot' | 'qc_checklist';
  title: string;
  why: string;
  size_chart_table?: {
    headers: string[];
    rows: Array<Record<string, string>>;
    fit_guidance: string;
  };
  rewritten_copy?: {
    english: { title: string; bullets: string[]; description: string };
    hindi: { title: string; bullets: string[]; description: string };
    gujarati: { title: string; bullets: string[]; description: string };
  };
  photo_instructions?: {
    lighting_spec: string;
    color_accuracy_tips: string[];
    required_angles: string[];
    customer_expectation_note: string;
  };
  qc_checklist?: {
    critical_checkpoints: string[];
    batch_containment_action: string;
    factory_audit_spec: string;
  };
  effectiveness_range: {
    low: number; // e.g. 0.20 (20%)
    expected: number; // e.g. 0.32 (32%)
    high: number; // e.g. 0.42 (42%)
  };
}

export interface ImageComparisonResult {
  color_verdict: string;
  color_analysis: string;
  texture_verdict: string;
  texture_analysis: string;
  workmanship_analysis: string;
  plain_language_verdict: string;
  recommended_action: string;
  confidence_score: number;
}

export interface BenchmarkItem {
  record_id: string;
  product_id: string;
  original_text: string;
  language: LanguageName;
  ground_truth_category: IssueCategory;
  approach_a_translation: string;
  approach_a_prediction: IssueCategory;
  approach_a_correct: boolean;
  approach_a_notes: string;
  approach_b_prediction: IssueCategory;
  approach_b_correct: boolean;
  approach_b_notes: string;
}
