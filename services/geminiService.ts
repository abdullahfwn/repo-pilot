import { GoogleGenAI, Type } from "@google/genai";
import { RepoAnalysis } from "../types";

// Helper to parse GitHub URL
function parseGithubUrl(url: string): { owner: string, repo: string } | null {
  try {
    const cleanUrl = url.replace(/\/$/, '');
    const parts = cleanUrl.split('github.com/');
    if (parts.length < 2) return null;
    const pathParts = parts[1].split('/');
    if (pathParts.length < 2) return null;
    return { owner: pathParts[0], repo: pathParts[1] };
  } catch (e) {
    return null;
  }
}

// Helper with timeout for fetch
const fetchWithTimeout = async (url: string, ms: number = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Optimized scoring function
const getFileScore = (p: string) => {
  const name = p.split('/').pop()?.toLowerCase() || '';
  const segments = p.split('/');
  const depth = segments.length;

  if (['package.json', 'go.mod', 'requirements.txt', 'pom.xml', 'cargo.toml', 'dockerfile', 'composer.json', 'gemfile', 'makefile', 'build.gradle', 'nx.json', 'tsconfig.json', 'vite.config.ts', 'next.config.js', 'vercel.json', 'netlify.toml', 'pnpm-workspace.yaml', 'lerna.json'].includes(name)) return 20;
  if (name.startsWith('readme')) return 15;
  if (name.startsWith('contributing')) return 10;
  if (name.includes('config') || name.startsWith('.') || name === 'docker-compose.yml') return 12;
  if (depth === 1) return 10;
  if (name === 'index.ts' || name === 'index.js' || name === 'main.go' || name === 'main.rs' || name === 'app.py' || name === 'server.js') return 9;
  if (p.startsWith('src/') || p.startsWith('app/') || p.startsWith('lib/') || p.startsWith('pkg/') || p.startsWith('core/')) return 8;
  if (depth > 4) return 1;
  if (p.includes('test') || p.includes('spec') || p.includes('__tests__')) return 1;
  if (p.includes('assets') || p.includes('public') || p.includes('images') || p.includes('icons') || p.includes('mock') || p.includes('fixtures')) return 0;
  if (p.includes('dist') || p.includes('build') || p.includes('out') || p.includes('node_modules')) return 0;
  
  return 5;
};

// Helper to fetch file tree from GitHub API
async function fetchRepoData(owner: string, repo: string): Promise<{ tree: string[], metadata: any } | null> {
  try {
    const [repoResponse, treeResponse] = await Promise.allSettled([
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`),
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`)
    ]);

    let metadata = null;
    let tree: string[] = [];

    if (repoResponse.status === 'fulfilled' && repoResponse.value.ok) {
      metadata = await repoResponse.value.json();
    }

    if (treeResponse.status === 'fulfilled' && treeResponse.value.ok) {
      const treeData = await treeResponse.value.json();
      if (treeData.tree && Array.isArray(treeData.tree)) {
        tree = treeData.tree
          .filter((item: any) => {
             if (item.type !== 'blob' && item.type !== 'tree') return false;
             const p = item.path.toLowerCase();
             if (p.endsWith('.png') || p.endsWith('.jpg') || p.endsWith('.svg') || p.endsWith('.lock') || p.endsWith('.pdf') || p.endsWith('.min.js') || p.endsWith('.map') || p.endsWith('.ttf') || p.endsWith('.woff') || p.endsWith('.ico') || p.endsWith('.json.map')) return false;
             const parts = p.split('/');
             if (parts.some((part: string) => ['node_modules', 'vendor', 'dist', 'build', 'out', 'coverage', '.idea', '.vscode', '.git', 'target', 'bin', 'obj'].includes(part))) return false;
             return true;
          })
          .sort((a: any, b: any) => getFileScore(b.path) - getFileScore(a.path))
          .map((item: any) => item.path)
          .slice(0, 200); 
      }
    }

    if (!metadata && tree.length === 0) return null;
    return { tree, metadata: metadata || {} };
  } catch (error) {
    console.warn("GitHub API fetch failed or timed out", error);
    return null;
  }
}

