// Canvas.js
import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';
import ConvexHull from './ConvexHull';

const Canvas = () => {
    const canvasRef = useRef(null);
    const [finished, setFinished] = useState(false);
    const [points, setPoints] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'p') {
                const newPoints = [];
                while (newPoints.length < 20) {
                    const x = Math.random() * canvasRef.current.width;
                    const y = Math.random() * canvasRef.current.height;
                    if (!newPoints.some(point => point.x === x && point.y === y)) {
                        newPoints.push({ x, y });
                    }
                }
                setPoints(prevPoints => [...prevPoints, ...newPoints]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw convex hull
        if (finished) {
            const convexHull = new ConvexHull(points).findConvexHull();
            ctx.beginPath();
            ctx.moveTo(convexHull[0].x, convexHull[0].y);
            for (let i = 1; i < convexHull.length; i++) {
                ctx.lineTo(convexHull[i].x, convexHull[i].y);
            }
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }

        // Draw points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
        });

    }, [points, finished]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setMousePos({ x, y });
        };

        const canvas = canvasRef.current;
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleCanvasClick = (event) => {
        if (!finished) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            setPoints(prevPoints => [...prevPoints, { x, y }]);

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
            <canvas className='canvascss'
                ref={canvasRef}
                width={1600}
                height={600}
                onClick={handleCanvasClick}
                style={{ cursor: 'crosshair' }}
            />
            <br />
            <button className="buttons" onClick={handleFinishClick} disabled={points.length === 0 || finished}>
                Finish
            </button>
            <button className="buttons" onClick={clearCanvas} disabled={finished}>
                Clear
            </button>
            <br />
            {/* <h4>Type r for adding random points, hover to see coordinates</h4> */}
            {/* <h4>Click on the canvas to add points. Press finish to compute convex hull.</h4> */}
            <h4>Mouse Position: x={mousePos.x.toFixed(2)}, y={mousePos.y.toFixed(2)}</h4>
        </div>
    );
};

export default Canvas;
