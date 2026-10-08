export type NotificationType =
  | 'TRIAL_COMPLETED'
  | 'VERDICT_GENERATED'
  | 'ROADMAP_COMPLETED'
  | 'EXPERIMENT_CREATED'
  | 'SAVED_IDEA'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}
