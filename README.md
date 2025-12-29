# JobFill Extension

JobFill is a Chrome extension that watches form fields on job and application sites, surfaces
context-aware suggestions from your saved answers, and lets you quickly fill or save responses.

## Setup

Install dependencies:

```bash
npm install
```

## Development

Run the Vite development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

The production build is output to `dist/`.

## Load in Chrome

1. Run `npm run build`.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder.

## Usage

1. Visit a job application or form page.
2. Click into a form field to open the JobFill widget.
3. Review suggested answers, click **Use** to populate the draft, and select **Fill** to insert it.
4. Click **Save** to store a new answer for future suggestions.
5. Use **Clear** to reset the draft, or **Hide** to dismiss the widget.
