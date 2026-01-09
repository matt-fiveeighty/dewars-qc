# Dewar's Creative Maven - AI-Powered BVI QC Tool

A brand compliance analysis tool that uses Claude AI to automatically verify Dewar's marketing creatives against Brand Visual Identity guidelines.

## Features

- **AI-Powered Analysis**: Claude Sonnet analyzes images for brand compliance
- **Interactive Regions**: Drag and resize overlay boxes to manually verify elements
- **PDF Export**: Generate shareable compliance reports
- **Real-time Scoring**: Automatic scoring based on pass/fail criteria

## Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variable:
     - `ANTHROPIC_API_KEY` = your API key from [console.anthropic.com](https://console.anthropic.com)
   - Deploy!

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your ANTHROPIC_API_KEY
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Cost

Each analysis uses Claude Sonnet with image input:
- **~$0.01-0.03 per analysis** depending on image size
- 100 analyses ≈ $1-3

## File Structure

```
deployable/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js      # Server-side Claude API (keeps key secure)
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── QCAnalyzer.js         # Main QC component with full UI
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Security

- API key is stored server-side only (in environment variables)
- Users never see or need the API key
- All billing goes to your Anthropic account
