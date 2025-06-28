
import { useEffect, useRef } from 'react';
import { wsService } from '../services/websocket';

export const useWebSocket = () => {
  const callbacksRef = useRef<Map<string, Function>>(new Map());

  return {
    emit: (event: string, data: any) => wsService.emit(event, data),
    on: (event: string, callback: Function) => {
      useEffect(() => {
        // Store callback reference to avoid duplicate listeners
        const callbackKey = `${event}_${callback.toString().slice(0, 50)}`;
        
        if (!callbacksRef.current.has(callbackKey)) {
          callbacksRef.current.set(callbackKey, callback);
          wsService.on(event, callback);
        }
        
        return () => {
          if (callbacksRef.current.has(callbackKey)) {
            wsService.off(event, callback);
            callbacksRef.current.delete(callbackKey);
          }
        };
      }, [event, callback]);
    },
  };
};
