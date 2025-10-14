import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Code, Play, Loader2 } from "lucide-react";

const codingQuestions = [
  {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    examples: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]"
  },
  {
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: "Easy",
    examples: "Input: s = ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']"
  },
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
    difficulty: "Medium",
    examples: "Input: s = 'A man, a plan, a canal: Panama'\nOutput: true"
  }
];

export default function CodingTest() {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    setEvaluating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-code', {
        body: {
          code,
          question: codingQuestions[selectedQuestion].description,
          language
        }
      });

      if (error) throw error;

      setResult(data);
      toast.success("Code evaluated successfully!");

      // Save to user progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          activity_type: 'coding_test',
          activity_data: {
            question: codingQuestions[selectedQuestion].title,
            language,
            score: data.correctness
          },
          score: data.correctness
        });
      }
    } catch (error: any) {
      console.error('Error evaluating code:', error);
      toast.error(error.message || "Failed to evaluate code");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Select Problem</h3>
        </div>
        
        <Select value={selectedQuestion.toString()} onValueChange={(v) => setSelectedQuestion(parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {codingQuestions.map((q, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {q.title} - {q.difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">{codingQuestions[selectedQuestion].title}</h4>
          <p className="text-sm text-muted-foreground">{codingQuestions[selectedQuestion].description}</p>
          <div className="bg-muted p-3 rounded text-sm">
            <pre className="whitespace-pre-wrap">{codingQuestions[selectedQuestion].examples}</pre>
          </div>
        </div>
      </Card>

      {/* Code Editor */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Write your solution here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />

          <Button onClick={handleSubmit} disabled={evaluating} className="w-full">
            {evaluating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Submit Solution
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Evaluation Results</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Correctness</p>
                <p className="text-2xl font-bold text-primary">{result.correctness}%</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Code Quality</p>
                <p className="text-2xl font-bold text-primary">{result.codeQuality}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p><strong>Time Complexity:</strong> {result.timeComplexity}</p>
              <p><strong>Space Complexity:</strong> {result.spaceComplexity}</p>
              <p><strong>Interview Pass:</strong> {result.passes ? "✅ Yes" : "❌ No"}</p>
            </div>

            <div className="p-4 bg-muted rounded">
              <p className="font-semibold mb-2">Feedback:</p>
              <p className="text-sm whitespace-pre-wrap">{result.feedback}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
