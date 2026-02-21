import React, { useState, useCallback } from 'react';
import { Layout, GitBranch, Play, AlertCircle, BarChart3, BookOpen, FolderSearch, Github } from 'lucide-react';
import LandingHero from './components/LandingHero';
import AnalysisLoader from './components/AnalysisLoader';
import Dashboard from './components/Dashboard';
import { RepoAnalysis } from './types';
import { analyzeRepository } from './services/geminiService';
import { motion } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'loading' | 'dashboard'>('landing');
  const [repoUrl, setRepoUrl] = useState('');
  const [referenceRepos, setReferenceRepos] = useState('');
  const [analysisData, setAnalysisData] = useState<RepoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  const handleStartAnalysis = useCallback(async (url: string, refs: string) => {
    const cleanUrl = url.trim();
    setRepoUrl(cleanUrl);
    setReferenceRepos(refs);
    setError(null);
    setIsAnalysisComplete(false);

    // Check Cache
    const cacheKey = `repo_analysis_cache_${cleanUrl.toLowerCase()}`;
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setAnalysisData(parsedData);
        // For cache, we skip the loading animation sequence or make it instant
        // But to keep consistency, let's just go straight to dashboard
        setCurrentView('dashboard');
        updateRecents(parsedData, cleanUrl);
        return;
      }
    } catch (e) {
      console.warn("Failed to load from cache", e);
      localStorage.removeItem(cacheKey);
    }

    // No cache, proceed to load
    setCurrentView('loading');

    try {
      const repoName = cleanUrl.split('github.com/')[1] || cleanUrl;

      const data = await analyzeRepository(repoName, refs);
      setAnalysisData(data);

      // Save to Cache (Full Analysis)
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        console.error("Failed to cache analysis data (likely quota exceeded)", e);
      }

      updateRecents(data, cleanUrl);

      // Signal that data is ready, letting the loader animate to 100%
      setIsAnalysisComplete(true);

    } catch (err: any) {
      console.error(err);
      // Use the specific error message thrown by the service
      setError(err.message || "Failed to analyze repository. Please check the URL and try again.");
      setCurrentView('landing');
    }
  }, []);

  const handleLoaderFinished = () => {
    setCurrentView('dashboard');
  };

  const updateRecents = (data: RepoAnalysis, cleanUrl: string) => {
    // Save to recent repositories list (Metadata only)
    try {
      const recentRepo = {
        name: data.repoDetails.name,
        description: data.repoDetails.description,
        stars: data.repoDetails.stars,
        url: data.repoDetails.url || (cleanUrl.startsWith('http') ? cleanUrl : `https://github.com/${cleanUrl}`),
        timestamp: Date.now()
      };

      const storedRecents = localStorage.getItem('recent_repos');
      let recents = [];
      try {
        recents = storedRecents ? JSON.parse(storedRecents) : [];
      } catch (e) {
        recents = [];
      }

      if (!Array.isArray(recents)) recents = [];

      // Remove duplicates based on name
      recents = recents.filter((r: any) => r.name.toLowerCase() !== recentRepo.name.toLowerCase());

      // Add new repo to the beginning
      recents.unshift(recentRepo);

      // Keep only top 3
      if (recents.length > 3) {
        recents = recents.slice(0, 3);
      }

      localStorage.setItem('recent_repos', JSON.stringify(recents));
    } catch (e) {
      console.error("Failed to save recent repo to localStorage", e);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setRepoUrl('');
    setReferenceRepos('');
    setCurrentView('landing');
    setIsAnalysisComplete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-[100dvh] bg-palladian text-abyssal font-mono selection:bg-burningFlame selection:text-abyssal overflow-x-hidden flex flex-col"
    >
      {/* Navigation Bar - Abyssal Anchorfish Blue */}
      <nav className="border-b border-oatmeal bg-abyssal sticky top-0 z-50 shadow-md w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={handleReset}>
              <div className="bg-palladian/10 p-1.5 sm:p-2 rounded-lg border border-palladian/20 group-hover:bg-palladian/20 transition-colors">
                <FolderSearch className="h-5 w-5 sm:h-6 sm:w-6 text-burningFlame" />
              </div>
              <span className="text-xl sm:text-2xl font-serif font-normal text-palladian">
                RepoPilot
              </span>
            </div>

            <a
              href="https://github.com/abdullahfwn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-palladian hover:text-burningFlame transition-colors p-1.5 sm:p-2"
              aria-label="GitHub Profile"
            >
              <Github className="h-5 w-5 sm:h-6 sm:w-6" />
            </a>
          </div>
        </div>
      </nav>

      <main className="relative flex-1 flex flex-col">
        {error && (
          <div className="max-w-7xl mx-auto px-4 mt-6">
            <div className="bg-truffle/10 border border-truffle/20 text-truffle p-4 rounded-lg flex items-center space-x-3 animate-fade-in-down">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {currentView === 'landing' && (
          <LandingHero onAnalyze={handleStartAnalysis} />
        )}

        {currentView === 'loading' && (
          <AnalysisLoader
            repoUrl={repoUrl}
            isFinished={isAnalysisComplete}
            onAnimationComplete={handleLoaderFinished}
          />
        )}

        {currentView === 'dashboard' && analysisData && (
          <Dashboard data={analysisData} repoUrl={repoUrl} onBack={handleReset} />
        )}
      </main>

      {/* Footer - Abyssal Anchorfish Blue */}
      <footer className="border-t border-oatmeal bg-abyssal py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-oatmeal text-sm font-mono">
          <p>Made with ❤️ by Abdullah</p>
        </div>
      </footer>
    </motion.div>
  );
}