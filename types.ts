export interface RepoAnalysis {
  repoDetails: {
    name: string;
    description: string;
    ownerAvatar: string;
    stars: number;
    forks: number;
    issues: number;
    url: string;
  };
  
  overview: {
    whatItDoes: string;
    targetAudience: string;
    techStack: string[];
    topDependencies: string[];
    howToRun: string[];
    architectureOverview: string;
    architectureLayers: string[];
    strengths: string[];
    weaknesses: string[];
  };

  scores: {
    overall: number;
    codeQuality: number;
    security: number;
    documentation: number;
    maintainability: number;
    dependencies: number;
    testCoverage: number;
  };

  keyFolders: {
    path: string;
    explanation: string;
  }[];

  fileTree?: string[];
  
  recommendations: {
    type: 'Issue' | 'Automation' | 'Refactor';
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    affectedFiles?: string[];
  }[];
}

// Initial state for contexts or loading placeholders
export const EMPTY_ANALYSIS: RepoAnalysis = {
  repoDetails: { name: "", description: "", ownerAvatar: "", stars: 0, forks: 0, issues: 0, url: "" },
  overview: { whatItDoes: "", targetAudience: "", techStack: [], topDependencies: [], howToRun: [], architectureOverview: "", architectureLayers: [], strengths: [], weaknesses: [] },
  scores: { overall: 0, codeQuality: 0, security: 0, documentation: 0, maintainability: 0, dependencies: 0, testCoverage: 0 },
  keyFolders: [],
  recommendations: []
};