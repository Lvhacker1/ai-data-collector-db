import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { MotorcycleShop } from '../types/types';

interface ShopStats {
  total: number;
  countries: number;
  verified: number;
  withWebsite: number;
}

export function useShops() {
  const [shops, setShops] = useState<MotorcycleShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('repair_shops')
        .select('*')
        .order('rating', { ascending: false });

      if (fetchError) throw fetchError;
      
      setShops(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shops');
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  return { shops, loading, error, refetch: fetchShops };
}

export function useShopStats() {
  const [stats, setStats] = useState<ShopStats>({
    total: 0,
    countries: 0,
    verified: 0,
    withWebsite: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        const [
          { count: total },
          { data: countries },
          { data: verified },
          { data: withWebsite }
        ] = await Promise.all([
          supabase.from('repair_shops').select('*', { count: 'exact', head: true }),
          supabase.from('repair_shops').select('country_code'),
          supabase.from('repair_shops').select('id').eq('verified', true),
          supabase.from('repair_shops').select('id').not('website', 'is', null)
        ]);

        const uniqueCountries = new Set(countries?.map(s => s.country_code));

        setStats({
          total: total || 0,
          countries: uniqueCountries.size,
          verified: verified?.length || 0,
          withWebsite: withWebsite?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}