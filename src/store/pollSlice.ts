
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: { [option: string]: number };
  isActive: boolean;
  createdAt: number;
  maxTime: number;
}

export interface Student {
  id: string;
  name: string;
  hasAnswered: boolean;
  isApproved: boolean;
}

export interface PendingStudent {
  id: string;
  name: string;
  timestamp: number;
}

interface PollState {
  currentPoll: Poll | null;
  students: Student[];
  pendingStudents: PendingStudent[];
  role: 'teacher' | 'student' | null;
  studentName: string;
  timeRemaining: number;
  showResults: boolean;
  kickedStudents: string[];
}

const initialState: PollState = {
  currentPoll: null,
  students: [],
  pendingStudents: [],
  role: null,
  studentName: '',
  timeRemaining: 0,
  showResults: false,
  kickedStudents: [],
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<'teacher' | 'student'>) => {
      state.role = action.payload;
      if (action.payload === 'teacher') {
        // Reset everything for teacher role
        state.currentPoll = null;
        state.students = [];
        state.pendingStudents = [];
        state.timeRemaining = 0;
        state.showResults = false;
        state.kickedStudents = [];
      }
    },
    setStudentName: (state, action: PayloadAction<string>) => {
      state.studentName = action.payload;
    },
    addPendingStudent: (state, action: PayloadAction<string>) => {
      const existingPending = state.pendingStudents.find(s => s.name === action.payload);
      const existingApproved = state.students.find(s => s.name === action.payload);
      const isKicked = state.kickedStudents.includes(action.payload);
      
      if (!existingPending && !existingApproved && !isKicked) {
        state.pendingStudents.push({
          id: Date.now().toString(),
          name: action.payload,
          timestamp: Date.now(),
        });
      }
    },
    approveStudent: (state, action: PayloadAction<string>) => {
      const pendingStudent = state.pendingStudents.find(s => s.name === action.payload);
      if (pendingStudent) {
        state.students.push({
          id: pendingStudent.id,
          name: pendingStudent.name,
          hasAnswered: false,
          isApproved: true,
        });
        state.pendingStudents = state.pendingStudents.filter(s => s.name !== action.payload);
        state.kickedStudents = state.kickedStudents.filter(name => name !== action.payload);
      }
    },
    rejectStudent: (state, action: PayloadAction<string>) => {
      state.pendingStudents = state.pendingStudents.filter(s => s.name !== action.payload);
      if (!state.kickedStudents.includes(action.payload)) {
        state.kickedStudents.push(action.payload);
      }
    },
    createPoll: (state, action: PayloadAction<{ question: string; options: string[]; maxTime: number }>) => {
      // Clear any existing poll completely - no history
      const newPoll: Poll = {
        id: Date.now().toString(),
        question: action.payload.question,
        options: action.payload.options,
        votes: action.payload.options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
        isActive: true,
        createdAt: Date.now(),
        maxTime: action.payload.maxTime,
      };
      
      console.log('Creating new poll in reducer:', newPoll);
      state.currentPoll = newPoll;
      // Reset all students' answered status for new poll
      state.students = state.students.map(s => ({ ...s, hasAnswered: false }));
      state.timeRemaining = action.payload.maxTime;
      state.showResults = false;
      console.log('Poll created, students reset:', state.students);
    },
    submitVote: (state, action: PayloadAction<{ studentName: string; option: string }>) => {
      console.log('submitVote reducer called with:', action.payload);
      console.log('Current poll:', state.currentPoll);
      console.log('Current students:', state.students);
      
      if (state.currentPoll && state.currentPoll.isActive) {
        const student = state.students.find(s => s.name === action.payload.studentName);
        console.log('Found student:', student);
        
        if (student && !student.hasAnswered) {
          console.log('Recording vote for option:', action.payload.option);
          console.log('Current votes before:', state.currentPoll.votes);
          
          // Increment the vote count
          state.currentPoll.votes[action.payload.option]++;
          student.hasAnswered = true;
          
          console.log('Current votes after:', state.currentPoll.votes);
          console.log('Student marked as answered:', student);
        } else {
          console.log('Vote not recorded - student already answered or not found');
        }
      } else {
        console.log('Vote not recorded - poll not active or not found');
      }
    },
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    endPoll: (state) => {
      if (state.currentPoll) {
        state.currentPoll.isActive = false;
        state.showResults = true;
      }
    },
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(s => s.name !== action.payload);
      if (!state.kickedStudents.includes(action.payload)) {
        state.kickedStudents.push(action.payload);
      }
    },
    // Remove poll completely - no history
    removePoll: (state) => {
      state.currentPoll = null;
      state.students = state.students.map(s => ({ ...s, hasAnswered: false }));
      state.timeRemaining = 0;
      state.showResults = false;
    },
    leavePoll: (state) => {
      state.role = null;
      state.studentName = '';
    },
    clearAllData: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setRole,
  setStudentName,
  addPendingStudent,
  approveStudent,
  rejectStudent,
  createPoll,
  submitVote,
  setTimeRemaining,
  endPoll,
  setShowResults,
  removeStudent,
  removePoll,
  leavePoll,
  clearAllData,
} = pollSlice.actions;

export default pollSlice.reducer;
