import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an aptitude test generator for placement preparation. Generate ${count} multiple-choice questions with difficulty level: ${difficulty}.

Include questions from these categories:
- Logical Reasoning
- Quantitative Aptitude
- Verbal Ability
- Data Interpretation

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. Brief explanation
5. Category

Return as a JSON array with this structure:
[{
  "question": "string",
  "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
  "correctAnswer": "A",
  "explanation": "string",
  "category": "string"
}]`;

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
          { role: 'user', content: `Generate ${count} ${difficulty} difficulty aptitude questions.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    let questions = data.choices[0].message.content;

    // Try to extract JSON if wrapped in markdown
    if (questions.includes('```json')) {
      questions = questions.split('```json')[1].split('```')[0].trim();
    } else if (questions.includes('```')) {
      questions = questions.split('```')[1].split('```')[0].trim();
    }

    const parsedQuestions = JSON.parse(questions);

    return new Response(JSON.stringify({ questions: parsedQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
