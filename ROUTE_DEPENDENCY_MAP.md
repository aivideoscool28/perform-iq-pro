# AthleticIQ route and feature dependency map

## 1. Route dependency map

### /auth
Purpose: login, sign-up, password reset, Google auth
Main files:
- src/routes/auth.tsx
- src/hooks/use-auth.ts
- src/integrations/supabase/client.ts
- src/lib/auth-session.ts

Dependencies:
- Supabase Auth
- local storage session flags
- auth redirect logic

---

### /
Purpose: main dashboard
Main files:
- src/routes/index.tsx
- src/lib/athletic.functions.ts
- src/components/athleticiq/AppShell.tsx

Dependencies:
- auth hook
- dashboard server function
- workout/check-in data
- onboarding state

---

### /coach
Purpose: AI coach experience
Main files:
- src/routes/coach.tsx
- src/components/athleticiq/EditableShell.tsx

Dependencies:
- UI shell
- local editable state
- shared coach-oriented UI components

---

### /competition
Purpose: competition-related experience
Main files:
- src/routes/competition.tsx

Dependencies:
- shared shell
- editable layout container

---

### /devices
Purpose: connected device experience
Main files:
- src/routes/devices.tsx

Dependencies:
- shared shell
- device-related UI components

---

### /diagnostics
Purpose: diagnostics experience
Main files:
- src/routes/diagnostics.tsx

Dependencies:
- shared shell
- editable layout container

---

### /disciplines
Purpose: discipline selection
Main files:
- src/routes/disciplines.tsx
- src/components/athleticiq/DisciplineSelector.tsx

Dependencies:
- discipline selector component
- profile context

---

### /gamification
Purpose: streaks and challenge-style gamification
Main files:
- src/routes/gamification.tsx
- src/components/athleticiq/StreakManager.tsx

Dependencies:
- local streak data
- shared shell
- profile/check-in state

---

### /gear
Purpose: gear recommendations and gear logs
Main files:
- src/routes/gear.tsx
- src/lib/gear.functions.ts
- src/lib/athletic.functions.ts

Dependencies:
- auth session
- dashboard data
- Supabase gear tables

---

### /nutrition
Purpose: nutrition experience
Main files:
- src/routes/nutrition.tsx
- src/components/athleticiq/MacroRings.tsx
- src/components/athleticiq/FoodScanner.tsx

Dependencies:
- UI shell
- nutrition-related cards
- future data integration layer

---

### /onboarding
Purpose: first-run onboarding flow
Main files:
- src/routes/onboarding.tsx

Dependencies:
- auth session
- profile state
- route navigation

---

### /profile
Purpose: athlete profile
Main files:
- src/routes/profile.tsx
- src/components/athleticiq/SignOutButton.tsx

Dependencies:
- auth session
- profile state
- auth actions

---

### /recovery
Purpose: recovery insights and monitoring
Main files:
- src/routes/recovery.tsx

Dependencies:
- shared shell
- recovery UI components

---

### /reset-password
Purpose: reset password flow
Main files:
- src/routes/reset-password.tsx

Dependencies:
- Supabase Auth
- auth state listener

---

### /settings
Purpose: user settings
Main files:
- src/routes/settings.tsx
- src/components/athleticiq/SignOutButton.tsx

Dependencies:
- auth session
- shared shell

---

### /training
Purpose: AI-generated training plan and timer flow
Main files:
- src/routes/training.tsx
- src/lib/training.functions.ts
- src/components/athleticiq/DisciplineLogger.tsx

Dependencies:
- AI planning server function
- local storage plan/done state
- discipline logger

---

### /video
Purpose: video upload and AI movement analysis
Main files:
- src/routes/video.tsx
- src/lib/video.functions.ts

Dependencies:
- browser video frame extraction
- AI analysis service
- UI shell

---

### /workout-analysis
Purpose: review AI-generated analysis boards
Main files:
- src/routes/workout-analysis.tsx
- src/lib/athletic.functions.ts
- src/components/athleticiq/AnalysisBoard.tsx

Dependencies:
- dashboard data
- analysis boards
- workout records

---

## 2. Feature-level dependency map

### Authentication
- src/routes/auth.tsx
- src/hooks/use-auth.ts
- src/integrations/supabase/client.ts
- src/integrations/supabase/auth-attacher.ts
- src/integrations/supabase/auth-middleware.ts

### Dashboard
- src/routes/index.tsx
- src/lib/athletic.functions.ts

### Workout logging
- src/components/athleticiq/WorkoutChat.tsx
- src/lib/athletic.functions.ts

### Training plan generation
- src/routes/training.tsx
- src/lib/training.functions.ts

### Video analysis
- src/routes/video.tsx
- src/lib/video.functions.ts

### Gear
- src/routes/gear.tsx
- src/lib/gear.functions.ts

### Profile and settings
- src/routes/profile.tsx
- src/routes/settings.tsx

### Shared shell and UI
- src/components/athleticiq/AppShell.tsx
- src/components/athleticiq/EditableShell.tsx
