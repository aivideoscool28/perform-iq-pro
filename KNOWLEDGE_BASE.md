# AthleticIQ repository knowledge base

## 1. Project purpose

AthleticIQ is a premium athlete-performance web app for track and field athletes. It combines:
- authentication and user profiles
- dashboard insights
- AI-generated workout logging
- AI training planning
- gear recommendations
- video-based movement analysis
- workout analysis boards

The product is built as a React application using TanStack Start, TanStack Router, Supabase, and AI gateway integrations.

---

## 2. High-level architecture

### Frontend
- React 19 for UI rendering
- TanStack Router for route navigation
- TanStack Query for client-side data fetching and cache handling
- Tailwind-based design system with custom UI components

### Full-stack runtime
- TanStack Start powers server-side rendering and server functions
- Server functions are invoked from the client using the framework’s server function pattern

### Authentication
- Supabase Auth manages login, signup, password reset, and sessions
- Authentication state is read by the hook in src/hooks/use-auth.ts
- Bearer tokens are attached to server function requests by src/integrations/supabase/auth-attacher.ts

### Data layer
- Supabase PostgreSQL tables are the main persistent store
- Some UI state such as training plans and profile preferences are stored in local storage

### AI layer
- The app calls the Lovable AI gateway for:
  - workout parsing
  - training plan generation
  - video analysis

---

## 3. Main folders

- src/routes: route components and page-level logic
- src/components/athleticiq: shared app-specific UI components
- src/lib: server-side business logic and feature functions
- src/integrations/supabase: auth and Supabase integration layer
- src/hooks: reusable hooks such as auth state
- src/styles.css: theme and global visual styling

---

## 4. Core runtime entry points

- src/start.ts: app startup and middleware setup
- src/server.ts: server entry and SSR error handling
- src/router.tsx: router and query client initialization

These files form the runtime backbone of the app.

---

## 5. Authentication flow

### Entry points
- src/routes/auth.tsx: login, sign-up, password reset, Google auth UI
- src/hooks/use-auth.ts: checks and listens to auth state
- src/lib/auth-session.ts: remember-me/session-only handling and welcome flags

### Security layer
- src/integrations/supabase/auth-attacher.ts: attaches auth tokens to server calls
- src/integrations/supabase/auth-middleware.ts: validates auth on server functions

### Important behavior
- Protected routes rely on the auth session
- A user without a valid session is redirected to the auth page

---

## 6. Main product features

### Dashboard
- src/routes/index.tsx
- Shows daily summary, check-ins, streaks, profile, and dashboard data

### Workout logging
- src/components/athleticiq/WorkoutChat.tsx
- src/lib/athletic.functions.ts
- User can describe a workout in natural language; AI parses it into structured data

### Training planning
- src/routes/training.tsx
- src/lib/training.functions.ts
- Generates a weekly training plan using AI

### Workout analysis
- src/routes/workout-analysis.tsx
- src/lib/athletic.functions.ts
- Displays AI-generated analysis boards for logged workouts

### Video analysis
- src/routes/video.tsx
- src/lib/video.functions.ts
- Uploads videos, extracts frames, and runs biomechanical analysis

### Gear management
- src/routes/gear.tsx
- src/lib/gear.functions.ts
- Stores gear preferences and logs, and shows discipline-based recommendations

### Profile and settings
- src/routes/profile.tsx
- src/routes/settings.tsx

---

## 7. Key server functions

### Athletic data functions
- src/lib/athletic.functions.ts
- Contains the main server functions for:
  - dashboard fetching
  - workout logging
  - analysis updates
  - check-in deletion

### Training
- src/lib/training.functions.ts
- AI-generated training plan

### Gear
- src/lib/gear.functions.ts
- Gear profile and gear log CRUD operations

### Video
- src/lib/video.functions.ts
- AI video analysis

---

## 8. Shared UI shell

- src/components/athleticiq/AppShell.tsx
- This is the common shell for the app, including the top bar, sidebar, and page layout.

---

## 9. Typical debugging entry points

