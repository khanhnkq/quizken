# Database Architecture Overview

> **IP Protection Notice:** Detailed schema, migrations, và business logic được ẩn để bảo vệ intellectual property cho cuộc thi.

## System Overview

QuizKen sử dụng Supabase PostgreSQL với các tính năng:
- **Row Level Security (RLS)** - User data isolation
- **Real-time Subscriptions** - Live updates
- **Edge Functions** - Server-side business logic
- **PostgreSQL Triggers** - Automated processes

## Core Entities

### 1. User Management
- User profiles & authentication
- Gamification data (ZCoin, XP, Levels)
- Daily quota tracking
- Inventory system

### 2. Quiz System
- AI-generated quizzes
- Multi-language support
- Public/private visibility
- Expiration & cleanup

### 3. Progress Tracking
- Quiz attempts & scores
- Performance analytics
- Historical data
- Leaderboards

### 4. Gamification
- Shop items catalog
- User inventory
- Equipment system
- Daily quests & rewards

## Key Features

### Server-side Validation
All critical calculations (scores, rewards, levels) are performed server-side to prevent cheating:
- Score validation via Edge Functions
- Anti-cheat mechanisms
- Idempotency enforcement

### Performance Optimization
- Indexed queries
- JSONB for flexible data
- Automatic cleanup jobs
- Connection pooling ready

### Security Measures
- Row Level Security on all tables
- JWT authentication
- Foreign key constraints
- Input sanitization

## For Judges

To review full implementation details:
- **Email:** [your-email@example.com]
- **Request:** Database schema & migrations access
- **Alternative:** Comprehensive demo presentation available

## Technology Stack

- **Database:** PostgreSQL 15+ (Supabase)
- **ORM:** Supabase Client Library
- **Real-time:** WebSocket subscriptions
- **Functions:** Deno Edge Runtime
- **Security:** RLS + JWT

---

*Last updated: 2026-01-27*
