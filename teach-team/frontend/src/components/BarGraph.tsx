import React from 'react';
import BarItem from './BarItem';

interface BarGraphProps {
  most: number;
  least: number;
  mostName: string;
  leastName: string;
}

export default function BarGraph({ most, least, mostName, leastName}: BarGraphProps) {
  const maxValue = Math.max(most, least);
  const heightMost = (most / maxValue) * 100;
  const heightLeast = (least / maxValue) * 100;

  mostName = "Most: " + mostName;
  leastName = "Least: " + leastName;
  
  return (
    <div className="bar-graph">
      <div className="bars-list">
        <BarItem label={mostName} value={most} height={heightMost} />
        <BarItem label={leastName} value={least} height={heightLeast} />
      </div>
    </div>
  );
}
