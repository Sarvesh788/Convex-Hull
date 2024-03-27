// PointGenerator.js
import React from 'react';

const PointGenerator = ({ generatePoints }) => {
  return (
    <div>
      <button onClick={generatePoints}>Generate Points</button>
    </div>
  );
};

export default PointGenerator;
