# 75 Hard — 10KG Challenge Tracker

Personal fitness tracker for the 75 Hard challenge with a 10kg weight loss goal.

## Features
- Daily 6-task checklist (75 Hard rules)
- Weight logging + progress chart
- Monthly calendar with colour-coded completion status
- Penalty tracker: miss any task → +10 min stairmaster next day
- Progress stats: streak, weight lost, completion rate
- Data stored in browser localStorage (no account needed)

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy to GitHub Pages

1. Create a GitHub repo (e.g. `fitness-tracker`)

2. Update `package.json` — add your repo name to the deploy script:
```json
"deploy": "gh-pages -d dist"
```

3. Update `vite.config.js` if deploying to a sub-path (e.g. `/fitness-tracker/`):
```js
base: '/fitness-tracker/',
```

4. Push your code and deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fitness-tracker.git
git push -u origin main
npm run deploy
```

5. Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch

Your app will be live at `https://YOUR_USERNAME.github.io/fitness-tracker/`

## Data backup

Your data lives in the browser's localStorage under the key `ft_v1`.

To back up: open DevTools → Application → Local Storage → copy the `ft_v1` value.
To restore: paste it back.

## Customising tasks

Edit `src/constants.js` to change the task list, penalty amount, or challenge duration.
