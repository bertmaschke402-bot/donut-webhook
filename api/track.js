import { fetchDonutPrices, analyzePriceChanges } from '../lib/donut-api.js';
import { sendWebhook } from '../lib/webhook.js';

// In-Memory Storage für vorherige Preise (bei Serverless-Funktionen)
// Besser wäre Redis oder ähnliches für Production!
let previousPrices = {};

export default async function handler(req, res) {
  // Optional: Auth-Token check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Donut-Tracker gestartet:', new Date().toISOString());
    
    // Aktuelle Preise fetchen
    const currentPrices = await fetchDonutPrices();
    
    if (!currentPrices) {
      return res.status(500).json({ error: 'Failed to fetch prices' });
    }

    // Analyse nur wenn wir vorherige Preise haben
    let significantChanges = [];
    if (Object.keys(previousPrices).length > 0) {
      significantChanges = analyzePriceChanges(currentPrices, previousPrices);
      
      // Webhook bei krassen Änderungen senden
      if (significantChanges.length > 0) {
        await sendWebhook(significantChanges);
        console.log(`✅ ${significantChanges.length} krass Änderungen entdeckt!`);
      } else {
        console.log('😴 Alles ruhig im Donut-Land');
      }
    }

    // Preise für nächstes Mal speichern
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
