# Deploy the LSU election preview

## Quick preview deployment

1. Push the repository to GitHub.
2. Open [render.com](https://render.com) and create a Web Service from the repository.
3. Render can use the included `render.yaml`, or enter:
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
4. Deploy and open the Render URL.
5. Verify `https://YOUR-URL.onrender.com/health` returns `{"status":"ok"}`.

The service serves both the React frontend and `/api/state` from one public URL.

## Important data limitation

The included `data/election.json` store is a simple demo database. Render's free filesystem is not persistent across every restart or redeploy, so it must not be used as the authoritative election record.

For the actual 70-person election:

1. Create a free Supabase project.
2. Create a database table for accounts, candidates, votes, and audit events.
3. Move the API writes from `data/election.json` to Supabase.
4. Add the Supabase connection variables to Render.
5. Keep the JSON file only as seed data or a backup export.

Do not commit real voter passwords or personal information to GitHub. The current demo credentials are intentionally placeholders.
