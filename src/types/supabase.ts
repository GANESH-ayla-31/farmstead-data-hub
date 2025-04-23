
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
      fertilizers: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          npk_ratio: string
          application_method: string
          price_per_unit: number
          unit: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: string
          npk_ratio: string
          application_method: string
          price_per_unit: number
          unit: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: string
          npk_ratio?: string
          application_method?: string
          price_per_unit?: number
          unit?: string
          notes?: string | null
        }
      }
      pesticides: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          target_pests: string
          active_ingredients: string
          application_rate: string
          safety_interval_days: number
          price_per_unit: number
          unit: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: string
          target_pests: string
          active_ingredients: string
          application_rate: string
          safety_interval_days: number
          price_per_unit: number
          unit: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: string
          target_pests?: string
          active_ingredients?: string
          application_rate?: string
          safety_interval_days?: number
          price_per_unit?: number
          unit?: string
          notes?: string | null
        }
      }
      yield_records: {
        Row: {
          id: string
          created_at: string
          crop_cycle_id: string
          harvest_date: string
          quantity_kg: number
          quality_grade: string
          notes: string | null
          income: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_cycle_id: string
          harvest_date: string
          quantity_kg: number
          quality_grade: string
          notes?: string | null
          income?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_cycle_id?: string
          harvest_date?: string
          quantity_kg?: number
          quality_grade?: string
          notes?: string | null
          income?: number | null
        }
      }
      weather_data: {
        Row: {
          id: string
          created_at: string
          farmland_id: string
          date: string
          temperature_high: number
          temperature_low: number
          rainfall_mm: number
          humidity_percent: number
          wind_speed_kmh: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          farmland_id: string
          date: string
          temperature_high: number
          temperature_low: number
          rainfall_mm: number
          humidity_percent: number
          wind_speed_kmh: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          farmland_id?: string
          date?: string
          temperature_high?: number
          temperature_low?: number
          rainfall_mm?: number
          humidity_percent?: number
          wind_speed_kmh?: number
          notes?: string | null
        }
      }
      market_prices: {
        Row: {
          id: string
          created_at: string
          crop_id: string
          market_location_id: string
          date: string
          price_per_kg: number
          price_trend: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_id: string
          market_location_id: string
          date: string
          price_per_kg: number
          price_trend: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_id?: string
          market_location_id?: string
          date?: string
          price_per_kg?: number
          price_trend?: string
          notes?: string | null
        }
      }
      market_locations: {
        Row: {
          id: string
          created_at: string
          name: string
          address: string
          type: string
          contact_person: string | null
          contact_number: string | null
          operation_hours: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          address: string
          type: string
          contact_person?: string | null
          contact_number?: string | null
          operation_hours?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          address?: string
          type?: string
          contact_person?: string | null
          contact_number?: string | null
          operation_hours?: string | null
          notes?: string | null
        }
      }
      soil_conditions: {
        Row: {
          id: string
          created_at: string
          farmland_id: string
          test_date: string
          soil_type: string
          ph_level: number
          organic_matter_percent: number
          nitrogen_level: string
          phosphorus_level: string
          potassium_level: string
          other_nutrients: Json | null
          recommendations: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          farmland_id: string
          test_date: string
          soil_type: string
          ph_level: number
          organic_matter_percent: number
          nitrogen_level: string
          phosphorus_level: string
          potassium_level: string
          other_nutrients?: Json | null
          recommendations?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          farmland_id?: string
          test_date?: string
          soil_type?: string
          ph_level?: number
          organic_matter_percent?: number
          nitrogen_level?: string
          phosphorus_level?: string
          potassium_level?: string
          other_nutrients?: Json | null
          recommendations?: string | null
        }
      }
      best_practices: {
        Row: {
          id: string
          created_at: string
          crop_id: string | null
          title: string
          category: string
          content: string
          source: string | null
          author: string | null
          publication_date: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_id?: string | null
          title: string
          category: string
          content: string
          source?: string | null
          author?: string | null
          publication_date?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_id?: string | null
          title?: string
          category?: string
          content?: string
          source?: string | null
          author?: string | null
          publication_date?: string | null
          tags?: string[] | null
        }
      }
      recommendations: {
        Row: {
          id: string
          created_at: string
          farmer_id: string
          farmland_id: string | null
          crop_id: string | null
          title: string
          description: string
          category: string
          priority: string
          status: string
          due_date: string | null
          completed_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          farmer_id: string
          farmland_id?: string | null
          crop_id?: string | null
          title: string
          description: string
          category: string
          priority: string
          status: string
          due_date?: string | null
          completed_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          farmer_id?: string
          farmland_id?: string | null
          crop_id?: string | null
          title?: string
          description?: string
          category?: string
          priority?: string
          status?: string
          due_date?: string | null
          completed_date?: string | null
        }
      }
      community_forum: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          content: string
          category: string
          tags: string[] | null
          likes_count: number
          is_solved: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          content: string
          category: string
          tags?: string[] | null
          likes_count?: number
          is_solved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[] | null
          likes_count?: number
          is_solved?: boolean
        }
      }
      forum_comments: {
        Row: {
          id: string
          created_at: string
          post_id: string
          user_id: string
          content: string
          likes_count: number
          is_solution: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          post_id: string
          user_id: string
          content: string
          likes_count?: number
          is_solution?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          post_id?: string
          user_id?: string
          content?: string
          likes_count?: number
          is_solution?: boolean
        }
      }
    }
  }
}
