export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  credits: number;
  hasAcceptedTerms: boolean;
  acceptedTermsAt: string | null;
  totalAnalysesCount: number;
  createdAt: string;
  onboarding?: UserOnboarding | null;
}

export interface LegalConsent {
  uid: string;
  termsVersion: string;
  privacyVersion: string;
  aiDisclaimerVersion: string;
  ageConfirmed: boolean;
  acceptedAt?: string;
  updatedAt?: string;
}

export interface UserOnboarding {
  uid: string;
  topFocus: 'photos' | 'profile' | 'bio' | 'conversations' | 'everything';
  platforms: string[];
  vibeStyle: string;
  goal: string;
  completedAt?: string;
}

export interface VibeScores {
  flirtMeter: number; // 0-100
  interestIndex: number; // 0-100
  awkwardnessGauge: number; // 0-100
  vibeDescription: string;
  tone: string;
}

export interface SuggestedReply {
  id: string;
  category: 'Bold Flirt' | 'Playful Banter' | 'Low-Key Smooth' | 'Curveball Question' | 'Humor Twist';
  text: string;
  explanation: string;
  successLikelihood: number; // 0-100%
}

export interface IcebreakerCard {
  id: string;
  title: string;
  style: 'polaroid' | 'neon' | 'comic' | 'typography' | 'minimal';
  headlineText: string;
  subText: string;
  visualPrompt: string;
  generatedImageUrl?: string;
  accentColor: string;
  bgGradient: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  chatType: 'screenshot' | 'text' | 'demo';
  demoTitle?: string;
  previewImage?: string;
  chatSnippet?: string;
  vibeScores: VibeScores;
  advice: {
    overallStrategy: string;
    whatIsWorking: string[];
    pitfallsToAvoid: string[];
  };
  suggestedReplies: SuggestedReply[];
  icebreakerCard: IcebreakerCard;
  creditsSpent: number;
}

export interface UserProfilePersona {
  age: number;
  occupation: string;
  proficiencies: string[]; // e.g. ["Software Engineering", "Italian Cooking", "Guitar"]
  interests: string[]; // e.g. ["Hiking", "Indie Cinema", "Matcha", "Dog Walking"]
  datingGoal: 'Long-term relationship' | 'Casual dating' | 'Looking for the one' | 'Not sure yet';
  vibeType: 'Witty & Banter' | 'Thoughtful & Cozy' | 'Ambitious & Driven' | 'Adventurous & Active';
}

export interface PersonalizedPrompt {
  id: string;
  subjectPrompt: string; // e.g. "A typical Sunday for me is..."
  personalizedBody: string; // Fully written response based on user profile
  fillInTemplate: string; // Template with bracketed placeholders e.g. "Sipping [FAVORITE DRINK] while [HOBBY]..."
  matchImpact: string; // Strategic reason why this works
  vibeTag: string;
  targetApp: 'Hinge' | 'Bumble' | 'Tinder';
}

export interface PhotoPrompt {
  id: string;
  title: string;
  category: string;
  promptText: string;
  bestFor: string;
  styleBadge: string;
  bgGradient: string;
  sampleIconName?: string;
}

export interface GeneratedPhoto {
  id: string;
  createdAt: string;
  originalImageBase64?: string;
  promptTitle: string;
  promptText: string;
  generatedImageUrl: string;
  aiStyle: string;
  photographerAdvice: string;
  vibeMatchScore: number;
}

export interface InspireStory {
  id: string;
  anonymousHandle: string; // e.g. "Liam, 28"
  location: string; // e.g. "Chicago, IL"
  platform: 'Hinge' | 'Tinder' | 'Bumble' | 'Raya' | 'Match' | 'General';
  category: 'Bio Overhaul' | 'Photo Selection' | 'Opening Lines' | 'Prompt Strategy' | 'Overall Match Rate';
  beforeMetric: string; // e.g. "1 match / week"
  afterMetric: string; // e.g. "14 matches / week (+1300%)"
  beforeSnippet: string; // Bio or prompt snippet before AI
  afterSnippet: string; // Bio or prompt snippet after AI
  storyText: string; // Detailed story about their transformation journey
  keyInsight: string; // Key takeaway rule
  upvotesCount: number;
  isAiGenerated?: boolean;
  createdAt: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number; // e.g. 4.99
  priceLabel: string;
  popular?: boolean;
  bestValue?: boolean;
  badge?: string;
  secondaryBadge?: string;
  description: string;
  usageExample: string;
}

export interface CreditTransaction {
  id: string;
  date: string;
  activity: string;
  type: 'credit_purchase' | 'image_generation' | 'profile_analysis' | 'dating_coach_reply' | 'text_suggestion' | 'admin_adjustment' | 'failed_action_refund';
  amount: number;
  remainingBalance: number;
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  event: 'chat_analysis_started' | 'credit_deducted' | 'credit_refunded' | 'gemini_multimodal_call' | 'icebreaker_card_generated' | 'fallback_prompt_used' | 'credit_purchased' | 'terms_accepted' | 'user_registered' | 'landing_page_viewed' | 'legal_consent_completed' | 'onboarding_completed' | 'account_deleted';
  details: string;
  latencyMs?: number;
  status: 'success' | 'warning' | 'error';
}

export interface SystemMetrics {
  totalScans: number;
  activeCredits: number;
  avgLatencyMs: number;
  successRatePercent: number;
  fallbackCount: number;
  contentSafetyRejections: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  thinkingProcess?: string;
}

export interface PromptHistoryItem {
  id: string;
  createdAt: string;
  persona: UserProfilePersona;
  prompts: PersonalizedPrompt[];
}

export interface CoachChatHistoryItem {
  id: string;
  createdAt: string;
  title: string;
  messages: ChatMessage[];
}

export interface PhotoStudioHistoryItem {
  id: string;
  createdAt: string;
  photo: GeneratedPhoto;
  uploadedImageBase64?: string;
}

export interface ProfileAIFeedback {
  overallScore: number;
  archetype: string;
  summary: string;
  bioAnalysis: {
    strengths: string[];
    weaknesses: string[];
    suggestedBioRewrites: string[];
  };
  photoFeedback: {
    photoCritique: string;
    suggestedPhotosToKeep: string[];
    suggestedPhotosToReplace: string[];
  };
  redFlagsDetected: string[];
  instantFixesToBoostMatches: string[];
}

