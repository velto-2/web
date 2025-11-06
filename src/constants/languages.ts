/**
 * Language Configuration for Frontend
 * This mirrors the backend language configuration
 */

export interface Dialect {
  code: string;
  name: string;
  nativeName: string;
  region: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dialects: Dialect[];
  defaultDialect: string;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dialects: [
      {
        code: 'egyptian',
        name: 'Egyptian Arabic',
        nativeName: 'مصري',
        region: 'Egypt',
      },
      {
        code: 'gulf',
        name: 'Gulf Arabic',
        nativeName: 'خليجي',
        region: 'Gulf Countries',
      },
    ],
    defaultDialect: 'egyptian',
  },
};

export const PERSONAS = [
  { value: 'polite_customer', label: 'Polite Customer' },
  { value: 'frustrated_customer', label: 'Frustrated Customer' },
  { value: 'urgent_customer', label: 'Urgent Customer' },
  { value: 'confused_customer', label: 'Confused Customer' },
  { value: 'returning_customer', label: 'Returning Customer' },
];

