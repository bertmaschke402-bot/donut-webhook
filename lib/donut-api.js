// Deine Donut-API Anbindung
const DONUT_API_URL = 'https://api.donut.com/v1/stocks'; // Beispiel-URL

export async function fetchDonutPrices() {
  try {
    // Hier deine spezifische Donut-API einfügen
    const response = await fetch(process.env.DONUT_API_URL || DONUT_API_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.DONUT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching donut prices:', error);
    return null;
  }
}

// Beispiel für Daten-Struktur (anpassen!)
export function analyzePriceChanges(currentPrices, previousPrices) {
  const significantChanges = [];
  const THRESHOLD = 5; // 5% Veränderung = krass
  
  for (const [symbol, current] of Object.entries(currentPrices)) {
    if (previousPrices[symbol]) {
      const previous = previousPrices[symbol];
      const changePercent = ((current.price - previous.price) / previous.price) * 100;
      
      if (Math.abs(changePercent) >= THRESHOLD) {
        significantChanges.push({
          symbol,
          name: current.name,
          oldPrice: previous.price,
          newPrice: current.price,
          changePercent: changePercent.toFixed(2),
          direction: changePercent > 0 ? '📈 RAKETE 🚀' : '📉 PANIK 🔻',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  return significantChanges;
}
