export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: Database["public"]["Enums"]["notification_type"];
          is_read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          is_read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      attempt_answers: {
        Row: {
          manual_feedback: string | null;
          manual_score: number | null;
          attempt_id: string;
          feedback: string | null;
          flagged: boolean;
          id: string;
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
          manual_feedback?: string | null;
          manual_score?: number | null;
          attempt_id: string;
          feedback?: string | null;
          flagged?: boolean;
          id?: string;
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
          manual_feedback?: string | null;
          manual_score?: number | null;
          attempt_id?: string;
          feedback?: string | null;
          flagged?: boolean;
          id?: string;
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
      attempts: {
        Row: {
          axes: Json | null;
          blur_count: number;
          completed_at: string | null;
          id: string;
          score: number | null;
          started_at: string;
          status: Database["public"]["Enums"]["attempt_status"];
          student_id: string;
          test_id: string;
        };
        Insert: {
          axes?: Json | null;
          blur_count?: number;
          completed_at?: string | null;
          id?: string;
          score?: number | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["attempt_status"];
          student_id: string;
          test_id: string;
        };
        Update: {
          axes?: Json | null;
          blur_count?: number;
          completed_at?: string | null;
          id?: string;
          score?: number | null;
          started_at?: string;
          status?: Database["public"]["Enums"]["attempt_status"];
          student_id?: string;
          test_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attempts_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          branch: string | null;
          code_number: string | null;
          subject: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          institution: string;
          onboarded: boolean;
          year: string;
        };
        Insert: {
          branch?: string | null;
          code_number?: string | null;
          subject?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          institution?: string;
          onboarded?: boolean;
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
          year?: string;
        };
        Relationships: [];
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
      tests: {
        Row: {
          is_practice: boolean;
          category: string;
          code: string | null;
          created_at: string;
          difficulty: string;
          expires_at: string | null;
          id: string;
          name: string;
          owner_id: string;
          question_count: number;
          response_seconds: number;
          seconds_per_question: number;
          status: Database["public"]["Enums"]["test_status"];
        };
        Insert: {
          is_practice?: boolean;
          category: string;
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          expires_at?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          question_count?: number;
          response_seconds?: number;
          seconds_per_question?: number;
          status?: Database["public"]["Enums"]["test_status"];
        };
        Update: {
          is_practice?: boolean;
          category?: string;
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          expires_at?: string | null;
          id?: string;
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "student";
      attempt_status: "in_progress" | "evaluating" | "evaluated";
      test_status: "draft" | "active" | "completed";
      notification_type: "system" | "alert" | "message" | "evaluation";
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
  public: {
    Enums: {
      app_role: ["admin", "student"],
      attempt_status: ["in_progress", "evaluating", "evaluated"],
      test_status: ["draft", "active", "completed"],
    },
  },
} as const;
