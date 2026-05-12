export type MasteryBand = 'not_started' | 'weak' | 'learning' | 'strong';

export interface ProgressHeatMapLo {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  total_questions: number;
  seen_questions: number;
  avg_mastery: number | null;
  band: MasteryBand;
}

export interface ProgressHeatMapPaper {
  paper_id: string;
  paper_code: string;
  paper_name: string;
  los: ProgressHeatMapLo[];
}

export interface ProgressWeakTopic {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  paper_code: string;
  avg_mastery: number;
  seen_questions: number;
}

export interface ProgressRecentSession {
  id: string;
  started_at: string;
  completed_at: string | null;
  question_count: number;
  correct_count: number;
}

export interface ProgressResponse {
  heat_map: ProgressHeatMapPaper[];
  weak_topics: ProgressWeakTopic[];
  recent_sessions: ProgressRecentSession[];
}
