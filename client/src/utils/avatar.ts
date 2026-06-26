export function avatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  return avatar.startsWith('/') ? avatar : `/${avatar}`;
}
