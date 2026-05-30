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
      complaints: {
        Row: {
          complaint_type: string
          created_at: string
          form_data: Json
          generated_content: string | null
          id: string
          language: string
          recipient: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          complaint_type: string
          created_at?: string
          form_data?: Json
          generated_content?: string | null
          id?: string
          language?: string
          recipient?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          complaint_type?: string
          created_at?: string
          form_data?: Json
          generated_content?: string | null
          id?: string
          language?: string
          recipient?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          module: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_analyses: {
        Row: {
          actions: Json
          clauses: Json
          created_at: string
          deadlines: Json
          doc_kind: string
          id: string
          language: string
          mime_type: string | null
          raw_analysis: string | null
          risks: Json
          source_text: string | null
          status: string
          storage_path: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          clauses?: Json
          created_at?: string
          deadlines?: Json
          doc_kind?: string
          id?: string
          language?: string
          mime_type?: string | null
          raw_analysis?: string | null
          risks?: Json
          source_text?: string | null
          status?: string
          storage_path?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          clauses?: Json
          created_at?: string
          deadlines?: Json
          doc_kind?: string
          id?: string
          language?: string
          mime_type?: string | null
          raw_analysis?: string | null
          risks?: Json
          source_text?: string | null
          status?: string
          storage_path?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fir_drafts: {
        Row: {
          created_at: string
          form_data: Json
          generated_content: string | null
          id: string
          incident_date: string | null
          incident_location: string | null
          language: string
          police_station: string | null
          state: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data?: Json
          generated_content?: string | null
          id?: string
          incident_date?: string | null
          incident_location?: string | null
          language?: string
          police_station?: string | null
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          generated_content?: string | null
          id?: string
          incident_date?: string | null
          incident_location?: string | null
          language?: string
          police_station?: string | null
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_notice_reviews: {
        Row: {
          created_at: string
          deadlines: Json
          id: string
          language: string
          notice_text: string
          raw_analysis: string | null
          recommended_response: string | null
          risk_level: string
          summary: string | null
          title: string
          updated_at: string
          urgency_score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deadlines?: Json
          id?: string
          language?: string
          notice_text: string
          raw_analysis?: string | null
          recommended_response?: string | null
          risk_level?: string
          summary?: string | null
          title?: string
          updated_at?: string
          urgency_score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          deadlines?: Json
          id?: string
          language?: string
          notice_text?: string
          raw_analysis?: string | null
          recommended_response?: string | null
          risk_level?: string
          summary?: string | null
          title?: string
          updated_at?: string
          urgency_score?: number
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_verifications: {
        Row: {
          created_at: string
          guidance: string | null
          id: string
          language: string
          missing_fields: Json
          ownership_checklist: Json
          property_type: string
          raw_analysis: string | null
          risks: Json
          source_text: string
          state: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guidance?: string | null
          id?: string
          language?: string
          missing_fields?: Json
          ownership_checklist?: Json
          property_type?: string
          raw_analysis?: string | null
          risks?: Json
          source_text: string
          state?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          guidance?: string | null
          id?: string
          language?: string
          missing_fields?: Json
          ownership_checklist?: Json
          property_type?: string
          raw_analysis?: string | null
          risks?: Json
          source_text?: string
          state?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_exports: {
        Row: {
          created_at: string
          file_name: string
          format: string
          id: string
          source_id: string | null
          source_type: string
          storage_path: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          format: string
          id?: string
          source_id?: string | null
          source_type: string
          storage_path?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          format?: string
          id?: string
          source_id?: string | null
          source_type?: string
          storage_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scam_reports: {
        Row: {
          actions: Json
          channel: string
          content: string
          created_at: string
          explanation: string | null
          id: string
          indicators: Json
          language: string
          raw_analysis: string | null
          risk_level: string
          scam_score: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          channel?: string
          content: string
          created_at?: string
          explanation?: string | null
          id?: string
          indicators?: Json
          language?: string
          raw_analysis?: string | null
          risk_level?: string
          scam_score?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          channel?: string
          content?: string
          created_at?: string
          explanation?: string | null
          id?: string
          indicators?: Json
          language?: string
          raw_analysis?: string | null
          risk_level?: string
          scam_score?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          id: string
          mime_type: string | null
          name: string
          notes: string | null
          size_bytes: number | null
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          id?: string
          mime_type?: string | null
          name: string
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          notes?: string | null
          size_bytes?: number | null
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "lawyer" | "user"
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
      app_role: ["admin", "lawyer", "user"],
    },
  },
} as const
