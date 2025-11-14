export interface UsageStatistics {
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  average_duration: number;
  session_count: number;
  daily_average: number;
  weekly_trend: number;
  monthly_trend: number;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  project_id?: string;
  usage_type: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  duration?: number;
  model_version?: string;
  created_at: string;
}

export interface TopProject {
  project_id: string;
  project_name: string;
  total_cost: number;
  total_tokens: number;
}

export interface DashboardData {
  today_usage: UsageStatistics;
  weekly_usage: UsageStatistics;
  monthly_usage: UsageStatistics;
  real_time_usage: UsageRecord[];
  top_projects: TopProject[];
}