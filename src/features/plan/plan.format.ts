import type { ActionCategory, AqiBand } from '../../domain/types';
import { translate, type Language } from '../../i18n';

/** Maps a risk severity band string to the corresponding AQI visual category band. */
export function mapRiskToAqiBand(riskBand: string): AqiBand {
  switch (riskBand) {
    case 'low':
      return 'good';
    case 'moderate':
      return 'moderate';
    case 'high':
      return 'unhealthy';
    case 'severe':
      return 'hazardous';
    default:
      return 'moderate';
  }
}

/** Resolves the localized display label for an inhalation risk severity band. */
export function formatRiskBandLabel(riskBand: string, lang: Language): string {
  switch (riskBand) {
    case 'low':
      return translate(lang, 'plan.risk.low');
    case 'moderate':
      return translate(lang, 'plan.risk.moderate');
    case 'high':
      return translate(lang, 'plan.risk.high');
    case 'severe':
      return translate(lang, 'plan.risk.severe');
    default:
      return riskBand;
  }
}

/** Resolves the localized display header label for a mitigation action category. */
export function formatCategoryLabel(category: ActionCategory, lang: Language): string {
  if (lang === 'hi') {
    switch (category) {
      case 'routine':
        return 'दैनिक आदतें एवं मास्क';
      case 'indoor':
        return 'घर की हवा एवं सीलिंग';
      case 'sustainable':
        return 'स्वच्छ परिवहन एवं ईंधन';
      case 'community':
        return 'सामुदायिक प्रयास';
    }
  }
  switch (category) {
    case 'routine':
      return 'Daily Routines & Masks';
    case 'indoor':
      return 'Indoor Air & Home Sealing';
    case 'sustainable':
      return 'Sustainable Travel & Fuel';
    case 'community':
      return 'Community & Neighborhood Actions';
  }
}
