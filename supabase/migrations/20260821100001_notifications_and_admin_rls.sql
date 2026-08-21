
-- Add missing RLS policy for admins to view attempt answers for their tests
CREATE POLICY "Admins can view attempt answers for their tests" ON attempt_answers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM attempts
      JOIN tests ON tests.id = attempts.test_id
      WHERE attempts.id = attempt_id
      AND tests.owner_id = auth.uid()
    )
  );

-- Create Notifications System
CREATE TYPE public.notification_type AS ENUM ('system', 'alert', 'message', 'evaluation');

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'system',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

