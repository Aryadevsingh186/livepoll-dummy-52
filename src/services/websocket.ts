import { store } from '../store';
import { addPendingStudent, approveStudent, rejectStudent, submitVote, updatePollVotes, setTimeRemaining, endPoll, createPoll, removeStudent, setShowResults, clearPoll } from '../store/pollSlice';
import { calculateFromVoteCounts, recalculateVoteCounts, checkAllStudentsVoted, getStudentVotesArray } from '../utils/pollCalculations';

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
  private isProcessingVote = false;
  private processedVotes = new Map<string, string>(); // Track student votes per poll
  private currentPollId: string | null = null;

  constructor() {
    this.syncFromStorage();
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  emit(event: string, data: any) {
    console.log(`Emitting ${event}:`, data);
    
    switch (event) {
      case 'requestJoin':
        this.handleJoinRequest(data);
        break;
        
      case 'approveStudent':
        this.handleApproveStudent(data);
        break;
        
      case 'rejectStudent':
        this.handleRejectStudent(data);
        break;
        
      case 'createPoll':
        this.handleCreatePoll(data);
        break;
        
      case 'submitVote':
        this.handleVoteSubmission(data);
        break;
        
      case 'removeStudent':
        this.handleRemoveStudent(data);
        break;
        
      case 'clearPoll':
        this.handleClearPoll();
        break;
        
      case 'sendMessage':
        this.handleSendMessage(data);
        break;
    }
  }

  private handleJoinRequest(data: { name: string }) {
    const state = store.getState().poll;
    const existingApproved = state.students.find(s => s.name === data.name);
    const existingPending = state.pendingStudents.find(s => s.name === data.name);
    const isKicked = state.kickedStudents.includes(data.name);
    
    if (!existingApproved && !existingPending && !isKicked) {
      store.dispatch(addPendingStudent(data.name));
      this.broadcast('studentJoinRequest', { name: data.name });
      this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
    }
  }

  private handleApproveStudent(data: { studentName: string }) {
    store.dispatch(approveStudent(data.studentName));
    this.broadcast('studentApproved', { name: data.studentName });
    this.saveToStorage('students', store.getState().poll.students);
    this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
  }

  private handleRejectStudent(data: { studentName: string }) {
    store.dispatch(rejectStudent(data.studentName));
    this.broadcast('studentRejected', { name: data.studentName });
    this.saveToStorage('pendingStudents', store.getState().poll.pendingStudents);
  }

  private handleCreatePoll(data: any) {
    this.stopTimer();
    
    // Clear all processed votes when creating new poll
    this.processedVotes.clear();
    this.currentPollId = Date.now().toString();
    
    store.dispatch(createPoll(data));
    
    const newState = store.getState().poll;
    this.saveToStorage('currentPoll', newState.currentPoll);
    this.saveToStorage('students', newState.students);
    this.saveToStorage('timeRemaining', data.maxTime);
    this.saveToStorage('showResults', false);
    
    console.log('New poll created with ID:', this.currentPollId);
    this.broadcast('newPoll', newState.currentPoll);
    this.startTimer(data.maxTime);
  }

  private async handleVoteSubmission(voteData: { studentName: string; option: string }) {
    const currentState = store.getState().poll;
    
    // Early validation - check if poll exists and is active
    if (!currentState.currentPoll || !currentState.currentPoll.isActive) {
      console.log('Vote rejected: Poll is not active');
      return;
    }

    // Check if student exists and is approved
    const student = currentState.students.find(s => s.name === voteData.studentName);
    if (!student) {
      console.log('Vote rejected: Student not found');
      return;
    }

    // CRITICAL: Check if student has already voted for this poll
    if (student.hasAnswered) {
      console.log('Vote rejected: Student already voted for this poll');
      return;
    }

    // Additional protection: Check our internal tracking
    const pollVoteKey = `${this.currentPollId}_${voteData.studentName}`;
    if (this.processedVotes.has(pollVoteKey)) {
      console.log('Vote rejected: Duplicate vote detected in internal tracking');
      return;
    }

    // Prevent concurrent vote processing
    if (this.isProcessingVote) {
      console.log('Vote rejected: Another vote is being processed');
      return;
    }

    this.isProcessingVote = true;

    try {
      // Mark this vote as processed immediately
      this.processedVotes.set(pollVoteKey, voteData.option);
      
      console.log(`Processing vote for ${voteData.studentName}: ${voteData.option}`);

      // Submit the vote through Redux
      store.dispatch(submitVote(voteData));
      
      // Small delay to ensure Redux state is updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Recalculate votes to ensure accuracy
      this.recalculateAndSyncVotes();
      
      // Get final state after recalculation
      const finalState = store.getState().poll;
      
      // Broadcast the updated vote information
      this.broadcast('voteUpdate', {
        pollId: finalState.currentPoll?.id,
        votes: finalState.currentPoll?.votes,
        students: finalState.students
      });
      
      console.log('Vote processed successfully for:', voteData.studentName);
      
      // Check if all students have voted (with small delay)
      setTimeout(() => {
        this.checkVotingCompletion();
      }, 200);
      
    } catch (error) {
      console.error('Error processing vote:', error);
      // Remove from processed votes if there was an error
      this.processedVotes.delete(pollVoteKey);
    } finally {
      this.isProcessingVote = false;
    }
  }

  private handleRemoveStudent(data: { studentName: string }) {
    // Remove student's vote from tracking if they had voted
    if (this.currentPollId) {
      const pollVoteKey = `${this.currentPollId}_${data.studentName}`;
      this.processedVotes.delete(pollVoteKey);
    }
    
    store.dispatch(removeStudent(data.studentName));
    this.broadcast('studentRemoved', { name: data.studentName });
    this.saveToStorage('students', store.getState().poll.students);
    
    // Recalculate votes after removing student
    setTimeout(() => {
      this.recalculateAndSyncVotes();
    }, 100);
  }

  private handleClearPoll() {
    this.stopTimer();
    this.processedVotes.clear();
    this.currentPollId = null;
    
    store.dispatch(clearPoll());
    this.broadcast('pollCleared', {});
    this.clearPollStorage();
  }

  private handleSendMessage(data: any) {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user: data.user,
      message: data.message,
      timestamp: new Date(),
      isTeacher: data.isTeacher
    };
    this.chatMessages.push(message);
    this.broadcast('newMessage', message);
    this.saveToStorage('chatMessages', this.chatMessages);
  }

  private recalculateAndSyncVotes() {
    const state = store.getState().poll;
    
    if (!state.currentPoll) return;

    try {
      // Recalculate vote counts from actual student data
      const correctVoteCounts = recalculateVoteCounts(
        state.currentPoll.options,
        state.students
      );

      // Update Redux with correct vote counts
      store.dispatch(updatePollVotes({ votes: correctVoteCounts }));
      
      // Save to storage
      const updatedState = store.getState().poll;
      this.saveToStorage('currentPoll', updatedState.currentPoll);
      this.saveToStorage('students', updatedState.students);
      
      console.log('Vote counts recalculated:', correctVoteCounts);
    } catch (error) {
      console.error('Error recalculating votes:', error);
    }
  }

  private checkVotingCompletion() {
    const state = store.getState().poll;
    
    if (!state.currentPoll || !state.currentPoll.isActive) {
      return;
    }

    const totalStudents = state.students.length;
    const votedStudents = state.students.filter(s => s.hasAnswered).length;
    
    console.log(`Voting progress: ${votedStudents}/${totalStudents} students voted`);
    
    if (totalStudents > 0 && checkAllStudentsVoted(totalStudents, votedStudents)) {
      console.log('All students voted, ending poll in 2 seconds');
      setTimeout(() => {
        // Double check before ending
        const currentState = store.getState().poll;
        if (currentState.currentPoll?.isActive) {
          this.endPoll();
        }
      }, 2000);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    // Check if this callback is already registered for this event
    const isAlreadyRegistered = this.listeners[event].some(cb => cb === callback);
    if (!isAlreadyRegistered) {
      this.listeners[event].push(callback);
    }
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  getChatMessages(): ChatMessage[] {
    return [...this.chatMessages];
  }

  private broadcast(event: string, data: any) {
    console.log(`Broadcasting ${event}:`, data);
    try {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in ${event} callback:`, error);
          }
        });
      }
      this.saveToStorage(`event_${event}`, { data, timestamp: Date.now() });
    } catch (error) {
      console.error(`Error broadcasting ${event}:`, error);
    }
  }

  private startTimer(maxTime: number) {
    // Clear any existing timer first
    this.stopTimer();
    
    if (maxTime <= 0) return;
    
    console.log('Starting timer for', maxTime, 'seconds');
    let timeLeft = maxTime;
    
    store.dispatch(setTimeRemaining(timeLeft));
    this.saveToStorage('timeRemaining', timeLeft);
    
    this.pollTimer = setInterval(() => {
      timeLeft -= 1;
      store.dispatch(setTimeRemaining(Math.max(0, timeLeft)));
      this.saveToStorage('timeRemaining', Math.max(0, timeLeft));
      this.broadcast('timeUpdate', { timeRemaining: Math.max(0, timeLeft) });

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
      console.log('Timer stopped');
    }
  }

  private endPoll() {
    this.stopTimer();
    
    // Final vote recalculation before ending
    this.recalculateAndSyncVotes();
    
    store.dispatch(endPoll());
    this.saveToStorage('showResults', true);
    this.saveToStorage('timeRemaining', 0);
    this.broadcast('pollEnded', {});
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
    try {
      const keys = ['currentPoll', 'timeRemaining', 'showResults'];
      keys.forEach(key => {
        localStorage.removeItem(`poll_${key}`);
      });
    } catch (error) {
      console.error('Error clearing poll storage:', error);
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (!event.key?.startsWith('poll_')) return;

    try {
      const key = event.key.replace('poll_', '');
      
      if (key.startsWith('event_')) {
        const eventType = key.replace('event_', '');
        const eventData = event.newValue ? JSON.parse(event.newValue) : null;
        
        if (eventData && this.listeners[eventType]) {
          this.listeners[eventType].forEach(callback => {
            try {
              callback(eventData.data);
            } catch (error) {
              console.error(`Error in storage event callback for ${eventType}:`, error);
            }
          });
        }
      } else {
        this.syncFromStorage();
      }
    } catch (error) {
      console.error('Error handling storage change:', error);
    }
  }

  private syncFromStorage() {
    try {
      const students = this.getFromStorage('students');
      const pendingStudents = this.getFromStorage('pendingStudents');
      const currentPoll = this.getFromStorage('currentPoll');
      const timeRemaining = this.getFromStorage('timeRemaining');
      const showResults = this.getFromStorage('showResults');
      const chatMessages = this.getFromStorage('chatMessages');

      if (chatMessages && Array.isArray(chatMessages)) {
        this.chatMessages = chatMessages;
      }

      if (pendingStudents && Array.isArray(pendingStudents)) {
        pendingStudents.forEach((student: any) => {
          if (student && student.name) {
            store.dispatch(addPendingStudent(student.name));
          }
        });
      }

      if (students && Array.isArray(students)) {
        students.forEach((student: any) => {
          if (student && student.name) {
            store.dispatch(approveStudent(student.name));
          }
        });
      }

      if (currentPoll) {
        this.currentPollId = currentPoll.id;
        store.dispatch(createPoll(currentPoll));
        // Update votes from storage
        if (currentPoll.votes) {
          store.dispatch(updatePollVotes({ votes: currentPoll.votes }));
        }
        
        if (timeRemaining !== null && timeRemaining > 0) {
          store.dispatch(setTimeRemaining(timeRemaining));
          this.startTimer(timeRemaining);
        }
        if (showResults) {
          store.dispatch(setShowResults(true));
        }
      }
    } catch (error) {
      console.error('Error syncing from storage:', error);
    }
  }
}

export const wsService = new WebSocketService();
