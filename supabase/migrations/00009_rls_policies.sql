-- Migration: 00009_rls_policies
-- Description: Row Level Security policies for all tables
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: All previous migrations
-- Rollback: See individual DROP POLICY statements

-- ============================================================
-- Helper: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION is_admin IS 'Check if authenticated user has admin role — used in RLS policies';

-- ============================================================
-- Enable RLS on ALL tables
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_split_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES — users manage own (CANNOT change role), admin full access
-- ============================================================
CREATE POLICY "profiles_own_select" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_own_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CRITICAL: WITH CHECK prevents user from changing their own role
CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- ============================================================
-- DNA PROFILES — users manage own
-- ============================================================
CREATE POLICY "dna_own_select" ON dna_profiles
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "dna_own_insert" ON dna_profiles
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "dna_own_update" ON dna_profiles
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
-- NOTE: Public DNA sharing is handled via API Route /api/og/dna/[userId]
-- with service_role key, NOT via direct client query. This prevents
-- enumeration of profile_ids. No public SELECT policy needed.

-- ============================================================
-- QUIZ RESPONSES — users manage own
-- ============================================================
CREATE POLICY "quiz_own_all" ON quiz_responses
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================
-- DNA HISTORY — users read own
-- ============================================================
CREATE POLICY "dna_history_own_select" ON dna_history
  FOR SELECT USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "dna_history_admin_all" ON dna_history
  FOR ALL USING (is_admin());

-- ============================================================
-- DESTINATIONS — everyone reads active, admin manages all
-- ============================================================
CREATE POLICY "destinations_public_select" ON destinations
  FOR SELECT USING (is_active = true);
CREATE POLICY "destinations_admin_all" ON destinations
  FOR ALL USING (is_admin());

-- ============================================================
-- DESTINATION SCORES — everyone reads, admin manages
-- ============================================================
CREATE POLICY "dest_scores_public_select" ON destination_scores
  FOR SELECT USING (TRUE);
CREATE POLICY "dest_scores_admin_all" ON destination_scores
  FOR ALL USING (is_admin());

-- ============================================================
-- DESTINATION WEATHER — everyone reads, admin manages
-- ============================================================
CREATE POLICY "dest_weather_public_select" ON destination_weather
  FOR SELECT USING (TRUE);
CREATE POLICY "dest_weather_admin_all" ON destination_weather
  FOR ALL USING (is_admin());

-- ============================================================
-- DESTINATION REQUIREMENTS — everyone reads, admin manages
-- ============================================================
CREATE POLICY "dest_req_public_select" ON destination_requirements
  FOR SELECT USING (TRUE);
CREATE POLICY "dest_req_admin_all" ON destination_requirements
  FOR ALL USING (is_admin());

-- ============================================================
-- PARTNERS — everyone reads curated+active, admin manages all
-- ============================================================
CREATE POLICY "partners_public_select" ON partners
  FOR SELECT USING (is_curated = true AND contract_status = 'active');
CREATE POLICY "partners_admin_all" ON partners
  FOR ALL USING (is_admin());

-- ============================================================
-- PACKAGES — users manage own, admin reads all
-- ============================================================
CREATE POLICY "packages_own_all" ON packages
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "packages_admin_select" ON packages
  FOR SELECT USING (is_admin());

-- ============================================================
-- PACKAGE ITEMS — via package ownership
-- ============================================================
CREATE POLICY "pkg_items_own_select" ON package_items
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );
CREATE POLICY "pkg_items_own_update" ON package_items
  FOR UPDATE USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );
CREATE POLICY "pkg_items_own_delete" ON package_items
  FOR DELETE USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );
-- H1 FIX: Allow users to insert items into their own draft packages
CREATE POLICY "pkg_items_own_insert" ON package_items
  FOR INSERT WITH CHECK (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
        AND p.status = 'draft'  -- Only draft packages can be modified
    )
  );
CREATE POLICY "pkg_items_admin_all" ON package_items
  FOR ALL USING (is_admin());

-- ============================================================
-- PACKAGE CHECKLIST — via package ownership
-- ============================================================
CREATE POLICY "pkg_checklist_own_all" ON package_checklist_items
  FOR ALL USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );
CREATE POLICY "pkg_checklist_admin_all" ON package_checklist_items
  FOR ALL USING (is_admin());

-- ============================================================
-- PAYMENTS — users read own, admin reads all
-- ============================================================
CREATE POLICY "payments_own_select" ON package_payments
  FOR SELECT USING (
    package_id IN (
      SELECT p.id FROM packages p
      JOIN profiles pr ON p.profile_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  );
CREATE POLICY "payments_admin_all" ON package_payments
  FOR ALL USING (is_admin());

-- ============================================================
-- PAYMENT SPLIT ITEMS — admin only
-- ============================================================
CREATE POLICY "split_admin_all" ON payment_split_items
  FOR ALL USING (is_admin());

-- ============================================================
-- RECOMMENDATION CACHE — users read own
-- ============================================================
CREATE POLICY "rec_cache_own_all" ON recommendation_cache
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================
-- REVIEWS — users manage own, public reads
-- ============================================================
CREATE POLICY "reviews_public_select" ON reviews
  FOR SELECT USING (TRUE);
CREATE POLICY "reviews_own_insert" ON reviews
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "reviews_own_update" ON reviews
  FOR UPDATE USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
