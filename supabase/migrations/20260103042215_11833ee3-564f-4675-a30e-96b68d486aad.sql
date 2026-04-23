-- Create user_progress table to store student progress
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  completed_levels INTEGER[] NOT NULL DEFAULT '{}',
  earned_badges TEXT[] NOT NULL DEFAULT '{}',
  quiz_scores JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies - allow anyone to read/write their own progress by session_id
CREATE POLICY "Anyone can read their own progress" 
ON public.user_progress 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert their own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own progress" 
ON public.user_progress 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_progress_updated_at();