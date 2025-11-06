import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestsState {
  selectedLanguage: string | null;
  selectedDialect: string | null;
  filters: {
    status?: string;
    language?: string;
  };
}

const initialState: TestsState = {
  selectedLanguage: null,
  selectedDialect: null,
  filters: {},
};

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
      // Reset dialect when language changes
      state.selectedDialect = null;
    },
    setDialect: (state, action: PayloadAction<string>) => {
      state.selectedDialect = action.payload;
    },
    setFilters: (state, action: PayloadAction<TestsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    reset: (state) => {
      state.selectedLanguage = null;
      state.selectedDialect = null;
      state.filters = {};
    },
  },
});

export const { setLanguage, setDialect, setFilters, clearFilters, reset } =
  testsSlice.actions;

export default testsSlice.reducer;


