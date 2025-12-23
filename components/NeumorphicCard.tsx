
import React from 'react';

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ children, className = "", inset = false }) => {
  return (
    <div className={`p-6 rounded-3xl ${inset ? 'neu-inset' : 'neu-flat'} ${className}`}>
      {children}
    </div>
  );
};

export default NeumorphicCard;
