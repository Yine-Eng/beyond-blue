export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          class_year: number
          created_at: string
          graduation_date: string
          id: string
          is_default: boolean
          is_demo: boolean
          name: string
          owner_id: string | null
          time_zone: string
        }
        Insert: {
          class_year: number
          created_at?: string
          graduation_date: string
          id?: string
          is_default?: boolean
          is_demo?: boolean
          name: string
          owner_id?: string | null
          time_zone?: string
        }
        Update: {
          class_year?: number
          created_at?: string
          graduation_date?: string
          id?: string
          is_default?: boolean
          is_demo?: boolean
          name?: string
          owner_id?: string | null
          time_zone?: string
        }
        Relationships: []
      }
      pathways: {
        Row: {
          id: string
          name: string
          self_description: string
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          self_description: string
          sort_order: number
        }
        Update: {
          id?: string
          name?: string
          self_description?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          class_year: number | null
          cohort_id: string | null
          created_at: string
          destination_role: string | null
          full_name: string | null
          id: string
          is_demo: boolean
          journey_tags: string[]
          last_active_at: string | null
          major: string | null
          onboarded_at: string | null
          preferred_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          school: string
          target_city: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          class_year?: number | null
          cohort_id?: string | null
          created_at?: string
          destination_role?: string | null
          full_name?: string | null
          id: string
          is_demo?: boolean
          journey_tags?: string[]
          last_active_at?: string | null
          major?: string | null
          onboarded_at?: string | null
          preferred_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string
          target_city?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          class_year?: number | null
          cohort_id?: string | null
          created_at?: string
          destination_role?: string | null
          full_name?: string | null
          id?: string
          is_demo?: boolean
          journey_tags?: string[]
          last_active_at?: string | null
          major?: string | null
          onboarded_at?: string | null
          preferred_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school?: string
          target_city?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_areas: {
        Row: {
          id: string
          milestone_day: number
          name: string
          opens_at_day: number
          sort_order: number
        }
        Insert: {
          id: string
          milestone_day: number
          name: string
          opens_at_day: number
          sort_order: number
        }
        Update: {
          id?: string
          milestone_day?: number
          name?: string
          opens_at_day?: number
          sort_order?: number
        }
        Relationships: []
      }
      student_plans: {
        Row: {
          created_at: string
          pathway_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          pathway_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          pathway_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          completed_at: string
          id: string
          output_data: Json | null
          output_path: string | null
          output_type: Database["public"]["Enums"]["output_type"]
          output_url: string | null
          pathway_id_at_completion: string
          shared_with_mentors: boolean
          student_id: string
          task_id: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_at?: string
          id?: string
          output_data?: Json | null
          output_path?: string | null
          output_type: Database["public"]["Enums"]["output_type"]
          output_url?: string | null
          pathway_id_at_completion: string
          shared_with_mentors?: boolean
          student_id: string
          task_id: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_at?: string
          id?: string
          output_data?: Json | null
          output_path?: string | null
          output_type?: Database["public"]["Enums"]["output_type"]
          output_url?: string | null
          pathway_id_at_completion?: string
          shared_with_mentors?: boolean
          student_id?: string
          task_id?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_pathway_id_at_completion_fkey"
            columns: ["pathway_id_at_completion"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accept: string[] | null
          area_id: string
          content_version: number
          due_day_offset: number
          equivalence_key: string | null
          form_id: string | null
          id: string
          is_key_output: boolean
          launch_file_section: string
          output_type: Database["public"]["Enums"]["output_type"]
          pathway_id: string
          slug: string
          sort_order: number
          support: string[]
          title: string
          updated_at: string
          why_it_matters: string
        }
        Insert: {
          accept?: string[] | null
          area_id: string
          content_version?: number
          due_day_offset: number
          equivalence_key?: string | null
          form_id?: string | null
          id: string
          is_key_output?: boolean
          launch_file_section: string
          output_type: Database["public"]["Enums"]["output_type"]
          pathway_id: string
          slug: string
          sort_order: number
          support?: string[]
          title: string
          updated_at?: string
          why_it_matters: string
        }
        Update: {
          accept?: string[] | null
          area_id?: string
          content_version?: number
          due_day_offset?: number
          equivalence_key?: string | null
          form_id?: string | null
          id?: string
          is_key_output?: boolean
          launch_file_section?: string
          output_type?: Database["public"]["Enums"]["output_type"]
          pathway_id?: string
          slug?: string
          sort_order?: number
          support?: string[]
          title?: string
          updated_at?: string
          why_it_matters?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "readiness_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      output_type: "file" | "link" | "form"
      user_role: "student" | "mentor" | "staff" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      output_type: ["file", "link", "form"],
      user_role: ["student", "mentor", "staff", "admin"],
    },
  },
} as const
