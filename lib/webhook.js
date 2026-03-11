// In lib/webhook.js - für DonutSMP
function formatDiscordMessage(data) {
  if (Array.isArray(data) && data.length > 0) {
    let message = '**🍩 DONUTSMP MARKT ALARM! 🍩**\n\n';
    
    data.forEach(item => {
      message += `${item.emoji} **${item.item}** ${item.direction}\n`;
      message += `Preis: ${item.oldPrice}💰 → ${item.newPrice}💰\n`;
      message += `Änderung: **${item.changePercent}%**\n\n`;
    });
    
    return message;
  }
  
  return 'Keine krassen Preisänderungen auf DonutSMP 🍩';
}
