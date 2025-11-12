#!/usr/bin/env tsx

import 'dotenv/config';
import { runUpdateAgent } from '../lib/services/updateAgent';

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

const NORDIC_COUNTRIES = ['SE', 'NO', 'DK', 'FI'];

async function main() {
  const args = process.argv.slice(2);
  
  let countryCodes: string[] = NORDIC_COUNTRIES;
  let updateOldShops = false;
  let maxShopsPerCountry: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--all-eu') {
      countryCodes = EU_COUNTRIES;
    } else if (arg === '--countries' && args[i + 1]) {
      countryCodes = args[i + 1].split(',');
      i++;
    } else if (arg === '--update') {
      updateOldShops = true;
    } else if (arg === '--limit' && args[i + 1]) {
      maxShopsPerCountry = parseInt(args[i + 1]);
      i++;
    } else if (arg === '--help') {
      console.log(`
Update Agent CLI

Usage:
  npm run agent
  npm run agent -- --all-eu
  npm run agent -- --countries SE,NO,DK
  npm run agent -- --update
  npm run agent -- --limit 50

Examples:
  npm run agent -- --countries SE --update --limit 10
  npm run agent -- --all-eu --update
      `);
      process.exit(0);
    }
  }

  console.log('🤖 Starting Update Agent CLI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Countries: ${countryCodes.join(', ')}`);
  console.log(`Update existing: ${updateOldShops}`);
  if (maxShopsPerCountry) {
    console.log(`Limit per country: ${maxShopsPerCountry}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const results = await runUpdateAgent({
      countryCodes,
      updateOldShops,
      maxShopsPerCountry,
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Final Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    results.forEach((result) => {
      console.log(`\n${result.country}:`);
      console.log(`  ✅ New: ${result.newShops}`);
      console.log(`  🔄 Updated: ${result.updatedShops}`);
      console.log(`  ⏭️  Skipped: ${result.skippedShops}`);
      if (result.errors.length > 0) {
        console.log(`  ❌ Errors: ${result.errors.length}`);
      }
      console.log(`  ⏱️  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    });

    const totals = results.reduce(
      (acc, r) => ({
        new: acc.new + r.newShops,
        updated: acc.updated + r.updatedShops,
        skipped: acc.skipped + r.skippedShops,
        errors: acc.errors + r.errors.length,
      }),
      { new: 0, updated: 0, skipped: 0, errors: 0 }
    );

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Total:');
    console.log(`  ✅ ${totals.new} new shops imported`);
    console.log(`  🔄 ${totals.updated} shops updated`);
    console.log(`  ⏭️  ${totals.skipped} shops skipped`);
    if (totals.errors > 0) {
      console.log(`  ❌ ${totals.errors} errors`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();