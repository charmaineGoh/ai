import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'marketer' | 'intern' | 'creator';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  role_type?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  user_id: string;
  name: string;
  api_key?: string;
  connected: boolean;
  created_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  title?: string;
  type: 'image' | 'video' | 'text_template';
  url?: string;
  generated_by_ai: boolean;
  created_at: string;
}

export interface ContentPost {
  id: string;
  user_id: string;
  platform_id?: string;
  asset_id?: string;
  caption?: string;
  scheduled_at?: string;
  status: 'draft' | 'scheduled' | 'posted';
  created_at: string;
}

export interface BrandTheme {
  id: string;
  user_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  post_id: string;
  platform: string;
  reach: number;
  likes: number;
  shares: number;
  comments: number;
  fetched_at: string;
}
