
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
      resources: {
        Row: {
          id: string
          created_at: string
          name: string
          type: string
          unit: string
          quantity: number
          supplier: string
          cost_per_unit: number
          purchase_date: string
          expiry_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: string
          unit: string
          quantity: number
          supplier: string
          cost_per_unit: number
          purchase_date: string
          expiry_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: string
          unit?: string
          quantity?: number
          supplier?: string
          cost_per_unit?: number
          purchase_date?: string
          expiry_date?: string | null
        }
      }
      resource_usage: {
        Row: {
          id: string
          created_at: string
          crop_cycle_id: string
          resource_id: string
          application_date: string
          quantity_used: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_cycle_id: string
          resource_id: string
          application_date: string
          quantity_used: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_cycle_id?: string
          resource_id?: string
          application_date?: string
          quantity_used?: number
          notes?: string | null
        }
      }
      weather_data: {
        Row: {
          id: string
          created_at: string
          farmland_id: string
          date: string
          temperature: number
          humidity: number
          rainfall: number
          wind_speed: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          farmland_id: string
          date: string
          temperature: number
          humidity: number
          rainfall: number
          wind_speed: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          farmland_id?: string
          date?: string
          temperature?: number
          humidity?: number
          rainfall?: number
          wind_speed?: number
          notes?: string | null
        }
      }
      market_prices: {
        Row: {
          id: string
          created_at: string
          crop_id: string
          date: string
          price_per_kg: number
          market_location: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          crop_id: string
          date: string
          price_per_kg: number
          market_location: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          crop_id?: string
          date?: string
          price_per_kg?: number
          market_location?: string
          notes?: string | null
        }
      }
    }
    Views: {
      active_crop_cycles: {
        Row: {
          id: string
          farmland_id: string
          farmland_name: string
          farmer_id: string
          farmer_name: string
          crop_id: string
          crop_name: string
          crop_variety: string
          planting_date: string
          expected_harvest_date: string
          days_to_harvest: number
          status: string
          area_hectares: number
        }
      }
      resource_inventory: {
        Row: {
          id: string
          name: string
          type: string
          quantity_available: number
          unit: string
          supplier: string
          cost_per_unit: number
          total_cost: number
          days_to_expiry: number | null
        }
      }
      crop_yield_summary: {
        Row: {
          farmer_id: string
          farmer_name: string
          crop_id: string
          crop_name: string
          total_cycles: number
          avg_yield_per_hectare: number
          total_yield: number
          total_area: number
        }
      }
    }
    Functions: {
      get_farmer_dashboard: {
        Args: { farmer_id: string }
        Returns: {
          active_crops: number
          upcoming_harvests: number
          total_farmland: number
          low_resources: number
        }
      }
      calculate_estimated_profit: {
        Args: { crop_cycle_id: string }
        Returns: {
          estimated_yield: number
          estimated_revenue: number
          estimated_cost: number
          estimated_profit: number
        }
      }
    }
  }
}
