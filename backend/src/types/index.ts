export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
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

export interface AlertSetting {
  id: string;
  user_id: string;
  alert_type: string;
  threshold_value: number;
  notification_method: string;
  is_enabled: boolean;
  created_at: string;
}

export interface UsageStatistics {
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  average_duration: number;
  session_count: number;
  daily_average: number;
  weekly_trend: number;
  monthly_trend: number;
  total_tokens?: number; // 来自ccusage的真实total tokens，包含缓存tokens
}

export interface DashboardData {
  today_usage: UsageStatistics;
  weekly_usage: UsageStatistics;
  monthly_usage: UsageStatistics;
  real_time_usage: UsageRecord[];
  top_projects: Array<{
    project_id: string;
    project_name: string;
    total_cost: number;
    total_tokens: number;
  }>;
}