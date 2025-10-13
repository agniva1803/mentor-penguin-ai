import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Home, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";
import mentorPenguin from "@/assets/mentor-penguin.png";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    guardian_name: "",
    college: "",
    university: "",
    cgpa: "",
    tech_stacks: [] as string[],
    website_links: [] as string[],
    resume_url: "",
  });
  const [newStack, setNewStack] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchProfile(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) {
      setProfile({
        name: data.name || "",
        guardian_name: data.guardian_name || "",
        college: data.college || "",
        university: data.university || "",
        cgpa: data.cgpa || "",
        tech_stacks: data.tech_stacks || [],
        website_links: data.website_links || [],
        resume_url: data.resume_url || "",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          guardian_name: profile.guardian_name,
          college: profile.college,
          university: profile.university,
          cgpa: profile.cgpa ? parseFloat(profile.cgpa as string) : null,
          tech_stacks: profile.tech_stacks,
          website_links: profile.website_links,
          resume_url: profile.resume_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const addStack = () => {
    if (newStack.trim()) {
      setProfile(prev => ({
        ...prev,
        tech_stacks: [...prev.tech_stacks, newStack.trim()]
      }));
      setNewStack("");
    }
  };

  const removeStack = (index: number) => {
    setProfile(prev => ({
      ...prev,
      tech_stacks: prev.tech_stacks.filter((_, i) => i !== index)
    }));
  };

  const addLink = () => {
    if (newLink.trim() && profile.website_links.length < 3) {
      setProfile(prev => ({
        ...prev,
        website_links: [...prev.website_links, newLink.trim()]
      }));
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      website_links: prev.website_links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={mentorPenguin} alt="Loading" className="w-32 h-32 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mentorPenguin} alt="Mentor Pengu" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mentor Pengu
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guardian">Guardian Name</Label>
                <Input
                  id="guardian"
                  value={profile.guardian_name}
                  onChange={(e) => setProfile({ ...profile, guardian_name: e.target.value })}
                  placeholder="Parent/Guardian Name"
                />
              </div>
            </div>

            {/* Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={profile.college}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  placeholder="Your College"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  placeholder="Your University"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: e.target.value })}
                placeholder="9.5"
              />
            </div>

            {/* Tech Stacks */}
            <div className="space-y-2">
              <Label>Technical Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="e.g., React, Python, SQL"
                  onKeyPress={(e) => e.key === "Enter" && addStack()}
                />
                <Button onClick={addStack} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.tech_stacks.map((stack, index) => (
                  <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{stack}</span>
                    <button onClick={() => removeStack(index)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Website Links */}
            <div className="space-y-2">
              <Label>Website Links (Max 3)</Label>
              <div className="flex gap-2">
                <Input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://github.com/username"
                  onKeyPress={(e) => e.key === "Enter" && addLink()}
                  disabled={profile.website_links.length >= 3}
                />
                <Button onClick={addLink} size="icon" disabled={profile.website_links.length >= 3}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {profile.website_links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1 truncate text-sm">{link}</span>
                    <button onClick={() => removeLink(index)} className="hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Upload Note */}
            <div className="space-y-2">
              <Label>Resume (PDF, Max 1MB)</Label>
              <p className="text-sm text-muted-foreground">
                Upload your resume in the Resume Builder section
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-gradient-primary hover:shadow-glow"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
