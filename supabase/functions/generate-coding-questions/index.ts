import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Predefined coding questions with test cases
const codingQuestions = {
  easy: [
    {
      title: "Two Sum",
      difficulty: "easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
      ],
      testCases: [
        { input: { nums: [2,7,11,15], target: 9 }, output: [0,1] },
        { input: { nums: [3,2,4], target: 6 }, output: [1,2] },
        { input: { nums: [3,3], target: 6 }, output: [0,1] }
      ],
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)"
    },
    {
      title: "Palindrome Number",
      difficulty: "easy",
      description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
      examples: [
        { input: "x = 121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." }
      ],
      testCases: [
        { input: { x: 121 }, output: true },
        { input: { x: -121 }, output: false },
        { input: { x: 10 }, output: false }
      ],
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)"
    }
  ],
  medium: [
    {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "medium",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      examples: [
        { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' }
      ],
      testCases: [
        { input: { s: "abcabcbb" }, output: 3 },
        { input: { s: "bbbbb" }, output: 1 },
        { input: { s: "pwwkew" }, output: 3 }
      ],
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m,n))"
    },
    {
      title: "Container With Most Water",
      difficulty: "medium",
      description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
      examples: [
        { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "The vertical lines are at indices 1 and 8, which form a container with area = 7 * 7 = 49." }
      ],
      testCases: [
        { input: { height: [1,8,6,2,5,4,8,3,7] }, output: 49 },
        { input: { height: [1,1] }, output: 1 },
        { input: { height: [4,3,2,1,4] }, output: 16 }
      ],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    },
    {
      title: "3Sum",
      difficulty: "medium",
      description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      examples: [
        { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "The distinct triplets are [-1,0,1] and [-1,-1,2]." }
      ],
      testCases: [
        { input: { nums: [-1,0,1,2,-1,-4] }, output: [[-1,-1,2],[-1,0,1]] },
        { input: { nums: [0,1,1] }, output: [] },
        { input: { nums: [0,0,0] }, output: [[0,0,0]] }
      ],
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1)"
    }
  ],
  hard: [
    {
      title: "Median of Two Sorted Arrays",
      difficulty: "hard",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
      examples: [
        { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." }
      ],
      testCases: [
        { input: { nums1: [1,3], nums2: [2] }, output: 2.0 },
        { input: { nums1: [1,2], nums2: [3,4] }, output: 2.5 },
        { input: { nums1: [], nums2: [1] }, output: 1.0 }
      ],
      timeComplexity: "O(log(m+n))",
      spaceComplexity: "O(1)"
    },
    {
      title: "Trapping Rain Water",
      difficulty: "hard",
      description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      examples: [
        { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped." }
      ],
      testCases: [
        { input: { height: [0,1,0,2,1,0,1,3,2,1,2,1] }, output: 6 },
        { input: { height: [4,2,0,3,2,5] }, output: 9 },
        { input: { height: [4,2,3] }, output: 1 }
      ],
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)"
    }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty = 'medium' } = await req.json();
    
    const questions = codingQuestions[difficulty as keyof typeof codingQuestions] || codingQuestions.medium;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return new Response(JSON.stringify(randomQuestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-coding-questions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
