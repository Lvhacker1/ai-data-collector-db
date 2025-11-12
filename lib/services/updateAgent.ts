import {
  searchOSMShops,
  getNominatimDetails,
  extractServices,
  formatAddress,
  getContactInfo,
  rateLimitDelay,
} from './osmService';
import {
  shopExists,
  insertShop,
  updateShop,
  getShopsNeedingUpdate,
} from './databaseService';
import { MotorcycleShop } from '../types/types';

export interface UpdateAgentResult {
  country: string;
  newShops: number;
  updatedShops: number;
  skippedShops: number;
  errors: Array<{ shop: string; error: string }>;
  duration: number;
}

export interface UpdateAgentConfig {
  countryCodes: string[];
  updateOldShops: boolean;
  maxShopsPerCountry?: number;
}

export async function processCountry(
  countryCode: string,
  config: { updateOldShops: boolean; maxShops?: number }
): Promise<UpdateAgentResult> {
  const startTime = Date.now();
  const result: UpdateAgentResult = {
    country: countryCode,
    newShops: 0,
    updatedShops: 0,
    skippedShops: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log(`[${countryCode}] Fetching shops from OpenStreetMap...`);

    const osmShops = await searchOSMShops(countryCode);
    console.log(`[${countryCode}] Found ${osmShops.length} shops`);

    const shopsToProcess = config.maxShops
      ? osmShops.slice(0, config.maxShops)
      : osmShops;

    for (const osmShop of shopsToProcess) {
      try {
        const lat = osmShop.lat || (osmShop as any).center?.lat;
        const lon = osmShop.lon || (osmShop as any).center?.lon;

        if (!lat || !lon) {
          result.skippedShops++;
          continue;
        }

        const tags = osmShop.tags || {};
        const osmId = `${osmShop.type}${osmShop.id}`;
        const name = tags.name || `Motorcycle Shop ${osmShop.id}`;

        const exists = await shopExists(osmId);

        let addressDetails = null;
        if (!tags['addr:city'] || !exists) {
          addressDetails = await getNominatimDetails(lat, lon);
          await rateLimitDelay(1000);
        }

        const address = formatAddress(tags, addressDetails?.address);
        const contact = getContactInfo(tags);
        const services = extractServices(tags);

        const shopData: Omit<
          MotorcycleShop,
          'id' | 'created_at' | 'updated_at'
        > = {
          name,
          description: `Motorcycle repair shop from OpenStreetMap`,
          street_address: address.street_address,
          postal_code: address.postal_code,
          city: address.city,
          country: address.country,
          country_code: countryCode,
          latitude: lat,
          longitude: lon,
          phone: contact.phone,
          email: contact.email,
          website: contact.website,
          opening_hours: tags.opening_hours || null,
          verified: false,
          rating: null,
          review_count: 0,
          osm_id: osmId,
          osm_type: osmShop.type,
          services,
        };

        if (exists) {
          if (config.updateOldShops) {
            const { error } = await updateShop(osmId, shopData);
            if (error) {
              result.errors.push({ shop: name, error: error.message });
            } else {
              result.updatedShops++;
            }
          } else {
            result.skippedShops++;
          }
        } else {
          const { error } = await insertShop(shopData);
          if (error) {
            result.errors.push({ shop: name, error: error.message });
          } else {
            result.newShops++;
          }
        }

        await rateLimitDelay(200);
      } catch (error) {
        result.errors.push({
          shop: osmShop.tags?.name || `Shop ${osmShop.id}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    result.errors.push({
      shop: countryCode,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  result.duration = Date.now() - startTime;
  return result;
}

export async function runUpdateAgent(
  config: UpdateAgentConfig
): Promise<UpdateAgentResult[]> {
  console.log('🤖 Starting Update Agent...');
  console.log(`Countries: ${config.countryCodes.join(', ')}`);
  console.log(`Update old shops: ${config.updateOldShops}`);

  const results: UpdateAgentResult[] = [];

  for (const countryCode of config.countryCodes) {
    try {
      const result = await processCountry(countryCode, {
        updateOldShops: config.updateOldShops,
        maxShops: config.maxShopsPerCountry,
      });
      results.push(result);

      console.log(`[${countryCode}] Complete:`, {
        new: result.newShops,
        updated: result.updatedShops,
        skipped: result.skippedShops,
        errors: result.errors.length,
        duration: `${(result.duration / 1000).toFixed(2)}s`,
      });

      await rateLimitDelay(2000);
    } catch (error) {
      console.error(`[${countryCode}] Failed:`, error);
      results.push({
        country: countryCode,
        newShops: 0,
        updatedShops: 0,
        skippedShops: 0,
        errors: [
          {
            shop: countryCode,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
        duration: 0,
      });
    }
  }

  const summary = results.reduce(
    (acc, r) => ({
      newShops: acc.newShops + r.newShops,
      updatedShops: acc.updatedShops + r.updatedShops,
      skippedShops: acc.skippedShops + r.skippedShops,
      errors: acc.errors + r.errors.length,
      duration: acc.duration + r.duration,
    }),
    { newShops: 0, updatedShops: 0, skippedShops: 0, errors: 0, duration: 0 }
  );

  console.log('\n✅ Update Agent Complete:');
  console.log(`Total new shops: ${summary.newShops}`);
  console.log(`Total updated: ${summary.updatedShops}`);
  console.log(`Total skipped: ${summary.skippedShops}`);
  console.log(`Total errors: ${summary.errors}`);
  console.log(`Total duration: ${(summary.duration / 1000 / 60).toFixed(2)}m`);

  return results;
}

export async function refreshOldShops(daysOld: number = 30): Promise<{
  updated: number;
  errors: Array<{ shop: string; error: string }>;
}> {
  console.log(`🔄 Refreshing shops older than ${daysOld} days...`);

  const oldShops = await getShopsNeedingUpdate(daysOld);
  console.log(`Found ${oldShops.length} shops to refresh`);

  const errors: Array<{ shop: string; error: string }> = [];
  let updated = 0;

  for (const shop of oldShops) {
    try {
      const addressDetails = await getNominatimDetails(
        shop.latitude!,
        shop.longitude!
      );

      if (addressDetails) {
        await updateShop(shop.osm_id!, {
          updated_at: new Date().toISOString(),
        });
        updated++;
      }

      await rateLimitDelay(1000);
    } catch (error) {
      errors.push({
        shop: shop.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log(`✅ Refreshed ${updated} shops with ${errors.length} errors`);
  return { updated, errors };
}