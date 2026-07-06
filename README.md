# LiftTrack

A private, browser-local workout log for a fixed four-week gym routine. LiftTrack records individual sets, cardio duration and distance, session history, and progress trends without an account or backend.

## Development

Requires Node.js 22 (Vite supports Node 20.19+ or 22.12+).

```bash
npm ci
npm run dev
```

Run the full verification suite:

```bash
npm run check
```

## Data and backups

Workout history is stored only in the current browser. Use **Settings → Export backup** before clearing browser data or moving to another device, then use **Import backup** on the destination device.

The app imports completion markers from the original `completedWorkouts` browser key as undated legacy records. These are preserved but excluded from progress charts.

## GitHub Pages

The production site is built for `/workouts/` and deployed from `main` by `.github/workflows/deploy.yml`.

One-time repository configuration:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main` or run the workflow manually from the Actions tab.
