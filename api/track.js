import { fetchDonutPrices, analyzePriceChanges } from '../lib/donut-api.js';
import { sendWebhook, testWebhook } from '../lib/webhook.js';

let previousPrices = {};

export default async function handler(req, res) {
  // 🔍 DEBUG: Zeig alles an was ankommt
  console.log('🔥 Request erhalten:');
  console.log('- Method:', req.method);
  console.log('- Query:', req.query);
  console.log('- Headers:', req.headers['x-cron-secret']);
  
  // 1️⃣ Secret aus verschiedenen Quellen holen
  const secretFromQuery = req.query.secret;
  const secretFromHeader = req.headers['x-cron-secret'];
  const cronSecret = secretFromQuery || secretFromHeader;
  
  // 2️⃣ Gegen das gespeicherte Secret prüfen (OHNE trim Probleme)
  const expectedSecret = process.env.CRON_SECRET || 'bert11'; // Fallback
  
  console.log('🔐 Secret Check:');
  console.log('- Von Query:', secretFromQuery);
  console.log('- Von Header:', secretFromHeader);
  console.log('- Erwartet:', expectedSecret);
  
  if (!cronSecret || cronSecret !== expectedSecret) {
    return res.status(401).json({ 
      error: 'Unauthorized - falsches Secret!',
      hint: 'Benutz: ?secret=bert11',
      received: cronSecret,
      expected: expectedSecret
    });
  }

  // 3️⃣ Test-Modus
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

  // 4️⃣ Normale Ausführung
  try {
    console.log('🔍 Donut-Tracker gestartet:', new Date().toISOString());
    
    // ⚠️ TEMPORÄR: Immer Test-Daten zurückgeben bis API fertig
    return res.status(200).json({
      success: true,
      message: 'API funktioniert! (Tracker bald bereit)',
      timestamp: new Date().toISOString()
    });
    
    /* AUSKOMMENTIERT bis DonutSMP API klar ist
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
    */

  } catch (error) {
    console.error('❌ Fehler im Tracker:', error);
    return res.status(500).json({ error: error.message });
  }
}
