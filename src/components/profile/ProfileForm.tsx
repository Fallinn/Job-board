
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export const ProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience_level: 'entry',
    profile_image_url: '',
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, profile_image_url: publicUrl }));
      
      toast({
        title: "Image uploaded!",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.profile_image_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {uploadingImage && (
                <p className="text-sm text-purple-600">Uploading image...</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <select
                id="experience"
                value={profile.experience_level || 'entry'}
                onChange={(e) => setProfile(prev => ({ ...prev, experience_level: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.skills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
