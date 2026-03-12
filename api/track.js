iimport { fetchDonutPrices, analyzePriceChanges } from '../lib/donut-api.js';
import { sendWebhook, testWebhook } from '../lib/webhook.js';

let previousPrices = {};

export default async function handler(req, res) {
  // 🔐 TOLERANTE Secret-Prüfung
  const secretFromQuery = req.query.secret;
  const secretFromHeader = req.headers['x-cron-secret'];
  const secretFromBody = req.body?.secret;
  
  const cronSecret = secretFromQuery || secretFromHeader || secretFromBody;
  
  console.log('🔍 Debug:');
  console.log('- Secret aus Query:', secretFromQuery);
  console.log('- Secret aus Header:', secretFromHeader);
  console.log('- Secret aus Body:', secretFromBody);
  console.log('- Erwartetes Secret:', process.env.CRON_SECRET);
  
  // Prüfung (ohne Leerzeichen!)
  if (!cronSecret || cronSecret.trim() !== process.env.CRON_SECRET?.trim()) {
    return res.status(401).json({ 
      error: 'Unauthorized - falsches Secret!',
      hint: 'Benutz: ?secret=bert11',
      received: cronSecret,
      expected: process.env.CRON_SECRET
    });
  }

  // 🔥 TEST-MODUS: Wenn ?test=true im URL
  if (req.query.test === 'true' || req.query.test === '1') {
    console.log('🧪 Test-Modus aktiviert!');
    const testResult = await testWebhook();
    
    return res.status(200).json({
      mode: 'test',
      success: testResult,
      message: testResult ? 'Test-Webhook gesendet! Check Discord 🍩' : 'Test fehlgeschlagen',
      timestamp: new Date().toISOString()
    });
  }

  // Normale Ausführung (Cron-Job)
  try {
    console.log('🔍 Donut-Tracker gestartet:', new Date().toISOString());
    
    const currentPrices = await fetchDonutPrices();
    
    if (!currentPrices) {
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }

    let significantChanges = [];
    if (Object.keys(previousPrices).length > 0) {
      significantChanges = analyzePriceChanges(currentPrices, previousPrices);
      
      if (significantChanges.length > 0) {
        await sendWebhook(significantChanges);
        console.log(`✅ ${significantChanges.length} krass Änderungen entdeckt!`);
      }
    }

    previousPrices = currentPrices;

    return res.status(200).json({
      success: true,
      tracked: significantChanges.length,
      changes: significantChanges,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fehler im Tracker:', error);
    return res.status(500).json({ error: error.message });
  }
}
