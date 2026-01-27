# Database Architecture

## Overview
Dự án QuizKen sử dụng Supabase PostgreSQL với các tính năng:
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions cho business logic
- PostgreSQL triggers cho automation

## Core Tables

### 1. `profiles`
Lưu trữ thông tin user profile và gamification data.

**Key Fields:**
- `id` (UUID) - References auth.users
- `zcoin` (INTEGER) - Virtual currency
- `daily_quiz_count` (INTEGER) - Daily usage tracking
- `last_daily_reset` (TIMESTAMP) - Quota reset tracking

**Business Logic:**
- Level system dựa trên XP calculation
- Dynamic rewards với multiplier theo level
- Daily quota reset tự động

### 2. `quizzes`
Lưu trữ quiz data được generate bởi AI.

**Key Fields:**
- `id` (UUID) - Primary key
- `title`, `description` - Metadata
- `questions` (JSONB) - Quiz content
- `user_id` (UUID) - Owner reference
- `status` (TEXT) - Generation status
- `is_public` (BOOLEAN) - Visibility
- Token usage tracking fields

**Features:**
- Automatic expiration (5 days default)
- Idempotency key để prevent duplicates
- Usage tracking (views, downloads)

### 3. `quiz_attempts`
Tracking user quiz completion và scores.

**Key Fields:**
- `id` (UUID)
- `quiz_id`, `user_id` - Foreign keys
- `score`, `total_questions` - Results
- `answers` (JSONB) - User answers
- `time_spent` (INTEGER) - Performance tracking

**Server-side Validation:**
- Scores được tính toán server-side
- Prevent client-side cheating
- Edge Function handles submission

### 4. Items & Gamification
- `items` - Shop items catalog
- `user_items` - User inventory
- Equipment system với `is_equipped` flag

## Security

### Row Level Security (RLS)
- Users chỉ access được data của họ
- Public quizzes có separate policies
- Service role bypass RLS cho Edge Functions

### Authentication
- Supabase Auth với JWT tokens
- Email/password authentication
- Session management

## Business Logic Protection

### Sensitive Functions (Protected)
1. **Level System**
   - XP calculation: `Sqrt(XP / 500) + 1`
   - Reward multiplier: `1 + (Level * 0.1)`
   - Level-up bonus: 1000 ZCoin

2. **Quota Management**
   - Anonymous users: 3 quizzes/day (localStorage)
   - Authenticated users: 10 quizzes/day (server-tracked)
   - Reset at midnight UTC

3. **Edge Functions**
   - `generate-quiz`: AI quiz generation với Gemini API
   - `submit-quiz-attempt`: Server-side score validation
   - Rate limiting và idempotency

## Schema Generation

Để regenerate TypeScript types (for developers):

```bash
npx supabase gen types typescript \
  --project-id <YOUR_PROJECT_ID> \
  --schema public \
  > src/integrations/supabase/types.ts
```

**IMPORTANT NOTES:**
- The generated `types.ts` file is automatically ignored by `.gitignore` for security
- Each developer must regenerate this file locally after pulling schema changes
- Do NOT commit the `types.ts` file to the repository
- Database schema và migration files được protected khỏi public repository để bảo vệ intellectual property
- For team members: Contact the team lead for the project ID and credentials

## Development Setup

1. Contact team lead để nhận:
   - Project ID
   - Database credentials
   - API keys

2. Set up local environment:
   ```bash
   npx supabase init
   npx supabase link --project-ref <PROJECT_ID>
   npx supabase db pull
   ```

3. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

## Database Migration Guidelines

- All migrations must be reviewed và approved
- Use descriptive names: `YYYYMMDD_description.sql`
- Test migrations locally trước khi deploy
- Backup database trước major migrations

## Performance Considerations

- Indexes on frequently queried columns
- JSONB indexes cho quiz questions và answers
- Pagination cho large datasets
- Query optimization với EXPLAIN ANALYZE

## Monitoring

- Query performance tracking
- Error logging via Edge Functions
- Usage analytics
- Rate limiting metrics
