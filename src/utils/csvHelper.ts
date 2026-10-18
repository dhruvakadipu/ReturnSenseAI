import { FeedbackRecord, LanguageName, IssueCategory } from '../types';

export function exportFeedbackToCsv(records: FeedbackRecord[]): string {
  const headers = [
    'id',
    'product_id',
    'source',
    'text',
    'language',
    'rating',
    'return_reason_code',
    'payment_mode',
    'pincode',
    'date',
    'ground_truth_category',
    'ground_truth_product_caused',
  ];

  const rows = records.map((r) => [
    r.id,
    r.product_id,
    r.source,
    `"${r.text.replace(/"/g, '""')}"`,
    r.language,
    r.rating,
    r.return_reason_code || '',
    r.payment_mode,
    r.pincode,
    r.date,
    r.ground_truth_category,
    r.ground_truth_product_caused ? 'true' : 'false',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseFeedbackCsv(csvText: string): FeedbackRecord[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const records: FeedbackRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV tokenization handling quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' && (charIdx === 0 || line[charIdx - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const getVal = (col: string) => {
      const idx = headers.indexOf(col.toLowerCase());
      if (idx === -1) return '';
      let val = values[idx] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      return val;
    };

    const id = getVal('id') || `FB-IMP-${i}`;
    const product_id = getVal('product_id') || 'PRD-KURTI-01';
    const source = (['review', 'return_comment', 'support_chat'].includes(getVal('source'))
      ? getVal('source')
      : 'review') as 'review' | 'return_comment' | 'support_chat';
    const text = getVal('text');
    if (!text) continue;

    const language = (getVal('language') || 'English') as LanguageName;
    const rating = parseInt(getVal('rating'), 10) || 3;
    const return_reason_code = getVal('return_reason_code');
    const payment_mode = (getVal('payment_mode') === 'COD' ? 'COD' : 'prepaid') as 'COD' | 'prepaid';
    const pincode = getVal('pincode') || '110001';
    const date = getVal('date') || new Date().toISOString().split('T')[0];
    const ground_truth_category = (getVal('ground_truth_category') || 'sizing') as IssueCategory;
    const ground_truth_product_caused = getVal('ground_truth_product_caused') !== 'false';

    records.push({
      id,
      product_id,
      source,
      text,
      language,
      rating,
      return_reason_code,
      payment_mode,
      pincode,
      date,
      ground_truth_category,
      ground_truth_product_caused,
    });
  }

  return records;
}
