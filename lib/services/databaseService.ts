import { createClient } from '@supabase/supabase-js';
import { MotorcycleShop } from '../types/types';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function shopExists(osmId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .select('id')
    .eq('osm_id', osmId)
    .single();

  return !!data && !error;
}

export async function insertShop(
  shop: Omit<MotorcycleShop, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: MotorcycleShop | null; error: any }> {
  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .insert(shop)
    .select()
    .single();

  return { data, error };
}

export async function updateShop(
  osmId: string,
  updates: Partial<MotorcycleShop>
): Promise<{ data: MotorcycleShop | null; error: any }> {
  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .update(updates)
    .eq('osm_id', osmId)
    .select()
    .single();

  return { data, error };
}

export async function getAllShops(): Promise<MotorcycleShop[]> {
  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .select('*')
    .order('rating', { ascending: false, nullsLast: true });

  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }

  return data || [];
}

export async function getShopsByCountry(
  countryCode: string
): Promise<MotorcycleShop[]> {
  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .select('*')
    .eq('country_code', countryCode)
    .order('rating', { ascending: false, nullsLast: true });

  if (error) {
    console.error('Error fetching shops:', error);
    return [];
  }

  return data || [];
}

export async function getShopsNeedingUpdate(
  daysOld: number = 30
): Promise<MotorcycleShop[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabaseAdmin
    .from('repair_shops')
    .select('*')
    .lt('updated_at', cutoffDate.toISOString())
    .order('updated_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Error fetching shops needing update:', error);
    return [];
  }

  return data || [];
}

export async function deleteShop(osmId: string): Promise<{ error: any }> {
  const { error } = await supabaseAdmin
    .from('repair_shops')
    .delete()
    .eq('osm_id', osmId);

  return { error };
}

export async function getDatabaseStats(): Promise<{
  total: number;
  byCountry: Record<string, number>;
  verified: number;
  withWebsite: number;
  withPhone: number;
}> {
  const shops = await getAllShops();

  const byCountry: Record<string, number> = {};
  shops.forEach((shop) => {
    byCountry[shop.country_code] = (byCountry[shop.country_code] || 0) + 1;
  });

  return {
    total: shops.length,
    byCountry,
    verified: shops.filter((s) => s.verified).length,
    withWebsite: shops.filter((s) => s.website).length,
    withPhone: shops.filter((s) => s.phone).length,
  };
}

export async function batchInsertShops(
  shops: Omit<MotorcycleShop, 'id' | 'created_at' | 'updated_at'>[]
): Promise<{
  inserted: number;
  errors: Array<{ shop: string; error: string }>;
}> {
  const errors: Array<{ shop: string; error: string }> = [];
  let inserted = 0;

  const batchSize = 50;
  for (let i = 0; i < shops.length; i += batchSize) {
    const batch = shops.slice(i, i + batchSize);

    const { data, error } = await supabaseAdmin
      .from('repair_shops')
      .insert(batch)
      .select();

    if (error) {
      batch.forEach((shop) => {
        errors.push({ shop: shop.name, error: error.message });
      });
    } else {
      inserted += data?.length || 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { inserted, errors };
}