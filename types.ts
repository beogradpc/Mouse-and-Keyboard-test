
export type TestView = 'clicks' | 'polling' | 'keyboard' | 'rollover';

export interface TesterRef {
  getResults: () => string;
  reset: () => void;
}
