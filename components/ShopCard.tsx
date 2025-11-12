import { MotorcycleShop } from '@/lib/types/types';
import { generateMapUrl } from '@/lib/utils/shopUtils';

interface ShopCardProps {
  shop: MotorcycleShop;
}

export function ShopCard({ shop }: ShopCardProps) {
  const mapUrl = generateMapUrl(shop.latitude ?? undefined, shop.longitude ?? undefined);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-xl hover:border-blue-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-white">{shop.name}</h3>
        {shop.verified && (
          <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-medium">
            ✓ Verified
          </span>
        )}
      </div>

      {shop.rating && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="text-white font-semibold ml-1">{shop.rating.toFixed(1)}</span>
          </div>
          {shop.review_count != null && shop.review_count > 0 && (
            <span className="text-gray-400 text-sm">({shop.review_count} reviews)</span>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-300 mb-4">
        {shop.street_address && (
          <p className="flex items-start gap-2">
            <span className="text-gray-500">📍</span>
            <span>{shop.street_address}</span>
          </p>
        )}
        
        {shop.city && (
          <p className="flex items-center gap-2">
            <span className="text-gray-500">🏙️</span>
            <span>{shop.city}{shop.postal_code && `, ${shop.postal_code}`}</span>
          </p>
        )}

        {shop.country && (
          <p className="flex items-center gap-2">
            <span className="text-gray-500">🌍</span>
            <span>{shop.country}</span>
          </p>
        )}

        {shop.phone && (
          <p className="flex items-center gap-2">
            <span className="text-gray-500">📞</span>
            <a href={`tel:${shop.phone}`} className="text-blue-400 hover:text-blue-300">
              {shop.phone}
            </a>
          </p>
        )}

        {shop.email && (
          <p className="flex items-center gap-2">
            <span className="text-gray-500">✉️</span>
            <a href={`mailto:${shop.email}`} className="text-blue-400 hover:text-blue-300 break-all">
              {shop.email}
            </a>
          </p>
        )}

        {shop.website && (
          <p className="flex items-center gap-2">
            <span className="text-gray-500">🌐</span>
            <a 
              href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 break-all"
            >
              {shop.website.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}
      </div>

      {shop.services && shop.services.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {shop.services.map((service, idx) => (
              <span
                key={idx}
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {shop.opening_hours && (
        <div className="mb-4 text-xs">
          <p className="text-gray-400 font-medium mb-1">Opening Hours:</p>
          <pre className="text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 p-2 rounded">
            {shop.opening_hours}
          </pre>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-700">
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm font-medium transition"
          >
            📍 View on Map
          </a>
        )}
        {shop.website && (
          <a
            href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-center text-sm font-medium transition"
          >
            🌐 Website
          </a>
        )}
      </div>
    </div>
  );
}