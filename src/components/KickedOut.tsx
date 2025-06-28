
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

interface KickedOutProps {
  onReturnHome: () => void;
}

const KickedOut: React.FC<KickedOutProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-600 shadow-2xl max-w-md mx-auto">
        <CardContent className="text-center py-12 px-8">
          <div className="space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500/50">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-100 mb-4">You've Been Removed</h2>
              <p className="text-gray-300 text-lg font-medium mb-6">
                Your teacher has removed you from the current poll session.
              </p>
            </div>
            <Button 
              onClick={onReturnHome}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KickedOut;