### Auth problems
- src/routes/auth.tsx
- src/hooks/use-auth.ts
- src/integrations/supabase/client.ts

### Dashboard or workout issues
- src/lib/athletic.functions.ts
- src/routes/index.tsx

### Training plan issues
- src/lib/training.functions.ts
- src/routes/training.tsx

### Video analysis issues
- src/routes/video.tsx
- src/lib/video.functions.ts

### UI or layout issues
- src/components/athleticiq/AppShell.tsx
- the specific route component

---

## 10. How to read a TSX file without getting lost

A TSX file in this repo usually follows one of three patterns:

### Pattern A: Route page
Example: src/routes/auth.tsx

What it does:
- defines the page route
- holds page-level state such as email, password, loading
- handles user actions such as submitting the form
- decides what to render on screen

Mental model:
- Think of it as the page controller.
- It is responsible for user interaction and page UI.

Typical flow:
1. user types into a field
2. the component calls a function
3. that function talks to Supabase or an AI server function
4. the component updates the screen based on the result

### Pattern B: Shared UI component
Example: src/components/athleticiq/AppShell.tsx

What it does:
- provides reusable layout or visual structure
- receives children and props
--> structured Data and Nested Content
- does not usually contain business logic

Mental model:
- Think of it as a reusable frame.
- It wraps page content and gives it the app’s visual shell.

### Pattern C: Feature component
Example: src/components/athleticiq/WorkoutChat.tsx

What it does:
- collects input from the user
- calls a server function
- shows the result in the UI

Mental model:
- Think of it as a small feature widget.
- It connects the user interface to the backend logic.

---

## 11. Visual examples of the main TSX files

### Example 1: src/routes/auth.tsx
Imagine this file as a login screen.

What happens:
- the user types an email and password
- the form is submitted
- the component calls Supabase auth
- if login succeeds, the app redirects to the dashboard

In simple terms:
- input -> validate -> auth call -> success or error -> navigate

### Example 2: src/components/athleticiq/WorkoutChat.tsx
Imagine this as a chat box for logging workouts.

What happens:
- the athlete types: “I did 30 min easy run and 4x8 squats”
- the chat component sends that text to a server function
- the backend parses it with AI
- the app shows a confirmation message and refreshes the dashboard

In simple terms:
- message -> AI processing -> save workout -> refresh UI

### Example 3: src/routes/training.tsx
Imagine this as a weekly training planner.

What happens:
- the page loads a training plan
- the user clicks “Neuer Plan”
- the app calls the AI plan generator
- the new plan is shown on screen

In simple terms:
- existing plan -> generate new plan -> display new plan

### Example 4: src/routes/gear.tsx
Imagine this as a gear recommendation page.

What happens:
- the page loads the athlete’s past workouts
- it guesses the likely discipline from those workouts
- it shows the best gear recommendations for that discipline
- the user can also save gear preferences

In simple terms:
- workout history -> detect discipline -> show recommendations

### Example 5: src/components/athleticiq/AppShell.tsx
Imagine this as the app’s outer frame.

What happens:
- every route is wrapped by this shell
- it shows the sidebar, header, and page content area
- it creates the overall app layout and visual identity

In simple terms:
- shared layout -> page content sits inside it

---

## 12. A simple mental model for the whole app

You can think of the project like this:

- routes = pages the user visits
- components = visual building blocks shown on those pages
- hooks = reusable logic for things like auth state
- lib files = the backend/business logic behind the UI
- Supabase = the database and auth backend
- AI gateway = the “smart” part that generates insights and plans

A helpful sentence to remember:
- the TSX files usually describe what the user sees and what the user can do
- the lib files usually describe what the app does behind the scenes

---

## 13. Maintenance guidance

- Keep features route-driven: routes define page entry points
- Keep domain logic in src/lib
- Keep shared UI in src/components/athleticiq
- Keep auth and token behavior centralized in src/integrations/supabase
- Prefer updating existing abstractions instead of duplicating logic
- When you are new to a TSX file, read it in this order: imports -> route/component definition -> state -> effects -> render output
