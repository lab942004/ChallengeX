export interface DashboardStats {
  totalIdeas: number;
  totalTrials: number;
  buildDecisions: number;
  pivotDecisions: number;
  validateDecisions: number;
  killedIdeas: number;
  averageScore: number;
  unreadNotifications: number;
  activeTrial: {
    id: string;
    ideaTitle: string;
    currentQuestion: number;
    totalQuestions: number;
  } | null;
  recentTrials: {
    id: string;
    ideaTitle: string;
    verdict: string | null;
    score: number | null;
    status: string;
    createdAt: string;
  }[];
  savedIdeas: { id: string; title: string; savedAt: string }[];
  roadmapCount: number;
  experimentCount: number;
}
