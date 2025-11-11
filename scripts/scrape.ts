import { MotorcycleShopScraper } from '../lib/scraper/motorcycleScraper';
import { EU_Countries } from '../lib/data/contries';

async function main() {
    const scraper = new MotorcycleShopScraper();

    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'all':
            await scraper.scrapeAllEUCountries();
            break;

        case 'country':
            const countryCode = args[1];
            if (!countryCode) {
                console.error('❌ Provide country code, e.g.: npm run scrape:country SE');
                process.exit(1);
            }
            const country = EU_Countries.find(c => c.code === countryCode.toUpperCase());
            if (!country) {
                console.error(`❌ Invalid country code: ${countryCode}`);
                process.exit(1);
            }
            await scraper.scrapeCountry(country);
            break;

        case 'cities':
            const countryForCities = args[1];
            if (!countryForCities) {
                console.error('❌ Provide country code, e.g.: npm run scrape:cities SE');
                process.exit(1);
            }
            await scraper.scrapeMajorCitiesInCountry(countryForCities.toUpperCase());
            break;

        case 'stats':
            await scraper.printStats();
            break;

        case 'nordic':
            await scraper.scrapeAllEUCountries({
                onlyCountries: ['SE', 'NO', 'DK', 'FI']
            });
            break;

        default:
            console.log('📖 USAGE:');
            console.log('  npm run scrape:all          - Scrape all EU countries');
            console.log('  npm run scrape:country SE   - Scrape a specific country');
            console.log('  npm run scrape:cities SE    - Scrape cities in a country');
            console.log('  npm run scrape:nordic       - Scrape Nordic countries only');
            console.log('  npm run scrape:stats        - Show statistics');
            console.log('\n  npm run check-db            - Test database connection');
            break;
    }
}

main().catch(console.error);