import { GooglePlacesService } from '../services/googlePlacesService';
import { DatabaseService } from '../services/databaseService';
import { EU_Countries } from '../data/contries';
import { Country } from '../types/types';

export class MotorcycleShopScraper {
    private googleService: GooglePlacesService;
    private dbService: DatabaseService;

    constructor() {
        this.googleService = new GooglePlacesService();
        this.dbService = new DatabaseService();
    }

    async scrapeAllEUCountries(options?: {
        startFromCountry?: string;
        onlyCountries?: string[];
    }): Promise<void> {
        console.log('🚀 Starting motorcycle shop scraping in EU...\n');
        
        let countriesToScrape = EU_Countries;
        
        if (options?.onlyCountries) {
            countriesToScrape = EU_Countries.filter(c => 
                options.onlyCountries!.includes(c.code)
            );
        }
        
        if (options?.startFromCountry) {
            const startIndex = countriesToScrape.findIndex(c => c.code === options.startFromCountry);
            if (startIndex !== -1) {
                countriesToScrape = countriesToScrape.slice(startIndex);
            }
        }

        console.log(`📊 Will scrape ${countriesToScrape.length} countries\n`);
        
        for (let i = 0; i < countriesToScrape.length; i++) {
            const country = countriesToScrape[i];
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🌍 [${i + 1}/${countriesToScrape.length}] ${country.name} (${country.code})`);
            console.log('='.repeat(60));
            
            await this.scrapeCountry(country);
            
            if (i < countriesToScrape.length - 1) {
                console.log('\n⏳ Waiting 5 seconds before next country...');
                await this.delay(5000);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Scraping complete!');
        console.log('='.repeat(60));
        await this.printStats();
    }

    async scrapeCountry(country: Country): Promise<void> {
        try {
            console.log(`🔍 Searching for shops...`);
            const shops = await this.googleService.searchShops(country.code);
            
            console.log(`📊 Found ${shops.length} shops`);

            if (shops.length === 0) {
                console.log(`⚠️  No shops found`);
                await this.dbService.logSearch(country.code, undefined, 0, 'google_places');
                return;
            }

            shops.forEach(shop => {
                shop.country_name = country.name;
            });

            console.log(`💾 Saving to database...`);
            const savedCount = await this.dbService.upsertShopsBulk(shops);
            
            console.log(`✅ Saved ${savedCount} of ${shops.length} shops`);
            
            await this.dbService.logSearch(country.code, undefined, shops.length, 'google_places');

        } catch (error) {
            console.error(`❌ Error scraping ${country.name}:`, error);
        }
    }

    async scrapeMajorCitiesInCountry(countryCode: string): Promise<void> {
        const country = EU_Countries.find(c => c.code === countryCode);
        if (!country) {
            console.error(`❌ Country with code ${countryCode} not found`);
            return;
        }

        const majorCities: Record<string, string[]> = {
            'SE': ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås'],
            'NO': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
            'DK': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
            'FI': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa'],
            'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
            'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
            'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo'],
            'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'],
        };

        const cities = majorCities[countryCode];
        if (!cities) {
            console.log(`⚠️  No preconfigured cities for ${country.name}`);
            return;
        }

        console.log(`\n🌍 Scraping major cities in ${country.name}`);
        console.log(`📍 Cities: ${cities.join(', ')}\n`);

        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            console.log(`\n[${i + 1}/${cities.length}] 📍 ${city}`);
            
            try {
                const shops = await this.googleService.searchShops(countryCode, city);
                console.log(`   Found ${shops.length} shops`);

                if (shops.length > 0) {
                    shops.forEach(shop => {
                        shop.country_name = country.name;
                        shop.city = city;
                    });

                    const savedCount = await this.dbService.upsertShopsBulk(shops);
                    console.log(`   ✅ Saved ${savedCount} shops`);

                    await this.dbService.logSearch(countryCode, city, shops.length, 'google_places');
                }
                
                if (i < cities.length - 1) {
                    await this.delay(3000);
                }
            } catch (error) {
                console.error(`   ❌ Error scraping ${city}:`, error);
            }
        }
    }

    async printStats(): Promise<void> {
        console.log('\n📊 DATABASE STATISTICS:');
        console.log('='.repeat(60));
        
        const stats = await this.dbService.getDatabaseStats();
        if (stats) {
            console.log(`Total shops: ${stats.total_shops}`);
            console.log(`Verified: ${stats.verified_shops}`);
            console.log(`With website: ${stats.shops_with_website}`);
            console.log(`With phone: ${stats.shops_with_phone}`);
        }

        console.log('\n📈 PER COUNTRY:');
        const countryStats = await this.dbService.getShopCountByCountry();
        
        const sorted = Object.entries(countryStats).sort((a, b) => b[1] - a[1]);
        
        sorted.forEach(([code, count]) => {
            const country = EU_Countries.find(c => c.code === code);
            const name = country ? country.name : code;
            console.log(`  ${code} (${name}): ${count} shops`);
        });
        
        console.log('='.repeat(60));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}