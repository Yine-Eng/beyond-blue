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
      connections: {
        Row: {
          id: string
          match_reason: string | null
          match_score: number | null
          mentor_id: string
          note: string | null
          requested_at: string
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
          student_id: string
        }
        Insert: {
          id?: string
          match_reason?: string | null
          match_score?: number | null
          mentor_id: string
          note?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          student_id: string
        }
        Update: {
          id?: string
          match_reason?: string | null
          match_score?: number | null
          mentor_id?: string
          note?: string | null
          requested_at?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      day_plus_100_surveys: {
        Row: {
          improve: string | null
          most_useful: string | null
          opt_in_give: boolean
          opt_in_mentor: boolean
          opt_in_session: boolean
          outcome: string
          pathway_id: string
          stress: number
          student_id: string
          submitted_at: string
          usefulness: number
        }
        Insert: {
          improve?: string | null
          most_useful?: string | null
          opt_in_give?: boolean
          opt_in_mentor?: boolean
          opt_in_session?: boolean
          outcome: string
          pathway_id: string
          stress: number
          student_id: string
          submitted_at?: string
          usefulness: number
        }
        Update: {
          improve?: string | null
          most_useful?: string | null
          opt_in_give?: boolean
          opt_in_mentor?: boolean
          opt_in_session?: boolean
          outcome?: string
          pathway_id?: string
          stress?: number
          student_id?: string
          submitted_at?: string
          usefulness?: number
        }
        Relationships: [
          {
            foreignKeyName: "day_plus_100_surveys_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_plus_100_surveys_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      detour_plans: {
        Row: {
          answers: Json
          completed_at: string | null
          current_step: number
          student_id: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          completed_at?: string | null
          current_step?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          current_step?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "detour_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_requests: {
        Row: {
          amount_cents: number
          category: Database["public"]["Enums"]["fund_category"]
          decided_at: string | null
          document_path: string | null
          id: string
          justification: string
          needed_by: string
          next_step: string
          reviewer_id: string | null
          reviewer_notes: string | null
          rubric: Json | null
          status: Database["public"]["Enums"]["fund_status"]
          student_id: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          category: Database["public"]["Enums"]["fund_category"]
          decided_at?: string | null
          document_path?: string | null
          id?: string
          justification: string
          needed_by: string
          next_step: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json | null
          status?: Database["public"]["Enums"]["fund_status"]
          student_id: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: Database["public"]["Enums"]["fund_category"]
          decided_at?: string | null
          document_path?: string | null
          id?: string
          justification?: string
          needed_by?: string
          next_step?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          rubric?: Json | null
          status?: Database["public"]["Enums"]["fund_status"]
          student_id?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_settings: {
        Row: {
          id: boolean
          request_cap_cents: number
          total_budget_cents: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          request_cap_cents?: number
          total_budget_cents?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          request_cap_cents?: number
          total_budget_cents?: number
          updated_at?: string
        }
        Relationships: [
        ]
      }
      launch_files: {
        Row: {
          exported_at: string
          id: string
          snapshot: Json
          student_id: string
        }
        Insert: {
          exported_at?: string
          id?: string
          snapshot: Json
          student_id: string
        }
        Update: {
          exported_at?: string
          id?: string
          snapshot?: Json
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_files_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_notes: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          met_on: string
          notes: string | null
          topic: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          met_on: string
          notes?: string | null
          topic: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          met_on?: string
          notes?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_notes_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          bio: string | null
          capacity: number
          city: string | null
          created_at: string
          display_name: string
          employer: string | null
          grad_school: string | null
          grad_year: number | null
          id: string
          industry: string | null
          is_available: boolean
          is_seeded_fictional: boolean
          journey_tags: string[]
          last_active_at: string
          pathways: string[]
          role_title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          capacity?: number
          city?: string | null
          created_at?: string
          display_name: string
          employer?: string | null
          grad_school?: string | null
          grad_year?: number | null
          id?: string
          industry?: string | null
          is_available?: boolean
          is_seeded_fictional?: boolean
          journey_tags?: string[]
          last_active_at?: string
          pathways?: string[]
          role_title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          capacity?: number
          city?: string | null
          created_at?: string
          display_name?: string
          employer?: string | null
          grad_school?: string | null
          grad_year?: number | null
          id?: string
          industry?: string | null
          is_available?: boolean
          is_seeded_fictional?: boolean
          journey_tags?: string[]
          last_active_at?: string
          pathways?: string[]
          role_title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pathway_changes: {
        Row: {
          changed_at: string
          completed_kept: number
          credited_in_new: number
          from_pathway_id: string
          id: string
          reason: string | null
          student_id: string
          to_pathway_id: string
        }
        Insert: {
          changed_at?: string
          completed_kept: number
          credited_in_new: number
          from_pathway_id: string
          id?: string
          reason?: string | null
          student_id: string
          to_pathway_id: string
        }
        Update: {
          changed_at?: string
          completed_kept?: number
          credited_in_new?: number
          from_pathway_id?: string
          id?: string
          reason?: string | null
          student_id?: string
          to_pathway_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathway_changes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      day_plus_100_insights: {
        Args: never
        Returns: {
          avg_usefulness: number | null
          employed: number | null
          enrolled: number | null
          give_pct: number | null
          less_stressed_pct: number | null
          mentor_pct: number | null
          more_stressed_pct: number | null
          other: number | null
          pathway_id: string | null
          responses: number
          same_stress_pct: number | null
          searching: number | null
          self_employed: number | null
          session_pct: number | null
          suppressed: boolean
        }[]
      }
      decide_fund_request: {
        Args: {
          p_id: string
          p_note: string
          p_rubric: Json
          p_status: Database["public"]["Enums"]["fund_status"]
        }
        Returns: Database["public"]["Tables"]["fund_requests"]["Row"]
      }
      fund_balance: {
        Args: never
        Returns: {
          approved_cents: number
          remaining_cents: number
          request_cap_cents: number
          total_cents: number
        }[]
      }
      available_mentors: {
        Args: never
        Returns: {
          active_mentees: number
          bio: string
          city: string
          display_name: string
          employer: string
          grad_school: string
          grad_year: number
          id: string
          industry: string
          journey_tags: string[]
          last_active_at: string
          pathways: string[]
          role_title: string
        }[]
      }
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      my_mentor_id: { Args: never; Returns: string }
      network_stats: {
        Args: never
        Returns: { alumni: number; mentors: number; students_on_path: number }[]
      }
      resubmit_fund_request: {
        Args: {
          p_amount_cents: number
          p_category: Database["public"]["Enums"]["fund_category"]
          p_document_path?: string
          p_justification: string
          p_needed_by: string
          p_next_step: string
          p_id: string
        }
        Returns: Database["public"]["Tables"]["fund_requests"]["Row"]
      }
      submit_day_plus_100: {
        Args: {
          p_improve: string
          p_most_useful: string
          p_opt_in_give: boolean
          p_opt_in_mentor: boolean
          p_opt_in_session: boolean
          p_outcome: string
          p_stress: number
          p_usefulness: number
        }
        Returns: Database["public"]["Tables"]["day_plus_100_surveys"]["Row"]
      }
      submit_fund_request: {
        Args: {
          p_amount_cents: number
          p_category: Database["public"]["Enums"]["fund_category"]
          p_document_path?: string
          p_justification: string
          p_needed_by: string
          p_next_step: string
        }
        Returns: Database["public"]["Tables"]["fund_requests"]["Row"]
      }
      switch_pathway: {
        Args: { p_reason?: string; p_to: string }
        Returns: Database["public"]["Tables"]["pathway_changes"]["Row"]
      }
      verify_output: { Args: { p_completion: string }; Returns: undefined }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "declined" | "withdrawn"
      fund_category:
        | "certification_fee"
        | "background_check"
        | "interview_travel"
        | "deposit"
        | "relocation"
        | "other"
      fund_status: "submitted" | "in_review" | "needs_info" | "approved" | "declined"
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
      connection_status: ["pending", "accepted", "declined", "withdrawn"],
      fund_category: [
        "certification_fee",
        "background_check",
        "interview_travel",
        "deposit",
        "relocation",
        "other",
      ],
      fund_status: ["submitted", "in_review", "needs_info", "approved", "declined"],
      output_type: ["file", "link", "form"],
      user_role: ["student", "mentor", "staff", "admin"],
    },
  },
} as const
