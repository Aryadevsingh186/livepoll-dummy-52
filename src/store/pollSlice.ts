
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
}

interface PollState {
  currentPoll: Poll | null;
  students: Student[];
  role: 'teacher' | 'student' | null;
  studentName: string;
  pollHistory: Poll[];
  timeRemaining: number;
  showResults: boolean;
}

const initialState: PollState = {
  currentPoll: null,
  students: [],
  role: null,
  studentName: '',
  pollHistory: [],
  timeRemaining: 0,
  showResults: false,
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<'teacher' | 'student'>) => {
      state.role = action.payload;
    },
    setStudentName: (state, action: PayloadAction<string>) => {
      state.studentName = action.payload;
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
      if (state.currentPoll) {
        state.pollHistory.push(state.currentPoll);
      }
      state.currentPoll = newPoll;
      state.students = state.students.map(s => ({ ...s, hasAnswered: false }));
      state.timeRemaining = action.payload.maxTime;
      state.showResults = false;
    },
    addStudent: (state, action: PayloadAction<string>) => {
      const studentExists = state.students.find(s => s.name === action.payload);
      if (!studentExists) {
        state.students.push({
          id: Date.now().toString(),
          name: action.payload,
          hasAnswered: false,
        });
      }
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
    },
  },
});

export const {
  setRole,
  setStudentName,
  createPoll,
  addStudent,
  submitVote,
  setTimeRemaining,
  endPoll,
  setShowResults,
  removeStudent,
} = pollSlice.actions;

export default pollSlice.reducer;
