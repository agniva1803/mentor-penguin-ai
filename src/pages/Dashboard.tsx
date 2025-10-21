import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, FileCheck, Target, TrendingUp, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";
import penguinxLogo from "@/assets/penguinx-logo.jpeg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    await fetchProgress(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const fetchProgress = async (userId: string) => {
    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(5);
    setProgress(data || []);
  };

  const quickActions = [
    {
      icon: Brain,
      title: "Career Guidance",
      description: "Get AI-powered advice",
      action: "/career-guidance",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileCheck,
      title: "Resume Builder",
      description: "Build & analyze resume",
      action: "/resume-builder",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Practice Tests",
      description: "Coding & interviews",
      action: "/placement-prep",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Your Insights",
      description: "Track progress",
      action: "/insights",
      color: "from-orange-500 to-red-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={penguinxLogo} alt="Loading" className="w-32 h-32 mx-auto mb-4 object-cover rounded-full ring-4 ring-primary/30 shadow-glow animate-float" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
            <img src={penguinxLogo} alt="PenguinX AI" className="h-10 w-10 object-cover rounded-full ring-2 ring-primary/20" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PenguinX AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <Home className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.name || "User"}! 🎉
          </h2>
          <p className="text-muted-foreground">
            Let's continue your journey to career success
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer hover:shadow-elegant transition-all group"
              onClick={() => navigate(action.action)}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          {progress.length > 0 ? (
            <div className="space-y-4">
              {progress.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{item.activity_type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  {item.score && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{item.score}%</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity yet. Start your learning journey!</p>
            </div>
          )}
        </Card>

        {/* Daily Goals */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Today's Goals</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Complete 1 Coding Challenge</span>
                <span className="text-sm text-muted-foreground">0/1</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Practice 1 Mock Interview</span>
                <span className="text-sm text-muted-foreground">0/1</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Review Resume</span>
                <span className="text-sm text-muted-foreground">0/1</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
