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
    const { type, answer, questionNumber, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userMessage = '';

    if (type === 'generate') {
      // Generate a new interview question
      systemPrompt = `You are a professional interviewer conducting a ${answer || 'technical'} interview. Generate one interview question that would be asked in a real placement interview. The question should be clear, professional, and appropriate for the question number ${questionNumber || 1} in the sequence.

Return a JSON object with:
{
  "question": "the interview question",
  "type": "behavioral/technical/situational",
  "difficulty": "easy/medium/hard"
}`;
      
      userMessage = `Generate interview question number ${questionNumber || 1} for a ${answer || 'technical'} interview.`;
    } else if (type === 'evaluate') {
      // Evaluate the candidate's answer
      systemPrompt = `You are a professional interviewer evaluating a candidate's response. Provide constructive feedback on their answer, including:
1. Strengths of the response
2. Areas for improvement
3. A score out of 10
4. Suggested better answer approach

Format as JSON:
{
  "score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "suggestedApproach": "string",
  "nextQuestion": "string"
}`;

      const lastQuestion = conversationHistory?.[conversationHistory.length - 1]?.question || '';
      userMessage = `Question asked: "${lastQuestion}"\n\nCandidate's answer: "${answer}"\n\nProvide detailed evaluation and generate the next appropriate follow-up question.`;
    }

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
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to process interview request');
    }

    const data = await response.json();
    let result = data.choices[0].message.content;

    // Extract JSON if wrapped in markdown
    if (result.includes('```json')) {
      result = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      result = result.split('```')[1].split('```')[0].trim();
    }

    const parsedResult = JSON.parse(result);

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in interview-practice:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
