// api/track.js - MINIMAL VERSION
export default async function handler(req, res) {
  console.log('🚀 Funktion wurde gestartet!');
  
  try {
    // Einfache Secret-Prüfung
    const secret = req.query.secret;
    
    if (secret !== 'bert11') {
      return res.status(401).json({ 
        error: 'Falsches Secret',
        received: secret 
      });
    }

    // Test-Modus
    if (req.query.test === 'true') {
      return res.status(200).json({
        success: true,
        message: 'Test-Modus OK!',
        timestamp: new Date().toISOString()
      });
    }

    // Normale Antwort
    return res.status(200).json({
      success: true,
      message: 'API funktioniert!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ CRASH:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}
