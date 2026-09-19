import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DraftState = {
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  tags: string[];
  updatedAt: string;
};

export const initialState: DraftState = {
  title: "",
  excerpt: "",
  content: "",
  published: false,
  tags: [],
  updatedAt: new Date().toISOString(),
};

export const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    setExcerpt: (state, action: PayloadAction<string>) => {
      state.excerpt = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    setPublished: (state, action: PayloadAction<boolean>) => {
      state.published = action.payload;
      state.updatedAt = new Date().toISOString();
    },

    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },

    // Replaces a whole draft in one shot — used when hydrating from
    // localStorage (or eventually a backend) on mount.
    loadDraft: (_state, action: PayloadAction<DraftState>) => {
      return action.payload;
    },

    resetDraft: () => initialState,
  },
});

export const {
  setTitle,
  setExcerpt,
  setContent,
  setPublished,
  setTags,
  loadDraft,
  resetDraft,
} = draftSlice.actions;

export default draftSlice.reducer;