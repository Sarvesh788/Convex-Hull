import React, { useState, useRef, useEffect } from 'react';

const CanvasWithHoverCoordinates = () => {
  const canvasRef = useRef(null);
  const [hoverCoordinates, setHoverCoordinates] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHoverCoordinates({ x, y });
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ border: '1px solid black' }}
      />
      <div>
        Hovered coordinates: {hoverCoordinates.x}, {hoverCoordinates.y}
      </div>
    </div>
  );
};

export default CanvasWithHoverCoordinates;
