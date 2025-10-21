# 🔧 Load More Flash Fix - Proposal

## Current Issue
Flash khi click "Xem thêm" - `filteredQuizzes` giảm từ 18 → 9

## Debugging Added
Console logs để track:
- `📥 loadMore` - Current quizzes count và số rows load
- `📥 setQuizzes` - State before/after update
- `📥 setDisplayLimit` - DisplayLimit before/after  
- `🔍 filteredQuizzes memo` - Quizzes length khi memo runs

## Alternative Solution: useReducer

Thay vì multiple useState, dùng useReducer để đảm bảo state updates atomic:

```typescript
type QuizState = {
  quizzes: PublicQuiz[];
  displayLimit: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

type QuizAction =
  | { type: 'INIT_LOAD'; payload: PublicQuiz[] }
  | { type: 'LOAD_MORE'; payload: PublicQuiz[] }
  | { type: 'RESET_DISPLAY_LIMIT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'INIT_LOAD':
      return {
        ...state,
        quizzes: action.payload,
        displayLimit: PAGE_SIZE,
        hasMore: action.payload.length === PAGE_SIZE,
        loading: false,
      };
      
    case 'LOAD_MORE':
      return {
        ...state,
        quizzes: [...state.quizzes, ...action.payload],
        displayLimit: state.displayLimit + PAGE_SIZE,
        hasMore: action.payload.length === PAGE_SIZE,
        loadingMore: false,
      };
      
    case 'RESET_DISPLAY_LIMIT':
      return {
        ...state,
        displayLimit: PAGE_SIZE,
      };
      
    default:
      return state;
  }
}

// Usage:
const [state, dispatch] = useReducer(quizReducer, {
  quizzes: [],
  displayLimit: PAGE_SIZE,
  hasMore: true,
  loading: true,
  loadingMore: false,
});

// loadMore function:
const loadMore = async () => {
  if (state.loadingMore || !state.hasMore) return;
  
  dispatch({ type: 'SET_LOADING_MORE', payload: true });
  
  const { data } = await supabase...;
  
  dispatch({ type: 'LOAD_MORE', payload: data || [] });
};
```

**Benefits:**
- ✅ Atomic state updates (no race conditions)
- ✅ All related state changes in one place
- ✅ Easier to debug
- ✅ More predictable behavior

## Next Steps

1. **Option A:** Check console logs và fix specific issue
2. **Option B:** Refactor to useReducer (more robust)

Bạn muốn option nào?
