import { NextResponse } from 'next/server';
import { processCountry } from '@/lib/services/updateAgent';

export const maxDuration = 300;

const ALL_EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',  
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'  
];

function getCountriesForCurrentBatch(): string[] {
  const hour = new Date().getUTCHours();
  
  if (hour >= 3 && hour < 15) {
    return ALL_EU_COUNTRIES.slice(0, 13);
  } else {
    return ALL_EU_COUNTRIES.slice(13);
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Starting batch update...');

    const DAILY_COUNTRIES = getCountriesForCurrentBatch();
    console.log(`Current batch countries: ${DAILY_COUNTRIES.join(', ')}`);

    const results = [];
    
    for (const countryCode of DAILY_COUNTRIES) {
      try {
        console.log(`Processing ${countryCode}...`);
        
        const result = await processCountry(countryCode, {
          updateOldShops: true,
          maxShops: 30,
        });
        
        results.push(result);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Failed to process ${countryCode}:`, error);
        results.push({
          country: countryCode,
          newShops: 0,
          updatedShops: 0,
          skippedShops: 0,
          errors: [{ shop: countryCode, error: String(error) }],
          duration: 0,
        });
      }
    }

    const summary = results.reduce(
      (acc, r) => ({
        newShops: acc.newShops + r.newShops,
        updatedShops: acc.updatedShops + r.updatedShops,
        skippedShops: acc.skippedShops + r.skippedShops,
      }),
      { newShops: 0, updatedShops: 0, skippedShops: 0 }
    );

    console.log('✅ Daily update complete:', summary);

    return NextResponse.json({
      success: true,
      summary,
      results,
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}