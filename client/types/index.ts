// 景点数据
export interface Attraction {
  id: string;
  name: string;
  category: string;
  district: string;
  address?: string;
  lat: number;
  lng: number;
  open_time: string;
  ticket: string;
  description: string;
  story: string;
  tags: string[];
  image: string;
  checkin_radius: number;
  rating?: number;
}

// Menu Types
export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  toggle?: boolean;
  value?: string | boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// 打卡记录
export interface Checkin {
  id: string;
  attraction_id: string;
  attraction_name: string;
  district: string;
  checkin_time: string;
  lat: number;
  lng: number;
  distance: number;
  is_valid: boolean;
  is_demo?: boolean;
}

// 打卡请求
export interface CheckinRequest {
  user_id: string;
  attraction_id: string;
  lat: number;
  lng: number;
}

// 打卡响应
export interface CheckinResponse {
  success: boolean;
  message: string;
  data?: {
    checkin_id: string;
    attraction: {
      id: string;
      name: string;
    };
    distance: number;
    points_earned: number;
    achievements_unlocked?: string[];
  };
}

// 成就徽章
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  unlock_time?: string;
}

// AI 对话消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// AI 对话请求
export interface ChatRequest {
  message: string;
  user_id: string;
  type?: 'general' | 'plan' | 'food' | 'route';
}

// AI 对话响应
export interface ChatResponse {
  success: boolean;
  message: string;
  data?: {
    reply: string;
    suggestions?: string[];
  };
}

// 用户数据
export interface User {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  levelTitle: string;
  points: number;
  checkinCount: number;
  exploredDistricts: string[];
}

// API 响应基础结构
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// 快捷问题
export interface QuickQuestion {
  id: string;
  text: string;
  query: string;
  icon?: string;
}

// 导航路线
export interface Route {
  id: string;
  name: string;
  description: string;
  spots: string[];
  duration: string;
  image: string;
}