export async function analyzeRepository(repoName: string, references: string): Promise<RepoAnalysis> {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API Key is missing. Please add 'API_KEY' to your environment variables.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Clean inputs
    const cleanRepoName = repoName.replace("https://github.com/", "").replace(/\/$/, "");

    const repoDetails = parseGithubUrl(repoName.startsWith('http') ? repoName : `https://github.com/${repoName}`);
    let fileTreePaths: string[] = [];
    let apiMetadata: any = null;
    let fileTreeContext = "";
    
    // Attempt to fetch real data
    if (repoDetails) {
        const data = await fetchRepoData(repoDetails.owner, repoDetails.repo);
        if (data) {
            fileTreePaths = data.tree;
            apiMetadata = data.metadata;
            if (data.tree.length > 0 || (data.metadata && data.metadata.name)) {
                fileTreeContext = `
                ACTUAL REPOSITORY METADATA:
                Name: ${apiMetadata.name || "Unknown"}
                Description: ${apiMetadata.description || "None"}
                Stars: ${apiMetadata.stargazers_count || 0}
                Forks: ${apiMetadata.forks_count || 0}
                
                ACTUAL FILE TREE (Top 200 most relevant files for architecture):
                ${data.tree.join('\n')}
                `;
            }
        }
    }

    if (!fileTreeContext) {
      throw new Error("Could not retrieve repository data from GitHub. The repository might be private, does not exist, or API rate limit exceeded.");
    }

    // Schema definition
    const schema = {
      type: Type.OBJECT,
      properties: {
        overview: {
          type: Type.OBJECT,
          properties: {
            whatItDoes: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            topDependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            howToRun: { type: Type.ARRAY, items: { type: Type.STRING } },
            architectureOverview: { type: Type.STRING },
            architectureLayers: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        scores: {
          type: Type.OBJECT,
          properties: {
            overall: { type: Type.INTEGER },
            codeQuality: { type: Type.INTEGER },
            security: { type: Type.INTEGER },
            documentation: { type: Type.INTEGER },
            maintainability: { type: Type.INTEGER },
            dependencies: { type: Type.INTEGER },
            testCoverage: { type: Type.INTEGER }
          }
        },
        keyFolders: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              path: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        },
        recommendations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING }, 
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING }, 
              affectedFiles: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    };

    const prompt = `
      You are an elite Senior Software Architect. Analyze the GitHub repository "${cleanRepoName}".
      
      Use the following REAL DATA:
      ${fileTreeContext}
      
      Goal: Provide a CRITICAL technical audit.
      
      1. **Overview**: Deduce purpose, audience, stack.
         - **How to Run**: Provide a specific array of shell commands to setup and start the project. 
           (e.g., "npm install", "npm run dev").
      2. **Scores**: Estimate 0-100 scores based on file structure maturity. Be strict.
      3. **Recommendations**: YOU MUST PROVIDE AT LEAST 3 ACTIONABLE RECOMMENDATIONS.
         - 'type' must be "Issue", "Automation", or "Refactor".
         - 'priority' must be "High", "Medium", or "Low".
      
      CRITICAL: Be concise. Return JSON only.
    `;

    const generateWithRetry = async (retries = 1) => {
        try {
            return await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 0 } 
              }
            });
        } catch (e) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 1000));
                return generateWithRetry(retries - 1);
            }
            throw e;
        }
    };

    const response = await Promise.race([
        generateWithRetry(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Gemini API timeout. The analysis took too long.")), 60000))
    ]);

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini API.");
    
    const analysis = JSON.parse(text) as RepoAnalysis;

    // Inject API Data
    analysis.repoDetails = {
      name: apiMetadata?.full_name || repoName,
      description: apiMetadata?.description || "No description",
      ownerAvatar: apiMetadata?.owner?.avatar_url || "",
      stars: apiMetadata?.stargazers_count || 0,
      forks: apiMetadata?.forks_count || 0,
      issues: apiMetadata?.open_issues_count || 0,
      url: apiMetadata?.html_url || `https://github.com/${repoName}`
    };
    
    analysis.fileTree = fileTreePaths.sort();

    // Defaults if AI is lazy
    if (!analysis.recommendations) analysis.recommendations = [];
    if (!analysis.overview) {
      analysis.overview = {
        whatItDoes: "Information unavailable",
        targetAudience: "Unknown",
        techStack: [],
        topDependencies: [],
        howToRun: [],
        architectureOverview: "Analysis incomplete",
        architectureLayers: [],
        strengths: [],
        weaknesses: []
      };
    }
    
    return analysis;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Directly rethrow the error to be caught by the UI
    throw new Error(error.message || "An unknown error occurred during analysis.");
  }
}