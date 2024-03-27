import React, { useEffect, useState }from 'react';
import './DottedLine.css'; // Import your CSS file for styling

const DottedLine = ({ dotSize }) => {
  const windowWidth = window.innerWidth;
  const numberOfDots = Math.ceil(windowWidth / dotSize);
  const [isTopHalf, setIsTopHalf] = useState(false);


  const dots = Array.from({ length: numberOfDots }).map((_, index) => (
    <span key={index} className="dot" style={{ width: dotSize, height: dotSize }} />
  ));

  useEffect(() => {
    const handleMouseMove = (e) => {
      setIsTopHalf(window.innerHeight / 2 > e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`dotted-line ${isTopHalf ? 'move-down' : 'move-up'}`}>
      {dots}
    </div>
  );
};

export default DottedLine;
