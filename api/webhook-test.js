import { sendWebhook } from '../lib/webhook.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const testData = [{
      symbol: '🍩TEST',
      name: 'Test Donut',
      oldPrice: 100,
      newPrice: 115,
      changePercent: '15.00',
      direction: '📈 RAKETE 🚀'
    }];
    
    const result = await sendWebhook(testData);
    
    return res.status(200).json({
      success: result,
      message: result ? 'Webhook test erfolgreich!' : 'Webhook fehlgeschlagen'
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
