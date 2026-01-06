This project is an interactive MerchAI Studio web app that lets users upload a logo and place it on product mockups like mugs and t‑shirts, with optional Gemini image generation and editing (Gemini 3 Pro Preview + Nano Banana).
​

Project overview
Web-based mockup editor where users upload a logo and position it on various merch items (e.g., mugs, t-shirts).
​

Integrates Gemini 3 Pro image generation (1K/2K/4K) and Gemini 2.5 Flash image editing (Nano Banana) via Google AI Studio / Gemini API.
​

Built as a TypeScript React-style app with modular components and a dedicated Gemini service.
​

Tech stack
Frontend: TypeScript, React-style components (TSX), HTML5 canvas for the mockup editor.
​

Backend / API: Gemini API via gemini-3-pro-image-preview and gemini-2.5-flash-image models using API keys managed in the app.
​

Structure: index.html, index.tsx, App.tsx, types.ts, services/geminiService.ts, components/*.tsx, metadata.json.
​

Features
Upload a logo and place it on product mockups with canvas-based positioning and scaling.
​

Generate new product or background images with Gemini 3 Pro in multiple resolutions (1K/2K/4K).
​

Edit images (e.g., refine logo placement, cleanups) using Gemini 2.5 Flash image tools.
​

Getting started
Clone or download the project from AI Studio (Download app / Save to GitHub).
​

Install dependencies (e.g., npm install) in the project directory and run the dev server (e.g., npm run dev or npm start).
​

Open the app in the browser and configure a valid Gemini API key via the in-app API Key dialog.
​

Configuration and API keys
Open the API Key dialog in the app to enter/select your Gemini API key.
​

Use a paid Google Cloud project key to access Gemini 3 Pro and Veo models as required.
​
