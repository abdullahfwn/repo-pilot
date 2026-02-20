import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisLoaderProps {
  repoUrl: string;
  isFinished?: boolean;
  onAnimationComplete?: () => void;
}

const STEPS = [
  "Fetching repository metadata...",
  "Analyzing file structure...",
  "Reading dependency graphs...",
  "Identifying tech stack...",
  "Evaluating code quality...",
  "Checking architectural patterns...",
  "Generating improvement report..."
];

export default function AnalysisLoader({ repoUrl, isFinished = false, onAnimationComplete }: AnalysisLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Ref to track if we've already triggered completion to avoid double calls
  const completedRef = useRef(false);

  useEffect(() => {
    // 1. Text Steps Animation
    // Adjusted timing to match the linear progress bar (approx 10-12s total)
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (isFinished) return STEPS.length - 1; // Jump to end if finished
        if (prev >= STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 1500);

    // 2. Progress Bar Animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // If we hit 100, stop updating
        if (prev >= 100) {
          return 100;
        }

        // If analysis is finished, accelerate rapidly to 100%
        if (isFinished) {
           const remaining = 100 - prev;
           // Finish within ~500ms regardless of current position
           const jump = Math.max(3, remaining * 0.2); 
           return Math.min(100, prev + jump);
        }

        // Constant linear speed requested by user
        // ~10 seconds to reach 99% (0.3% per 30ms)
        const increment = 0.3;
        
        // Cap at 99%
        return Math.min(99, prev + increment);
      });
    }, 30); // 30ms tick for smoother animation

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isFinished]);

  // Watch for completion
  useEffect(() => {
    if (progress >= 100 && !completedRef.current) {
        completedRef.current = true;
        // Small delay to let user see the 100% bar
        setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, 300);
    }
  }, [progress, onAnimationComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-[80vh] flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md bg-white border border-oatmeal rounded-xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Abstract Background Animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-truffle to-transparent animate-pulse-slow"></div>
        
        <div className="flex flex-col items-center mb-8 relative">
          <div className="absolute inset-0 bg-burningFlame blur-xl opacity-20 rounded-full"></div>
          <Loader2 className="h-12 w-12 text-truffle animate-spin relative z-10" />
        </div>
        
        <h2 className="text-xl font-bold text-abyssal text-center mb-2">
          {isFinished ? "Analysis Complete!" : "Analyzing Repository"}
        </h2>
        <p className="text-sm text-abyssal/60 font-mono mb-8 truncate max-w-xs text-center">
          {repoUrl}
        </p>

        {/* Progress Bar Section */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-xs text-abyssal/50 font-mono px-1">
            <span className="animate-pulse">
                {isFinished ? "Finalizing report..." : STEPS[currentStepIndex]}
            </span>
            <span>{Math.floor(progress)}%</span>
          </div>
          
          <div className="w-full bg-palladian border border-oatmeal/30 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-truffle h-full rounded-full transition-all duration-75 ease-linear" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}