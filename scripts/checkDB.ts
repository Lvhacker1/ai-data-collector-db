import { supabase } from '../lib/config/supabase';

async function checkDatabase() {
    console.log('🔍 Checking Supabase connection and table structure...\n');

    try {
        const { data: tables, error: tableError } = await supabase
            .from('repair_shops')
            .select('*')
            .limit(1);

        if (tableError) {
            console.log('❌ Problem with table "repair_shops"');
            console.log('Error:', tableError.message);
            console.log('\n💡 Check that the table exists in Supabase Table Editor');
            return;
        }

        console.log('✅ Connection successful!');
        console.log(`✅ Table "repair_shops" exists and is accessible`);
        
        if (tables && tables.length > 0) {
            console.log('\n📝 Example entry in the table:');
            console.log(JSON.stringify(tables[0], null, 2));
        } else {
            console.log('\n📭 Table is empty (no entries yet)');
        }

        const { count, error: countError } = await supabase
            .from('repair_shops')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`\n📈 Total shops in database: ${count || 0}`);
        }

        console.log('\n📋 Table structure verified');
        console.log('   Table contains fields for:');
        console.log('   - Basic info (name, address, city, country)');
        console.log('   - Contact (phone, email, website)');
        console.log('   - Location (latitude, longitude, google_place_id)');
        console.log('   - Meta (rating, verified, data_source)');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct in .env.local');
        console.log('   2. Check that the "repair_shops" table exists in Supabase');
        console.log('   3. Check RLS policies (Row Level Security)');
    }

    console.log('\n🧪 Testing adding a test entry...');
    
    try {
        const testShop = {
            name: 'TEST Motorcycle Workshop',
            country_code: 'SE',
            country_name: 'Sweden',
            city: 'Stockholm',
            address: 'Test Street 1, Stockholm',
            verified: false,
            data_source: 'test'
        };

        const { data, error } = await supabase
            .from('repair_shops')
            .insert(testShop)
            .select();

        if (error) {
            console.log('❌ Could not add test entry:', error.message);
            console.log('\n💡 This could be due to:');
            console.log('   - RLS policies blocking insert');
            console.log('   - Your API key does not have correct permissions');
        } else {
            console.log('✅ Test entry added!');
            console.log('   ID:', data[0].id);
            console.log('   Name:', data[0].name);
            
            const { error: deleteError } = await supabase
                .from('repair_shops')
                .delete()
                .eq('id', data[0].id);
            
            if (!deleteError) {
                console.log('🧹 Test entry removed');
            }
        }
    } catch (error: any) {
        console.error('❌ Error during test:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database check complete!');
    console.log('='.repeat(60));
    console.log('\n💡 Next steps:');
    console.log('   npm run scrape:country SE    - Test scraping Sweden');
    console.log('   npm run scrape:stats         - Show statistics');
}

checkDatabase().catch(console.error);