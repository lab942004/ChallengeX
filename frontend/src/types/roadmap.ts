export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type RoadmapStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface RoadmapStep {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  order: number;
  status: StepStatus;
  objective: string | null;
  tasks: string[];
  deliverables: string[];
  estimatedEffort: string | null;
}

export interface Roadmap {
  id: string;
  trialId: string;
  title: string;
  status: RoadmapStatus;
  steps: RoadmapStep[];
}
