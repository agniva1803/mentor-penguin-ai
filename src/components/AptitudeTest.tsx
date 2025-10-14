import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

export default function AptitudeTest() {
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const startTest = async () => {
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-aptitude-test', {
        body: {
          difficulty,
          count: parseInt(questionCount)
        }
      });

      if (error) throw error;

      setQuestions(data.questions);
      toast.success("Test generated successfully!");
    } catch (error: any) {
      console.error('Error generating test:', error);
      toast.error(error.message || "Failed to generate test");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const correctCount = questions.filter((q, idx) => 
      answers[idx] === q.correctAnswer
    ).length;
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Save to user progress
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          activity_type: 'aptitude_test',
          activity_data: {
            difficulty,
            totalQuestions: questions.length,
            correctAnswers: correctCount
          },
          score: finalScore
        });
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }

    toast.success(`Test completed! Score: ${finalScore}%`);
  };

  if (questions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Start Aptitude Test</h3>
        </div>

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
            <Label>Number of Questions</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
                <SelectItem value="20">20 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={startTest} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Test...
              </>
            ) : (
              "Start Test"
            )}
          </Button>
        </div>
      </Card>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-4">Test Results</h3>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{score}%</div>
            <p className="text-muted-foreground">
              {questions.filter((q, idx) => answers[idx] === q.correctAnswer).length} out of {questions.length} correct
            </p>
          </div>
        </Card>

        {questions.map((q, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start gap-2 mb-2">
              {answers[idx] === q.correctAnswer ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="font-semibold mb-2">Question {idx + 1}: {q.question}</p>
                <p className="text-sm text-muted-foreground mb-2">Category: {q.category}</p>
                <div className="space-y-1 mb-3">
                  {q.options.map((opt, optIdx) => {
                    const optLetter = opt.split(':')[0];
                    const isCorrect = optLetter === q.correctAnswer;
                    const isUserAnswer = optLetter === answers[idx];
                    
                    return (
                      <div 
                        key={optIdx}
                        className={`p-2 rounded text-sm ${
                          isCorrect ? 'bg-green-100 dark:bg-green-900/20' : 
                          isUserAnswer ? 'bg-red-100 dark:bg-red-900/20' : 
                          'bg-muted'
                        }`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Button onClick={() => setQuestions([])} className="w-full">
          Take Another Test
        </Button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-semibold">{currentQ.category}</span>
        </div>

        <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>

        <RadioGroup 
          value={answers[currentQuestion]} 
          onValueChange={(value) => setAnswers({...answers, [currentQuestion]: value})}
        >
          {currentQ.options.map((option, idx) => {
            const optionLetter = option.split(':')[0];
            return (
              <div key={idx} className="flex items-center space-x-2 p-3 rounded hover:bg-muted cursor-pointer">
                <RadioGroupItem value={optionLetter} id={`q${currentQuestion}-opt${idx}`} />
                <Label htmlFor={`q${currentQuestion}-opt${idx}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
