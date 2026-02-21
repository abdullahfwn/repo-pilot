from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import urllib.request
import json
from ml_model import predict_scores

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    owner: str
    repo: str

# Helper to rank files heuristically (same as the frontend heuristic to keep it fair)
def get_file_score(p: str) -> int:
    name = p.split('/')[-1].lower() if '/' in p else p.lower()
    depth = len(p.split('/'))

    if name in ['package.json', 'go.mod', 'requirements.txt', 'pom.xml', 'cargo.toml', 'dockerfile', 'composer.json', 'makefile', 'vite.config.ts', 'next.config.js']: return 20
    if name.startswith('readme'): return 15
    if name.startswith('contributing'): return 10
    if 'config' in name or name.startswith('.') or name == 'docker-compose.yml': return 12
    if depth == 1: return 10
    if name in ['index.ts', 'index.js', 'main.go', 'app.py', 'server.js']: return 9
    if p.startswith('src/') or p.startswith('app/') or p.startswith('lib/'): return 8
    if depth > 4: return 1
    if 'test' in p or 'spec' in p: return 1
    if 'assets' in p or 'public' in p or 'images' in p: return 0
    if 'dist' in p or 'build' in p or 'node_modules' in p: return 0
    
    return 5

def fetch_github_tree(owner: str, repo: str) -> list[str]:
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=8.0) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch repository tree from GitHub.")
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Failed to fetch repository tree from GitHub.")

    if 'tree' not in data:
        return []
        
    # Filter and sort exactly like the old frontend implementation
    tree = [
        item['path'] for item in data['tree']
        if item['type'] in ['blob', 'tree']
        and not item['path'].lower().endswith(('.png', '.jpg', '.pdf', '.lock', '.ico'))
        and not any(part in item['path'].split('/') for part in ['node_modules', 'dist', '.git', 'vendor'])
    ]
    
    # Sort by relevance and take top 200 for consistency
    tree.sort(key=get_file_score, reverse=True)
    return tree[:200]

@app.post("/api/analyze")
def analyze_repo(request: AnalyzeRequest):
    try:
        # Fetch actual file tree from github
        file_tree = fetch_github_tree(request.owner, request.repo)
        if not file_tree:
             raise HTTPException(status_code=400, detail="Repository is empty or unreadable.")
             
        # Machine Learning Inference
        predicted_scores = predict_scores(file_tree)
        
        return {
            "status": "success",
            "scores": predicted_scores,
            "file_tree": file_tree
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "ML Backend is running"}
