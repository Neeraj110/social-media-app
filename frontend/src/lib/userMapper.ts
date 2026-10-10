import { User } from '../types';

export function mapBackendUserToUser(raw: any): User {
  if (!raw) {
    return {
      id: '',
      username: '',
      displayName: '',
      email: '',
      avatarUrl: '',
      coverUrl: '',
      bio: '',
      joinedDate: new Date().toISOString(),
      isVerified: false,
      role: 'member',
      status: 'offline',
      stats: {
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
      },
    };
  }

  const id = String(raw.user_id ?? raw.id ?? '');
  const username = raw.username || 'user';
  const displayName = raw.full_name || raw.name || raw.displayName || raw.username || 'Anonymous';
  const email = raw.email || '';
  const avatarUrl = raw.profile_image_url || raw.profile_picture || raw.avatarUrl || '';
  const coverUrl = raw.cover_image_url || raw.cover_photo || raw.coverUrl || '';
  const bio = raw.bio || '';
  const joinedDate = raw.created_at || raw.joinedDate || new Date().toISOString();
  const isVerified = Boolean(raw.is_verified ?? raw.isVerified ?? false);
  const role = raw.role || 'member';
  const status = raw.status || 'online';

  return {
    id,
    username,
    displayName,
    email,
    avatarUrl,
    coverUrl,
    bio,
    title: raw.title || '',
    location: raw.location || '',
    website: raw.website || '',
    joinedDate,
    isVerified,
    role,
    status,
    lastSeen: raw.lastSeen || 'Active recently',
    stats: {
      postsCount: raw.posts_count ?? raw.stats?.postsCount ?? 0,
      followersCount: raw.followers_count ?? raw.stats?.followersCount ?? 0,
      followingCount: raw.following_count ?? raw.stats?.followingCount ?? 0,
      friendsCount: raw.friends_count ?? raw.stats?.friendsCount ?? 0,
    },
    pinnedCommunities: raw.pinnedCommunities || [],
  };
}
