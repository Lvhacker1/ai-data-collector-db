import { FilterOptions } from '@/lib/utils/shopUtils';
import { MotorcycleShop } from '@/lib/types/types';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  allShops: MotorcycleShop[];
}

export function FilterBar({ filters, setFilters, allShops }: FilterBarProps) {
  const uniqueCountries = Array.from(
    new Set(allShops.map(shop => shop.country_code).filter(Boolean))
  ).sort();

  const uniqueCities = Array.from(
    new Set(allShops.map(shop => shop.city).filter(Boolean))
  ).sort();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <select
            value={filters.country || ''}
            onChange={(e) => setFilters({ ...filters, country: e.target.value || undefined })}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City
          </label>
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value || undefined })}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Cities</option>
            {uniqueCities.map(city => (
              <option key={city} value={city ?? ''}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Rating
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Options
          </label>
          <label className="flex items-center space-x-2 cursor-pointer bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition">
            <input
              type="checkbox"
              checked={filters.hasWebsite || false}
              onChange={(e) => setFilters({ ...filters, hasWebsite: e.target.checked || undefined })}
              className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
            />
            <span className="text-white text-sm">Has Website</span>
          </label>
        </div>
      </div>

      {(filters.country || filters.city || filters.minRating || filters.hasWebsite) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm transition"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}