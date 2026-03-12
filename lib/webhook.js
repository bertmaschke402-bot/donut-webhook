// lib/webhook.js - GANZ EINFACH, nur zum Testen
export async function sendWebhook(data) {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    console.log('📤 Sende an Discord:', webhookUrl);
    console.log('📦 Daten:', JSON.stringify(data, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '🍩 TEST von Vercel! ' + new Date().toLocaleString('de-DE')
      })
    });

    const responseText = await response.text();
    console.log('📨 Discord Antwort:', response.status, responseText);
    
    return response.ok;
  } catch (error) {
    console.error('❌ KRASSER FEHLER:', error);
    return false;
  }
}

export async function testWebhook() {
  return await sendWebhook(null);
}
