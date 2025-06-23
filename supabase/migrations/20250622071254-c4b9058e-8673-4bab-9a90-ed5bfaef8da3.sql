
-- Drop existing DELETE policy if it exists and recreate it
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Create a new policy that allows users to UPDATE their own jobs (for deactivation)
CREATE POLICY "Users can deactivate their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = posted_by)
  WITH CHECK (auth.uid() = posted_by);

-- Also ensure the SELECT policy allows users to see their own jobs
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Users can view active jobs and their own jobs" ON public.jobs
  FOR SELECT USING (is_active = true OR auth.uid() = posted_by);
