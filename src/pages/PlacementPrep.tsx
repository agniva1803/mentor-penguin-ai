import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Code, Brain, Video, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";
import mentorPenguin from "@/assets/mentor-penguin.png";

export default function PlacementPrep() {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const startCodingTest = () => {
    setActiveTest("coding");
    toast.info("Coding test feature coming soon!");
  };

  const startAptitudeTest = () => {
    setActiveTest("aptitude");
    toast.info("Aptitude test feature coming soon!");
  };

  const startTechnicalInterview = () => {
    setActiveTest("technical");
    toast.info("Technical interview simulation coming soon!");
  };

  const startHRInterview = () => {
    setActiveTest("hr");
    toast.info("HR interview simulation coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={mentorPenguin} alt="Mentor Pengu" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Placement Preparation
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
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tests">Practice Tests</TabsTrigger>
            <TabsTrigger value="interviews">Mock Interviews</TabsTrigger>
          </TabsList>

          {/* Practice Tests */}
          <TabsContent value="tests" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coding Test */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Coding Practice</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice coding problems with varying difficulty levels
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">60 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">5 problems</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <span className="font-medium">Mixed</span>
                  </div>
                </div>
                <Button 
                  onClick={startCodingTest}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Coding Test
                </Button>
              </Card>

              {/* Aptitude Test */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Logical Reasoning</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your logical reasoning and analytical skills
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions</span>
                    <span className="font-medium">30 questions</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Topics</span>
                    <span className="font-medium">Mixed</span>
                  </div>
                </div>
                <Button 
                  onClick={startAptitudeTest}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Aptitude Test
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Mock Interviews */}
          <TabsContent value="interviews" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical Interview */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Technical Interview</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered technical interview with voice interaction
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">10 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">Voice Q&A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Topics</span>
                    <span className="font-medium">Resume-based</span>
                  </div>
                </div>
                <Button 
                  onClick={startTechnicalInterview}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Technical Interview
                </Button>
              </Card>

              {/* HR Interview */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">HR Interview</h3>
                    <p className="text-sm text-muted-foreground">
                      Practice behavioral questions with AI interviewer
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">10 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-medium">Voice Q&A</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Focus</span>
                    <span className="font-medium">Behavioral</span>
                  </div>
                </div>
                <Button 
                  onClick={startHRInterview}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start HR Interview
                </Button>
              </Card>
            </div>

            <Card className="p-6 bg-gradient-card">
              <h3 className="font-semibold mb-4">How it works:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Upload your resume before starting</li>
                <li>2. The AI will ask you questions based on your resume</li>
                <li>3. Use your microphone to respond naturally</li>
                <li>4. Get instant feedback on your answers</li>
                <li>5. Review your performance in the insights section</li>
              </ol>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
