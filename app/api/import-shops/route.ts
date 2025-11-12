import { NextRequest, NextResponse } from 'next/server';
import { processCountry } from '@/lib/services/updateAgent';

export async function POST(request: NextRequest) {
  try {
    const { countryCode, updateOldShops = false } = await request.json();

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    console.log(`Starting import for ${countryCode}...`);

    const result = await processCountry(countryCode, {
      updateOldShops,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Failed to import shops',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to import shops from OpenStreetMap',
    example: {
      countryCode: 'SE',
      updateOldShops: false,
    },
  });
}
