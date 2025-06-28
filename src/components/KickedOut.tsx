
import React from 'react';

interface KickedOutProps {
  onReturnHome: () => void;
}

const KickedOut: React.FC<KickedOutProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-16">
          <span className="mr-2">⭐</span>
          <span className="font-medium">Intervue Poll</span>
        </div>
        
        <h1 className="text-white text-6xl font-bold mb-8 leading-tight">
          You've been Kicked out !
        </h1>
        <p className="text-gray-400 text-xl mb-16 max-w-lg mx-auto leading-relaxed">
          Looks like the teacher had removed you from the poll system. Please<br />
          Try again sometime.
        </p>
        
        <button
          onClick={onReturnHome}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-10 py-4 rounded-lg transition-colors text-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default KickedOut;
