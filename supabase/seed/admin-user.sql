-- Seed: Admin user setup
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Note: Run AFTER a user has signed up via Supabase Auth.
-- Replace the email below with the actual admin user email.

-- Promote first admin user by email
UPDATE profiles
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@travelmatch.com.br'
  LIMIT 1
);

-- Verify
-- SELECT p.full_name, p.role, u.email
-- FROM profiles p
-- JOIN auth.users u ON p.user_id = u.id
-- WHERE p.role = 'admin';
