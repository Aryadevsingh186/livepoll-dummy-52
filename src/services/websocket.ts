
import { store } from '../store';
import { addPendingStudent, approveStudent, rejectStudent, submitVote, setTimeRemaining, endPoll, createPoll, removeStudent, setShowResults, removePoll } from '../store/pollSlice';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isTeacher?: boolean;
}

class WebSocketService {
  private listeners: { [event: string]: Function[] } = {};
  private pollTimer: NodeJS.Timeout | null = null;
  private chatMessages: ChatMessage[] = [];

  constructor() {
    // Initialize storage sync
    this.syncFromStorage();
    // Listen for storage events to sync across tabs
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  emit(event: string, data: any) {
    console.log(`Emitting ${event}:`, data);
    
    switch (event) {
      case 'requestJoin':
        console.log('Student requesting to join:', data.name);
        // Always add to pending, even if they joined before
        const state = store.getState().poll;
        const existingApproved = state.students.find(s => s.name === data.name);
        const existingPending = state.pendingStudents.find(s => s.name === data.name);
        
        if (!existingApproved && !existingPending) {
          store.dispatch(addPendingStudent(data.name));
          this.broadcast('studentJoinRequest', { name: data.name });
          this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
        }
        break;
      case 'approveStudent':
        console.log('Approving student:', data.studentName);
        store.dispatch(approveStudent(data.studentName));
        this.broadcast('studentApproved', { name: data.studentName });
        this.saveToStorage('students', store.getState().poll.students);
        this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
        break;
      case 'rejectStudent':
        console.log('Rejecting student:', data.studentName);
        store.dispatch(rejectStudent(data.studentName));
        this.broadcast('studentRejected', { name: data.studentName });
        this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
        break;
      case 'createPoll':
        store.dispatch(createPoll(data));
        store.dispatch(setShowResults(false));
        this.broadcast('newPoll', data);
        this.saveToStorage('currentPoll', data);
        this.saveToStorage('pollActive', true);
        this.saveToStorage('showResults', false);
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
      case 'sendMessage':
        const message: ChatMessage = {
          id: Date.now().toString(),
          user: data.user,
          message: data.message,
          timestamp: new Date(),
          isTeacher: data.isTeacher
        };
        this.chatMessages.push(message);
        this.broadcast('newMessage', message);
        this.saveToStorage('chatMessages', this.chatMessages);
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

  getChatMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  private broadcast(event: string, data: any) {
    console.log(`Broadcasting ${event}:`, data);
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
    const pendingStudents = this.getFromStorage('pendingStudents');
    const currentPoll = this.getFromStorage('currentPoll');
    const pollActive = this.getFromStorage('pollActive');
    const timeRemaining = this.getFromStorage('timeRemaining');
    const chatMessages = this.getFromStorage('chatMessages');

    if (chatMessages) {
      this.chatMessages = chatMessages;
    }

    if (pendingStudents) {
      pendingStudents.forEach((student: any) => {
        store.dispatch(addPendingStudent(student.name));
      });
    }

    if (students) {
      students.forEach((student: any) => {
        store.dispatch(approveStudent(student.name));
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
