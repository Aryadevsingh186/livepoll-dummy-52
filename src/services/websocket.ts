import { store } from '../store';
import { addPendingStudent, approveStudent, rejectStudent, submitVote, updatePollVotes, setTimeRemaining, endPoll, createPoll, removeStudent, setShowResults, clearPoll } from '../store/pollSlice';

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
    this.syncFromStorage();
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  emit(event: string, data: any) {
    console.log(`Emitting ${event}:`, data);
    
    switch (event) {
      case 'requestJoin':
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
        store.dispatch(approveStudent(data.studentName));
        this.broadcast('studentApproved', { name: data.studentName });
        this.saveToStorage('students', store.getState().poll.students);
        this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
        break;
        
      case 'rejectStudent':
        store.dispatch(rejectStudent(data.studentName));
        this.broadcast('studentRejected', { name: data.studentName });
        this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
        break;
        
      case 'createPoll':
        this.stopTimer();
        
        store.dispatch(createPoll(data));
        
        const newState = store.getState().poll;
        this.saveToStorage('currentPoll', newState.currentPoll);
        this.saveToStorage('students', newState.students);
        this.saveToStorage('timeRemaining', data.maxTime);
        this.saveToStorage('showResults', false);
        
        this.broadcast('newPoll', newState.currentPoll);
        this.startTimer(data.maxTime);
        break;
        
      case 'submitVote':
        console.log('Processing vote:', data);
        
        // Submit vote to store
        store.dispatch(submitVote(data));
        
        // Get updated state
        const updatedState = store.getState().poll;
        
        // Save updated poll and students
        this.saveToStorage('currentPoll', updatedState.currentPoll);
        this.saveToStorage('students', updatedState.students);
        
        // Broadcast the updated vote counts to all clients
        this.broadcast('voteUpdate', {
          pollId: updatedState.currentPoll?.id,
          votes: updatedState.currentPoll?.votes,
          students: updatedState.students
        });
        
        // Check if all students have voted
        this.checkAllVoted();
        break;
        
      case 'removeStudent':
        store.dispatch(removeStudent(data.studentName));
        this.broadcast('studentRemoved', { name: data.studentName });
        this.saveToStorage('students', store.getState().poll.students);
        break;
        
      case 'clearPoll':
        this.stopTimer();
        store.dispatch(clearPoll());
        this.broadcast('pollCleared', {});
        this.clearPollStorage();
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
    this.saveToStorage(`event_${event}`, { data, timestamp: Date.now() });
  }

  private startTimer(maxTime: number) {
    console.log('Starting timer for', maxTime, 'seconds');
    let timeLeft = maxTime;
    
    store.dispatch(setTimeRemaining(timeLeft));
    this.saveToStorage('timeRemaining', timeLeft);
    
    this.pollTimer = setInterval(() => {
      timeLeft -= 1;
      store.dispatch(setTimeRemaining(timeLeft));
      this.saveToStorage('timeRemaining', timeLeft);
      this.broadcast('timeUpdate', { timeRemaining: timeLeft });

      if (timeLeft <= 0) {
        console.log('Timer ended, showing results');
        this.endPoll();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private endPoll() {
    this.stopTimer();
    store.dispatch(endPoll());
    this.saveToStorage('showResults', true);
    this.saveToStorage('timeRemaining', 0);
    this.broadcast('pollEnded', {});
  }

  private checkAllVoted() {
    const state = store.getState().poll;
    const totalStudents = state.students.length;
    const votedStudents = state.students.filter(s => s.hasAnswered).length;
    
    console.log(`Vote check: ${votedStudents}/${totalStudents} students voted`);
    
    if (totalStudents > 0 && votedStudents === totalStudents) {
      console.log('All students voted, ending poll early');
      setTimeout(() => {
        this.endPoll();
      }, 1000);
    }
  }

  private saveToStorage(key: string, data: any) {
    try {
      localStorage.setItem(`poll_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Storage save error:', error);
    }
  }

  private getFromStorage(key: string) {
    try {
      const item = localStorage.getItem(`poll_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  private clearPollStorage() {
    const keys = ['currentPoll', 'timeRemaining', 'showResults'];
    keys.forEach(key => {
      localStorage.removeItem(`poll_${key}`);
    });
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
      this.syncFromStorage();
    }
  }

  private syncFromStorage() {
    const students = this.getFromStorage('students');
    const pendingStudents = this.getFromStorage('pendingStudents');
    const currentPoll = this.getFromStorage('currentPoll');
    const timeRemaining = this.getFromStorage('timeRemaining');
    const showResults = this.getFromStorage('showResults');
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

    if (currentPoll) {
      store.dispatch(createPoll(currentPoll));
      // Update votes from storage
      store.dispatch(updatePollVotes({ votes: currentPoll.votes }));
      
      if (timeRemaining !== null && timeRemaining > 0) {
        store.dispatch(setTimeRemaining(timeRemaining));
        this.startTimer(timeRemaining);
      }
      if (showResults) {
        store.dispatch(setShowResults(true));
      }
    }
  }
}

export const wsService = new WebSocketService();
