export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      folio_counter: {
        Row: {
          id: string
          last_folio: number
          updated_at: string
        }
        Insert: {
          id?: string
          last_folio?: number
          updated_at?: string
        }
        Update: {
          id?: string
          last_folio?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          attachment_url: string | null
          created_at: string
          created_by_id: string
          date: string
          description: string | null
          id: string
          number: string
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          created_at?: string
          created_by_id: string
          date: string
          description?: string | null
          id?: string
          number: string
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          created_at?: string
          created_by_id?: string
          date?: string
          description?: string | null
          id?: string
          number?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_audit_log: {
        Row: {
          action: string
          event_date: string
          id: string
          movement_id: string
          new_value: Json | null
          note: string | null
          previous_value: Json | null
          user_id: string
        }
        Insert: {
          action: string
          event_date?: string
          id?: string
          movement_id: string
          new_value?: Json | null
          note?: string | null
          previous_value?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          event_date?: string
          id?: string
          movement_id?: string
          new_value?: Json | null
          note?: string | null
          previous_value?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_audit_log_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movement_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      movements: {
        Row: {
          amount: number
          attachment_url: string | null
          beneficiary: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by_id: string | null
          category: string
          concept: string
          created_at: string
          created_by_id: string
          delivered_by: string | null
          drive_file_id: string | null
          folio: number
          folio_display: string
          id: string
          movement_date: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes: string | null
          notification_error: string | null
          notification_sent_at: string | null
          notification_status: Database["public"]["Enums"]["notification_status"]
          payment_method: string | null
          pdf_error: string | null
          pdf_status: Database["public"]["Enums"]["pdf_status"]
          pdf_url: string | null
          received_by: string | null
          reference_person: string | null
          status: Database["public"]["Enums"]["movement_status"]
          support_number: string | null
          sync_error: string | null
          synced_to_sheet: boolean
          updated_at: string | null
          updated_by_id: string | null
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          beneficiary?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by_id?: string | null
          category: string
          concept: string
          created_at?: string
          created_by_id: string
          delivered_by?: string | null
          drive_file_id?: string | null
          folio: number
          folio_display?: string
          id?: string
          movement_date: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          notification_status?: Database["public"]["Enums"]["notification_status"]
          payment_method?: string | null
          pdf_error?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"]
          pdf_url?: string | null
          received_by?: string | null
          reference_person?: string | null
          status?: Database["public"]["Enums"]["movement_status"]
          support_number?: string | null
          sync_error?: string | null
          synced_to_sheet?: boolean
          updated_at?: string | null
          updated_by_id?: string | null
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          beneficiary?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by_id?: string | null
          category?: string
          concept?: string
          created_at?: string
          created_by_id?: string
          delivered_by?: string | null
          drive_file_id?: string | null
          folio?: number
          folio_display?: string
          id?: string
          movement_date?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          notification_error?: string | null
          notification_sent_at?: string | null
          notification_status?: Database["public"]["Enums"]["notification_status"]
          payment_method?: string | null
          pdf_error?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"]
          pdf_url?: string | null
          received_by?: string | null
          reference_person?: string | null
          status?: Database["public"]["Enums"]["movement_status"]
          support_number?: string | null
          sync_error?: string | null
          synced_to_sheet?: boolean
          updated_at?: string | null
          updated_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movements_cancelled_by_id_fkey"
            columns: ["cancelled_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_updated_by_id_fkey"
            columns: ["updated_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_log: {
        Row: {
          action: string
          entity: string
          entity_id: string | null
          event_date: string
          id: string
          new_value: Json | null
          note: string | null
          previous_value: Json | null
          user_id: string
        }
        Insert: {
          action: string
          entity: string
          entity_id?: string | null
          event_date?: string
          id?: string
          new_value?: Json | null
          note?: string | null
          previous_value?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          entity?: string
          entity_id?: string | null
          event_date?: string
          id?: string
          new_value?: Json | null
          note?: string | null
          previous_value?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ministries: {
        Row: {
          id: string
          name: string
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ministry_assignments: {
        Row: {
          id: string
          ministry_id: string
          user_id: string
          assigned_at: string
          unassigned_at: string | null
          assigned_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          ministry_id: string
          user_id: string
          assigned_at?: string
          unassigned_at?: string | null
          assigned_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          ministry_id?: string
          user_id?: string
          assigned_at?: string
          unassigned_at?: string | null
          assigned_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      budget_periods: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          status: Database["public"]["Enums"]["budget_period_status"]
          released_at: string | null
          released_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          status?: Database["public"]["Enums"]["budget_period_status"]
          released_at?: string | null
          released_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: Database["public"]["Enums"]["budget_period_status"]
          released_at?: string | null
          released_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ministry_budgets: {
        Row: {
          id: string
          ministry_id: string
          period_id: string
          amount: number
          status: Database["public"]["Enums"]["ministry_budget_status"]
          released_by: string | null
          released_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ministry_id: string
          period_id: string
          amount: number
          status?: Database["public"]["Enums"]["ministry_budget_status"]
          released_by?: string | null
          released_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ministry_id?: string
          period_id?: string
          amount?: number
          status?: Database["public"]["Enums"]["ministry_budget_status"]
          released_by?: string | null
          released_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_intentions: {
        Row: {
          id: string
          ministry_id: string
          period_id: string
          requested_by: string
          amount: number
          description: string
          purpose: string | null
          date_needed: string | null
          status: Database["public"]["Enums"]["intention_status"]
          is_over_budget: boolean
          token: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ministry_id: string
          period_id: string
          requested_by: string
          amount: number
          description: string
          purpose?: string | null
          date_needed?: string | null
          status?: Database["public"]["Enums"]["intention_status"]
          is_over_budget?: boolean
          token?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ministry_id?: string
          period_id?: string
          requested_by?: string
          amount?: number
          description?: string
          purpose?: string | null
          date_needed?: string | null
          status?: Database["public"]["Enums"]["intention_status"]
          is_over_budget?: boolean
          token?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      intention_transfers: {
        Row: {
          id: string
          intention_id: string
          amount: number
          transfer_date: string
          reference: string | null
          notes: string | null
          registered_by: string
          created_at: string
        }
        Insert: {
          id?: string
          intention_id: string
          amount: number
          transfer_date: string
          reference?: string | null
          notes?: string | null
          registered_by: string
          created_at?: string
        }
        Update: {
          id?: string
          intention_id?: string
          amount?: number
          transfer_date?: string
          reference?: string | null
          notes?: string | null
          registered_by?: string
          created_at?: string
        }
        Relationships: []
      }
      expense_settlements: {
        Row: {
          id: string
          intention_id: string
          submitted_by: string
          amount: number
          description: string
          expense_date: string
          is_late: boolean
          attachment_url: string | null
          status: Database["public"]["Enums"]["settlement_status"]
          token: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_message: string | null
          movement_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          intention_id: string
          submitted_by: string
          amount: number
          description: string
          expense_date: string
          is_late?: boolean
          attachment_url?: string | null
          status?: Database["public"]["Enums"]["settlement_status"]
          token?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_message?: string | null
          movement_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          intention_id?: string
          submitted_by?: string
          amount?: number
          description?: string
          expense_date?: string
          is_late?: boolean
          attachment_url?: string | null
          status?: Database["public"]["Enums"]["settlement_status"]
          token?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_message?: string | null
          movement_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          id: string
          entity_type: Database["public"]["Enums"]["comment_entity"]
          entity_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: Database["public"]["Enums"]["comment_entity"]
          entity_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: Database["public"]["Enums"]["comment_entity"]
          entity_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          value: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_initial_admin: {
        Args: { p_email: string; p_full_name: string; p_password: string }
        Returns: string
      }
      create_user_with_role: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      get_dashboard_summary: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      increment_and_get_folio: { Args: never; Returns: number }
      get_ministry_budget_summary: {
        Args: { p_ministry_id: string; p_period_id: string }
        Returns: Json
      }
      get_pending_reminders: {
        Args: never
        Returns: Json
      }
    }
    Enums: {
      budget_period_status: "DRAFT" | "ACTIVE" | "CLOSED"
      comment_entity: "INTENTION" | "SETTLEMENT"
      intention_status: "PENDING" | "APPROVED" | "REJECTED"
      invoice_status: "PENDING" | "SETTLED"
      ministry_budget_status: "DRAFT" | "RELEASED"
      movement_status: "ACTIVE" | "CANCELLED"
      movement_type: "INCOME" | "EXPENSE"
      notification_status: "PENDING" | "SENT" | "ERROR"
      pdf_status: "PENDING" | "GENERATED" | "ERROR"
      settlement_status: "PENDING" | "APPROVED" | "REJECTED"
      user_role: "ADMIN" | "OPERATOR" | "VIEWER" | "MINISTER"
      user_status:
        | "ACTIVE"
        | "INACTIVE"
        | "PENDING_ACTIVATION"
        | "PENDING_RESET"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      budget_period_status: ["DRAFT", "ACTIVE", "CLOSED"],
      comment_entity: ["INTENTION", "SETTLEMENT"],
      intention_status: ["PENDING", "APPROVED", "REJECTED"],
      invoice_status: ["PENDING", "SETTLED"],
      ministry_budget_status: ["DRAFT", "RELEASED"],
      movement_status: ["ACTIVE", "CANCELLED"],
      movement_type: ["INCOME", "EXPENSE"],
      notification_status: ["PENDING", "SENT", "ERROR"],
      pdf_status: ["PENDING", "GENERATED", "ERROR"],
      settlement_status: ["PENDING", "APPROVED", "REJECTED"],
      user_role: ["ADMIN", "OPERATOR", "VIEWER", "MINISTER"],
      user_status: [
        "ACTIVE",
        "INACTIVE",
        "PENDING_ACTIVATION",
        "PENDING_RESET",
      ],
    },
  },
} as const

