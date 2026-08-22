-- Stop auto-assigning a role to every new auth user.
--
-- The on_auth_user_created trigger inserted a 'student' role for ANY new
-- auth.users row, which meant a first-time Google OAuth identity instantly
-- became a full student account on login — bypassing signup (role choice and
-- details) entirely. Roles must only be assigned when signup is completed:
-- completeRegistrationWithPassword (email+OTP flow) or
-- completeGoogleRegistration (Google continuation flow), both of which use the
-- service role. The profile bootstrap in the trigger is harmless and stays.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, institution, year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- No automatic role assignment: new users complete signup to obtain a role.

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
