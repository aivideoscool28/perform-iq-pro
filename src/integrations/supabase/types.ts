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
      analysis_boards: {
        Row: {
          created_at: string
          id: string
          improvements: Json
          is_ai_generated: boolean
          negatives: Json
          positives: Json
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          improvements?: Json
          is_ai_generated?: boolean
          negatives?: Json
          positives?: Json
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          improvements?: Json
          is_ai_generated?: boolean
          negatives?: Json
          positives?: Json
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_boards_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          ai_summary: string | null
          ate_around_training: string | null
          checkin_date: string
          created_at: string
          discipline: string | null
          duration_min: number | null
          extra_note: string | null
          food_note: string | null
          has_pain: boolean | null
          id: string
          is_rest_day: boolean
          last_meal_before: string | null
          overall_feeling: number | null
          pain_note: string | null
          rpe: number | null
          satisfaction: number | null
          sleep_hours: string | null
          sleep_quality: number | null
          updated_at: string
          user_id: string
          water_intake: string | null
          woke_recovered: string | null
        }
        Insert: {
          ai_summary?: string | null
          ate_around_training?: string | null
          checkin_date?: string
          created_at?: string
          discipline?: string | null
          duration_min?: number | null
          extra_note?: string | null
          food_note?: string | null
          has_pain?: boolean | null
          id?: string
          is_rest_day?: boolean
          last_meal_before?: string | null
          overall_feeling?: number | null
          pain_note?: string | null
          rpe?: number | null
          satisfaction?: number | null
          sleep_hours?: string | null
          sleep_quality?: number | null
          updated_at?: string
          user_id: string
          water_intake?: string | null
          woke_recovered?: string | null
        }
        Update: {
          ai_summary?: string | null
          ate_around_training?: string | null
          checkin_date?: string
          created_at?: string
          discipline?: string | null
          duration_min?: number | null
          extra_note?: string | null
          food_note?: string | null
          has_pain?: boolean | null
          id?: string
          is_rest_day?: boolean
          last_meal_before?: string | null
          overall_feeling?: number | null
          pain_note?: string | null
          rpe?: number | null
          satisfaction?: number | null
          sleep_hours?: string | null
          sleep_quality?: number | null
          updated_at?: string
          user_id?: string
          water_intake?: string | null
          woke_recovered?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      gear_logs: {
        Row: {
          brand: string
          created_at: string
          discipline: string | null
          distance_km: number | null
          id: string
          model: string
          notes: string | null
          started_on: string
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          discipline?: string | null
          distance_km?: number | null
          id?: string
          model: string
          notes?: string | null
          started_on?: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          discipline?: string | null
          distance_km?: number | null
          id?: string
          model?: string
          notes?: string | null
          started_on?: string
          user_id?: string
        }
        Relationships: []
      }
      gear_profile: {
        Row: {
          created_at: string
          foot_width: string | null
          notes: string | null
          preferred_brands: string[]
          shoe_size_eu: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          foot_width?: string | null
          notes?: string | null
          preferred_brands?: string[]
          shoe_size_eu?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          foot_width?: string | null
          notes?: string | null
          preferred_brands?: string[]
          shoe_size_eu?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          current_streak: number
          disciplines: string[]
          display_name: string
          experience: string | null
          goal_text: string | null
          goals: string[]
          height_cm: number | null
          id: string
          injuries: string | null
          invite_code: string
          last_workout_date: string | null
          longest_streak: number
          onboarded_at: string | null
          streak_freezes_last_reset: string
          streak_freezes_remaining: number
          training_days_per_week: number | null
          training_setup: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          disciplines?: string[]
          display_name?: string
          experience?: string | null
          goal_text?: string | null
          goals?: string[]
          height_cm?: number | null
          id: string
          injuries?: string | null
          invite_code?: string
          last_workout_date?: string | null
          longest_streak?: number
          onboarded_at?: string | null
          streak_freezes_last_reset?: string
          streak_freezes_remaining?: number
          training_days_per_week?: number | null
          training_setup?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          disciplines?: string[]
          display_name?: string
          experience?: string | null
          goal_text?: string | null
          goals?: string[]
          height_cm?: number | null
          id?: string
          injuries?: string | null
          invite_code?: string
          last_workout_date?: string | null
          longest_streak?: number
          onboarded_at?: string | null
          streak_freezes_last_reset?: string
          streak_freezes_remaining?: number
          training_days_per_week?: number | null
          training_setup?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration_minutes: number | null
          exercises: Json
          id: string
          intensity: string | null
          notes: string | null
          raw_input: string | null
          summary: string | null
          user_id: string
          workout_date: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          intensity?: string | null
          notes?: string | null
          raw_input?: string | null
          summary?: string | null
          user_id: string
          workout_date?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          intensity?: string | null
          notes?: string | null
          raw_input?: string | null
          summary?: string | null
          user_id?: string
          workout_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: { Args: { invite_code: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
