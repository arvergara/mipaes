export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      question_feedback: {
        Row: {
          id: string
          user_id: string
          question_id: string
          feedback_type: string
          content: string
          status: string
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          feedback_type: string
          content: string
          status?: string
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          feedback_type?: string
          content?: string
          status?: string
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          subject: string
          content: string
          options: Json
          correct_answer: string
          explanation: string
          area_tematica: string | null
          tema: string | null
          subtema: string | null
          topic: string | null
          difficulty: number | null
          created_at: string | null
          active: boolean
        }
        Insert: {
          id?: string
          subject: string
          content: string
          options: Json
          correct_answer: string
          explanation: string
          area_tematica?: string | null
          tema?: string | null
          subtema?: string | null
          topic?: string | null
          difficulty?: number | null
          created_at?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          subject?: string
          content?: string
          options?: Json
          correct_answer?: string
          explanation?: string
          area_tematica?: string | null
          tema?: string | null
          subtema?: string | null
          topic?: string | null
          difficulty?: number | null
          created_at?: string | null
          active?: boolean
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          session_id: string
          question_id: string
          subject: string
          mode: string
          area_tematica: string | null
          tema: string | null
          subtema: string | null
          answer: string
          is_correct: boolean
          time_spent: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          question_id: string
          subject: string
          mode: string
          area_tematica?: string | null
          tema?: string | null
          subtema?: string | null
          answer: string
          is_correct: boolean
          time_spent: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          question_id?: string
          subject?: string
          mode?: string
          area_tematica?: string | null
          tema?: string | null
          subtema?: string | null
          answer?: string
          is_correct?: boolean
          time_spent?: number
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          mode: string
          questions_total: number
          questions_correct: number
          time_spent: number
          created_at: string
          question_details: Json
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          mode: string
          questions_total: number
          questions_correct: number
          time_spent: number
          created_at?: string
          question_details?: Json
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          mode?: string
          questions_total?: number
          questions_correct?: number
          time_spent?: number
          created_at?: string
          question_details?: Json
        }
      }
    }
  }
}