
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
      farmers: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          contact_number: string
          address: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          contact_number: string
          address: string
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          contact_number?: string
          address?: string
          email?: string
        }
      }
      farmlands: {
        Row: {
          id: string
          created_at: string
          farmer_id: string
          name: string
          location: string
          size_hectares: number
          soil_type: string
        }
        Insert: {
          id?: string
          created_at?: string
          farmer_id: string
          name: string
          location: string
          size_hectares: number
          soil_type: string
        }
        Update: {
          id?: string
          created_at?: string
          farmer_id?: string
          name?: string
          location?: string
          size_hectares?: number
          soil_type?: string
        }
      }
      crops: {
        Row: {
          id: string
          created_at: string
          name: string
          variety: string
          growth_period_days: number
          water_requirement: string
          ideal_temperature: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          variety: string
          growth_period_days: number
          water_requirement: string
          ideal_temperature: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          variety?: string
          growth_period_days?: number
          water_requirement?: string
          ideal_temperature?: string
        }
      }
      crop_cycles: {
        Row: {
          id: string
          created_at: string
          farmland_id: string
          crop_id: string
          planting_date: string
          expected_harvest_date: string
          actual_harvest_date: string | null
          area_hectares: number
          status: string
          yield_kg: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          farmland_id: string
          crop_id: string
          planting_date: string
          expected_harvest_date: string
          actual_harvest_date?: string | null
          area_hectares: number
          status: string
          yield_kg?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          farmland_id?: string
          crop_id?: string
          planting_date?: string
          expected_harvest_date?: string
          actual_harvest_date?: string | null
          area_hectares?: number
          status?: string
          yield_kg?: number | null
        }
      }
    }
  }
}
