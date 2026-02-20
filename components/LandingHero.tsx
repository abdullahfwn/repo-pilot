import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Github, ExternalLink, History } from 'lucide-react';
import BlurText from './BlurText';
import { motion } from 'motion/react';

interface LandingHeroProps {
  onAnalyze: (url: string, refs: string) => void;
}

interface RecentRepo {
  name: string;
  description: string;
  stars: number;
  url?: string;
}

export default function LandingHero({ onAnalyze }: LandingHeroProps) {
  const [input, setInput] = useState('');
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);

  useEffect(() => {
    try {
      const storedRecents = localStorage.getItem('recent_repos');
      if (storedRecents) {
        const parsed = JSON.parse(storedRecents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentRepos(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading recent repos:", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input, '');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center pt-16 pb-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col items-center justify-center">
            <BlurText
                text="Understand Any Code"
                delay={150}
                animateBy="words"
                direction="top"
                className="text-5xl md:text-7xl font-serif font-normal tracking-tight text-abyssal leading-[1.1] mb-2 justify-center"
                stepDuration={0.8}
            />
            <BlurText
                text="Instantly In Seconds"
                delay={150}
                animateBy="words"
                direction="bottom"
                className="text-5xl md:text-7xl font-serif font-normal tracking-tight text-truffle leading-[1.1] justify-center"
                stepDuration={0.8}
            />
        </div>
        
        {/* Input Section */}
        <div className="max-w-lg mx-auto w-full mt-12">
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Main Repo Input */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-burningFlame/50 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative flex items-center bg-white rounded-lg p-1 shadow-lg border border-oatmeal">
                <div className="pl-3 text-abyssal/50">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Target Repository URL (e.g., facebook/react)"
                  className="flex-1 bg-transparent border-none text-abyssal placeholder-abyssal/40 focus:ring-0 focus:outline-none px-3 py-3 font-mono text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-truffle hover:bg-abyssal text-palladian px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-truffle/20 text-base font-mono border border-transparent hover:border-burningFlame"
            >
              <span>Analyze Repository</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Recent Analyzed Repos - Only show if there are recents */}
      {recentRepos.length > 0 && (
        <div className="mt-24 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-4 border-b border-oatmeal pb-3">
              <h3 className="text-xl font-serif font-normal text-abyssal flex items-center gap-2">
                  Recently Analyzed
                  <History className="w-4 h-4 text-truffle" />
              </h3>
              <button 
                  onClick={() => {
                      localStorage.removeItem('recent_repos');
                      setRecentRepos([]);
                  }}
                  className="text-xs text-abyssal/60 hover:text-truffle transition-colors font-mono uppercase tracking-wide"
              >
                  Clear History
              </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-4">
            {recentRepos.map((repo, i) => (
              <div 
                  key={i} 
                  className="group bg-white/60 border border-oatmeal rounded-xl p-5 hover:border-truffle hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-md" 
                  onClick={() => onAnalyze(repo.url || `https://github.com/${repo.name}`, '')}
              >
                  <div className="flex items-center justify-between mb-3">
                      <div className="p-1.5 bg-palladian rounded-lg border border-oatmeal group-hover:border-truffle">
                          <Github className="h-5 w-5 text-abyssal" />
                      </div>
                      <div className="flex items-center text-[10px] font-mono text-abyssal/60">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          github.com
                      </div>
                  </div>
                  <h4 className="text-base font-bold text-abyssal mb-1 group-hover:text-truffle transition-colors truncate font-mono">{repo.name}</h4>
                  <p className="text-abyssal/70 text-xs mb-4 line-clamp-2 h-8 font-mono">{repo.description || "No description available."}</p>
                  <div className="flex items-center text-abyssal text-xs font-medium font-mono">
                      <span className="text-burningFlame mr-1">★</span> {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(repo.stars || 0)} stars
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}