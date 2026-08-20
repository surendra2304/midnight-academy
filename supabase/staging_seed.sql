-- ============================================================================
-- MIDNIGHT ACADEMY: STAGING SEED DATA PROCEDURE
-- ============================================================================
-- IMPORTANT:
-- In Supabase, auth.users must be created via Supabase Auth (Sign Up) so password
-- hashes are properly salted. 
--
-- After creating your Admin and Student accounts via the UI (/auth), run the SQL
-- below in your Supabase SQL Editor to link their roles and seed an active test:
-- ============================================================================

-- 1. Elevate your admin user (replace with your admin email):
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@midnight.academy'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Ensure student role for your student user (replace with your student email):
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'student'::public.app_role
FROM auth.users
WHERE email = 'student@midnight.academy'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Seed an active test owned by the admin user:
DO $$
DECLARE
  v_admin_id uuid;
  v_test_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@midnight.academy' LIMIT 1;
  
  IF v_admin_id IS NOT NULL THEN
    -- Insert active test
    INSERT INTO public.tests (
      id,
      owner_id,
      name,
      category,
      difficulty,
      question_count,
      seconds_per_question,
      response_seconds,
      status,
      code
    )
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      v_admin_id,
      'DSA & Arrays Technical Comprehension',
      'DSA',
      'Medium',
      3,
      45,
      180,
      'active',
      'DSA-X7K29'
    )
    ON CONFLICT (id) DO UPDATE SET
      status = 'active',
      code = 'DSA-X7K29';

    v_test_id := 'a0000000-0000-0000-0000-000000000001';

    -- Question 1
    INSERT INTO public.questions (
      id,
      test_id,
      position,
      text,
      category,
      topic,
      difficulty,
      concepts,
      constraints,
      reference_answer,
      approved
    )
    VALUES (
      'b0000000-0000-0000-0000-000000000001',
      v_test_id,
      0,
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      'DSA',
      'Arrays & Hash Maps',
      'Easy',
      ARRAY['Two Sum', 'Hash Map lookup', '1-pass complement'],
      ARRAY['Exactly one valid answer', 'Cannot use same element twice', 'Return 0-indexed indices'],
      'The goal is to find two distinct indices in nums whose values sum to target. We use a hash map to look up the complement in O(1) time while iterating through the array once in O(N) total time.',
      true
    )
    ON CONFLICT (id) DO NOTHING;

    -- Question 2
    INSERT INTO public.questions (
      id,
      test_id,
      position,
      text,
      category,
      topic,
      difficulty,
      concepts,
      constraints,
      reference_answer,
      approved
    )
    VALUES (
      'b0000000-0000-0000-0000-000000000002',
      v_test_id,
      1,
      'Given an integer array nums, find a subarray that has the largest product, and return the product. The test cases are generated so that the answer will fit in a 32-bit integer. A subarray is a contiguous non-empty sequence of elements.',
      'DSA',
      'Dynamic Programming',
      'Medium',
      ARRAY['Maximum Product Subarray', 'Contiguous sequence', 'Tracking min and max'],
      ARRAY['Contiguous subarray required', 'Array can contain negative numbers and zeros', 'Result fits in 32-bit integer'],
      'The problem asks for the maximum product achievable from any contiguous non-empty subarray in nums. Because multiplying by a negative number turns a minimum product into a maximum, we must maintain both running minimum and maximum products at each step in O(N) time.',
      true
    )
    ON CONFLICT (id) DO NOTHING;

    -- Question 3
    INSERT INTO public.questions (
      id,
      test_id,
      position,
      text,
      category,
      topic,
      difficulty,
      concepts,
      constraints,
      reference_answer,
      approved
    )
    VALUES (
      'b0000000-0000-0000-0000-000000000003',
      v_test_id,
      2,
      'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Let these two numbers be numbers[index1] and numbers[index2] where 1 <= index1 < index2 <= numbers.length. Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2. Your solution must use only constant extra space.',
      'DSA',
      'Two Pointers',
      'Medium',
      ARRAY['Two Pointers', 'Sorted Array', 'Constant space'],
      ARRAY['O(1) extra space complexity', '1-based indexing output', 'Array is already sorted in non-decreasing order', 'Exactly one solution'],
      'The task requires finding two 1-based indices in a sorted array whose elements sum to target, using strict O(1) auxiliary space. We maintain two pointers starting at the beginning and end of the array, shrinking the search range based on whether the sum is greater or less than the target.',
      true
    )
    ON CONFLICT (id) DO NOTHING;

  END IF;
END $$;
