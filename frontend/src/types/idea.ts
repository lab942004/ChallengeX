export type IdeaStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedIdea {
  title: string;
  problem: string;
  solution: string;
  targetUsers: string;
  whyNow: string;
  businessModel: string;
}
