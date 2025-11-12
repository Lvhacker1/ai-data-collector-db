export const APP_CONFIG = {
  name: 'Motorcycle Repair Shops',
  description: 'Find motorcycle repair shops across Europe',
  defaultLanguage: 'en',
  itemsPerPage: 12,
  mapDefaultZoom: 10,
} as const;

export const UI_TEXT = {
  header: {
    title: 'Motorcycle Repair Shops',
    subtitle: 'Find motorcycle repair shops across Europe',
    refreshButton: 'Refresh',
  },
  loading: {
    message: 'Loading motorcycle shops...',
  },
  stats: {
    totalShops: 'Total Shops',
    countries: 'Countries',
    verified: 'Verified',
    withWebsite: 'With Website',
  },
  filters: {
    title: 'Filters',
    search: 'Search',
    searchPlaceholder: 'Search by name, address, or city...',
    country: 'Country',
    countryAll: 'All Countries',
    city: 'City',
    cityAll: 'All Cities',
    minRating: 'Minimum Rating',
    hasWebsite: 'Has Website',
    clearAll: 'Clear All Filters',
  },
  sorting: {
    label: 'Sort by',
    rating: 'Rating',
    name: 'Name',
    country: 'Country',
  },
  shopCard: {
    verified: 'Verified',
    reviews: 'reviews',
    openingHours: 'Opening Hours',
    visitWebsite: 'Visit Website',
    viewOnMap: 'Map',
    dataSource: 'Source',
    lastUpdated: 'Updated',
  },
  results: {
    shopsFound: 'Shops Found',
    noResults: 'No shops found matching your filters.',
    clearFilters: 'Clear Filters',
  },
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
} as const;

export const RATING_OPTIONS = [
  { value: 0, label: 'All Ratings' },
  { value: 3, label: '3+ Stars' },
  { value: 4, label: '4+ Stars' },
  { value: 4.5, label: '4.5+ Stars' },
] as const;

export const SORT_OPTIONS = [
  { value: 'rating', label: UI_TEXT.sorting.rating },
  { value: 'name', label: UI_TEXT.sorting.name },
  { value: 'country', label: UI_TEXT.sorting.country },
] as const;

export const COLORS = {
  primary: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  neutral: 'gray',
} as const;

export const ICONS = {
  motorcycle: '🏍️',
  location: '📍',
  globe: '🌍',
  phone: '📞',
  website: '🌐',
  verified: '✓',
  star: '★',
  refresh: '🔄',
  search: '🔍',
  filter: '🎯',
} as const;