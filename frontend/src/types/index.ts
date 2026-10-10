// ==========================================
// 1. User & Identity Types
// ==========================================
export type UserStatus = 'online' | 'idle' | 'offline';
export type UserRole = 'member' | 'creator' | 'pro' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  title?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  isVerified: boolean;
  role: UserRole;
  status: UserStatus;
  lastSeen?: string;
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    friendsCount: number;
  };
  pinnedCommunities?: string[];
}

export interface FriendRequest {
  id: string;
  sender: User;
  createdAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

// ==========================================
// 2. Post & Reaction Types
// ==========================================
export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionDetail {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
  activeColor: string;
}

export interface PostReactionSummary {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  total: number;
  userReaction?: ReactionType;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16';
  caption?: string;
  thumbnailUrl?: string;
}

export interface CodeAttachment {
  language: string;
  filename: string;
  code: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  expiresIn?: string;
  expiresAt?: string;
}

export type PostVisibility = 'public' | 'friends' | 'private';

export interface Comment {
  id: string;
  postId: string;
  parentId?: string | null;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  replies?: Comment[];
  replyCount?: number;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  visibility: PostVisibility;
  media?: MediaItem[];
  codeSnippet?: CodeAttachment;
  isRepost?: boolean;
  repostedBy?: User;
  poll?: Poll;
  hashtags: string[];
  mentions: string[];
  reactions: PostReactionSummary;
  commentsCount: number;
  sharesCount: number;
  reactionCount?: number;
  userReaction?: ReactionType;
  viewsCount?: number;
  isSaved?: boolean;
  isPinned?: boolean;
  aiGenerated?: boolean;
}

// ==========================================
// 3. Stories & Reels Types
// ==========================================
export interface StoryItem {
  id: string;
  mediaUrl?: string;
  type?: 'image' | 'video';
  durationSeconds?: number;
  caption?: string;
  textOverlay?: string;
  backgroundGradient?: string;
  createdAt?: string;
  viewers?: { user: User; viewedAt: string }[];
}

export interface StoryGroup {
  id?: string;
  userId: string;
  user: User;
  hasUnseen: boolean;
  stories: StoryItem[];
  lastUpdated: string;
}

// ==========================================
// 4. Messaging & Direct Messages Types
// ==========================================
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  text: string;
  mediaUrl?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: DirectMessage;
  unreadCount: number;
  updatedAt: string;
  isGroup?: boolean;
  groupName?: string;
  recipient?: User;
  messages?: DirectMessage[];
  isTyping?: boolean;
}

// ==========================================
// 5. Notifications Types
// ==========================================
export type NotificationType =
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'mention'
  | 'follow'
  | 'friend_request'
  | 'message'
  | 'system';

export interface Notification {
  id: string;
  recipientId: string;
  actor: User;
  type: NotificationType;
  title: string;
  message: string;
  targetId?: string;
  targetType?: 'post' | 'comment' | 'profile' | 'chat';
  isRead: boolean;
  createdAt: string;
  reactionType?: ReactionType;
  actionData?: {
    snippet?: string;
    grantTitle?: string;
  };
}

// ==========================================
// 6. AI Copilot Types
// ==========================================
export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlock?: {
    language: string;
    code: string;
  };
  suggestedActions?: {
    label: string;
    action: string;
    payload?: string;
  }[];
}

export interface AIChatSession {
  id: string;
  title: string;
  mode: 'social' | 'creative' | 'analytics';
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AIPromptTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'captions' | 'feed' | 'friends' | 'strategy';
  prompt: string;
}

// ==========================================
// 7. Explore & Trending Types
// ==========================================
export interface TrendingTopic {
  id: string;
  category: string;
  tag: string;
  postCountFormatted: string;
  postCount: number;
  isHot?: boolean;
}

// ==========================================
// 8. Collections & Bookmarks Types
// ==========================================
export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  postIds: string[];
  coverUrl?: string;
  createdAt: string;
}

// ==========================================
// 9. Settings & Privacy Types
// ==========================================
export interface UserSettings {
  privacy: {
    isPrivateAccount: boolean;
    whoCanMessage: 'everyone' | 'friends' | 'nobody';
    whoCanComment: 'everyone' | 'friends' | 'mentions';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    readReceipts: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    pushReactions: boolean;
    pushComments: boolean;
    pushDMs: boolean;
    pushFriendRequests: boolean;
    aiDigest: boolean;
  };
  sessions: {
    id: string;
    device: string;
    location: string;
    ipAddress: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
}

// ==========================================
// 10. Safety & Reporting Types
// ==========================================
export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'misinformation'
  | 'violence'
  | 'inappropriate'
  | 'other';

export interface ReportPayload {
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  category: ReportCategory;
  description?: string;
}

// ==========================================
// 11. UI & Navigation Types
// ==========================================
export type AppView =
  | 'feed'
  | 'reels'
  | 'explore'
  | 'messages'
  | 'copilot'
  | 'notifications'
  | 'profile'
  | 'friends'
  | 'saved'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'spark';
  message: string;
  duration?: number;
}

// ==========================================
// 12. Reels Types
// ==========================================
export interface ReelAudioTrack {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  coverUrl?: string;
  audioUrl?: string;
}

export interface ReelComment {
  id: string;
  reelId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'image';
  thumbnailUrl?: string;
  caption: string;
  audioTrack: ReelAudioTrack;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  filterPreset?: string;
  filterId?: string;
  filterIntensity?: number;
  aspectRatio?: '9:16' | '1:1' | '4:5';
  createdAt: string;
  hashtags?: string[];
  mentions?: string[];
  tags?: string[];
  comments?: ReelComment[];
}

