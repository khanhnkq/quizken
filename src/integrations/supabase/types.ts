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
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          zcoin: number
          created_at: string | null
          updated_at: string | null
          daily_quiz_count: number
          last_daily_reset: string | null
        }
        Insert: {
          id: string
          zcoin?: number
          created_at?: string | null
          updated_at?: string | null
          daily_quiz_count?: number
          last_daily_reset?: string | null
        }
        Update: {
          id?: string
          zcoin?: number
          created_at?: string | null
          updated_at?: string | null
          daily_quiz_count?: number
          last_daily_reset?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          prompt: string
          questions: Json
          prompt_tokens: number
          candidates_tokens: number
          total_tokens: number
          created_at: string
          expires_at: string
          user_id: string | null
          is_public: boolean | null
          status: string
          session_id: string | null
          progress: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          prompt: string
          questions: Json
          prompt_tokens?: number
          candidates_tokens?: number
          total_tokens?: number
          created_at?: string
          expires_at?: string
          user_id?: string | null
          is_public?: boolean | null
          status?: string
          session_id?: string | null
          progress?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          prompt?: string
          questions?: Json
          prompt_tokens?: number
          candidates_tokens?: number
          total_tokens?: number
          created_at?: string
          expires_at?: string
          user_id?: string | null
          is_public?: boolean | null
          status?: string
          session_id?: string | null
          progress?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string | null
          score: number
          total_questions: number
          answers: Json
          completed_at: string
          time_spent: number | null
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id?: string | null
          score: number
          total_questions: number
          answers: Json
          completed_at?: string
          time_spent?: number | null
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string | null
          score?: number
          total_questions?: number
          answers?: Json
          completed_at?: string
          time_spent?: number | null
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
