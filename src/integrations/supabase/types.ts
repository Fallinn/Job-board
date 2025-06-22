export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          size: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size?: string | null
          website?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string | null
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string | null
          status: string | null
        }
        Insert: {
          applicant_id?: string | null
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Update: {
          applicant_id?: string | null
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_id: string | null
          created_at: string
          currency: string | null
          description: string
          experience_level: string
          id: string
          is_active: boolean | null
          job_type: string
          location: string | null
          posted_by: string | null
          remote_ok: boolean | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description: string
          experience_level: string
          id?: string
          is_active?: boolean | null
          job_type: string
          location?: string | null
          posted_by?: string | null
          remote_ok?: boolean | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          experience_level?: string
          id?: string
          is_active?: boolean | null
          job_type?: string
          location?: string | null
          posted_by?: string | null
          remote_ok?: boolean | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          profile_image_url: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
