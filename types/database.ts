export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          plan: string;
          plan_expires_at: string | null;
          plan_notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          plan_expires_at?: string | null;
          plan_notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      sources: {
        Row: {
          id: string;
          name: string;
          slug: string;
          organisation_type: string;
          sport: string | null;
          country: string | null;
          language_primary: string | null;
          website_url: string | null;
          is_fake: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          organisation_type: string;
          sport?: string | null;
          country?: string | null;
          language_primary?: string | null;
          website_url?: string | null;
          is_fake?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sources"]["Row"]>;
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          source_name: string;
          organisation_type: string;
          sport: string;
          country: string;
          language: string;
          content_type: string;
          title: string;
          summary: string;
          published_at: string;
          source_url: string;
          image_url: string | null;
          topics: string[];
          official_weight: number;
          status: string;
          is_fake: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          source_name: string;
          organisation_type: string;
          sport: string;
          country: string;
          language: string;
          content_type: string;
          title: string;
          summary: string;
          published_at: string;
          source_url: string;
          image_url?: string | null;
          topics?: string[];
          official_weight?: number;
          status?: string;
          is_fake?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
      };
      widgets: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          filters: Json;
          limit: number;
          sort: string;
          owner_id: string | null;
          is_public: boolean;
          allowed_domains: string[];
          is_fake: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          filters?: Json;
          limit?: number;
          sort?: string;
          owner_id?: string | null;
          is_public?: boolean;
          allowed_domains?: string[];
          is_fake?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["widgets"]["Row"]>;
      };
    };
    Views: {
      v_widget_articles: {
        Row: {
          id: string;
          source_id: string;
          source_name: string;
          organisation_type: string;
          sport: string;
          country: string;
          language: string;
          content_type: string;
          title: string;
          summary: string;
          published_at: string;
          source_url: string;
          image_url: string | null;
          topics: string[];
          official_weight: number;
          status: string;
        };
      };
    };
    Functions: Record<string, never>;
  };
}
