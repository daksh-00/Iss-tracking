# ISS Tracking Dashboard

Production-ready React + Vite dashboard featuring:

- Live ISS tracking on Leaflet map with trajectory
- Speed analytics and news distribution charts
- Latest news dashboard with search/sort/refresh/cache
- Floating AI chatbot restricted to ISS + dashboard news context
- Dark/light mode, responsive UI, skeleton loaders, toast notifications

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Fill keys in `.env`:
   - `VITE_NEWS_API_KEY`
   - `VITE_AI_TOKEN`
4. Run app:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview build output
