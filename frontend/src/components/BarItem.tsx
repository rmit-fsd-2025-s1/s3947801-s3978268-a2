import React from 'react';

interface BarItemProps {
  height: number; // height in percentage (0–100)
  label: string;  // the text label to display below the bar
  value: number;  // the numeric value, used for tooltips or similar
}

export default function BarItem({ height, label, value }: BarItemProps) {
  return (
    <div className="bar-item-container">
      <div 
        className="bar-item" 
        style={{ height: `${height}%` }} 
        title={value.toString()}
      />
      <div className="bar-label">{label} ({value})</div>
    </div>
  );
}