import { getApiOrigin } from './apiOrigin';

export function avatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;

  const path = avatar.startsWith('/') ? avatar : `/${avatar}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${path}` : path;
}
