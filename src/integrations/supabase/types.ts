export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string;
          feedback: string | null;
          flagged: boolean;
          id: string;
          manual_feedback: string | null;
          manual_score: number | null;
          missed_concepts: string[];
          missed_constraints: string[];
          position: number;
          question_id: string;
          response: string;
          revealed_at: string | null;
          score: number | null;
          submitted_at: string | null;
        };
        Insert: {
          attempt_id: string;
          feedback?: string | null;
          flagged?: boolean;
          id?: string;
          manual_feedback?: string | null;
          manual_score?: number | null;
          missed_concepts?: string[];
          missed_constraints?: string[];
          position?: number;
          question_id: string;
          response?: string;
          revealed_at?: string | null;
          score?: number | null;
          submitted_at?: string | null;
        };
        Update: {
          attempt_id?: string;
          feedback?: string | null;
          flagged?: boolean;
          id?: string;
          manual_feedback?: string | null;
          manual_score?: number | null;
          missed_concepts?: string[];
          missed_constraints?: string[];
          position?: number;
          question_id?: string;
          response?: string;
          revealed_at?: string | null;
          score?: number | null;
          submitted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      attempt_sections: {
        Row: {
          attempt_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          metrics: Json;
          raw_score: number | null;
          section_band: number | null;
          section_id: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["toefl_attempt_section_status"];
          time_spent_seconds: number | null;
        };
        Insert: {
          attempt_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          metrics?: Json;
          raw_score?: number | null;
          section_band?: number | null;
          section_id: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["toefl_attempt_section_status"];
          time_spent_seconds?: number | null;
        };
        Update: {
          attempt_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          metrics?: Json;
          raw_score?: number | null;
          section_band?: number | null;
          section_id?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["toefl_attempt_section_status"];
          time_spent_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "attempt_sections_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempt_sections_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      attempts: {
        Row: {
          axes: Json | null;
          blur_count: number;
          completed_at: string | null;
          evaluation_status: string;
          exam_mode: Database["public"]["Enums"]["toefl_exam_mode"] | null;
          id: string;
          score: number | null;
          selected_section_type: Database["public"]["Enums"]["toefl_section_type"] | null;
          started_at: string;
          status: Database["public"]["Enums"]["attempt_status"];
          student_id: string;
          test_id: string;
          test_version_id: string | null;
        };
        Insert: {
          axes?: Json | null;
          blur_count?: number;
          completed_at?: string | null;
          evaluation_status?: string;
          exam_mode?: Database["public"]["Enums"]["toefl_exam_mode"] | null;
          id?: string;
          score?: number | null;
          selected_section_type?: Database["public"]["Enums"]["toefl_section_type"] | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["attempt_status"];
          student_id: string;
          test_id: string;
          test_version_id?: string | null;
        };
        Update: {
          axes?: Json | null;
          blur_count?: number;
          completed_at?: string | null;
          evaluation_status?: string;
          exam_mode?: Database["public"]["Enums"]["toefl_exam_mode"] | null;
          id?: string;
          score?: number | null;
          selected_section_type?: Database["public"]["Enums"]["toefl_section_type"] | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["attempt_status"];
          student_id?: string;
          test_id?: string;
          test_version_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attempts_test_version_id_fkey";
            columns: ["test_version_id"];
            isOneToOne: false;
            referencedRelation: "test_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      content_assets: {
        Row: {
          asset_type: string;
          checksum: string | null;
          content_item_id: string | null;
          created_at: string;
          duration_ms: number | null;
          id: string;
          metadata: Json;
          mime_type: string;
          storage_path: string;
        };
        Insert: {
          asset_type: string;
          checksum?: string | null;
          content_item_id?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          metadata?: Json;
          mime_type: string;
          storage_path: string;
        };
        Update: {
          asset_type?: string;
          checksum?: string | null;
          content_item_id?: string | null;
          created_at?: string;
          duration_ms?: number | null;
          id?: string;
          metadata?: Json;
          mime_type?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_assets_content_item_id_fkey";
            columns: ["content_item_id"];
            isOneToOne: false;
            referencedRelation: "content_items";
            referencedColumns: ["id"];
          },
        ];
      };
      content_items: {
        Row: {
          created_at: string;
          difficulty: string;
          id: string;
          item_order: number;
          item_type: Database["public"]["Enums"]["toefl_item_type"];
          module_id: string | null;
          payload: Json;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
          skill_tags: string[];
        };
        Insert: {
          created_at?: string;
          difficulty?: string;
          id?: string;
          item_order?: number;
          item_type: Database["public"]["Enums"]["toefl_item_type"];
          module_id?: string | null;
          payload?: Json;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
          skill_tags?: string[];
        };
        Update: {
          created_at?: string;
          difficulty?: string;
          id?: string;
          item_order?: number;
          item_type?: Database["public"]["Enums"]["toefl_item_type"];
          module_id?: string | null;
          payload?: Json;
          section_type?: Database["public"]["Enums"]["toefl_section_type"];
          skill_tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "content_items_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "modules";
            referencedColumns: ["id"];
          },
        ];
      };
      content_tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          tag_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          tag_type?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          tag_type?: string;
        };
        Relationships: [];
      };
      email_verifications: {
        Row: {
          attempts_count: number;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          max_attempts: number;
          otp_hash: string;
          resend_available_at: string;
          used: boolean;
          used_at: string | null;
          verification_token_hash: string | null;
          verified: boolean;
          verified_at: string | null;
        };
        Insert: {
          attempts_count?: number;
          created_at?: string;
          email: string;
          expires_at: string;
          id?: string;
          max_attempts?: number;
          otp_hash: string;
          resend_available_at: string;
          used?: boolean;
          used_at?: string | null;
          verification_token_hash?: string | null;
          verified?: boolean;
          verified_at?: string | null;
        };
        Update: {
          attempts_count?: number;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          max_attempts?: number;
          otp_hash?: string;
          resend_available_at?: string;
          used?: boolean;
          used_at?: string | null;
          verification_token_hash?: string | null;
          verified?: boolean;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      evaluations: {
        Row: {
          confidence: number | null;
          corrections: Json;
          evaluated_at: string;
          id: string;
          issues: string[];
          model_id: string;
          next_actions: string[];
          prompt_version: string;
          response_hash: string | null;
          response_id: string;
          rubric_id: string | null;
          rubric_version: string;
          score_band: number;
          strengths: string[];
          task_score: number;
          traits: Json;
        };
        Insert: {
          confidence?: number | null;
          corrections?: Json;
          evaluated_at?: string;
          id?: string;
          issues?: string[];
          model_id?: string;
          next_actions?: string[];
          prompt_version?: string;
          response_hash?: string | null;
          response_id: string;
          rubric_id?: string | null;
          rubric_version?: string;
          score_band?: number;
          strengths?: string[];
          task_score?: number;
          traits?: Json;
        };
        Update: {
          confidence?: number | null;
          corrections?: Json;
          evaluated_at?: string;
          id?: string;
          issues?: string[];
          model_id?: string;
          next_actions?: string[];
          prompt_version?: string;
          response_hash?: string | null;
          response_id?: string;
          rubric_id?: string | null;
          rubric_version?: string;
          score_band?: number;
          strengths?: string[];
          task_score?: number;
          traits?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_response_id_fkey";
            columns: ["response_id"];
            isOneToOne: false;
            referencedRelation: "responses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluations_rubric_id_fkey";
            columns: ["rubric_id"];
            isOneToOne: false;
            referencedRelation: "rubrics";
            referencedColumns: ["id"];
          },
        ];
      };
      modules: {
        Row: {
          created_at: string;
          difficulty_band: Database["public"]["Enums"]["toefl_difficulty_band"];
          id: string;
          module_order: number;
          routing_rule: Json;
          section_id: string;
          stage_index: number;
        };
        Insert: {
          created_at?: string;
          difficulty_band?: Database["public"]["Enums"]["toefl_difficulty_band"];
          id?: string;
          module_order?: number;
          routing_rule?: Json;
          section_id: string;
          stage_index?: number;
        };
        Update: {
          created_at?: string;
          difficulty_band?: Database["public"]["Enums"]["toefl_difficulty_band"];
          id?: string;
          module_order?: number;
          routing_rule?: Json;
          section_id?: string;
          stage_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "modules_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          link: string | null;
          message: string;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message: string;
          title: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message?: string;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          branch: string | null;
          code_number: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          institution: string;
          onboarded: boolean;
          subject: string | null;
          year: string;
        };
        Insert: {
          branch?: string | null;
          code_number?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          institution?: string;
          onboarded?: boolean;
          subject?: string | null;
          year?: string;
        };
        Update: {
          branch?: string | null;
          code_number?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          institution?: string;
          onboarded?: boolean;
          subject?: string | null;
          year?: string;
        };
        Relationships: [];
      };
      question_options: {
        Row: {
          content_item_id: string;
          created_at: string;
          distractor_rationale: string | null;
          id: string;
          is_correct: boolean;
          option_key: string;
          option_order: number;
          option_text: string;
        };
        Insert: {
          content_item_id: string;
          created_at?: string;
          distractor_rationale?: string | null;
          id?: string;
          is_correct?: boolean;
          option_key: string;
          option_order?: number;
          option_text: string;
        };
        Update: {
          content_item_id?: string;
          created_at?: string;
          distractor_rationale?: string | null;
          id?: string;
          is_correct?: boolean;
          option_key?: string;
          option_order?: number;
          option_text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_options_content_item_id_fkey";
            columns: ["content_item_id"];
            isOneToOne: false;
            referencedRelation: "content_items";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          approved: boolean;
          category: string;
          concepts: string[];
          constraints: string[];
          created_at: string;
          difficulty: string;
          id: string;
          position: number;
          reference_answer: string;
          test_id: string;
          text: string;
          topic: string;
        };
        Insert: {
          approved?: boolean;
          category: string;
          concepts?: string[];
          constraints?: string[];
          created_at?: string;
          difficulty?: string;
          id?: string;
          position?: number;
          reference_answer?: string;
          test_id: string;
          text: string;
          topic?: string;
        };
        Update: {
          approved?: boolean;
          category?: string;
          concepts?: string[];
          constraints?: string[];
          created_at?: string;
          difficulty?: string;
          id?: string;
          position?: number;
          reference_answer?: string;
          test_id?: string;
          text?: string;
          topic?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      recommendations: {
        Row: {
          created_at: string;
          id: string;
          is_completed: boolean;
          priority: number;
          reason: string;
          skill_id: string | null;
          student_id: string;
          target_item_ids: string[];
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          priority?: number;
          reason: string;
          skill_id?: string | null;
          student_id: string;
          target_item_ids?: string[];
        };
        Update: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          priority?: number;
          reason?: string;
          skill_id?: string | null;
          student_id?: string;
          target_item_ids?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      response_skills: {
        Row: {
          created_at: string;
          id: string;
          is_proficient: boolean;
          response_id: string;
          score: number | null;
          skill_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_proficient?: boolean;
          response_id: string;
          score?: number | null;
          skill_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_proficient?: boolean;
          response_id?: string;
          score?: number | null;
          skill_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "response_skills_response_id_fkey";
            columns: ["response_id"];
            isOneToOne: false;
            referencedRelation: "responses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "response_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      responses: {
        Row: {
          answered_at: string;
          attempt_section_id: string;
          content_item_id: string;
          flagged: boolean | null;
          id: string;
          is_correct: boolean | null;
          normalized_answer: Json;
          raw_answer: string | null;
          score: number | null;
          student_id: string;
          time_spent_ms: number | null;
        };
        Insert: {
          answered_at?: string;
          attempt_section_id: string;
          content_item_id: string;
          flagged?: boolean | null;
          id?: string;
          is_correct?: boolean | null;
          normalized_answer?: Json;
          raw_answer?: string | null;
          score?: number | null;
          student_id: string;
          time_spent_ms?: number | null;
        };
        Update: {
          answered_at?: string;
          attempt_section_id?: string;
          content_item_id?: string;
          flagged?: boolean | null;
          id?: string;
          is_correct?: boolean | null;
          normalized_answer?: Json;
          raw_answer?: string | null;
          score?: number | null;
          student_id?: string;
          time_spent_ms?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "responses_attempt_section_id_fkey";
            columns: ["attempt_section_id"];
            isOneToOne: false;
            referencedRelation: "attempt_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_content_item_id_fkey";
            columns: ["content_item_id"];
            isOneToOne: false;
            referencedRelation: "content_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      rubrics: {
        Row: {
          band_descriptors: Json;
          created_at: string;
          id: string;
          rubric_version: string;
          task_type: Database["public"]["Enums"]["toefl_item_type"];
          title: string;
          traits: Json;
        };
        Insert: {
          band_descriptors?: Json;
          created_at?: string;
          id?: string;
          rubric_version?: string;
          task_type: Database["public"]["Enums"]["toefl_item_type"];
          title: string;
          traits?: Json;
        };
        Update: {
          band_descriptors?: Json;
          created_at?: string;
          id?: string;
          rubric_version?: string;
          task_type?: Database["public"]["Enums"]["toefl_item_type"];
          title?: string;
          traits?: Json;
        };
        Relationships: [];
      };
      score_reports: {
        Row: {
          attempt_id: string;
          comparable_score: number;
          generated_at: string;
          id: string;
          listening_band: number;
          overall_band: number;
          reading_band: number;
          skill_breakdown: Json;
          speaking_band: number;
          student_id: string;
          summary: string | null;
          target_gap: number | null;
          target_score: number | null;
          writing_band: number;
        };
        Insert: {
          attempt_id: string;
          comparable_score?: number;
          generated_at?: string;
          id?: string;
          listening_band?: number;
          overall_band?: number;
          reading_band?: number;
          skill_breakdown?: Json;
          speaking_band?: number;
          student_id: string;
          summary?: string | null;
          target_gap?: number | null;
          target_score?: number | null;
          writing_band?: number;
        };
        Update: {
          attempt_id?: string;
          comparable_score?: number;
          generated_at?: string;
          id?: string;
          listening_band?: number;
          overall_band?: number;
          reading_band?: number;
          skill_breakdown?: Json;
          speaking_band?: number;
          student_id?: string;
          summary?: string | null;
          target_gap?: number | null;
          target_score?: number | null;
          writing_band?: number;
        };
        Relationships: [
          {
            foreignKeyName: "score_reports_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: true;
            referencedRelation: "attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "score_reports_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sections: {
        Row: {
          config: Json;
          created_at: string;
          id: string;
          instructions: string;
          section_order: number;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
          test_version_id: string;
          timing_seconds: number;
        };
        Insert: {
          config?: Json;
          created_at?: string;
          id?: string;
          instructions?: string;
          section_order?: number;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
          test_version_id: string;
          timing_seconds?: number;
        };
        Update: {
          config?: Json;
          created_at?: string;
          id?: string;
          instructions?: string;
          section_order?: number;
          section_type?: Database["public"]["Enums"]["toefl_section_type"];
          test_version_id?: string;
          timing_seconds?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sections_test_version_id_fkey";
            columns: ["test_version_id"];
            isOneToOne: false;
            referencedRelation: "test_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
        };
        Insert: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          section_type: Database["public"]["Enums"]["toefl_section_type"];
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          section_type?: Database["public"]["Enums"]["toefl_section_type"];
        };
        Relationships: [
          {
            foreignKeyName: "skills_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      study_plans: {
        Row: {
          created_at: string;
          current_estimated_band: number | null;
          id: string;
          milestones: Json;
          plan_config: Json;
          student_id: string;
          target_date: string | null;
          target_overall_band: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_estimated_band?: number | null;
          id?: string;
          milestones?: Json;
          plan_config?: Json;
          student_id: string;
          target_date?: string | null;
          target_overall_band?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_estimated_band?: number | null;
          id?: string;
          milestones?: Json;
          plan_config?: Json;
          student_id?: string;
          target_date?: string | null;
          target_overall_band?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_plans_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      test_versions: {
        Row: {
          blueprint_version: string;
          config: Json;
          created_at: string;
          created_by: string | null;
          id: string;
          published_at: string | null;
          scoring_config: Json;
          scoring_version: string;
          status: Database["public"]["Enums"]["toefl_blueprint_status"];
          test_id: string | null;
          updated_at: string;
        };
        Insert: {
          blueprint_version?: string;
          config?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published_at?: string | null;
          scoring_config?: Json;
          scoring_version?: string;
          status?: Database["public"]["Enums"]["toefl_blueprint_status"];
          test_id?: string | null;
          updated_at?: string;
        };
        Update: {
          blueprint_version?: string;
          config?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published_at?: string | null;
          scoring_config?: Json;
          scoring_version?: string;
          status?: Database["public"]["Enums"]["toefl_blueprint_status"];
          test_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "test_versions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "test_versions_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      tests: {
        Row: {
          category: string;
          code: string | null;
          created_at: string;
          difficulty: string;
          expires_at: string | null;
          id: string;
          is_practice: boolean;
          name: string;
          owner_id: string;
          question_count: number;
          response_seconds: number;
          seconds_per_question: number;
          status: Database["public"]["Enums"]["test_status"];
        };
        Insert: {
          category: string;
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          expires_at?: string | null;
          id?: string;
          is_practice?: boolean;
          name: string;
          owner_id: string;
          question_count?: number;
          response_seconds?: number;
          seconds_per_question?: number;
          status?: Database["public"]["Enums"]["test_status"];
        };
        Update: {
          category?: string;
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          expires_at?: string | null;
          id?: string;
          is_practice?: boolean;
          name?: string;
          owner_id?: string;
          question_count?: number;
          response_seconds?: number;
          seconds_per_question?: number;
          status?: Database["public"]["Enums"]["test_status"];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      advance_attempt_section: {
        Args: {
          p_attempt_id: string;
          p_current_section_index: number;
          p_student_id: string;
        };
        Returns: Json;
      };
      has_attempt_on_test: {
        Args: { _test_id: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin_or_instructor: { Args: { user_id: string }; Returns: boolean };
      owns_attempt: {
        Args: { _attempt_id: string; _user_id: string };
        Returns: boolean;
      };
      owns_attempt_test: {
        Args: { _attempt_id: string; _user_id: string };
        Returns: boolean;
      };
      owns_test: {
        Args: { _test_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "student";
      attempt_status: "in_progress" | "evaluating" | "evaluated";
      notification_type: "system" | "alert" | "message" | "evaluation";
      test_status: "draft" | "active" | "completed";
      toefl_attempt_section_status: "not_started" | "in_progress" | "completed" | "skipped";
      toefl_blueprint_status: "draft" | "review" | "published" | "retired";
      toefl_difficulty_band: "lower" | "middle" | "upper";
      toefl_exam_mode: "full" | "section" | "practice" | "diagnostic";
      toefl_item_type:
        | "complete_words"
        | "read_daily_life"
        | "read_academic"
        | "listen_choose_response"
        | "listen_conversation"
        | "listen_announcement"
        | "listen_academic_talk"
        | "build_sentence"
        | "write_email"
        | "academic_discussion"
        | "listen_repeat"
        | "take_interview";
      toefl_section_type: "reading" | "listening" | "writing" | "speaking";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "student"],
      attempt_status: ["in_progress", "evaluating", "evaluated"],
      notification_type: ["system", "alert", "message", "evaluation"],
      test_status: ["draft", "active", "completed"],
      toefl_attempt_section_status: ["not_started", "in_progress", "completed", "skipped"],
      toefl_blueprint_status: ["draft", "review", "published", "retired"],
      toefl_difficulty_band: ["lower", "middle", "upper"],
      toefl_exam_mode: ["full", "section", "practice", "diagnostic"],
      toefl_item_type: [
        "complete_words",
        "read_daily_life",
        "read_academic",
        "listen_choose_response",
        "listen_conversation",
        "listen_announcement",
        "listen_academic_talk",
        "build_sentence",
        "write_email",
        "academic_discussion",
        "listen_repeat",
        "take_interview",
      ],
      toefl_section_type: ["reading", "listening", "writing", "speaking"],
    },
  },
} as const;
