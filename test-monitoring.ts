import { queryGoogleAIMode, queryChatGPT, generateQueries, detectMention } from './src/lib/monitoring';

async function testMonitoring() {
  console.log('🧪 Testing GeoWatch Monitoring System\n');

  // Test 1: Generate queries
  console.log('📝 Test 1: Generate queries for "GeoWatch"');
  const queries = generateQueries('GeoWatch');
  console.log('Generated queries:', queries);
  console.log('✓ Query generation works\n');

  // Test 2: Test Google AI Mode
  console.log('🔍 Test 2: Query Google AI Mode');
  try {
    const googleResult = await queryGoogleAIMode('what is geowatch');
    console.log('Google AI Mode response length:', googleResult.response.length);
    console.log('Response preview:', googleResult.response.substring(0, 100) + '...');
    console.log('✓ Google AI Mode works\n');

    // Test 3: Detect mention
    console.log('🔎 Test 3: Detect mention in Google AI Mode response');
    const { mentioned, text } = detectMention(googleResult.response, 'GeoWatch');
    console.log('Mentioned:', mentioned);
    if (mentioned) {
      console.log('Mention context:', text);
    }
    console.log('✓ Mention detection works\n');
  } catch (error) {
    console.error('❌ Google AI Mode failed:', error);
  }

  // Test 4: Test ChatGPT
  console.log('💬 Test 4: Query ChatGPT');
  try {
    const chatResult = await queryChatGPT('what is geowatch');
    console.log('ChatGPT response length:', chatResult.response.length);
    console.log('Response preview:', chatResult.response.substring(0, 100) + '...');
    console.log('✓ ChatGPT works\n');

    // Test 5: Detect mention in ChatGPT
    console.log('🔎 Test 5: Detect mention in ChatGPT response');
    const { mentioned: cMentioned, text: cText } = detectMention(chatResult.response, 'GeoWatch');
    console.log('Mentioned:', cMentioned);
    if (cMentioned) {
      console.log('Mention context:', cText);
    }
    console.log('✓ ChatGPT mention detection works\n');
  } catch (error) {
    console.error('❌ ChatGPT failed:', error);
  }

  console.log('✅ All tests completed!');
}

testMonitoring().catch(console.error);
