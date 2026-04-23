-- Drop and recreate the INSERT policy to allow anonymous users with session_id
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;

CREATE POLICY "Users can insert own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (
  -- Authenticated users can only insert their own records
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Anonymous users can insert records with NULL user_id and any session_id
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);

-- Also fix the UPDATE policy for anonymous users
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

CREATE POLICY "Users can update own progress" 
ON public.user_progress 
FOR UPDATE 
USING (check_user_progress_access(user_id, session_id))
WITH CHECK (
  -- Authenticated users can only update their own records
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  -- Anonymous users can update records with matching session_id
  (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
);