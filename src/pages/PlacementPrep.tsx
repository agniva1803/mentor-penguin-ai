import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import penguinxLogo from "@/assets/penguinx-logo.jpeg";
import CodingTest from "@/components/CodingTest";
import AptitudeTest from "@/components/AptitudeTest";
import InterviewPractice from "@/components/InterviewPractice";

export default function PlacementPrep() {
  const navigate = useNavigate();

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Placement Preparation</h2>
          <p className="text-muted-foreground">Practice coding, aptitude tests, and AI-powered mock interviews</p>
        </div>

        <Tabs defaultValue="coding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coding">Coding Practice</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude Tests</TabsTrigger>
            <TabsTrigger value="interview">Mock Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="coding">
            <CodingTest />
          </TabsContent>

          <TabsContent value="aptitude">
            <AptitudeTest />
          </TabsContent>

          <TabsContent value="interview">
            <InterviewPractice />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
