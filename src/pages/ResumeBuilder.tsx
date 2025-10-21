import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, Upload, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "sonner";
import penguinxLogo from "@/assets/penguinx-logo.jpeg";

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (selectedFile.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      // Read file as text for analysis
      const reader = new FileReader();
      reader.readAsText(file);
      
      reader.onload = async () => {
        const resumeContent = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke("analyze-resume", {
          body: { resumeContent }
        });

        if (error) throw error;

        // Transform data to match expected format
        const analysisResult = {
          ats_score: data.atsScore,
          analysis_text: data.assessment,
          suggestions: data.suggestions
        };

        setAnalysis(analysisResult);
        
        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('resume_analysis').insert({
            user_id: user.id,
            resume_url: file.name,
            ats_score: data.atsScore,
            analysis_text: data.assessment,
            suggestions: data.suggestions
          });
        }
        
        toast.success("Resume analyzed successfully!");
      };
    } catch (error: any) {
      toast.error("Error analyzing resume. Please try again.");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={penguinxLogo} alt="PenguinX AI" className="h-10 w-10 object-cover rounded-full ring-2 ring-primary/20" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Resume Builder & ATS Score
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF only, max 1MB
                  </p>
                </Label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className="w-full bg-gradient-primary hover:shadow-glow"
              >
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">
                What we analyze:
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• ATS compatibility score</li>
                <li>• Keyword optimization</li>
                <li>• Format and structure</li>
                <li>• Content suggestions</li>
              </ul>
            </div>
          </Card>

          {/* Analysis Results */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
            
            {!analysis ? (
              <div className="text-center py-12">
                <img src={penguinxLogo} alt="Waiting" className="w-32 h-32 mx-auto mb-4 object-cover rounded-full ring-4 ring-primary/20 opacity-50" />
                <p className="text-muted-foreground">
                  Upload and analyze your resume to see results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ATS Score */}
                <div className="text-center p-6 bg-gradient-card rounded-lg">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {analysis.ats_score}%
                  </div>
                  <p className="text-muted-foreground">ATS Compatibility Score</p>
                </div>

                {/* Analysis Text */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Overall Assessment</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {analysis.analysis_text}
                    </p>
                  </div>

                  {analysis.suggestions && (
                    <div>
                      <h3 className="font-semibold mb-2">Suggestions for Improvement</h3>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
