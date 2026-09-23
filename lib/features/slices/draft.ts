import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DraftItem = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  tags: string[];
  updatedAt: string;
};

type DraftState = {
  drafts: DraftItem[];
  activeDraftId: string;
  searchValue: string;
};

export function makeDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// A brand-new, empty draft. `overrides` lets callers seed fields — used by
// the "New draft" button (no overrides) and by localStorage migration when
// upgrading the old single-draft payload.
export function createBlankDraft(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    id: makeDraftId(),
    title: "",
    excerpt: "",
    content: "",
    published: false,
    tags: [],
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function getActiveDraft(state: DraftState): DraftItem | null {
  return state.drafts.find((draft) => draft.id === state.activeDraftId) ?? null;
}

function touch(draft: DraftItem) {
  draft.updatedAt = new Date().toISOString();
}

// The slice always carries at least one draft, and activeDraftId always
// points at one of them, so the editor never renders a draft that Redux
// cannot write back to.
const FIRST_DRAFT = createBlankDraft();

const initialState: DraftState = {
  drafts: [FIRST_DRAFT],
  activeDraftId: FIRST_DRAFT.id,
  searchValue: "",
};

export const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    addDraft: (state, { payload }: PayloadAction<DraftItem>) => {
      state.drafts.push(payload);
      state.activeDraftId = payload.id;
    },

    deleteDraft: (state, { payload: { id } }: PayloadAction<{ id: string }>) => {
      const index = state.drafts.findIndex((draft) => draft.id === id);
      if (index === -1) return;

      state.drafts.splice(index, 1);

      // Never leave the store empty: an empty list would strand the editor
      // on a fallback draft that no reducer can update.
      if (state.drafts.length === 0) {
        const fresh = createBlankDraft();
        state.drafts.push(fresh);
        state.activeDraftId = fresh.id;
        return;
      }

      // Fall back to the neighbour the deleted draft was sitting between.
      if (state.activeDraftId === id) {
        state.activeDraftId =
          state.drafts[index]?.id ?? state.drafts[index - 1].id;
      }
    },

    setActiveDraftId: (state, action: PayloadAction<string>) => {
      if (state.drafts.some((draft) => draft.id === action.payload)) {
        state.activeDraftId = action.payload;
      }
    },

    setSearchValue: (state, action: PayloadAction<string>) => {
      state.searchValue = action.payload;
    },

    setTitle: (state, action: PayloadAction<string>) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.title = action.payload;
      touch(draft);
    },

    setExcerpt: (state, action: PayloadAction<string>) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.excerpt = action.payload;
      touch(draft);
    },

    setContent: (state, action: PayloadAction<string>) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.content = action.payload;
      touch(draft);
    },

    setPublished: (state, action: PayloadAction<boolean>) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.published = action.payload;
      touch(draft);
    },

    setTags: (state, action: PayloadAction<string[]>) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.tags = action.payload;
      touch(draft);
    },

    // Upserts a whole draft in one shot — used when hydrating from
    // localStorage (or eventually a backend) on mount, and makes it
    // the active draft.
    loadDraft: (state, action: PayloadAction<DraftItem>) => {
      const incoming = action.payload;
      const idx = state.drafts.findIndex((draft) => draft.id === incoming.id);

      if (idx >= 0) {
        state.drafts[idx] = incoming;
      } else {
        state.drafts.push(incoming);
      }

      state.activeDraftId = incoming.id;
    },

    // Bulk-restores the entire drafts list in one shot — used on mount
    // once localStorage has been read, so the sidebar's list reflects
    // everything that was persisted, not just a single draft.
    hydrateDrafts: (
      state,
      action: PayloadAction<{ drafts: DraftItem[]; activeDraftId: string }>,
    ) => {
      const incoming = action.payload.drafts.filter(
        (draft) => typeof draft?.id === "string" && draft.id,
      );

      if (incoming.length === 0) {
        const fresh = createBlankDraft();
        incoming.push(fresh);
      }

      state.drafts = incoming;
      state.activeDraftId = incoming.some(
        (draft) => draft.id === action.payload.activeDraftId,
      )
        ? action.payload.activeDraftId
        : incoming[0].id;
    },

    // Clears the fields of the active draft back to blank, without
    // removing it from the list.
    resetDraft: (state) => {
      const draft = getActiveDraft(state);
      if (!draft) return;
      draft.title = "";
      draft.excerpt = "";
      draft.content = "";
      draft.published = false;
      draft.tags = [];
      touch(draft);
    },
  },
});

export const {
  addDraft,
  deleteDraft,
  setActiveDraftId,
  setSearchValue,
  setTitle,
  setExcerpt,
  setContent,
  setPublished,
  setTags,
  loadDraft,
  hydrateDrafts,
  resetDraft,
} = draftSlice.actions;

// Selector: the draft currently open in the editor.
export const selectActiveDraft = (state: {
  draftState: DraftState;
}): DraftItem | null => {
  const { draftState } = state;
  return draftState.drafts.find((d) => d.id === draftState.activeDraftId) ?? null;
};

export default draftSlice.reducer;
