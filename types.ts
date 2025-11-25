
export type BlockType = 'social' | 'image' | 'text' | 'map' | 'profile' | 'list';
export type BlockSize = string; // Format: "${width}x${height}" e.g., "1x1", "2x2", "3x1"

export interface BlockData {
  id: string;
  type: BlockType;
  size: BlockSize;
  title?: string;
  content?: string;
  url?: string;
  imageUrl?: string;
  iconName?: string; // For Lucide icons
  faviconUrl?: string; // For custom website favicons
  status?: string;
  tags?: string[];
  lastUpdated?: number;
  fileSize?: string;
  listType?: 'ordered' | 'unordered';
  items?: string[];
}

export interface VaultFolder {
  id: string;
  name: string;
  type: 'public' | 'private';
  password?: string;
  items: BlockData[];
  description?: string;
}

export interface UserConfig {
  username: string;
  email: string;
  avatar?: string;
}

export interface ThemeConfig {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string;
  overlayOpacity?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserConfig | null;
}
