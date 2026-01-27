# Setup Guide for Judges & Evaluators

## Quick Demo Access

**Live Application:** https://quizken.vercel.app

You can create a test account directly on the platform or request demo credentials.

## Project Overview

**QuizKen** - AI-powered quiz generation platform

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Supabase (PostgreSQL + Edge Functions)
- AI: Google Gemini API
- Deployment: Vercel + Supabase

## Repository Structure

```
quizken/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Route pages
│   ├── lib/            # Utilities
│   └── integrations/   # Supabase integration (types hidden)
├── public/             # Static assets
├── supabase/           # Backend (hidden for IP protection)
└── docs/               # Documentation
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Step 1: Install Dependencies

```bash
git clone https://github.com/khanhnkq/quizken.git
cd quizken
npm install
```

### Step 2: Environment Configuration

**IMPORTANT:** Database credentials and API keys are not committed to Git for IP protection.

Create `.env` file:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

**For Judges:** Please contact the project team to receive:
- Supabase project URL
- Supabase anonymous key
- Gemini API key (or request your own at https://makersuite.google.com/app/apikey)

### Step 3: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Key Features to Test

### 1. Quiz Generation
- AI-powered quiz creation with Gemini
- Support for Vietnamese and English
- Custom categories and difficulty levels
- Public/private quiz visibility

### 2. Gamification System
- ZCoin currency and XP points
- Level progression system
- Shop with purchasable items
- Daily quests and rewards

### 3. User Progress
- Quiz attempt history
- Score tracking and analytics
- Personal leaderboards
- Performance insights

### 4. Social Features
- Public quiz library
- Quiz sharing
- User profiles
- Comments and ratings

## Testing Accounts

**Option 1:** Create a new account via the signup page
**Option 2:** Request demo credentials from project team

## Architecture Notes

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Shadcn/ui** component library

### Backend (IP Protected)
- Supabase PostgreSQL database
- Row Level Security (RLS) policies
- Edge Functions for business logic
- Real-time subscriptions

### AI Integration
- Google Gemini API for quiz generation
- Smart prompt engineering
- Multi-language support
- Error handling and retries

## Deployment

**Production:** https://quizken.vercel.app
**Platform:** Vercel (Frontend) + Supabase (Backend)

### CI/CD
- Automatic deployments on push to main branch
- Preview deployments for pull requests
- Environment variables managed via Vercel dashboard

## IP Protection Notes

The following are intentionally hidden from this public repository:
- Database schema and migrations
- Edge function implementations
- Seed data and test fixtures
- Detailed technical documentation
- Business logic specifics

**For complete access:** Contact project team for demo or source code review.

## Support & Contact

For questions or demo requests:
- **GitHub Issues:** https://github.com/khanhnkq/quizken/issues
- **Email:** [your-email@example.com]
- **Demo Request:** Available upon request for judges

## License

MIT License - See LICENSE file for details

---

*Last updated: 2026-01-27*
