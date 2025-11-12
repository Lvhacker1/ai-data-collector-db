export interface MotorcycleShop {
  id?: string;
  name: string;
  description?: string | null;
  street_address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
  country_code: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  opening_hours?: string | null;
  services?: string[] | null;
  verified?: boolean;
  rating?: number | null;
  review_count?: number;
  osm_id?: string | null;
  osm_type?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface Country {
  code: string;
  name: string;
  flag?: string;
}

export interface ShopStats {
  total: number;
  countries: number;
  verified: number;
  withWebsite: number;
}

export interface FilterOptions {
  country?: string;
  city?: string;
  minRating?: number;
  hasWebsite?: boolean;
  searchTerm?: string;
}

export type SortOption = 'rating' | 'name' | 'country';

export interface OSMElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags: Record<string, string>;
}

export interface OSMResponse {
  version: number;
  generator: string;
  elements: OSMElement[];
}

export interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}