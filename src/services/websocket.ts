
import { store } from '../store';
import { addStudent, submitVote, setTimeRemaining, endPoll, createPoll, removeStudent } from '../store/pollSlice';

class WebSocketService {
  private listeners: { [event: string]: Function[] } = {};
  private pollTimer: NodeJS.Timeout | null = null;

  emit(event: string, data: any) {
    console.log(`Emitting ${event}:`, data);
    
    switch (event) {
      case 'joinAsStudent':
        store.dispatch(addStudent(data.name));
        this.broadcast('studentJoined', { name: data.name });
        break;
      case 'createPoll':
        store.dispatch(createPoll(data));
        this.broadcast('newPoll', data);
        this.startPollTimer(data.maxTime);
        break;
      case 'submitVote':
        store.dispatch(submitVote(data));
        this.broadcast('voteSubmitted', data);
        this.checkIfAllAnswered();
        break;
      case 'removeStudent':
        store.dispatch(removeStudent(data.studentName));
        this.broadcast('studentRemoved', { name: data.studentName });
        break;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private broadcast(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  private startPollTimer(maxTime: number) {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    let timeLeft = maxTime;
    this.pollTimer = setInterval(() => {
      timeLeft -= 1;
      store.dispatch(setTimeRemaining(timeLeft));
      this.broadcast('timeUpdate', { timeRemaining: timeLeft });

      if (timeLeft <= 0) {
        this.endPollTimer();
      }
    }, 1000);
  }

  private checkIfAllAnswered() {
    const state = store.getState().poll;
    const allAnswered = state.students.every(s => s.hasAnswered);
    if (allAnswered && state.students.length > 0) {
      this.endPollTimer();
    }
  }

  private endPollTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    store.dispatch(endPoll());
    this.broadcast('pollEnded', {});
  }
}

export const wsService = new WebSocketService();
