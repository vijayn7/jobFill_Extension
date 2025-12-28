## 2025-09-27
- Build: `npm run build`
- Lint: `npm run lint`
- Chrome load (manual): open `chrome://extensions`, enable Developer mode, click "Load unpacked", select the `dist` folder.
- Build: `npm run build`
- Lint: `npm run lint`

## 2025-12-28
- Build: `npm run build`
- Lint: `npm run lint`
- Runtime check: `node -e "import('./dist/background/messages.js').then(() => console.log('runtime check ok'))"`
