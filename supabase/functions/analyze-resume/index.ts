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
    const { resumeContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and resume reviewer. Analyze the provided resume content and provide:
1. An ATS compatibility score (0-100)
2. Overall assessment of the resume's strengths and weaknesses
3. Specific, actionable suggestions for improvement

Format your response as JSON with these fields:
{
  "atsScore": number (0-100),
  "assessment": "string describing overall quality",
  "suggestions": ["array", "of", "specific", "improvements"]
}`;

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
          { role: 'user', content: `Analyze this resume:\n\n${resumeContent}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('Failed to analyze resume');
    }

    const data = await response.json();
    let analysis = data.choices[0].message.content;

    // Extract JSON if wrapped in markdown
    if (analysis.includes('```json')) {
      analysis = analysis.split('```json')[1].split('```')[0].trim();
    } else if (analysis.includes('```')) {
      analysis = analysis.split('```')[1].split('```')[0].trim();
    }

    const result = JSON.parse(analysis);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-resume:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
