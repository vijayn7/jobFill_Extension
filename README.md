Do not add new permissions unless explicitly required by the prompt.
Keep all new logic inside specified modules, avoiding large logic in top-level index files.
Update src/shared/types.ts when new types are added.
Update NOTES.md with verification steps performed.

# JobFill Extension

## Overview
JobFill Extension is a Chrome extension skeleton for fast job application form filling.

## Build
```sh
npm install
npm run build
```

## Load in Chrome
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `dist` directory.
```
