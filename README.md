# Lean Half Marathon Tracker (V1)

A mobile-first training companion for Half Marathon preparation, built with Next.js 14 and Supabase.

## 🌟 Features
-   **Plan Tracking**: Daily workouts adjusted by readiness (Green/Yellow/Red).
-   **Weekly Check-in**: Track Weight, Waist, and Long Run progress.
-   **Data Vis**: Charts to visualize weight loss and distance ramp-up.
-   **Eating Out Guide**: Simple rules for staying on track at restaurants.

## 🛠️ Stack
-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
-   **Database**: Supabase (PostgreSQL) + Auth.
-   **Authentication**: Email/Password (Supabase Auth).

## 🚀 Getting Started

### 1. Prerequisites
-   Node.js 18+ installed.
-   A Supabase project created.

### 2. Installation
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
Run the `schema.sql`, `schema_policies.sql`, and `fix_profile_trigger.sql` scripts in your Supabase SQL Editor to set up tables and security.

## 📦 Deployment
The app is ready to deploy on **Vercel**:
1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add the Environment Variables (from step 3) to Vercel Settings.
