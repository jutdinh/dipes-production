import React, { useState, useEffect } from 'react';

const IncrementalNumber = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (currentValue < value) {
      const interval = setInterval(() => {
        setCurrentValue(currentValue + 1);
      }, 10); // Mỗi 100ms tăng giá trị 1 đơn vị

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentValue, value]);

  return <span>{currentValue}</span>;
};

export default IncrementalNumber;
