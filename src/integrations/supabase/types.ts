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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          active: boolean
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          active?: boolean
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          body: string
          created_at: string
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      internships: {
        Row: {
          batch_id: string | null
          certificate_code: string | null
          certificate_issued_at: string | null
          completed_at: string | null
          created_at: string
          domain_id: string
          duration: string | null
          id: string
          internship_code: string
          offer_issued_at: string | null
          offer_letter_code: string | null
          progress_percent: number
          started_at: string | null
          status: Database["public"]["Enums"]["internship_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          batch_id?: string | null
          certificate_code?: string | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          created_at?: string
          domain_id: string
          duration?: string | null
          id?: string
          internship_code?: string
          offer_issued_at?: string | null
          offer_letter_code?: string | null
          progress_percent?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["internship_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          batch_id?: string | null
          certificate_code?: string | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          created_at?: string
          domain_id?: string
          duration?: string | null
          id?: string
          internship_code?: string
          offer_issued_at?: string | null
          offer_letter_code?: string | null
          progress_percent?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["internship_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internships_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college: string | null
          created_at: string
          department: string | null
          duration: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          id: string
          internship_id: string | null
          linkedin_url: string | null
          must_change_password: boolean
          phone: string | null
          portfolio_url: string | null
          resume_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          selected_domain: string | null
          updated_at: string
          user_id: string | null
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          duration?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          internship_id?: string | null
          linkedin_url?: string | null
          must_change_password?: boolean
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          selected_domain?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college?: string | null
          created_at?: string
          department?: string | null
          duration?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          internship_id?: string | null
          linkedin_url?: string | null
          must_change_password?: boolean
          phone?: string | null
          portfolio_url?: string | null
          resume_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          selected_domain?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          read_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          read_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          read_at?: string | null
          status?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          drive_url: string | null
          feedback: string | null
          github_url: string | null
          id: string
          internship_id: string
          linkedin_url: string | null
          notes: string | null
          project_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          task_no: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          drive_url?: string | null
          feedback?: string | null
          github_url?: string | null
          id?: string
          internship_id: string
          linkedin_url?: string | null
          notes?: string | null
          project_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          task_no: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          drive_url?: string | null
          feedback?: string | null
          github_url?: string | null
          id?: string
          internship_id?: string
          linkedin_url?: string | null
          notes?: string | null
          project_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          task_no?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          rating: number
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rating: number
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rating?: number
          message?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_admin: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student" | "intern"
      internship_status: "pending" | "active" | "completed" | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "student", "intern"],
      internship_status: ["pending", "active", "completed", "cancelled"],
    },
  },
} as const
