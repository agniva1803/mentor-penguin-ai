-- Add UPDATE and DELETE policies for resume_analysis table
CREATE POLICY "Users can update their own resume analysis"
ON public.resume_analysis FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume analysis"
ON public.resume_analysis FOR DELETE
USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for interview_results table
CREATE POLICY "Users can update their own interview results"
ON public.interview_results FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview results"
ON public.interview_results FOR DELETE
USING (auth.uid() = user_id);