import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Mic, Loader2, MessageSquare } from "lucide-react";

interface InterviewQuestion {
  question: string;
  type: string;
  difficulty: string;
}

interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedApproach: string;
  nextQuestion: string;
}

export default function InterviewPractice() {
  const [interviewType, setInterviewType] = useState("technical");
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const startInterview = async () => {
    setLoading(true);
    setEvaluation(null);
    setConversationHistory([]);
    setQuestionNumber(1);

    try {
      const { data, error } = await supabase.functions.invoke('interview-practice', {
        body: {
          type: 'generate',
          answer: interviewType,
          questionNumber: 1
        }
      });

      if (error) throw error;

      setCurrentQuestion(data);
      setStarted(true);
      toast.success("Interview started!");
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast.error(error.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    setLoading(true);

    try {
      const history = [...conversationHistory, { question: currentQuestion?.question, answer }];
      
      const { data, error } = await supabase.functions.invoke('interview-practice', {
        body: {
          type: 'evaluate',
          answer,
          conversationHistory: history
        }
      });

      if (error) throw error;

      setEvaluation(data);
      setConversationHistory(history);
      
      // Save progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          activity_type: 'interview_practice',
          activity_data: {
            interviewType,
            questionNumber,
            score: data.score
          },
          score: data.score * 10
        });
      }

      toast.success("Answer evaluated!");
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      toast.error(error.message || "Failed to evaluate answer");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (evaluation?.nextQuestion) {
      setCurrentQuestion({
        question: evaluation.nextQuestion,
        type: currentQuestion?.type || 'technical',
        difficulty: currentQuestion?.difficulty || 'medium'
      });
      setQuestionNumber(questionNumber + 1);
      setAnswer("");
      setEvaluation(null);
    }
  };

  const endInterview = () => {
    setStarted(false);
    setCurrentQuestion(null);
    setAnswer("");
    setEvaluation(null);
    setConversationHistory([]);
    setQuestionNumber(1);
    toast.success("Interview session ended");
  };

  if (!started) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">AI Interview Practice</h3>
        </div>

        <p className="text-muted-foreground mb-6">
          Practice your interview skills with AI-powered questions and real-time feedback.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                <SelectItem value="hr">HR Interview</SelectItem>
                <SelectItem value="case-study">Case Study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">How it works:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• AI will ask you interview questions</li>
              <li>• Type or speak your answers</li>
              <li>• Get instant feedback and scoring</li>
              <li>• Improve with AI suggestions</li>
            </ul>
          </div>

          <Button onClick={startInterview} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Interview...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Interview
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Question */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber}
          </span>
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {currentQuestion?.type}
          </span>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="text-lg font-semibold mb-2">Interviewer:</p>
            <p className="text-muted-foreground">{currentQuestion?.question}</p>
          </div>
        </div>

        {!evaluation ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[150px]"
            />

            <div className="flex gap-2">
              <Button onClick={submitAnswer} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
              <Button variant="outline" onClick={endInterview}>
                End Interview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className="text-4xl font-bold text-primary">{evaluation.score}/10</p>
            </div>

            {/* Strengths */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="font-semibold mb-2 text-green-700 dark:text-green-400">Strengths:</p>
              <ul className="space-y-1 text-sm">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>• {s}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="font-semibold mb-2 text-orange-700 dark:text-orange-400">Areas for Improvement:</p>
              <ul className="space-y-1 text-sm">
                {evaluation.improvements.map((i, idx) => (
                  <li key={idx}>• {i}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Approach */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-semibold mb-2 text-blue-700 dark:text-blue-400">Suggested Approach:</p>
              <p className="text-sm">{evaluation.suggestedApproach}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={nextQuestion} className="flex-1">
                Next Question
              </Button>
              <Button variant="outline" onClick={endInterview}>
                End Interview
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
