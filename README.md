<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio# LPH UNISMA - Management Information System

This is a Management Information System for LPH UNISMA, built with React, Vite, and Supabase.

## Tech Stack
- **Frontend**: React 19, Vite, Lucide React
- **Database**: Supabase
- **Deployment**: Vercel

## Getting Started

### 1. Prerequisites
- Node.js installed
- Supabase Project

### 2. Setup Database
Run the `supabase_schema.sql` script in your Supabase SQL Editor to create the necessary tables.

### 3. Environment Variables
Create a `.env.local` file and add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install & Run
```bash
npm install
npm run dev
```

## Deployment
Push to GitHub and connect to Vercel. Ensure environment variables are set in the Vercel dashboard.
3. Run the app:
   `npm run dev`
