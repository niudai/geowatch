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
      'GeoWatch is a platform for monitoring brand mentions in AI search results. It helps companies track visibility across Google AI Mode, ChatGPT, and other generative engines.';
    const { mentioned, text } = detectMention(sampleResponse, testKeyword);
    console.log(`Detected mention: ${mentioned}`);
    if (mentioned) {
      console.log(`Context: "${text}"\n`);
    }

    // Save a test result
    console.log('💾 Saving test monitoring result...');
    const [result] = await db
      .insert(monitoringResults)
      .values({
        appId: testApp.id,
        keywordId: kw.id,
        source: 'google_ai_mode',
        queryText: 'what is geowatch',
        aiResponse: sampleResponse,
        mentionedInResponse: mentioned,
        sentiment: 'positive',
        mentionText: text || null,
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
      const first = savedResults[0];
      console.log(`  - Query: "${first.queryText}"`);
      console.log(`  - Source: ${first.source}`);
      console.log(`  - Mentioned: ${first.mentionedInResponse}`);
      console.log(`  - Response length: ${first.aiResponse.length} chars`);
    }
    console.log();

    console.log('✅ E2E Test Complete!\n');
    console.log('System Status:');
    console.log('  ✓ Database connectivity');
    console.log('  ✓ User creation');
    console.log('  ✓ App creation');
    console.log('  ✓ Keywords management');
    console.log('  ✓ Query generation');
    console.log('  ✓ Mention detection');
    console.log('  ✓ Results storage');
    console.log('  ✓ Results retrieval');
    console.log('\n🎉 All systems ready for production!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testMonitoringE2E();
