import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { bandToComparable120 } from '../src/types/toefl';

describe('TOEFL Domain Model & Migration Validation Suite', () => {
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260901100000_toefl_domain_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  it('verifies migration file exists and contains all required TOEFL tables', () => {
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.test_versions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.sections');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.modules');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.content_items');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.content_assets');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.question_options');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.rubrics');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.attempt_sections');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.responses');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.evaluations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.score_reports');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.skills');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.response_skills');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.recommendations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.study_plans');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.content_tags');
  });

  it('verifies additive column extensions on existing attempts table', () => {
    expect(sql).toContain('ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS test_version_id');
    expect(sql).toContain('ALTER TABLE public.attempts ADD COLUMN IF NOT EXISTS exam_mode');
  });

  it('verifies RLS enabled on all newly created tables', () => {
    const tables = [
      'test_versions',
      'sections',
      'modules',
      'content_items',
      'content_assets',
      'question_options',
      'rubrics',
      'attempt_sections',
      'responses',
      'evaluations',
      'score_reports',
      'skills',
      'response_skills',
      'recommendations',
      'study_plans',
      'content_tags',
    ];
    for (const table of tables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it('verifies immutability trigger definition for published test_versions', () => {
    expect(sql).toContain('check_test_version_immutability');
    expect(sql).toContain('CREATE TRIGGER trg_test_version_immutability');
  });

  it('verifies all 12 TOEFL 2026 item types are defined in toefl_item_type enum', () => {
    const itemTypes = [
      'complete_words',
      'read_daily_life',
      'read_academic',
      'listen_choose_response',
      'listen_conversation',
      'listen_announcement',
      'listen_academic_talk',
      'build_sentence',
      'write_email',
      'academic_discussion',
      'listen_repeat',
      'take_interview',
    ];
    for (const type of itemTypes) {
      expect(sql).toContain(`'${type}'`);
    }
  });

  it('verifies score conversion helper bandToComparable120 maps 1-6 scale to 0-120 accurately', () => {
    expect(bandToComparable120(6.0)).toBe(120);
    expect(bandToComparable120(5.5)).toBe(110);
    expect(bandToComparable120(5.0)).toBe(100);
    expect(bandToComparable120(4.5)).toBe(88);
    expect(bandToComparable120(4.0)).toBe(72);
    expect(bandToComparable120(3.5)).toBe(57);
    expect(bandToComparable120(3.0)).toBe(42);
    expect(bandToComparable120(2.5)).toBe(27);
    expect(bandToComparable120(2.0)).toBe(15);
    expect(bandToComparable120(1.5)).toBe(8);
    expect(bandToComparable120(1.0)).toBe(0);
  });
});
