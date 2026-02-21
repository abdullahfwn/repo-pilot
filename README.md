<h1 align="center">RepoPilot</h1>
<p align="center">
  <b>Instant AI-Powered GitHub Repository Analyzer</b><br/>
  Understand any GitHub codebase, its architecture, and file structure in literally seconds using the power of Machine Learning and LLMs!
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="#getting-started">Getting Started</a> &bull;
  <a href="#how-it-works">How It Works</a>
</p>

---

## Features

- **Blazing Fast Inferences:** Extracts any public GitHub repo’s file tree and provides instantaneous overview metrics.
- **Machine Learning Built-in:** Custom ML pipeline backed by Fast-API & `scikit-learn` to objectively gauge code quality, security, and maintainability scores solely off of structural heuristics.
- **AI powered Analysis (Gemini):** Uses Google's state-of-the-art Gemini Flash model for deducing architecture stacks, generating specific shell commands, and extracting actionable recommendations (Issues, Refactors, Automations).
- **Responsive Dashboard Elements:** Stunning, mobile-friendly interface built intricately with standard Tailwind grid/flex mechanics alongside high-quality Recharts radar diagrams.

## Tech Stack

### Frontend
- **Framework:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Styling:** Custom Vanilla Tailwind CSS configurations for high-end aesthetic designs.
- **Animations:** `motion` library for smooth blurs, cascading elements, and slick loaders.
- **Charts:** [Recharts](https://recharts.org/) for polar coordinate health visualizers.

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Machine Learning:** `scikit-learn` for generating algorithmic baseline scores for the repository's source paths.
- **Networking:** Async HTTP requests using `httpx`.

### Integration Engine
- **LLM:** [Google Gen AI (Gemini Flash Model)](https://ai.google.dev/) API used for deep conceptualization and natural language responses.

---

## Getting Started

### Prerequisites
Make sure you have both [Node.js](https://nodejs.org/en/) and [Python 3.x](https://www.python.org/) installed locally.

### 1. Setup Environment
Clone the repository, then create a local `.env` file at the root of the project with your Gemini API key:
```env
API_KEY=your_gemini_api_key_here
```

### 2. Boot up the ML Backend (FastAPI)
Open a terminal instance and set up the Python environment:

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install the dependencies
pip install fastapi uvicorn pydantic scikit-learn httpx

# 4. Start the backend server
cd backend
python -m uvicorn main:app --reload --port 8000
```
> The backend will securely watch for ML score generation requests from the front client on `localhost:8000`.

### 3. Star the React Frontend
Open a *new* separate terminal window, ensuring you are at the root project directory:

```bash
# 1. Install Node Dependencies
npm install

# 2. Start the Vite Dev Server
npm run dev
```

Visit the designated local host URL (typically `http://localhost:5173`) in your browser to experience **RepoPilot**!

## How It Works

1. **Input**: User points to a `facebook/react`-like GitHub URL on the main Landing UI.
2. **Ping ML Backend**: The Vite UI directly hits the Python `FastAPI` instance which recursively crawls the remote repository API for its exact live File Tree. Python algorithmically hashes the file names against ML models arrays for its code Quality, Dependencies, and Test scores.
3. **Structured Context**: A payload containing solely path schemas without massive code-content overload gets delivered smoothly back to the Vite Client.
4. **LLM Magic**: The frontend wraps those paths firmly inside a strongly-typed schema prompt sent securely to Google's Gemini Models, demanding a synthesized architectural response containing target scopes and actionable recommendations.
5. **Dashboard Rendering**: The resulting high-precision JSON payload is painted onto custom-built Dashboard widgets asynchronously!
