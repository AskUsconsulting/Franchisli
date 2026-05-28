export interface TrainingModule {
  id:                string;
  name:              string;
  description:       string | null;
  category:          string;
  is_required:       boolean;
  estimated_minutes: number;
  created_at:        string;
}

export interface TrainingCompletion {
  id:            string;
  module_id:     string;
  location_id:   string;
  employee_name: string;
  completed_at:  string;
  score:         number | null;
}

export interface TrainingCompletionWithLocation extends TrainingCompletion {
  locations: { id: string; name: string };
}

export interface LocationRanking {
  rank:          number;
  location:      { id: string; name: string };
  latest_score:  number | null;
  avg_score:     number;
  total_audits:  number;
  trend:         number;
  grade:         string | null;
  open_findings: number;
}

export interface TrainingModuleReport {
  module:          TrainingModule;
  completions:     TrainingCompletionWithLocation[];
  location_count:  number;  // total locations in network
  completed_count: number;  // locations with ≥1 completion
}
