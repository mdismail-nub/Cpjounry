import React from 'react';

interface TagBadgeProps {
  name: string;
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({ name, className = "" }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neon-blue/5 text-neon-blue border border-neon-blue/20 ${className}`}>
      {name}
    </span>
  );
};

export default TagBadge;
