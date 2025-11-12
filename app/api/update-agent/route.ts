import { NextRequest, NextResponse } from 'next/server';
import { runUpdateAgent, refreshOldShops } from '@/lib/services/updateAgent';

export async function POST(request: NextRequest) {
  try {
    const {
      action = 'import',
      countryCodes = ['SE'],
      updateOldShops = false,
      maxShopsPerCountry,
      daysOld = 30,
    } = await request.json();

    if (action === 'refresh') {
      const result = await refreshOldShops(daysOld);
      return NextResponse.json({
        success: true,
        action: 'refresh',
        ...result,
      });
    }

    const results = await runUpdateAgent({
      countryCodes,
      updateOldShops,
      maxShopsPerCountry,
    });

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

    return NextResponse.json({
      success: true,
      action: 'import',
      summary,
      results,
    });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json(
      {
        error: 'Update agent failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Update Agent API',
    actions: {
      import: {
        description: 'Import new shops and optionally update existing ones',
        example: {
          action: 'import',
          countryCodes: ['SE', 'NO', 'DK'],
          updateOldShops: false,
          maxShopsPerCountry: 100,
        },
      },
      refresh: {
        description: 'Refresh shops older than X days',
        example: {
          action: 'refresh',
          daysOld: 30,
        },
      },
    },
  });
}