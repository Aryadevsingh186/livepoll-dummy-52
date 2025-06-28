
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
  kickedStudents: string[]; // Track kicked students
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
        // Remove from kicked list if they were previously kicked
        state.kickedStudents = state.kickedStudents.filter(name => name !== action.payload);
      }
    },
    rejectStudent: (state, action: PayloadAction<string>) => {
      state.pendingStudents = state.pendingStudents.filter(s => s.name !== action.payload);
      // Add to kicked students list
      if (!state.kickedStudents.includes(action.payload)) {
        state.kickedStudents.push(action.payload);
      }
    },
    createPoll: (state, action: PayloadAction<{ question: string; options: string[]; maxTime: number }>) => {
      const newPoll: Poll = {
        id: Date.now().toString(),
        question: action.payload.question,
        options: action.payload.options,
        votes: action.payload.options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
        isActive: true,
        createdAt: Date.now(),
        maxTime: action.payload.maxTime,
      };
      
      state.currentPoll = newPoll;
      state.students = state.students.map(s => ({ ...s, hasAnswered: false }));
      state.timeRemaining = action.payload.maxTime;
      state.showResults = false;
    },
    submitVote: (state, action: PayloadAction<{ studentName: string; option: string }>) => {
      if (state.currentPoll) {
        state.currentPoll.votes[action.payload.option]++;
        const student = state.students.find(s => s.name === action.payload.studentName);
        if (student) {
          student.hasAnswered = true;
        }
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
      // Add to kicked students list
      if (!state.kickedStudents.includes(action.payload)) {
        state.kickedStudents.push(action.payload);
      }
    },
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
