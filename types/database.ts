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
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          photo_url: string | null
          role: 'founder' | 'investor' | 'both'
          followed_rounds: string[]
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          photo_url?: string | null
          role?: 'founder' | 'investor' | 'both'
          followed_rounds?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          photo_url?: string | null
          role?: 'founder' | 'investor' | 'both'
          followed_rounds?: string[]
          created_at?: string
        }
      }
      fundraising_rounds: {
        Row: {
          id: string
          company_name: string
          logo_url: string
          raising_amount: number
          currency: string
          description: string
          deck_url: string
          founder_id: string
          follower_count: number
          intro_request_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          logo_url: string
          raising_amount: number
          currency?: string
          description: string
          deck_url: string
          founder_id: string
          follower_count?: number
          intro_request_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          logo_url?: string
          raising_amount?: number
          currency?: string
          description?: string
          deck_url?: string
          founder_id?: string
          follower_count?: number
          intro_request_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      intro_requests: {
        Row: {
          id: string
          investor_id: string
          round_id: string
          startup_name: string
          status: 'pending' | 'accepted' | 'declined'
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          round_id: string
          startup_name: string
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          round_id?: string
          startup_name?: string
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}
