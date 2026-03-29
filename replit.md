# Prompt Tool Pro

A cinematic AI prompt engineering tool for generating image and video prompts from Burmese language descriptions.

## Overview

Users describe a scene in Burmese, configure cinematic parameters, and the app uses the Groq API (Llama/Gemma models) to generate detailed English prompts for tools like Midjourney, Stable Diffusion, Runway, and Sora.

## Tech Stack

- **Frontend:** React 18 + Vite 5
- **Styling:** Tailwind CSS utility classes + custom CSS
- **Icons:** Lucide React
- **UI Components:** React Bootstrap
- **API:** Groq API (user provides their own API key, stored in localStorage)
- **Package Manager:** npm

## Project Structure

```
/
├── src/
│   ├── App.jsx        # Main application component (MatrixRain background, prompt generation)
│   ├── main.jsx       # React entry point
│   ├── App.css        # Component styles
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.js     # Vite config (port 5000, host 0.0.0.0, allowedHosts: true)
└── package.json
```

## Development

The app runs on port 5000 via the "Start application" workflow (`npm run dev`).

## Deployment

Configured as a static site deployment:
- Build command: `npm run build`
- Public directory: `dist`
