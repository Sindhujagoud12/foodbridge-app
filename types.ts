export interface FoodItemAnalysis {
  item: string;
  quantity: string;
  expiry_estimate: string;
  category: string;
  safety_check: string;
}

export interface AnalysisResult {
  food_items: FoodItemAnalysis[];
  error?: string;
}

export interface Donation {
  id: number;
  item: string;
  quantity: string;
  category: string;
  expiry: string;
  status: 'Available' | 'Claimed';
  imageUrl?: string; // base64 string for display
}

export interface RecipientNeed {
  recipient: string;
  need: string;
  urgency: string;
}

export interface Match {
  donation_id: number;
  recipient_id: string;
  score: number;
  reasoning: string;
}

export interface MatchResult {
  matches: Match[];
  summary: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}