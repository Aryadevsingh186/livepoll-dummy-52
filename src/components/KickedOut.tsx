
import React from 'react';

interface KickedOutProps {
  onReturnHome: () => void;
}

const KickedOut: React.FC<KickedOutProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-12">
          <span className="mr-2">⭐</span>
          <span className="font-medium">Intervue Poll</span>
        </div>
        
        <h1 className="text-white text-5xl font-bold mb-6">You've been Kicked out !</h1>
        <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
          Looks like the teacher had removed you from the poll system. Please<br />
          Try again sometime.
        </p>
        
        <button
          onClick={onReturnHome}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default KickedOut;
