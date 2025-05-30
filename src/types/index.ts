// 基本的な型定義

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  user_id: string;
  nickname: string;
  platform: string;
  current_stage: ConnectionStage;
  basic_info: BasicInfo;
  communication: CommunicationInfo;
  user_feelings: UserFeelings;
  created_at: string;
  updated_at: string;
}

export type ConnectionStage = 
  | 'マッチング直後'
  | 'メッセージ中'
  | 'LINE交換済み'
  | 'デート前'
  | 'デート後'
  | '交際中'
  | '停滞中'
  | '終了';

export interface BasicInfo {
  age?: number;
  occupation?: string;
  hobbies?: string[];
  location?: string;
}

export interface CommunicationInfo {
  frequency?: string;
  lastContact?: string;
  communicationStyle?: string;
  responseTime?: string;
}

export interface UserFeelings {
  expectations?: string;
  concerns?: string;
  attractivePoints?: string[];
}

export interface ProgressEntry {
  id: string;
  connection_id: string;
  distance_level: number; // 1-5
  hope_score: number; // 0-100
  milestone?: string;
  recorded_at: string;
}

export interface ActionHistory {
  id: string;
  connection_id: string;
  action_type: string;
  action_detail: any;
  result?: any;
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  template: string;
  ai_types: AIType[];
}

export type AIType = 'claude' | 'gpt' | 'gemini';

export interface PromptGenerationRequest {
  template_id: string;
  connection_id?: string;
  context?: any;
  ai_type: AIType;
}

export interface DashboardData {
  connections: Connection[];
  totalConnections: number;
  activeConnections: number;
  recommendedActions: RecommendedAction[];
  progressSummary: ProgressSummary;
}

export interface RecommendedAction {
  id: string;
  connection_id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimated_time: string;
  prompt_type: string;
}

export interface ProgressSummary {
  overall_hope_score: number;
  weekly_progress: number;
  milestones_this_month: number;
  best_connection: {
    nickname: string;
    score: number;
  };
}