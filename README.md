# NEC

A React + TypeScript + Vite application.

## Local development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. In the terminal, run:

```bash
git init
git branch -M main
git remote add origin <your-github-repo-url>
```

3. Publish the site:

```bash
npm install
git add .
git commit -m "Initial commit"
git push -u origin main
npm run deploy
```

The deployment publishes the generated `dist` folder to the `gh-pages` branch.
