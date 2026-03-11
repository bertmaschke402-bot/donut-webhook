export async function sendWebhook(data) {
  try {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('No webhook URL configured');
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: formatDiscordMessage(data),
        username: 'Donut Stock Alert',
        avatar_url: 'https://example.com/donut-icon.png' // Optional
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }

    console.log('Webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending webhook:', error);
    return false;
  }
}

function formatDiscordMessage(data) {
  if (Array.isArray(data)) {
    if (data.length === 0) return 'Keine krassen Veränderungen 🍩';
    
    let message = '**🚨 DONUT ALERT - KRASSE BEWEGUNGEN!**\n\n';
    data.forEach(item => {
      message += `${item.direction} **${item.symbol}** - ${item.name}\n`;
      message += `Preis: ${item.oldPrice}€ → ${item.newPrice}€\n`;
      message += `Änderung: **${item.changePercent}%**\n\n`;
    });
    return message;
  }
  
  return JSON.stringify(data, null, 2);
}
