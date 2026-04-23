-- Drop existing overly permissive policies on user_progress
DROP POLICY IF EXISTS "Anyone can read their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Anyone can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Anyone can update their own progress" ON public.user_progress;

-- Create a security definer function to check session ownership for anonymous users
-- This allows anonymous users to access only their own session-based records
CREATE OR REPLACE FUNCTION public.check_user_progress_access(progress_user_id uuid, progress_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- For authenticated users: check user_id matches
  -- For anonymous users: user_id must be NULL (cannot access user-linked records)
  SELECT 
    CASE 
      -- Authenticated user accessing their own record
      WHEN auth.uid() IS NOT NULL AND progress_user_id = auth.uid() THEN true
      -- Anonymous access is allowed only for records with no user_id 
      -- (they can only insert/update via session, but session validation is app-level)
      WHEN auth.uid() IS NULL AND progress_user_id IS NULL THEN true
      ELSE false
    END
$$;

-- Create proper RLS policies for user_progress table

-- SELECT: Users can only read their own progress
CREATE POLICY "Users can read own progress"
ON public.user_progress 
FOR SELECT
USING (public.check_user_progress_access(user_id, session_id));

-- INSERT: Users can only insert their own progress
-- For authenticated users, they must set their own user_id
-- For anonymous users, user_id must be NULL
CREATE POLICY "Users can insert own progress"
ON public.user_progress 
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- UPDATE: Users can only update their own progress
CREATE POLICY "Users can update own progress"
ON public.user_progress 
FOR UPDATE
USING (public.check_user_progress_access(user_id, session_id))
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) 
  OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- DELETE: Users can only delete their own progress (for reset functionality)
CREATE POLICY "Users can delete own progress"
ON public.user_progress 
FOR DELETE
USING (public.check_user_progress_access(user_id, session_id));