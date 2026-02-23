export interface ProductProfile {
  whatItDoes: string;
  targetAudience: string;
  keyBenefits: string[];
  useCases: string[];
  uniqueSellingPoints: string[];
  competitors: Array<{ name: string; description: string }>;
  monitoringKeywords: string[];
}

export interface CreateAppPayload {
  name: string;
  domain: string;
  productProfile: ProductProfile;
  keywords: string[];
}
