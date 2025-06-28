
import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '../services/websocket';

export const useWebSocket = () => {
  const activeListenersRef = useRef<Set<string>>(new Set());

  const emit = useCallback((event: string, data: any) => {
    wsService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: Function) => {
    const listenerId = `${event}_${Date.now()}_${Math.random()}`;
    
    useEffect(() => {
      // Prevent duplicate listeners for the same event
      if (!activeListenersRef.current.has(event)) {
        activeListenersRef.current.add(event);
        wsService.on(event, callback);
        
        return () => {
          activeListenersRef.current.delete(event);
          wsService.off(event, callback);
        };
      }
      
      return () => {};
    }, [event, callback]);
  }, []);

  return { emit, on };
};
