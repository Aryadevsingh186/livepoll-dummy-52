
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

interface KickedOutProps {
  onReturnHome: () => void;
}

const KickedOut: React.FC<KickedOutProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Card className="bg-white border border-gray-200 shadow-lg max-w-md mx-auto">
        <CardContent className="text-center py-12 px-8">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto border-4 border-red-200">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">You've Been Removed</h2>
              <p className="text-gray-600 text-lg mb-6">
                Your teacher has removed you from the current poll session.
              </p>
            </div>
            <Button 
              onClick={onReturnHome}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6"
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
