export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: Role2;
  createdAt: string;
  updatedAt?: string;
  _count?: { ideas: number; trials: number };
}

type Role2 = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AdminIdea {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  _count?: { trials: number };
}

export interface AdminTrial {
  id: string;
  mode: string;
  status: string;
  score: number | null;
  verdict: string | null;
  createdAt: string;
  completedAt: string | null;
  idea: { id: string; title: string };
  user: { id: string; name: string; email: string };
  _count?: { questions: number; answers: number };
}
