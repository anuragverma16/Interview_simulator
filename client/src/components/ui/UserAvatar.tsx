import { useAuth } from '../../contexts/AuthContext';
import { avatarUrl } from '../../utils/avatar';
import { cn } from '../../utils/cn';

export default function UserAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { user } = useAuth();
  const src = avatarUrl(user?.avatar);
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-20 w-20 text-3xl' };

  if (src) {
    return (
      <img
        src={src}
        alt={user?.name || 'Profile'}
        className={cn('rounded-full object-cover border-2 border-purple-500/30', sizes[size])}
      />
    );
  }

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold border-2 border-purple-500/30',
      sizes[size]
    )}>
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
}
