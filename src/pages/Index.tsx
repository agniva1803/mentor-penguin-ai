import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, FileCheck, Target, TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import mentorPenguin from "@/assets/mentor-penguin.png";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Career Guidance",
      description: "Get personalized career advice powered by Gemini AI",
      action: "/career-guidance"
    },
    {
      icon: FileCheck,
      title: "Resume Builder & ATS Score",
      description: "Build your resume and get ATS scoring with AI analysis",
      action: "/resume-builder"
    },
    {
      icon: Target,
      title: "Placement Preparation",
      description: "Practice coding, aptitude, and mock interviews",
      action: "/placement-prep"
    },
    {
      icon: TrendingUp,
      title: "Real-time Insights",
      description: "Track your progress and improvement metrics",
      action: "/insights"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={mentorPenguin} alt="Mentor Pengu" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mentor Pengu
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <UserAvatar />
            ) : (
              <Button onClick={() => navigate("/auth")} className="bg-gradient-primary hover:shadow-glow">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <img 
            src={mentorPenguin} 
            alt="Mentor Pengu Mascot" 
            className="w-64 h-64 mx-auto mb-8 object-contain animate-bounce"
          />
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Your AI-Powered Career Coach
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Prepare for placements, build perfect resumes, and ace interviews with AI guidance
          </p>
          <div className="flex gap-4 justify-center">
            {!user && (
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:shadow-glow text-lg px-8"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center bg-gradient-card shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Students Guided</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-card shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">75%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-card shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-elegant transition-all cursor-pointer bg-gradient-card"
                onClick={() => user ? navigate(feature.action) : navigate("/auth")}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-gradient-hero">
          <div className="container mx-auto text-center">
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Launch Your Career?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join Mentor Pengu today and get personalized AI-powered career guidance
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card/50">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Mentor Pengu. Powered by AI to help you succeed.</p>
        </div>
      </footer>
    </div>
  );
}
