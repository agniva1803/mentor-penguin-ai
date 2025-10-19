import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback questions when AI is unavailable
const fallbackQuestions = {
  easy: [
    {
      question: "If a train travels 120 km in 2 hours, what is its average speed?",
      options: ["A: 50 km/h", "B: 60 km/h", "C: 70 km/h", "D: 80 km/h"],
      correctAnswer: "B",
      explanation: "Speed = Distance / Time = 120 / 2 = 60 km/h",
      category: "Quantitative Aptitude"
    },
    {
      question: "Choose the word that is most similar to 'Happy':",
      options: ["A: Sad", "B: Joyful", "C: Angry", "D: Nervous"],
      correctAnswer: "B",
      explanation: "Joyful is a synonym of Happy, both mean feeling pleasure or contentment.",
      category: "Verbal Ability"
    },
    {
      question: "What comes next in the series: 2, 4, 6, 8, ?",
      options: ["A: 9", "B: 10", "C: 11", "D: 12"],
      correctAnswer: "B",
      explanation: "This is a series of even numbers, so the next number is 10.",
      category: "Logical Reasoning"
    }
  ],
  medium: [
    {
      question: "A shopkeeper marks his goods 40% above the cost price and gives a discount of 20%. What is his profit percentage?",
      options: ["A: 10%", "B: 12%", "C: 15%", "D: 18%"],
      correctAnswer: "B",
      explanation: "Let CP = 100. Marked price = 140. After 20% discount: 140 × 0.8 = 112. Profit = 12%",
      category: "Quantitative Aptitude"
    },
    {
      question: "In a group of 6 people, how many different handshakes are possible if each person shakes hands with every other person exactly once?",
      options: ["A: 12", "B: 15", "C: 18", "D: 21"],
      correctAnswer: "B",
      explanation: "Using combination formula: 6C2 = 6!/(2!×4!) = 15",
      category: "Logical Reasoning"
    },
    {
      question: "Choose the word that best completes the analogy: Doctor : Hospital :: Teacher : ?",
      options: ["A: Student", "B: School", "C: Book", "D: Classroom"],
      correctAnswer: "B",
      explanation: "Just as a doctor works in a hospital, a teacher works in a school.",
      category: "Verbal Ability"
    }
  ],
  hard: [
    {
      question: "A boat takes 4 hours to travel 20 km downstream and 5 hours to return. What is the speed of the boat in still water?",
      options: ["A: 4.5 km/h", "B: 5 km/h", "C: 5.5 km/h", "D: 6 km/h"],
      correctAnswer: "A",
      explanation: "Downstream speed = 20/4 = 5 km/h, Upstream speed = 20/5 = 4 km/h. Speed in still water = (5+4)/2 = 4.5 km/h",
      category: "Quantitative Aptitude"
    },
    {
      question: "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?",
      options: ["A: EOJDJEFM", "B: NFEDJJOF", "C: MFEJDJOF", "D: NFEJDJO"],
      correctAnswer: "B",
      explanation: "Each letter is shifted by +2 and then reversed. MEDICINE becomes NFEJDJOF.",
      category: "Logical Reasoning"
    },
    {
      question: "Find the next number in the series: 1, 4, 9, 16, 25, ?",
      options: ["A: 30", "B: 33", "C: 36", "D: 40"],
      correctAnswer: "C",
      explanation: "This is a series of perfect squares: 1², 2², 3², 4², 5², 6² = 36",
      category: "Logical Reasoning"
    }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty = 'medium', count = 10 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('LOVABLE_API_KEY not configured, using fallback questions');
      return useFallbackQuestions(difficulty, count);
    }

    try {
      const systemPrompt = `You are an aptitude test generator for placement preparation. Generate multiple-choice questions.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Generate ${count} ${difficulty} difficulty aptitude questions covering Logical Reasoning, Quantitative Aptitude, Verbal Ability, and Data Interpretation.` 
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_aptitude_questions",
                description: "Generate aptitude test questions",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          options: {
                            type: "array",
                            items: { type: "string" }
                          },
                          correctAnswer: { type: "string" },
                          explanation: { type: "string" },
                          category: { type: "string" }
                        },
                        required: ["question", "options", "correctAnswer", "explanation", "category"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["questions"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "generate_aptitude_questions" } }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        // Check for rate limiting
        if (response.status === 429 || response.status === 402) {
          console.log('Rate limited or out of credits, using fallback questions');
          return useFallbackQuestions(difficulty, count);
        }
        
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      
      if (!toolCall) {
        console.log('No tool call returned, using fallback questions');
        return useFallbackQuestions(difficulty, count);
      }

      const result = JSON.parse(toolCall.function.arguments);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (aiError) {
      console.error('AI generation failed, using fallback:', aiError);
      return useFallbackQuestions(difficulty, count);
    }
  } catch (error) {
    console.error('Error in generate-aptitude-test:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function useFallbackQuestions(difficulty: string, count: number) {
  const difficultyKey = difficulty.toLowerCase() as keyof typeof fallbackQuestions;
  const questions = fallbackQuestions[difficultyKey] || fallbackQuestions.medium;
  
  // Repeat questions if count is greater than available questions
  const selectedQuestions = [];
  for (let i = 0; i < count; i++) {
    selectedQuestions.push(questions[i % questions.length]);
  }

  return new Response(JSON.stringify({ questions: selectedQuestions }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
