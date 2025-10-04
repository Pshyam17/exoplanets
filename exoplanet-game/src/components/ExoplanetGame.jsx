import React, { useState, useRef, useEffect } from 'react';
import { Camera, Radio, Zap, Rocket } from 'lucide-react';
import Papa from 'papaparse';

const ExoplanetGame = () => {
  const [planets, setPlanets] = useState([]);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [viewAngle, setViewAngle] = useState(0);
  const [explodingPlanet, setExplodingPlanet] = useState(null);
  const [explosionFrame, setExplosionFrame] = useState(0);
  const [communicationMessage, setCommunicationMessage] = useState(null);
  const [destroyedPlanets, setDestroyedPlanets] = useState([]);
  const [warping, setWarping] = useState(false);
  const [warpProgress, setWarpProgress] = useState(0);
  const [toiData, setToiData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const viewAngleRef = useRef(0);
  const starsRef = useRef([]);
  const warpStartTime = useRef(null);

  // Load TOI data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const csvContent = await window.fs.readFile('toi_predictions.csv', { encoding: 'utf8' });
        const parsed = Papa.parse(csvContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Filter out rows with missing essential data
        const validData = parsed.data.filter(row => 
          row.toi && row.pl_rade && row.pl_orbper && row.pl_trandep && row.st_teff
        );
        
        setToiData(validData);
        setDataLoaded(true);
        
        // Load initial set of planets
        loadNewPlanets(validData);
      } catch (error) {
        console.error('Error loading TOI data:', error);
        // Fall back to some default planets if loading fails
        loadDefaultPlanets();
      }
    };
    
    loadData();
  }, []);

  // Initialize background stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 200 }, (_, i) => ({
      x: Math.random() * 800,
      y: Math.random() * 600,
      z: Math.random() * 1000,
      size: Math.random() * 2 + 0.5
    }));
  }, []);

  const loadNewPlanets = (data = toiData) => {
    if (!data || data.length === 0) {
      loadDefaultPlanets();
      return;
    }

    // Randomly select 3-4 TOIs
    const numPlanets = 3 + Math.floor(Math.random() * 2);
    const selectedTOIs = [];
    const usedIndices = new Set();
    
    while (selectedTOIs.length < numPlanets && usedIndices.size < data.length) {
      const idx = Math.floor(Math.random() * data.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        selectedTOIs.push(data[idx]);
      }
    }

    // Convert TOI data to planet objects
    const newPlanets = selectedTOIs.map((toi, index) => {
      // Generate positions in a spread pattern
      const angle = (index / numPlanets) * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      
      // Determine classification based on disposition and predicted label
      const isConfirmed = toi.tfopwg_disp === 'KP' || toi.tfopwg_disp === 'CP' || 
                         (toi.tfopwg_disp === 'PC' && toi['Predicted Label'] === 1);
      
      // Assign colors based on classification
      const color = isConfirmed ? '#2ECC71' : '#E74C3C';
      
      // Calculate size based on planet radius (Earth radii)
      const size = Math.min(Math.max(20, toi.pl_rade * 3), 80);
      
      return {
        id: `TOI-${toi.toi}`,
        name: `Unknown TOI ${toi.toi}`,
        realName: `TOI ${toi.toi} (${toi.tfopwg_disp || 'Unknown'})`,
        position: {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          z: (Math.random() - 0.5) * 100
        },
        color: color,
        size: size,
        stats: {
          koi_period: toi.pl_orbper || 0,
          koi_depth: toi.pl_trandep || 0,
          koi_prad: toi.pl_rade || 0,
          koi_model_snr: toi.pl_insol || 0,
          koi_steff: toi.st_teff || 0,
          koi_duration: toi.pl_trandurh || 0,
          koi_impact: toi.st_logg || 0,
          koi_teq: toi.pl_eqt || 0,
          depth_snr_ratio: toi.pl_trandep && toi.pl_insol ? toi.pl_trandep / Math.max(toi.pl_insol, 0.1) : 0,
          koi_srad: toi.st_rad || 0
        },
        classification: isConfirmed ? 'CONFIRMED' : 'FALSE POSITIVE',
        probability: toi['Predicted Label'] === 1 ? 0.85 + Math.random() * 0.14 : 0.05 + Math.random() * 0.25,
        disposition: toi.tfopwg_disp
      };
    });

    setPlanets(newPlanets);
    setDestroyedPlanets([]);
    setSelectedPlanet(null);
    setScanComplete(false);
  };

  const loadDefaultPlanets = () => {
    // Fallback planets if data doesn't load
    const defaultPlanets = [
      {
        id: 'DEFAULT-1',
        name: 'Unknown-314',
        realName: 'Kepler-314 c',
        position: { x: -200, y: 50, z: 0 },
        color: '#4A90E2',
        size: 40,
        stats: {
          koi_period: 23.1,
          koi_depth: 856,
          koi_prad: 1.6,
          koi_model_snr: 45.2,
          koi_steff: 5640,
          koi_duration: 3.2,
          koi_impact: 0.42,
          koi_teq: 582,
          depth_snr_ratio: 18.9,
          koi_srad: 0.95
        },
        classification: 'CONFIRMED',
        probability: 0.94
      }
    ];
    setPlanets(defaultPlanets);
  };

  const handleWarp = () => {
    if (warping) return;
    
    setWarping(true);
    setWarpProgress(0);
    warpStartTime.current = Date.now();
    setSelectedPlanet(null);
    setScanComplete(false);
    setCommunicationMessage(null);
    
    // After 5 seconds, load new planets
    setTimeout(() => {
      setWarping(false);
      setWarpProgress(0);
      warpStartTime.current = null;
      loadNewPlanets();
    }, 5000);
  };

  const FEATURE_NAMES = {
    koi_period: 'Orbital Period (days)',
    koi_depth: 'Transit Depth (ppm)',
    koi_prad: 'Planet Radius (Earth radii)',
    koi_model_snr: 'Insolation Flux',
    koi_steff: 'Stellar Temperature (K)',
    koi_duration: 'Transit Duration (hrs)',
    koi_impact: 'Stellar Surface Gravity',
    koi_teq: 'Equilibrium Temp (K)',
    depth_snr_ratio: 'Depth/Flux Ratio',
    koi_srad: 'Stellar Radius (Solar)'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const drawScene = () => {
      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (warping) {
        // Update warp progress
        const elapsed = Date.now() - warpStartTime.current;
        const progress = Math.min(elapsed / 5000, 1);
        setWarpProgress(progress);
        
        // Draw hyperspace effect
        drawHyperspaceEffect(ctx, progress);
      } else {
        // Draw normal stars
        drawStars(ctx);
        
        // Draw planets
        planets.forEach(planet => {
          if (destroyedPlanets.includes(planet.id)) return;

          const screenX = canvas.width / 2 + planet.position.x;
          const screenY = canvas.height / 2 + planet.position.y;
          const scale = 1;

          if (explodingPlanet === planet.id) {
            drawExplosion(ctx, screenX, screenY, explosionFrame, planet.size);
            return;
          }

          const gradient = ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, planet.size * scale
          );
          gradient.addColorStop(0, planet.color);
          gradient.addColorStop(0.5, planet.color + '80');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(screenX, screenY, planet.size * scale, 0, Math.PI * 2);
          ctx.fill();

          if (selectedPlanet?.id === planet.id) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(screenX, screenY, planet.size * scale + 10, 0, Math.PI * 2);
            ctx.stroke();

            if (scanning) {
              const scanRadius = planet.size * scale + 10 + (Date.now() % 1000) / 10;
              ctx.strokeStyle = `rgba(0, 255, 255, ${1 - (Date.now() % 1000) / 1000})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(screenX, screenY, scanRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          const displayName = scanComplete && selectedPlanet?.id === planet.id 
            ? planet.realName 
            : planet.name;
          
          ctx.fillStyle = 'white';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(displayName, screenX, screenY + planet.size * scale + 20);
        });
      }

      // Draw spaceship cockpit overlay
      drawSpaceship(ctx);

      if (!warping) {
        // Draw crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 20, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + 20, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 20);
        ctx.lineTo(canvas.width / 2, canvas.height / 2 + 20);
        ctx.stroke();
      }

      viewAngleRef.current += 0.5;
      animationRef.current = requestAnimationFrame(drawScene);
    };

    const drawStars = (ctx) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      starsRef.current.forEach(star => {
        const x = star.x;
        const y = star.y;
        ctx.fillRect(x, y, star.size, star.size);
      });
    };

    const drawHyperspaceEffect = (ctx, progress) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate speed multiplier (accelerates over time)
      const speed = Math.pow(progress, 2) * 50 + 1;
      
      // Draw stretched stars
      starsRef.current.forEach(star => {
        // Update star position (move from center outward)
        const dx = star.x - centerX;
        const dy = star.y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate stretch based on progress
        const stretch = speed * (1 + distance / 100);
        
        // Draw star as a line
        const gradient = ctx.createLinearGradient(
          centerX + Math.cos(angle) * distance,
          centerY + Math.sin(angle) * distance,
          centerX + Math.cos(angle) * (distance + stretch),
          centerY + Math.sin(angle) * (distance + stretch)
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, `rgba(200, 200, 255, ${1 - progress * 0.3})`);
        gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.size * (1 + progress);
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * distance,
          centerY + Math.sin(angle) * distance
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * (distance + stretch),
          centerY + Math.sin(angle) * (distance + stretch)
        );
        ctx.stroke();
        
        // Reset star position if it goes off screen
        if (Math.abs(star.x - centerX) > canvas.width || Math.abs(star.y - centerY) > canvas.height) {
          star.x = centerX + (Math.random() - 0.5) * 100;
          star.y = centerY + (Math.random() - 0.5) * 100;
        } else {
          star.x += Math.cos(angle) * speed;
          star.y += Math.sin(angle) * speed;
        }
      });
      
      // Add central flash effect
      if (progress > 0.8) {
        const flashIntensity = (progress - 0.8) * 5;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity})`);
        gradient.addColorStop(0.5, `rgba(200, 200, 255, ${flashIntensity * 0.5})`);
        gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const drawSpaceship = (ctx) => {
      // Cockpit frame (darker edges)
      ctx.strokeStyle = 'rgba(20, 40, 60, 0.9)';
      ctx.lineWidth = 40;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Corner panels
      const cornerSize = 80;
      ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
      // Top left
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cornerSize, 0);
      ctx.lineTo(0, cornerSize);
      ctx.closePath();
      ctx.fill();
      // Top right
      ctx.beginPath();
      ctx.moveTo(canvas.width, 0);
      ctx.lineTo(canvas.width - cornerSize, 0);
      ctx.lineTo(canvas.width, cornerSize);
      ctx.closePath();
      ctx.fill();
      // Bottom left
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(cornerSize, canvas.height);
      ctx.lineTo(0, canvas.height - cornerSize);
      ctx.closePath();
      ctx.fill();
      // Bottom right
      ctx.beginPath();
      ctx.moveTo(canvas.width, canvas.height);
      ctx.lineTo(canvas.width - cornerSize, canvas.height);
      ctx.lineTo(canvas.width, canvas.height - cornerSize);
      ctx.closePath();
      ctx.fill();

      // Tech details on corners
      ctx.strokeStyle = warping ? '#ff00ff' : '#00d9ff';
      ctx.lineWidth = 2;
      // Top left bracket
      ctx.beginPath();
      ctx.moveTo(20, 60);
      ctx.lineTo(20, 20);
      ctx.lineTo(60, 20);
      ctx.stroke();
      // Top right bracket
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, 60);
      ctx.lineTo(canvas.width - 20, 20);
      ctx.lineTo(canvas.width - 60, 20);
      ctx.stroke();
      // Bottom left bracket
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 60);
      ctx.lineTo(20, canvas.height - 20);
      ctx.lineTo(60, canvas.height - 20);
      ctx.stroke();
      // Bottom right bracket
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, canvas.height - 60);
      ctx.lineTo(canvas.width - 20, canvas.height - 20);
      ctx.lineTo(canvas.width - 60, canvas.height - 20);
      ctx.stroke();

      // Heads-up display lines
      ctx.strokeStyle = warping ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 217, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = 100 + i * 100;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(100, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(canvas.width - 50, y);
        ctx.lineTo(canvas.width - 100, y);
        ctx.stroke();
      }

      // Targeting reticle elements (hide during warp)
      if (!warping) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        // Outer targeting circle
        ctx.beginPath();
        ctx.arc(cx, cy, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner crosshair
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx - 10, cy);
        ctx.moveTo(cx + 10, cy);
        ctx.lineTo(cx + 30, cy);
        ctx.moveTo(cx, cy - 30);
        ctx.lineTo(cx, cy - 10);
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx, cy + 30);
        ctx.stroke();
      }
    };

    const drawExplosion = (ctx, x, y, frame, size) => {
      const maxFrames = 30;
      const progress = frame / maxFrames;
      const explosionSize = size * (1 + progress * 3);
      
      // Main explosion flash
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, explosionSize);
      
      if (progress < 0.3) {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 200, 0, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      } else {
        const opacity = 1 - progress;
        gradient.addColorStop(0, `rgba(255, 150, 0, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 50, 0, ${opacity * 0.6})`);
        gradient.addColorStop(0.8, `rgba(100, 0, 0, ${opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, explosionSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Debris particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = progress * size * 2;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        const particleSize = size * 0.2 * (1 - progress);
        
        ctx.fillStyle = `rgba(255, ${100 * (1 - progress)}, 0, ${1 - progress})`;
        ctx.beginPath();
        ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawScene();
    return () => cancelAnimationFrame(animationRef.current);
  }, [selectedPlanet, scanning, viewAngle, explodingPlanet, explosionFrame, destroyedPlanets, scanComplete, warping, planets]);

  // Handle explosion animation
  useEffect(() => {
    if (explodingPlanet) {
      if (explosionFrame < 30) {
        const timer = setTimeout(() => {
          setExplosionFrame(prev => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        // Explosion complete
        setDestroyedPlanets(prev => [...prev, explodingPlanet]);
        setExplodingPlanet(null);
        setExplosionFrame(0);
        setSelectedPlanet(null);
        setScanComplete(false);
      }
    }
  }, [explodingPlanet, explosionFrame]);

  const handleScan = () => {
    if (!selectedPlanet) return;
    setScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const handleAction = (action) => {
    if (action === 'DESTROY') {
      setExplodingPlanet(selectedPlanet.id);
      setExplosionFrame(0);
      setScanComplete(false);
    } else if (action === 'COMMUNICATE') {
      const messages = selectedPlanet.classification === 'CONFIRMED' ? [
        `"Hello from ${selectedPlanet.realName}! We've been trying to reach you about your starship's extended warranty..."`,
        `The inhabitants of ${selectedPlanet.realName} respond: "Have you tried turning your civilization off and on again?"`,
        `"${selectedPlanet.realName} here. Thanks for the contact, but we're kind of in the middle of something. Can you call back in 100 years?"`,
        `Message received: "Your planet looks nice too! Want to trade recipes? We have excellent methane souffle."`,
        `"${selectedPlanet.realName} speaking. Before we proceed, we need to discuss your ship's carbon emissions..."`,
        `BEEP BOOP. ERROR 404: INTELLIGENT LIFE NOT FOUND. Just kidding! We speak emoji exclusively.`,
        `"Greetings! We've analyzed your music transmissions. We regret to inform you that disco will NOT be making a comeback here."`
      ] : [
        `*static* ...You're getting a very confused response from what appears to be two binary stars having an argument.`,
        `The "planet" responds: "I'M NOT A PLANET, I'M TWO STARS IN A TRENCHCOAT!"`,
        `*static* All you hear is the sound of stellar fusion and existential dread.`,
        `An eclipsing binary replies: "Stop calling us a planet! We identify as a stellar system, thank you very much."`,
        `Your communication bounces back with a note: "Return to sender. No planet at this address."`,
        `*confused stellar noises* The binary star system seems offended you mistook them for a planet.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCommunicationMessage(randomMessage);
      
      setTimeout(() => {
        setCommunicationMessage(null);
        setSelectedPlanet(null);
        setScanComplete(false);
      }, 5000);
    }
  };

  const topFeatures = selectedPlanet && scanComplete
    ? Object.entries(selectedPlanet.stats)
        .filter(([key, value]) => value !== 0 && value !== null)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 10)
    : [];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #000814 0%, #001d3d 100%)',
      color: 'white',
      fontFamily: 'monospace',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '10px',
          textShadow: `0 0 10px ${warping ? '#ff00ff' : '#00ffff'}`
        }}>
          EXOPLANET CLASSIFICATION MISSION
        </h1>
        <p style={{
          textAlign: 'center',
          color: warping ? '#ff00ff' : '#00d9ff',
          marginBottom: '30px'
        }}>
          {warping 
            ? `ENGAGING HYPERDRIVE... ${(warpProgress * 100).toFixed(0)}%` 
            : `Sector TESS-${Math.floor(Math.random() * 999) + 1} | Mission: Identify Exoplanet Candidates`}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '800px 1fr',
          gap: '20px'
        }}>
          <div style={{
            border: `2px solid ${warping ? '#ff00ff' : '#00d9ff'}`,
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <canvas
              ref={canvasRef}
              onClick={(e) => {
                if (warping) return;
                
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left - 400;
                const y = e.clientY - rect.top - 300;
                
                const clicked = planets.find(p => {
                  if (destroyedPlanets.includes(p.id)) return false;
                  const dx = x - p.position.x;
                  const dy = y - p.position.y;
                  return Math.sqrt(dx*dx + dy*dy) < p.size;
                });
                
                if (clicked) {
                  setSelectedPlanet(clicked);
                  setScanComplete(false);
                  setCommunicationMessage(null);
                }
              }}
              style={{ cursor: warping ? 'wait' : 'crosshair', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <div>TARGETS DETECTED: {planets.length - destroyedPlanets.length}</div>
              <div>STATUS: {warping ? 'WARPING' : scanning ? 'SCANNING...' : 'READY'}</div>
              <div>DATA SOURCE: {dataLoaded ? 'TESS TOI CATALOG' : 'LOADING...'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button
              onClick={handleWarp}
              disabled={warping}
              style={{
                padding: '15px',
                fontSize: '16px',
                background: warping 
                  ? 'linear-gradient(45deg, #ff00ff, #00ffff)' 
                  : 'linear-gradient(45deg, #8b00ff, #00d9ff)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: warping ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                boxShadow: warping ? '0 0 20px #ff00ff' : '0 4px 15px rgba(139, 0, 255, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <Rocket size={20} />
              {warping ? 'WARPING...' : 'ENGAGE WARP DRIVE'}
            </button>

            <div style={{
              border: `2px solid ${warping ? '#ff00ff' : '#00d9ff'}`,
              borderRadius: '8px',
              padding: '15px',
              background: 'rgba(0, 30, 60, 0.5)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: warping ? '#ff00ff' : '#00d9ff' }}>
                TARGET SELECTED
              </h3>
              {selectedPlanet && !warping ? (
                <>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {scanComplete ? selectedPlanet.realName : selectedPlanet.name}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    ID: {selectedPlanet.id}
                  </div>
                </>
              ) : (
                <div style={{ opacity: 0.5 }}>
                  {warping ? 'Systems offline during warp...' : 'Click on a planet to select target'}
                </div>
              )}
            </div>

            <button
              onClick={handleScan}
              disabled={!selectedPlanet || scanning || scanComplete || warping}
              style={{
                padding: '15px',
                fontSize: '16px',
                background: selectedPlanet && !scanComplete && !warping ? '#00d9ff' : '#333',
                color: selectedPlanet && !scanComplete && !warping ? '#000' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedPlanet && !scanComplete && !warping ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}
            >
              <Camera size={20} />
              {scanning ? 'SCANNING...' : 'INITIATE SCAN'}
            </button>

            {scanComplete && !warping && (
              <div style={{
                border: '2px solid #00d9ff',
                borderRadius: '8px',
                padding: '15px',
                background: 'rgba(0, 30, 60, 0.5)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#00d9ff' }}>
                  CLASSIFICATION RESULT
                </h3>
                
                <div style={{
                  padding: '15px',
                  background: selectedPlanet.classification === 'CONFIRMED' 
                    ? 'rgba(46, 204, 113, 0.2)' 
                    : 'rgba(231, 76, 60, 0.2)',
                  borderRadius: '4px',
                  marginBottom: '15px',
                  border: `2px solid ${selectedPlanet.classification === 'CONFIRMED' ? '#2ecc71' : '#e74c3c'}`
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {selectedPlanet.classification}
                  </div>
                  <div>Confidence: {(selectedPlanet.probability * 100).toFixed(1)}%</div>
                  {selectedPlanet.disposition && (
                    <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '5px' }}>
                      TESS Disposition: {selectedPlanet.disposition}
                    </div>
                  )}
                </div>

                <h4 style={{ margin: '15px 0 10px 0', fontSize: '14px' }}>
                  TOP CONTRIBUTING FEATURES:
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px' }}>
                  {topFeatures.map(([key, value], idx) => (
                    <div key={key} style={{
                      padding: '8px',
                      background: idx % 2 ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}>
                      <div style={{ opacity: 0.7 }}>{FEATURE_NAMES[key]}</div>
                      <div style={{ fontWeight: 'bold' }}>{value.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanComplete && !warping && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleAction('COMMUNICATE')}
                  disabled={communicationMessage !== null}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: communicationMessage ? '#555' : '#2ecc71',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: communicationMessage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Radio size={18} />
                  COMMUNICATE
                </button>
                <button
                  onClick={() => handleAction('DESTROY')}
                  disabled={explodingPlanet !== null}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: explodingPlanet ? '#555' : '#e74c3c',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    cursor: explodingPlanet ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Zap size={18} />
                  DESTROY
                </button>
              </div>
            )}

            {communicationMessage && (
              <div style={{
                border: '2px solid #2ecc71',
                borderRadius: '8px',
                padding: '20px',
                background: 'rgba(46, 204, 113, 0.1)',
                animation: 'fadeIn 0.5s',
                fontSize: '14px',
                lineHeight: '1.6',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                textAlign: 'center',
                maxWidth: '400px',
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2ecc71' }}>
                  INCOMING TRANSMISSION
                </h3>
                <div style={{ 
                  fontStyle: 'italic',
                  color: '#00ff88'
                }}>
                  {communicationMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExoplanetGame;
