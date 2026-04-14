// Auto-generated stub — run `pnpm supabase:gen-types` with the local stack running to regenerate.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: Database["public"]["Enums"]["user_role"]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      movements: {
        Row: {
          id: string
          folio: number
          folio_display: string
          movement_date: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          amount: number
          category: string
          concept: string
          reference_person: string | null
          received_by: string | null
          delivered_by: string | null
          beneficiary: string | null
          payment_method: string | null
          support_number: string | null
          notes: string | null
          status: Database["public"]["Enums"]["movement_status"]
          cancellation_reason: string | null
          pdf_url: string | null
          drive_file_id: string | null
          pdf_status: Database["public"]["Enums"]["pdf_status"]
          pdf_error: string | null
          synced_to_sheet: boolean
          sync_error: string | null
          notification_status: Database["public"]["Enums"]["notification_status"]
          notification_sent_at: string | null
          notification_error: string | null
          created_by_id: string
          created_at: string
          updated_by_id: string | null
          updated_at: string | null
          cancelled_by_id: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          folio: number
          movement_date: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          amount: number
          category: string
          concept: string
          reference_person?: string | null
          received_by?: string | null
          delivered_by?: string | null
          beneficiary?: string | null
          payment_method?: string | null
          support_number?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["movement_status"]
          cancellation_reason?: string | null
          pdf_url?: string | null
          drive_file_id?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"]
          pdf_error?: string | null
          synced_to_sheet?: boolean
          sync_error?: string | null
          notification_status?: Database["public"]["Enums"]["notification_status"]
          notification_sent_at?: string | null
          notification_error?: string | null
          created_by_id: string
          created_at?: string
          updated_by_id?: string | null
          updated_at?: string | null
          cancelled_by_id?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          folio?: number
          movement_date?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          amount?: number
          category?: string
          concept?: string
          reference_person?: string | null
          received_by?: string | null
          delivered_by?: string | null
          beneficiary?: string | null
          payment_method?: string | null
          support_number?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["movement_status"]
          cancellation_reason?: string | null
          pdf_url?: string | null
          drive_file_id?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"]
          pdf_error?: string | null
          synced_to_sheet?: boolean
          sync_error?: string | null
          notification_status?: Database["public"]["Enums"]["notification_status"]
          notification_sent_at?: string | null
          notification_error?: string | null
          created_by_id?: string
          created_at?: string
          updated_by_id?: string | null
          updated_at?: string | null
          cancelled_by_id?: string | null
          cancelled_at?: string | null
        }
        Relationships: [
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
          {
            foreignKeyName: "movements_cancelled_by_id_fkey"
            columns: ["cancelled_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_audit_log: {
        Row: {
          id: string
          movement_id: string
          action: string
          user_id: string
          event_date: string
          previous_value: Json | null
          new_value: Json | null
          note: string | null
        }
        Insert: {
          id?: string
          movement_id: string
          action: string
          user_id: string
          event_date?: string
          previous_value?: Json | null
          new_value?: Json | null
          note?: string | null
        }
        Update: {
          id?: string
          movement_id?: string
          action?: string
          user_id?: string
          event_date?: string
          previous_value?: Json | null
          new_value?: Json | null
          note?: string | null
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
      system_audit_log: {
        Row: {
          id: string
          entity: string
          action: string
          entity_id: string | null
          user_id: string
          event_date: string
          previous_value: Json | null
          new_value: Json | null
          note: string | null
        }
        Insert: {
          id?: string
          entity: string
          action: string
          entity_id?: string | null
          user_id: string
          event_date?: string
          previous_value?: Json | null
          new_value?: Json | null
          note?: string | null
        }
        Update: {
          id?: string
          entity?: string
          action?: string
          entity_id?: string | null
          user_id?: string
          event_date?: string
          previous_value?: Json | null
          new_value?: Json | null
          note?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_and_get_folio: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      create_initial_admin: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
        }
        Returns: string
      }
      create_user_with_role: {
        Args: {
          p_email: string
          p_password: string
          p_full_name: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
    }
    Enums: {
      user_role: "ADMIN" | "OPERATOR" | "VIEWER"
      movement_type: "INCOME" | "EXPENSE"
      movement_status: "ACTIVE" | "CANCELLED"
      pdf_status: "PENDING" | "GENERATED" | "ERROR"
      notification_status: "PENDING" | "SENT" | "ERROR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
