import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FadeInUp from '../components/animations/FadeInUp';
import UserAvatar from '../components/ui/UserAvatar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [linkedin, setLinkedin] = useState(user?.profile?.linkedin || '');
  const [github, setGithub] = useState(user?.profile?.github || '');
  const [targetRole, setTargetRole] = useState(user?.profile?.targetRole || '');
  const [experience, setExperience] = useState(user?.profile?.experience || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    setUploading(true);
    try {
      await userApi.uploadAvatar(file);
      await refreshUser();
      toast.success('Profile photo updated');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userApi.updateProfile({
        name,
        profile: { bio, location, linkedin, github, targetRole, experience },
      });
      await refreshUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          User <span className="neon-text">Profile</span>
        </h1>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <Card>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <UserAvatar size="lg" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-white/50">{user?.email}</p>
              <p className="text-sm text-purple-400 mt-1">Level {user?.stats.level} · {user?.stats.xp} XP</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="h-4 w-4" /> Change photo
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            <Input label="Target Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
            <Input label="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 2 years" />
            <Input label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
            <Input label="GitHub" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
          </div>

          <Button onClick={handleSave} loading={loading} className="mt-6">Save Profile</Button>
        </Card>
      </FadeInUp>
    </div>
  );
}
