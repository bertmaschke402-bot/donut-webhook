import { fetchDonutPrices, analyzePriceChanges } from '../lib/donut-api.js';
import { sendWebhook, testWebhook } from '../lib/webhook.js';

// In-Memory Speicher für vorherige Preise
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
  
  // 2️⃣ Gegen das gespeicherte Secret prüfen
  const expectedSecret = process.env.CRON_SECRET || 'bert11';
  
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

  // 3️⃣ TEST-MODUS: Wenn ?test=true im URL
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

  // 4️⃣ NORMBLER MODUS: Echte DonutSMP Daten checken
  try {
    console.log('🔍 Donut-Tracker gestartet:', new Date().toISOString());
    
    // ECHTE DonutSMP Daten holen
    const currentPrices = await fetchDonutPrices();
    
    if (!currentPrices) {
      return res.status(500).json({ 
        error: 'Failed to fetch DonutSMP prices',
        hint: 'Check ob DONUT_API_KEY und DONUT_API_URL in Vercel eingetragen sind'
      });
    }

    console.log('📊 Aktuelle DonutSMP Daten:', Object.keys(currentPrices).length, 'Spieler');
    
    let significantChanges = [];
    
    // Ersten Durchlauf: Nur speichern, keine Alerts
    if (Object.keys(previousPrices).length === 0) {
      console.log('📝 Erster Durchlauf - Speichere Ausgangsdaten');
      previousPrices = currentPrices;
      
      return res.status(200).json({
        success: true,
        message: 'Erster Durchlauf - Daten gespeichert, nächste Checks bringen Alerts',
        players: Object.keys(currentPrices).length,
        timestamp: new Date().toISOString()
      });
    }
    
    // Zweiter+ Durchlauf: Vergleichen und Alerts senden
    significantChanges = analyzePriceChanges(currentPrices, previousPrices);
    
    if (significantChanges.length > 0) {
      console.log(`✅ ${significantChanges.length} krasse Änderungen entdeckt!`);
      await sendWebhook(significantChanges);
    } else {
      console.log('😴 Keine krassen Änderungen - alles ruhig');
    }

    // Preise für nächstes Mal speichern
    previousPrices = currentPrices;

    return res.status(200).json({
      success: true,
      tracked: significantChanges.length,
      changes: significantChanges,
      players: Object.keys(currentPrices).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ KRASSER FEHLER im Tracker:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
