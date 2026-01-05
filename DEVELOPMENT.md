# Development Documentation

## 1. Project Overview
**Application Name:** Lean Half Marathon Tracker

This application is a specialized fitness tracker designed to help users train for a half marathon while monitoring body composition metrics (weight, waist size). It combines traditional run tracking with "Lean" methodology metrics.

### Key Features
- **User Authentication:** Secure email/password login via Supabase.
- **Daily Dashboard:** At-a-glance view of today's workouts and readiness.
- **Training Plan:** 4-week structured training blocks.
- **Progress Tracking:** Interactive charts for weight, waist measurements, and run volume.
- **Weekly Check-ins:** Structured form for end-of-week reflection and data entry.

---

## 2. Technical Architecture

### **Tech Stack**
- **Frontend Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript / JavaScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + `clsx` for dynamic classes.
- **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth).
- **Icons:** [Lucide React](https://lucide.dev/).
- **Charts:** [Recharts](https://recharts.org/).

### **Project Structure**
```
/app              # Next.js App Router pages and layouts
  /login          # Authentication pages
  /dashboard      # Main user interface (implied structure)
/components       # Reusable UI components (implied)
/lib              # Utility functions and Supabase client
  supabase.ts     # Supabase client initialization
  utils.ts        # Helper functions
/public           # Static assets
api/              # Server-side API routes (if applicable)
```

### **Database Schema**
The database is hosted on Supabase and consists of 6 main tables:
1.  **`public.profiles`**: Extends Supabase Auth with user-specific data (Target weight/waist).
2.  **`public.plan_weeks`**: Stores the training schedule (targets for Easy, Quality, and Long runs).
3.  **`public.day_logs`**: The core activity log. Tracks daily execution (Run, OTF, Walk) and metrics (Readiness, Steps, OTF Stats).
4.  **`public.week_checkins`**: Weekly summary data for progress tracking.
5.  **`public.kb_workouts`**: Definitions of Kettlebell workouts (Core, Upper, Hinge, etc.).
6.  **`public.kb_sessions`**: Logs of completed Kettlebell workouts.

**Security:**
-   Row Level Security (RLS) is **ENABLED** on all tables.
-   Policies ensure users can only viewing, edit, and delete their *own* data.

---

## 3. Getting Started

### **Prerequisites**
-   Node.js 18+
-   npm or yarn
-   A Supabase project (for environment variables)

### **Installation**
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jhousvawls/half-marathon-tracker.git
    cd half-marathon-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 4. Completed Work & Rationale

|Feature | Description | Why? |
| :--- | :--- | :--- |
| **Supabase Integration** | Replaced mock data with live Supabase DB connections. | To persist user data across sessions and devices securely. |
| **RLS Policies** | Added strict SQL policies for all tables. | To prevent users from accessing each other's sensitive health data. |
| **Dynamic Dashboard** | Connected UI components to `day_logs` table. | To give immediate feedback on today's goals and completion status. |
| **Git Housekeeping** | Added `.gitignore` and removed large artifacts. | To keep the repository clean and efficient for collaboration. |
| **Planning Engine** | Deterministic logic (`lib/planning.ts`) to calculate daily workouts. | To ensure the plan adapts to the day of the week and user history (e.g. Thursday Strength rule). |
| **Weekly View** | Added 7-day schedule to dashboard. | To help users visualize their week, track missed workouts, and look ahead. |
| **OTF & Kettlebell Support** | Integrated specialized trackers for Orangetheory and Kettlebell workouts. | To support a hybrid training model with specific biomechanical needs (splats, specific KB moves). |

---

## 5. Roadmap & Future Improvements

### **Short Term**
-   [ ] **Mobile Optimization:** Further refine touch targets and layout for small screens.
-   [ ] **Offline Mode:** Implement partial offline support using local storage or Service Workers.
-   [ ] **Form Validation:** detailed error messages for invalid inputs (e.g., unrealistic weight entries).

### **Medium Term**
-   [ ] **Strava Integration:** Auto-import run data via Strava API to reduce manual data entry.
-   [ ] **Apple Health / Google Fit:** Sync steps and "Readiness" metrics automatically.
-   [ ] **Push Notifications:** Reminders to log daily workouts or complete weekly check-ins.

### **Long Term**
-   [ ] **Coach Dashboard:** Create an "Admin" role that can view read-only data of specific users (for coaching).
-   [ ] **Social Sharing:** Allow users to share "Week Summary" cards to social media.
-   [ ] **AI Insights:** Use historical data to suggest training adjustments (e.g., "You missed 2 long runs, consider repeating Week 3").

## 6. How to Contribute
1.  Create a new branch for your feature: `git checkout -b feature/amazing-feature`.
2.  Commit your changes: `git commit -m 'Add amazing feature'`.
3.  Push to the branch: `git push origin feature/amazing-feature`.
4.  Open a Pull Request.
