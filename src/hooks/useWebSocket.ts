
import { useEffect } from 'react';
import { wsService } from '../services/websocket';

export const useWebSocket = () => {
  return {
    emit: (event: string, data: any) => wsService.emit(event, data),
    on: (event: string, callback: Function) => {
      useEffect(() => {
        wsService.on(event, callback);
        return () => wsService.off(event, callback);
      }, []);
    },
  };
};
