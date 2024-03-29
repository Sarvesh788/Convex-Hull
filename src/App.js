import React, { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import CanvasJarvis from './CanvasJarvis';
import pacmanImageClose from './p_right_close.png';
import pacmanImageOpen from './p_right_open.png';
import Pacman from './Pacman';
import DottedLine from './DottedLine';
import Canvas from './Canvas';
import pacman_beginning from './pacman_beginning.wav';

const App = () => {
  const [algorithm, setAlgorithm] = useState(null);
  const [isKPS, setKPS] = useState(null);
  const img_open = useMemo(() => {
    const img = new Image();
    img.src = pacmanImageOpen;
    return img;
  }, []);

  const img_close = useMemo(() => {
    const img = new Image();
    img.src = pacmanImageClose;
    return img;
  }, []);

  const canvasRef = useRef(null);
  const pacmansRef = useRef([]);

  const handleAlgorithmChange = (selectedAlgorithm) => {
    if(selectedAlgorithm === 'KPS') {
      let audio = new Audio(pacman_beginning);
      audio.currentTime = 0.15;
      audio.play();
      if(audio.currentTime >= 3)
      {
        audio.pause();
      }
    }
    setAlgorithm(selectedAlgorithm);
  };

  const handleKPS = (selectedKPS) => {
    setKPS(selectedKPS);
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      const topHalf = window.innerHeight / 2 > e.clientY;
      const appElement = document.getElementById('app');

      if (topHalf) {
        appElement.classList.add('hover-top-half');
        appElement.classList.remove('hover-bottom-half');
      } else {
        appElement.classList.add('hover-bottom-half');
        appElement.classList.remove('hover-top-half');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const newPacmans = [];

    const createPacmans = () => {
      for (let i = 0; i < newPacmans.length/2 + 2; i++) {
        newPacmans.push(new Pacman(img_open, img_close, 25));
      }

      for (let i = newPacmans.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPacmans[i], newPacmans[j]] = [newPacmans[j], newPacmans[i]];
      }
      newPacmans.length = Math.ceil(newPacmans.length / 2);
      if(newPacmans.length > 20) {
        newPacmans.length = 20;
      }
      pacmansRef.current = newPacmans;
    };

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const survivingPacmans = [];
      pacmansRef.current.forEach((pacman) => {
        if (pacman.update(canvas.width, canvas.height)) {
            survivingPacmans.push(pacman);
          pacman.draw(context);
        }
      });

      pacmansRef.current = survivingPacmans;
      requestAnimationFrame(animate);
    };

    createPacmans();
    animate();
    const intervalId = setInterval(createPacmans, 4000);
    return () => clearInterval(intervalId);
  }, [img_close, img_open]);

  return (
    <div className="app" id="app">
      {/* <h1 className="title">Convex hull algorithm</h1> */}
      <div className="canvas-container">
        {!algorithm ? (
          <>
            <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
            <div className="options">
              <button
                className = "option-btn option-btn-kps" id="kps-btn"
                onClick={() => handleAlgorithmChange('KPS')
              }
                // onClick={() => handleKPS('KPS')}
              >
                KPS
              </button>
              <DottedLine dotSize={6} />
              <button
                className="option-btn option-btn-jarvis" id="jarvis-btn"
                onClick={() => handleAlgorithmChange('JarvisMarch')}
              >
                Jarvis March
              </button>
            </div>
          </>
        ) : algorithm === 'KPS' ? (
          <Canvas algorithm={algorithm} ref={canvasRef} />
          ) : algorithm === 'JarvisMarch' ? (
            <CanvasJarvis algorithm={algorithm} ref={canvasRef} />
        ) : null
      }
      </div>
    </div>
  );
};

export default App;