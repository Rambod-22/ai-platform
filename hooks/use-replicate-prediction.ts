import { useState, useEffect } from 'react';
import axios from 'axios';

interface Prediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: any;
  error: string | null;
}

export const useReplicatePrediction = (predictionId: string | null) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!predictionId) return;

    setIsLoading(true);
    
    const pollPrediction = async () => {
      try {
        const response = await axios.get(`/api/replicate/${predictionId}`);
        const data = response.data;
        
        setPrediction(data);
        
        // If still processing, poll again in 2 seconds
        if (data.status === 'starting' || data.status === 'processing') {
          setTimeout(pollPrediction, 2000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error polling prediction:', error);
        setIsLoading(false);
      }
    };

    pollPrediction();
  }, [predictionId]);

  return { prediction, isLoading };
};