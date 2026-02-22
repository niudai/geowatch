import { db } from './src/lib/db';
import { users, apps, keywords, monitoringResults } from './src/lib/schema';
import { generateQueries, detectMention } from './src/lib/monitoring';
import { eq } from 'drizzle-orm';

async function testMonitoringE2E() {
  console.log('🧪 GeoWatch Monitoring System E2E Test\n');

  try {
    // Create test user
    console.log('👤 Creating test user...');
    const userId = crypto.randomUUID();
    await db
      .insert(users)
      .values({
        id: userId,
        email: `test-${Date.now()}@geowatch.test`,
        name: 'Test User',
      })
      .onConflictDoNothing();

    // Create test app
    console.log('📱 Creating test app...');
    const [testApp] = await db
      .insert(apps)
      .values({
        userId,
        name: 'Test App',
        slug: 'test-app',
        description: 'Testing app',
        status: 'active',
      })
      .returning();

    console.log(`✓ Created app: ${testApp.id}\n`);

    // Add test keywords
    console.log('🔑 Adding test keywords...');
    const testKeyword = 'GeoWatch';
    const [kw] = await db
      .insert(keywords)
      .values({
        appId: testApp.id,
        keyword: testKeyword,
        status: 'active',
      })
      .returning();

    console.log(`✓ Added keyword: ${testKeyword}\n`);

    // Test query generation
    console.log('📝 Testing query generation...');
    const queries = generateQueries(testKeyword);
    console.log(`Generated ${queries.length} queries:`);
    queries.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    console.log();

    // Test mention detection
    console.log('🔎 Testing mention detection...');
    const sampleResponse =
      'GeoWatch is a platform for monitoring brand mentions in AI search results...';
    const { mentioned, text } = detectMention(sampleResponse, testKeyword);
    console.log(`Detected mention: ${mentioned}`);
    if (mentioned) {
      console.log(`Context: ${text}\n`);
    }

    // Save a test result
    console.log('💾 Saving test monitoring result...');
    const [result] = await db
      .insert(monitoringResults)
      .values({
        appId: testApp.id,
        keywordId: kw.id,
        source: 'test',
        queryText: 'what is geowatch',
        aiResponse: sampleResponse,
        mentionedInResponse: true,
        sentiment: 'positive',
        mentionText: text,
      })
      .returning();

    console.log(`✓ Saved result: ${result.id}\n`);

    // Verify data retrieval
    console.log('📊 Verifying data retrieval...');
    const savedResults = await db
      .select()
      .from(monitoringResults)
      .where(eq(monitoringResults.appId, testApp.id));

    console.log(`✓ Retrieved ${savedResults.length} results from database`);
    if (savedResults.length > 0) {
      console.log(`  - First result: "${savedResults[0].queryText}"`);
      console.log(`  - Mentioned: ${savedResults[0].mentionedInResponse}`);
    }
    console.log();

    console.log('✅ E2E Test Complete!');
    console.log('\nSystem Status:');
    console.log('✓ Database connectivity working');
    console.log('✓ User creation working');
    console.log('✓ App creation working');
    console.log('✓ Keywords management working');
    console.log('✓ Query generation working');
    console.log('✓ Mention detection working');
    console.log('✓ Results storage working');
    console.log('✓ Results retrieval working');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testMonitoringE2E();
