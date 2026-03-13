-- Admin Seed Script
-- ==================
-- Supabase Auth does not allow creating users via SQL.
-- To create an admin user:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Set email: admin@travelmatch.com.br, password: (your choice)
-- 4. Run the SQL below to promote the user to admin role
--
-- Replace 'admin@travelmatch.com.br' with the actual admin email.

UPDATE profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users
  WHERE email = 'admin@travelmatch.com.br'
  LIMIT 1
);
