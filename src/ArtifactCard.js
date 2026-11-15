import React, { useRef, useEffect, useState } from 'react';
import './ArtifactCard.css';

export default function ArtifactCard({ artifact, planet, isAlreadyDusted, onMarkDusted, playClick, playUnlock }) {
  const canvasRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchCount, setScratchCount] = useState(0);
  const [isDusted, setIsDusted] = useState(isAlreadyDusted);
  
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [currentSlide, setCurrentSlide] = useState(0);

  // Set the theme color based on the current planet
  const themeColor = planet === 'mars' ? '#E27B58' : '#40E0D0';

  useEffect(() => {
    if (isAlreadyDusted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (planet === 'mars') {
        // Reddish Mars Dust
        const r = Math.floor(Math.random() * 50) + 150; 
        const g = Math.floor(Math.random() * 30) + 60;  
        const b = Math.floor(Math.random() * 20) + 30;  
        data[i] = r;     
        data[i + 1] = g; 
        data[i + 2] = b; 
        data[i + 3] = 255;   
      } else {
        // Gray Moon Dust
        const shade = Math.floor(Math.random() * 60) + 90;
        data[i] = shade;     
        data[i + 1] = shade; 
        data[i + 2] = shade; 
        data[i + 3] = 255;   
      }
    }
    
    ctx.putImageData(imageData, 0, 0);

  }, [isAlreadyDusted, planet]);

  const handleDustMouseMove = (e) => {
    if (!isDrawing || isDusted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2); 
    ctx.fill();

    setScratchCount((prev) => {
      const newCount = prev + 1;
      if (newCount > 80 && !isDusted) {
        setIsDusted(true);
        if (playUnlock) playUnlock();
        onMarkDusted(); 
      }
      return newCount;
    });
  };

  const handleCardMouseDown = (e) => {
    if (!isDusted) return; 
    setIsDraggingCard(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseMove = (e) => {
    if (!isDraggingCard) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x - deltaY * 0.5, 
      y: prev.y + deltaX * 0.5  
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCardMouseUp = () => {
    if (!isDraggingCard) return;
    setIsDraggingCard(false);
    
    const snapY = Math.round(rotation.y / 180) * 180;
    setRotation({ x: 0, y: snapY }); 
  };

  const nextSlide = (e) => {
    e.stopPropagation(); 
    if (currentSlide < artifact.infoSlider.length - 1) {
      if (playClick) playClick();
      setCurrentSlide(prev => prev + 1);
    }
  };
  
  const prevSlide = (e) => {
    e.stopPropagation();
    if (currentSlide > 0) {
      if (playClick) playClick();
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Encoded flat dusting brush SVG color matches the planet theme color
  const brushColorHex = planet === 'mars' ? '%23E27B58' : '%2340E0D0';
  const brushCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${brushColorHex}"><path d="M8 10V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7h1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1zm2 5v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-7h-4z"/></svg>') 12 2, crosshair`;

  return (
    <div 
      className={`card-container ${isDusted ? 'is-grabbable' : ''} ${isDraggingCard ? 'is-dragging' : ''}`}
      onMouseDown={handleCardMouseDown}
      onMouseMove={handleCardMouseMove}
      onMouseUp={handleCardMouseUp}
      onMouseLeave={handleCardMouseUp} 
    >
      <div 
        className="card-inner" 
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isDraggingCard ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)'
        }}
      >
        
        {/* FRONT OF CARD */}
        <div className="card-front" style={{ borderColor: themeColor, boxShadow: `0 0 30px ${themeColor}80` }}>
          <h2 style={{ color: themeColor, margin: '25px 0', fontSize: '28px', letterSpacing: '2px', padding: '0 10px' }}>
            {isDusted ? artifact.name.toUpperCase() : "UNKNOWN ARTIFACT"}
          </h2>
          
          <div style={{ position: 'relative', flex: 1, backgroundColor: '#222', overflow: 'hidden' }}>
            <img 
              src={`/images/${artifact.imageId}.jpg`} 
              alt="Artifact" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              draggable="false" 
            />
            
            {!isAlreadyDusted && (
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', 
                  opacity: isDusted ? 0 : 1, 
                  transition: 'opacity 1s',
                  cursor: isDusted ? 'default' : brushCursor 
                }}
                onMouseDown={(e) => { e.stopPropagation(); setIsDrawing(true); }} 
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
                onMouseMove={handleDustMouseMove}
              />
            )}
          </div>

          <div style={{ padding: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px' }}>
            {isDusted ? (
              <p style={{ color: themeColor, margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Hold and drag the edges to flip ↺
              </p>
            ) : (
              <p style={{ color: '#aaa', margin: 0, fontSize: '18px' }}>
                Brush off the dust with your cursor to reveal the artifact!
              </p>
            )}
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="card-back" style={{ borderColor: themeColor, boxShadow: `0 0 30px ${themeColor}80` }}>
          <h2 style={{ color: themeColor, marginTop: 0, fontSize: '32px', marginBottom: '5px' }}>{artifact.name}</h2>
          <p style={{ color: '#aaa', fontSize: '14px', letterSpacing: '1px' }}>LAT: {artifact.lat}° | LON: {artifact.lon}°</p>
          <hr style={{ borderColor: themeColor, margin: '15px 0' }}/>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ color: '#e5b13a', fontSize: '20px', letterSpacing: '2px', marginBottom: '15px' }}>
              {artifact.infoSlider[currentSlide].title}
            </h3>
            <p style={{ lineHeight: '1.8', fontSize: '20px', color: '#fff' }}>
              {artifact.infoSlider[currentSlide].content}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', padding: '10px 0', borderTop: '1px solid #333' }}>
            <button 
              onClick={prevSlide}
              onMouseDown={(e) => e.stopPropagation()} 
              style={{ backgroundColor: 'transparent', border: `1px solid ${themeColor}`, color: currentSlide === 0 ? '#444' : themeColor, padding: '10px 20px', cursor: currentSlide === 0 ? 'default' : 'pointer', fontSize: '18px', borderRadius: '4px' }}
              disabled={currentSlide === 0}
            >
              ◀ PREV
            </button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {artifact.infoSlider.map((_, index) => (
                <div key={index} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: currentSlide === index ? themeColor : '#444' }} />
              ))}
            </div>

            <button 
              onClick={nextSlide}
              onMouseDown={(e) => e.stopPropagation()} 
              style={{ backgroundColor: 'transparent', border: `1px solid ${themeColor}`, color: currentSlide === artifact.infoSlider.length - 1 ? '#444' : themeColor, padding: '10px 20px', cursor: currentSlide === artifact.infoSlider.length - 1 ? 'default' : 'pointer', fontSize: '18px', borderRadius: '4px' }}
              disabled={currentSlide === artifact.infoSlider.length - 1}
            >
              NEXT ▶
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
             <p style={{ color: themeColor, margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                Hold and drag the edges to flip ↺
              </p>
          </div>
        </div>

      </div>
    </div>
  );
}