import React, { useState } from 'react';

const NFTListItem = ({ imageSrc, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex items-center mb-2">
      <img src={imageSrc} alt="NFT" className="w-20 h-20 mr-2" />
      <div>
        <div>{title}</div>
        {isExpanded && <div>More details about the NFT...</div>}
        <button className="text-blue-500 hover:underline focus:outline-none" onClick={toggleExpand}>
          {isExpanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default NFTListItem;
