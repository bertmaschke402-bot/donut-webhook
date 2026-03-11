// api/test.js - Drück das einmal aus und es sendet einen Test-Webhook
import { testWebhook } from '../lib/webhook.js';

export default async function handler(req, res) {
  // Check ob secret stimmt (Sicherheit!)
  const secret = req.query.secret || req.headers['x-cron-secret'];
  
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ 
      error: 'Unauthorized - falsches Secret!',
      hint: 'Benutz: ?secret=dein-secret-hier'
    });
  }

  try {
    console.log('🧪 Test-Webhook wird gesendet...');
    
    // Test-Webhook senden
    const result = await testWebhook();
    
    if (result) {
      console.log('✅ Test erfolgreich!');
      res.status(200).json({
        success: true,
        message: 'Test-Webhook wurde an Discord gesendet! 🍩',
        timestamp: new Date().toISOString(),
        discord: 'Check deinen Discord-Channel!'
      });
    } else {
      throw new Error('Test fehlgeschlagen');
    }
  } catch (error) {
    console.error('❌ Test fehlgeschlagen:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: 'Check ob WEBHOOK_URL in .env stimmt'
    });
  }
}
