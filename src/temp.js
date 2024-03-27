// Canvas.js

import React, { useRef, useEffect, useState } from 'react';
import { loadWasmModule } from './ConvexHullModule'; // Import the generated JavaScript wrapper

const Canvas = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawPoints = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
      });
    };

    const drawConvexHull = async () => {
      if (finished) {
        const module = await loadWasmModule();
        const hull = module.computeConvexHull(points);
        if (hull && hull.length > 0) {
          ctx.beginPath();
          ctx.moveTo(hull[0].x, hull[0].y);
          for (let i = 1; i < hull.length; i++) {
            ctx.lineTo(hull[i].x, hull[i].y);
          }
          ctx.closePath();
          ctx.strokeStyle = 'red';
          ctx.stroke();
        }
      }
    };

    drawPoints();
    drawConvexHull();
  }, [points, finished]);

  const handleCanvasClick = (event) => {
    if (!finished) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPoints((prevPoints) => [...prevPoints, { x, y }]);
    }
  };

  const handleFinishClick = () => {
    setFinished(true);
  };

  const clearCanvas = () => {
    setPoints([]);
    setFinished(false);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        style={{ border: '1px solid black' }}
      />
      <br />
      <button onClick={handleFinishClick} disabled={points.length === 0 || finished}>
        Finish
      </button>
      <button onClick={clearCanvas} disabled={finished}>
        Clear
      </button>
      <br />
      <h4>Click on the canvas to add points. Press finish to compute convex hull.</h4>
    </div>
  );
};

export default Canvas;
