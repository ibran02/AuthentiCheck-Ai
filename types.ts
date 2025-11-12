export enum ProductStatus {
  AUTHENTIC = 'Authentic',
  COUNTERFEIT = 'Counterfeit',
}

export interface VerificationResult {
  status: ProductStatus;
  confidence: number;
  reasons: {
    title: string;
    details: string;
    passed: boolean;
  }[];
  imageUrl: string;
  brand: string;
  model: string;
}

export interface ModelMetric {
  name: string;
  value: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}