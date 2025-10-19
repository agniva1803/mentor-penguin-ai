import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Code, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestCase {
  input: any;
  output: any;
}

interface TestResult {
  testCase: number;
  input: any;
  expectedOutput: any;
  passed: boolean;
}

interface Question {
  title: string;
  difficulty: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  testCases: TestCase[];
  timeComplexity: string;
  spaceComplexity: string;
}

export default function CodingTest() {
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [evaluation, setEvaluation] = useState<any>(null);

  const startTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-coding-questions', {
        body: { difficulty }
      });

      if (error) throw error;

      setQuestion(data);
      setStarted(true);
      setCode("");
      setTestResults(null);
      setEvaluation(null);
      toast.success("Coding challenge loaded!");
    } catch (error: any) {
      console.error('Error starting test:', error);
      toast.error(error.message || "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!code.trim() || !question) {
      toast.error("Please write some code first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-code', {
        body: { 
          code,
          language,
          testCases: question.testCases
        }
      });

      if (error) throw error;

      setTestResults(data.testResults);
      
      if (data.allPassed) {
        toast.success("All test cases passed! 🎉");
      } else {
        toast.error("Some test cases failed. Keep trying!");
      }
    } catch (error: any) {
      console.error('Error running code:', error);
      toast.error(error.message || "Failed to run code");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim() || !question) {
      toast.error("Please write some code first");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-code', {
        body: { 
          code,
          question: question.description,
          language
        }
      });

      if (error) throw error;

      setEvaluation(data);
      
      // Save progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          activity_type: 'coding_test',
          activity_data: {
            question: question.title,
            language,
            difficulty: question.difficulty,
            correctness: data.correctness
          },
          score: data.correctness
        });
      }

      toast.success("Code evaluated!");
    } catch (error: any) {
      console.error('Error submitting code:', error);
      toast.error(error.message || "Failed to evaluate code");
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStarted(false);
    setQuestion(null);
    setCode("");
    setTestResults(null);
    setEvaluation(null);
  };

  if (!started) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Coding Practice</h3>
        </div>

        <p className="text-muted-foreground mb-6">
          Practice coding problems with real test cases and get AI-powered feedback.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="c">C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={startTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Challenge...
              </>
            ) : (
              "Start Coding Challenge"
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{question?.title}</h3>
            <div className="flex gap-2">
              <Badge variant={
                question?.difficulty === 'easy' ? 'default' : 
                question?.difficulty === 'medium' ? 'secondary' : 
                'destructive'
              }>
                {question?.difficulty}
              </Badge>
              <Badge variant="outline">Time: {question?.timeComplexity}</Badge>
              <Badge variant="outline">Space: {question?.spaceComplexity}</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={resetTest}>New Question</Button>
        </div>

        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-muted-foreground">{question?.description}</p>
          
          {question?.examples.map((example, idx) => (
            <div key={idx} className="bg-muted p-4 rounded-lg my-2">
              <p className="font-semibold">Example {idx + 1}:</p>
              <p className="text-sm"><strong>Input:</strong> {example.input}</p>
              <p className="text-sm"><strong>Output:</strong> {example.output}</p>
              <p className="text-sm text-muted-foreground">{example.explanation}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Solution ({language})</Label>
            <Textarea
              placeholder={`Write your ${language} code here...`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={runCode} disabled={loading} variant="outline" className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Test Cases"
              )}
            </Button>
            <Button onClick={submitCode} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit & Evaluate"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {testResults && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Test Results</h4>
          <div className="space-y-2">
            {testResults.map((result) => (
              <div key={result.testCase} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Test Case {result.testCase}</span>
                </div>
                <Badge variant={result.passed ? "default" : "destructive"}>
                  {result.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {evaluation && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">AI Evaluation</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Correctness</p>
                <p className="text-2xl font-bold text-primary">{evaluation.correctness}/100</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Code Quality</p>
                <p className="text-2xl font-bold text-primary">{evaluation.codeQuality}/100</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Complexity Analysis:</p>
              <p className="text-sm"><strong>Time:</strong> {evaluation.timeComplexity}</p>
              <p className="text-sm"><strong>Space:</strong> {evaluation.spaceComplexity}</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">Feedback:</p>
              <p className="text-sm whitespace-pre-wrap">{evaluation.feedback}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
