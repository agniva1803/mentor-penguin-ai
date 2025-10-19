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
    const { code, language, testCases } = await req.json();
    
    // Use Piston API for code execution
    const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: mapLanguage(language),
        version: '*',
        files: [
          {
            name: getFileName(language),
            content: code
          }
        ]
      }),
    });

    if (!pistonResponse.ok) {
      throw new Error('Failed to execute code');
    }

    const result = await pistonResponse.json();
    
    // Test against provided test cases
    const testResults = testCases.map((testCase: any, index: number) => {
      const passed = checkTestCase(result.run.output, testCase.output);
      return {
        testCase: index + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        passed
      };
    });

    const allPassed = testResults.every((tr: any) => tr.passed);

    return new Response(JSON.stringify({
      output: result.run.output,
      stderr: result.run.stderr,
      testResults,
      allPassed,
      language: result.language,
      version: result.version
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in run-code:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function mapLanguage(language: string): string {
  const languageMap: { [key: string]: string } = {
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'cpp': 'c++',
    'c': 'c'
  };
  return languageMap[language.toLowerCase()] || 'javascript';
}

function getFileName(language: string): string {
  const fileNameMap: { [key: string]: string } = {
    'javascript': 'index.js',
    'python': 'main.py',
    'java': 'Main.java',
    'cpp': 'main.cpp',
    'c': 'main.c'
  };
  return fileNameMap[language.toLowerCase()] || 'index.js';
}

function checkTestCase(output: string, expectedOutput: any): boolean {
  try {
    const trimmedOutput = output.trim();
    const expectedStr = JSON.stringify(expectedOutput);
    return trimmedOutput.includes(expectedStr) || trimmedOutput === String(expectedOutput);
  } catch {
    return false;
  }
}
