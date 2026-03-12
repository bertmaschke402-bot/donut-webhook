// lib/donut-api.js - Mit ECHTER DonutSMP API
const API_URL = process.env.DONUT_API_URL || 'https://api.donutsmp.net/v1';
const API_KEY = process.env.DONUT_API_KEY;

export async function fetchDonutPrices() {
  try {
    // Wir holen die Leaderboard-Daten (wer hat am meisten Geld)
    const response = await fetch(`${API_URL}/leaderboards/money/10?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`DonutSMP API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    
    // DonutSMP API gibt Array von Spielern zurück
    // Jeder hat username und value (Geld)
    const prices = {};
    data.result.forEach((player, index) => {
      prices[player.username] = {
        rank: index + 1,
        money: parseInt(player.value),
        name: player.username
      };
    });
    
    return prices;
  } catch (error) {
    console.error('❌ DonutSMP API Fehler:', error);
    return null;
  }
}

export function analyzePriceChanges(currentPrices, previousPrices) {
  const significantChanges = [];
  const THRESHOLD = 5; // 5% Veränderung = krass
  
  for (const [player, current] of Object.entries(currentPrices)) {
    if (previousPrices[player]) {
      const previous = previousPrices[player];
      const changePercent = ((current.money - previous.money) / previous.money) * 100;
      
      if (Math.abs(changePercent) >= THRESHOLD) {
        significantChanges.push({
          item: player,
          emoji: '👑',
          oldPrice: previous.money,
          newPrice: current.money,
          changePercent: changePercent.toFixed(2),
          direction: changePercent > 0 ? '📈 REICHER 🚀' : '📉 ÄRMER 🔻',
          rank: current.rank,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  return significantChanges;
}
