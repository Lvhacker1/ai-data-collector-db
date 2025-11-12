import { ShopStats } from '@/lib/types/types';

interface StatsBarProps {
  stats: ShopStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-blue-100 text-sm mt-1">Total Shops</p>
          </div>
          <div className="text-4xl opacity-50">🏪</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{stats.countries}</p>
            <p className="text-purple-100 text-sm mt-1">Countries</p>
          </div>
          <div className="text-4xl opacity-50">🌍</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{stats.verified}</p>
            <p className="text-green-100 text-sm mt-1">Verified</p>
          </div>
          <div className="text-4xl opacity-50">✓</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{stats.withWebsite}</p>
            <p className="text-orange-100 text-sm mt-1">With Website</p>
          </div>
          <div className="text-4xl opacity-50">🌐</div>
        </div>
      </div>
    </div>
  );
}