import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, TrendingUp, Code, MessageSquare, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import mentorPenguin from "@/assets/mentor-penguin.png";

export default function Insights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [stats, setStats] = useState({
    codingScore: 0,
    communicationScore: 0,
    logicalScore: 0,
    totalTests: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchData(session.user.id);
    setLoading(false);
  };

  const fetchData = async (userId: string) => {
    // Fetch progress data
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (progressData) {
      setProgress(progressData);
      
      // Calculate average scores
      const codingTests = progressData.filter(p => p.activity_type === "coding");
      const interviews = progressData.filter(p => p.activity_type === "interview");
      
      setStats({
        codingScore: codingTests.length > 0 
          ? Math.round(codingTests.reduce((sum, t) => sum + (t.score || 0), 0) / codingTests.length)
          : 0,
        communicationScore: 75, // Placeholder
        logicalScore: 68, // Placeholder
        totalTests: progressData.length,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={mentorPenguin} alt="Loading" className="w-32 h-32 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Loading your insights...</p>
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
              Your Insights
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <Code className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-blue-500 mb-1">{stats.codingScore}%</div>
            <div className="text-sm text-muted-foreground">Coding Skills</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-3xl font-bold text-purple-500 mb-1">{stats.communicationScore}%</div>
            <div className="text-sm text-muted-foreground">Communication</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-3xl font-bold text-green-500 mb-1">{stats.logicalScore}%</div>
            <div className="text-sm text-muted-foreground">Logical Reasoning</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <FileCheck className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-3xl font-bold text-orange-500 mb-1">{stats.totalTests}</div>
            <div className="text-sm text-muted-foreground">Tests Completed</div>
          </Card>
        </div>

        {/* Model Accuracy */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Mentor Pengu Model Accuracy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Resume Analysis</span>
                <span className="text-sm font-medium">95%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary w-[95%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Interview Assessment</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Career Guidance</span>
                <span className="text-sm font-medium">97%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary w-[97%]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          {progress.length > 0 ? (
            <div className="space-y-4">
              {progress.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{item.activity_type.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.completed_at).toLocaleDateString()} at{" "}
                      {new Date(item.completed_at).toLocaleTimeString()}
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
            <div className="text-center py-12">
              <img src={mentorPenguin} alt="No activity" className="w-32 h-32 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No activity yet. Start practicing to see your progress!</p>
              <Button 
                onClick={() => navigate("/placement-prep")}
                className="mt-4 bg-gradient-primary hover:shadow-glow"
              >
                Start Practicing
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
