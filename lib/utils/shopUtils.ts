import { MotorcycleShop } from '../types/types';

export interface FilterOptions {
  country?: string;
  city?: string;
  minRating?: number;
  hasWebsite?: boolean;
  searchTerm?: string;
}

export type SortOption = 'rating' | 'name' | 'country';

export function filterShops(shops: MotorcycleShop[], filters: FilterOptions): MotorcycleShop[] {
  let filtered = [...shops];

  if (filters.country) {
    filtered = filtered.filter(shop => shop.country_code === filters.country);
  }

  if (filters.city) {
    filtered = filtered.filter(shop => 
      shop.city?.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }

  if (filters.minRating && filters.minRating > 0) {
    filtered = filtered.filter(shop => (shop.rating || 0) >= filters.minRating!);
  }

  if (filters.hasWebsite) {
    filtered = filtered.filter(shop => Boolean(shop.website));
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(shop =>
      shop.name.toLowerCase().includes(term) ||
      shop.street_address?.toLowerCase().includes(term) ||
      shop.city?.toLowerCase().includes(term)
    );
  }

  return filtered;
}

export function sortShops(shops: MotorcycleShop[], sortBy: SortOption): MotorcycleShop[] {
  return [...shops].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'country':
        return a.country_code.localeCompare(b.country_code);
      default:
        return 0;
    }
  });
}

export function getUniqueValues<T>(items: T[], key: keyof T): string[] {
  return Array.from(
    new Set(
      items
        .map(item => item[key])
        .filter(Boolean)
        .map(val => String(val))
    )
  ).sort();
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function formatUrl(url: string | undefined): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function generateMapUrl(latitude?: number, longitude?: number): string | null {
  if (!latitude || !longitude) return null;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}