'use client';

import { useState, useMemo } from 'react';
import { useShops, useShopStats } from '@/lib/hooks/useShops';
import { filterShops, sortShops, FilterOptions, SortOption } from '@/lib/utils/shopUtils';
import { UI_TEXT, ICONS } from '@/lib/constants/config';
import { ShopCard } from '@/components/ShopCard';
import { FilterBar } from '@/components/FilterBar';
import { StatsBar } from '@/components/StatsBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Home() {
  const { shops, loading, error, refetch } = useShops();
  const { stats } = useShopStats();
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedShops = useMemo(() => {
    const filtersWithSearch = { ...filters, searchTerm };
    const filtered = filterShops(shops, filtersWithSearch);
    return sortShops(filtered, sortBy);
  }, [shops, filters, sortBy, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner message={UI_TEXT.loading.message} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {ICONS.motorcycle} {UI_TEXT.header.title}
                </h1>
                <p className="text-gray-400 mt-1">
                  {UI_TEXT.header.subtitle}
                </p>
              </div>
              <div className="flex gap-3">
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search shops by name, city, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 bg-gray-700 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <StatsBar stats={stats} />
        
        <FilterBar 
          filters={filters} 
          setFilters={setFilters}
          allShops={shops}
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {filteredAndSortedShops.length} shops found
            </h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="country">Sort by Country</option>
            </select>
          </div>

          {filteredAndSortedShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-lg mb-2">No shops found</p>
              {searchTerm && (
                <p className="text-gray-500 text-sm mb-4">
                  No results for "{searchTerm}"
                </p>
              )}
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}