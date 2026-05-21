export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Urgency = 'high' | 'medium' | 'low';
export type ActionType =
  | 'reply_urgent'
  | 'reply'
  | 'follow_up'
  | 'archive'
  | 'review'
  | 'schedule'
  | 'delegate'
  | 'no_action';

export interface EmailAnalysis {
  sentiment: Sentiment;
  urgency: Urgency;
  summary: string;
  suggestedAction: string;
  actionType: ActionType;
  topics: string[];
  sentimentScore: number;
  priorityScore: number;
}

export interface EmailInput {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  date: string;
  snippet: string;
  messageCount: number;
}

export interface AnalyzedEmail extends EmailInput {
  analysis: EmailAnalysis;
}

export interface DashboardStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  highUrgency: number;
  avgPriorityScore: number;
}
