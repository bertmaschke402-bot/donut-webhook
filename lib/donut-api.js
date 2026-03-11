// lib/donut-api.js - SPEZIELL FÜR DONUTSMP
const DONUT_API_URL = process.env.DONUT_API_URL || 'https://api.donutsmp.net/v1/economy';

export async function fetchDonutPrices() {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Nur API-Key hinzufügen wenn vorhanden
    if (process.env.DONUT_API_KEY) {
      options.headers['Authorization'] = `Bearer ${process.env.DONUT_API_KEY}`;
    }

    const response = await fetch(DONUT_API_URL, options);
    
    if (!response.ok) {
      throw new Error(`DonutSMP API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // DonutSMP spezifische Datenstruktur
    // Meistens so: { "donuts": { "chocolate": 100, "glazed": 150, ... } }
    return data;
  } catch (error) {
    console.error('Error fetching DonutSMP prices:', error);
    return null;
  }
}

// DonutSMP-spezifische Analyse
export function analyzePriceChanges(currentPrices, previousPrices) {
  const significantChanges = [];
  const THRESHOLD = 5; // 5% Veränderung = krass
  
  // DonutSMP hat vielleicht eine andere Struktur
  // Z.B. currentPrices.donuts oder currentPrices.items
  const current = currentPrices.donuts || currentPrices.items || currentPrices;
  const previous = previousPrices.donuts || previousPrices.items || previousPrices;
  
  for (const [item, currentPrice] of Object.entries(current)) {
    if (previous[item]) {
      const oldPrice = previous[item];
      const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100;
      
      if (Math.abs(changePercent) >= THRESHOLD) {
        significantChanges.push({
          item: item,
          emoji: getDonutEmoji(item),
          oldPrice: oldPrice,
          newPrice: currentPrice,
          changePercent: changePercent.toFixed(2),
          direction: changePercent > 0 ? '📈 TEURER 🚀' : '📉 BILLIGER 🔻',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  return significantChanges;
}

// Donut-Emojis für Discord
function getDonutEmoji(item) {
  const emojis = {
    'chocolate': '🍫',
    'glazed': '🍩',
    'sugar': '🧁',
    'sprinkles': '🎉',
    'jelly': '🍓',
    'cream': '🥛',
    'default': '🍩'
  };
  
  return emojis[item.toLowerCase()] || emojis.default;
}
