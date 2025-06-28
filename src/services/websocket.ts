
import { store } from '../store';
import { addStudent, submitVote, setTimeRemaining, endPoll, createPoll, removeStudent, setShowResults, removePoll } from '../store/pollSlice';

class WebSocketService {
  private listeners: { [event: string]: Function[] } = {};
  private pollTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Listen for storage events to sync across tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    this.syncFromStorage();
  }

  emit(event: string, data: any) {
    console.log(`Emitting ${event}:`, data);
    
    switch (event) {
      case 'joinAsStudent':
        store.dispatch(addStudent(data.name));
        this.broadcast('studentJoined', { name: data.name });
        this.saveToStorage('students', store.getState().poll.students);
        break;
      case 'createPoll':
        store.dispatch(createPoll(data));
        store.dispatch(setShowResults(false));
        this.broadcast('newPoll', data);
        this.saveToStorage('currentPoll', data);
        this.saveToStorage('pollActive', true);
        this.startPollTimer(data.maxTime);
        break;
      case 'submitVote':
        store.dispatch(submitVote(data));
        this.broadcast('voteSubmitted', data);
        this.saveToStorage('pollVotes', store.getState().poll.currentPoll?.votes);
        this.checkIfAllAnswered();
        break;
      case 'removeStudent':
        store.dispatch(removeStudent(data.studentName));
        this.broadcast('studentRemoved', { name: data.studentName });
        this.saveToStorage('students', store.getState().poll.students);
        break;
      case 'removePoll':
        this.endPollTimer();
        store.dispatch(removePoll());
        this.broadcast('pollRemoved', {});
        this.saveToStorage('currentPoll', null);
        this.saveToStorage('pollActive', false);
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
    // Also save to localStorage for cross-tab communication
    this.saveToStorage(`event_${event}`, { data, timestamp: Date.now() });
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(`poll_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private getFromStorage(key: string) {
    try {
      const item = localStorage.getItem(`poll_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return null;
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (!event.key?.startsWith('poll_')) return;

    const key = event.key.replace('poll_', '');
    
    if (key.startsWith('event_')) {
      const eventType = key.replace('event_', '');
      const eventData = event.newValue ? JSON.parse(event.newValue) : null;
      
      if (eventData && this.listeners[eventType]) {
        this.listeners[eventType].forEach(callback => callback(eventData.data));
      }
    } else {
      // Handle data changes
      this.syncFromStorage();
    }
  }

  private syncFromStorage() {
    const students = this.getFromStorage('students');
    const currentPoll = this.getFromStorage('currentPoll');
    const pollActive = this.getFromStorage('pollActive');
    const timeRemaining = this.getFromStorage('timeRemaining');

    if (students) {
      students.forEach((student: any) => {
        store.dispatch(addStudent(student.name));
      });
    }

    if (currentPoll && pollActive) {
      store.dispatch(createPoll(currentPoll));
      if (timeRemaining !== null) {
        store.dispatch(setTimeRemaining(timeRemaining));
        if (timeRemaining > 0) {
          this.startPollTimer(timeRemaining);
        }
      }
    }
  }

  private startPollTimer(maxTime: number) {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }

    let timeLeft = maxTime;
    store.dispatch(setTimeRemaining(timeLeft));
    this.saveToStorage('timeRemaining', timeLeft);
    
    this.pollTimer = setInterval(() => {
      timeLeft -= 1;
      console.log(`Timer: ${timeLeft} seconds remaining`);
      store.dispatch(setTimeRemaining(timeLeft));
      this.saveToStorage('timeRemaining', timeLeft);
      this.broadcast('timeUpdate', { timeRemaining: timeLeft });

      if (timeLeft <= 0) {
        console.log('Timer ended - showing results');
        this.endPollTimer();
      }
    }, 1000);
  }

  private checkIfAllAnswered() {
    const state = store.getState().poll;
    const allAnswered = state.students.every(s => s.hasAnswered);
    if (allAnswered && state.students.length > 0) {
      console.log('All students answered - showing results');
      setTimeout(() => {
        store.dispatch(setShowResults(true));
        this.broadcast('showResults', {});
        this.saveToStorage('showResults', true);
      }, 1000);
    }
  }

  private endPollTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    console.log('Poll ended - setting results to show');
    store.dispatch(endPoll());
    store.dispatch(setShowResults(true));
    this.saveToStorage('pollActive', false);
    this.saveToStorage('showResults', true);
    this.broadcast('pollEnded', {});
    this.broadcast('showResults', {});
  }
}

export const wsService = new WebSocketService();
