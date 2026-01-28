export type LeadStatus = 'new' | 'qualifying' | 'contacted' | 'negotiation' | 'won' | 'lost';

export interface DecisionMaker {
  name: string;
  role: string;
  linkedin?: string;
}

export interface Competitor {
  name: string;
  strength: string;
}

export interface ProspectingStep {
  day: number;
  channel: 'email' | 'linkedin' | 'phone';
  subject?: string;
  content: string;
}

export interface SalesKit {
  valueProposition: string;
  emailSubject: string;
  emailBody: string;
  phoneScript: string;
  cadence: ProspectingStep[];
  objectionHandling: { objection: string; response: string }[];
}

export interface Lead {
  id: string;
  companyName: string;
  cnpj?: string;
  sector?: string;
  location?: string;
  website?: string;
  phone?: string;
  score: number;
  status: LeadStatus;
  tags: string[];
  employees?: number;
  cnae?: string;
  notes?: string;
  
  // New Fields
  techStack?: string[];
  instagram?: string;
  linkedinUrl?: string;
  revenueEstimate?: string;
  
  // Enriched Data
  decisionMakers?: DecisionMaker[];
  competitors?: Competitor[];
  salesKit?: SalesKit;
  
  // AI Feedback
  matchReason?: string;
  
  createdAt: string;
  lastInteraction?: string;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  projectedRevenue: number;
}
