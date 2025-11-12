export interface OSMShop {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:postcode'?: string;
    'addr:city'?: string;
    'addr:country'?: string;
    phone?: string;
    email?: string;
    website?: string;
    opening_hours?: string;
    'contact:phone'?: string;
    'contact:email'?: string;
    'contact:website'?: string;
    [key: string]: any;
  };
}

export interface OSMResponse {
  elements: OSMShop[];
}

export interface NominatimAddress {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  country?: string;
  country_code?: string;
}

export async function searchOSMShops(countryCode: string): Promise<OSMShop[]> {
  const query = `
    [out:json][timeout:60];
    area["ISO3166-1"="${countryCode}"]["admin_level"="2"]->.country;
    (
      node["shop"="motorcycle"]["service:repair"="yes"](area.country);
      node["shop"="motorcycle_repair"](area.country);
      node["craft"="motorcycle_repair"](area.country);
      way["shop"="motorcycle"]["service:repair"="yes"](area.country);
      way["shop"="motorcycle_repair"](area.country);
      way["craft"="motorcycle_repair"](area.country);
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OSMResponse = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching from OSM:', error);
    throw error;
  }
}

export async function getNominatimDetails(
  lat: number,
  lon: number
): Promise<{ address: NominatimAddress } | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MotorcycleShopFinder/1.0',
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    return null;
  }
}

export function extractServices(tags: any): string[] {
  const services: string[] = ['Repair'];

  const serviceMap: Record<string, string> = {
    'service:repair': 'Service',
    'service:vehicle:tyres': 'Tyre Change',
    'service:vehicle:oil_change': 'Oil Change',
    'service:vehicle:parts': 'Parts',
    'service:vehicle:inspection': 'Inspection',
    'service:vehicle:maintenance': 'Maintenance',
  };

  Object.entries(serviceMap).forEach(([tag, service]) => {
    if (tags[tag] === 'yes') {
      services.push(service);
    }
  });

  return services;
}

export function formatAddress(
  tags: any,
  nominatimAddress?: NominatimAddress
): {
  street_address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
} {
  const address = nominatimAddress || {};

  const street = tags['addr:street'] || address.road;
  const houseNumber = tags['addr:housenumber'] || address.house_number;
  const streetAddress = street
    ? `${street}${houseNumber ? ' ' + houseNumber : ''}`
    : null;

  const city =
    tags['addr:city'] ||
    address.city ||
    address.town ||
    address.village ||
    null;

  const postalCode = tags['addr:postcode'] || address.postcode || null;
  const country = tags['addr:country'] || address.country || null;

  return {
    street_address: streetAddress,
    city,
    postal_code: postalCode,
    country,
  };
}

export function getContactInfo(tags: any): {
  phone: string | null;
  email: string | null;
  website: string | null;
} {
  return {
    phone: tags.phone || tags['contact:phone'] || null,
    email: tags.email || tags['contact:email'] || null,
    website: tags.website || tags['contact:website'] || null,
  };
}

export async function rateLimitDelay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}