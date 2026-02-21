import React, { useMemo, useState } from 'react';
import { RepoAnalysis } from '../types';
import { ArrowLeft, Star, GitFork, AlertCircle, Share2, Layers, Shield, FileText, Zap, Box, Activity, Github, Cpu, PlayCircle, FolderOpen, GitPullRequest, Wrench, RefreshCw, File, ChevronRight, ChevronDown, Package, Database, Server, Globe, CheckCircle2, XCircle, FolderSearch, BarChart3, Info } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  data: RepoAnalysis;
  repoUrl: string;
  onBack: () => void;
}

export default function Dashboard({ data, repoUrl, onBack }: DashboardProps) {
  const chartData = [
    { subject: 'Quality', A: data.scores?.codeQuality || 0, fullMark: 100 },
    { subject: 'Security', A: data.scores?.security || 0, fullMark: 100 },
    { subject: 'Docs', A: data.scores?.documentation || 0, fullMark: 100 },
    { subject: 'Maintainability', A: data.scores?.maintainability || 0, fullMark: 100 },
    { subject: 'Dependencies', A: data.scores?.dependencies || 0, fullMark: 100 },
    { subject: 'Tests', A: data.scores?.testCoverage || 0, fullMark: 100 },
  ];

  // Group recommendations safely and Case-Insensitively
  const recs = data.recommendations || [];
  const issues = recs.filter(r => r.type?.toLowerCase() === 'issue');
  const automations = recs.filter(r => r.type?.toLowerCase() === 'automation');
  const refactors = recs.filter(r => r.type?.toLowerCase() === 'refactor');

  // Safely access overview arrays
  const techStack = data.overview?.techStack || [];
  const howToRun = data.overview?.howToRun || [];
  const strengths = data.overview?.strengths || [];
  const weaknesses = data.overview?.weaknesses || [];
  const architectureLayers = data.overview?.architectureLayers || [];

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-abyssal font-mono"
    >

      {/* 1. Header Section */}
      <header className="mb-8 md:mb-10 flex flex-col items-start gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 md:p-3 hover:bg-white hover:shadow-sm border border-transparent hover:border-oatmeal rounded-full transition-all text-abyssal/60 hover:text-abyssal group">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <img src={data.repoDetails?.ownerAvatar || ''} alt="Owner" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-oatmeal shadow-xl" />
          </div>
          <div className="w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-abyssal flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="break-all">{data.repoDetails?.name || 'Unknown Repository'}</span>
              <a href={data.repoDetails?.url} target="_blank" rel="noreferrer" className="text-abyssal/40 hover:text-truffle transition-colors flex-shrink-0">
                <Github className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            </h1>
            <p className="text-abyssal/70 max-w-2xl text-base md:text-lg mt-2 leading-relaxed font-mono">{data.repoDetails?.description || 'No description available'}</p>
          </div>
        </div>
      </header>

      {/* 2. Stats Section */}
      <section className="mb-12 md:mb-24 flex flex-wrap gap-3 sm:gap-4">
        <StatBadge icon={<Star className="h-5 w-5 text-burningFlame" />} label="Stars" value={data.repoDetails?.stars || 0} />
        <StatBadge icon={<GitFork className="h-5 w-5 text-abyssal" />} label="Forks" value={data.repoDetails?.forks || 0} />
        <StatBadge icon={<AlertCircle className="h-5 w-5 text-truffle" />} label="Issues" value={data.repoDetails?.issues || 0} />
      </section>

      {/* 3. Overview Section */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<Activity className="text-truffle" />} title="Project Overview" />
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 space-y-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-4">
              <h3 className="text-xl font-normal text-abyssal flex items-center gap-2 font-serif">
                <Box className="h-5 w-5 text-burningFlame" /> What It Does
              </h3>
              <p className="text-abyssal/80 leading-relaxed text-lg">{data.overview?.whatItDoes || 'No information available.'}</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-normal text-abyssal flex items-center gap-2 font-serif">
                <Activity className="h-5 w-5 text-truffle" /> Target Audience
              </h3>
              <p className="text-abyssal/80 leading-relaxed text-lg">{data.overview?.targetAudience || 'No information available.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tech Stack */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<Cpu className="text-burningFlame" />} title="Tech Stack" />
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 shadow-sm">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {techStack.map(t => (
              <span key={t} className="px-4 py-2 bg-palladian rounded-lg text-base border border-oatmeal text-abyssal shadow-sm flex items-center gap-2 font-mono">
                <div className="w-2 h-2 rounded-full bg-truffle"></div>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How to Run */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<PlayCircle className="text-abyssal" />} title="How to Run" />
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 shadow-sm">
          <div className="bg-abyssal rounded-xl p-4 md:p-6 border border-abyssal font-mono text-sm space-y-2 md:space-y-3 overflow-x-auto shadow-inner text-palladian">
            {howToRun.map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-burningFlame select-none mt-0.5">$</span>
                <span className="text-palladian">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Health & Scores */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<Shield className="text-truffle" />} title="Repository Health" />
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">

            {/* Ratings on the LEFT */}
            <div className="w-full lg:w-1/2 space-y-8">
              <OverallScoreCircle score={data.scores?.overall || 0} />
              <div className="grid grid-cols-1 gap-3">
                <ScoreCard label="Code Quality" score={data.scores?.codeQuality || 0} />
                <ScoreCard label="Security" score={data.scores?.security || 0} />
                <ScoreCard label="Documentation" score={data.scores?.documentation || 0} />
                <ScoreCard label="Maintainability" score={data.scores?.maintainability || 0} />
                <ScoreCard label="Dependencies" score={data.scores?.dependencies || 0} />
                <ScoreCard label="Test Coverage" score={data.scores?.testCoverage || 0} />
              </div>
            </div>

            {/* Diagram on the RIGHT */}
            <div className="w-full lg:w-1/2 h-[300px] sm:h-[400px] md:h-[450px] relative font-mono mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-burningFlame/10 rounded-full blur-3xl opacity-50 md:opacity-100" />
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#C9C1B1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#1B2632', fontSize: 13, fontWeight: 500, fontFamily: 'Consolas, monospace' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#A35139" strokeWidth={3} fill="#A35139" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ backgroundColor: '#EEE9DF', borderColor: '#C9C1B1', color: '#1B2632', borderRadius: '0.5rem', fontFamily: 'Consolas, monospace' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AI Insights */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<Zap className="text-burningFlame" />} title="AI Insights" />
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <div className="bg-white/30 border border-oatmeal/60 rounded-3xl p-5 md:p-8">
            <h3 className="text-2xl font-serif font-normal text-abyssal mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-burningFlame" />
              Strengths
            </h3>
            <ul className="space-y-4">
              {strengths.map((item, i) => (
                <li key={i} className="flex gap-4 text-abyssal/80 items-start">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-burningFlame shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-truffle/5 border border-truffle/10 rounded-3xl p-5 md:p-8">
            <h3 className="text-2xl font-serif font-normal text-truffle mb-6 flex items-center gap-3">
              <XCircle className="w-6 h-6" />
              Weaknesses
            </h3>
            <ul className="space-y-4">
              {weaknesses.map((item, i) => (
                <li key={i} className="flex gap-4 text-abyssal/80 items-start">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-truffle shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Architecture */}
      <section className="mb-12 md:mb-24">
        <SectionHeader icon={<Layers className="text-truffle" />} title="Architecture" />
        <div className="grid lg:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 shadow-sm">
            <h3 className="text-xl font-normal text-abyssal mb-4 flex items-center gap-2 font-serif">
              <Server className="h-5 w-5 text-burningFlame" /> Pattern Overview
            </h3>
            <p className="text-abyssal/80 leading-relaxed text-lg">{data.overview?.architectureOverview || 'No overview available.'}</p>
          </div>

          <div className="bg-white/40 border border-oatmeal rounded-3xl p-5 md:p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-grid-abyssal/[0.05] -z-10" />
            <h3 className="text-xl font-normal text-abyssal mb-6 flex items-center gap-2 font-serif">
              <Database className="h-5 w-5 text-burningFlame" /> Architectural Layers
            </h3>
            <div className="space-y-3 w-full">
              {architectureLayers.length > 0 ? (
                architectureLayers.map((layer, idx) => (
                  <div key={idx} className="bg-white border border-oatmeal p-3 md:p-4 rounded-xl text-center shadow-md relative z-10 mx-2 md:mx-4 transform hover:scale-105 transition-transform duration-300">
                    <span className="font-mono text-truffle font-bold tracking-wider text-sm md:text-base">{layer}</span>
                  </div>
                ))
              ) : (
                // Fallback visualization if no specific layers returned
                <>
                  <div className="bg-white border border-oatmeal p-3 md:p-4 rounded-xl text-center shadow-md mx-2 md:mx-4 opacity-100"><span className="font-mono text-truffle text-sm md:text-base">Presentation Layer</span></div>
                  <div className="h-4 border-l-2 border-dashed border-oatmeal mx-auto"></div>
                  <div className="bg-white border border-oatmeal p-3 md:p-4 rounded-xl text-center shadow-md mx-2 md:mx-4 opacity-90"><span className="font-mono text-truffle text-sm md:text-base">Business Logic</span></div>
                  <div className="h-4 border-l-2 border-dashed border-oatmeal mx-auto"></div>
                  <div className="bg-white border border-oatmeal p-3 md:p-4 rounded-xl text-center shadow-md mx-2 md:mx-4 opacity-80"><span className="font-mono text-truffle text-sm md:text-base">Data Access</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Structure & Recommendations (Merged into one grid to remove gap) */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12 md:mb-24 items-start">

        {/* Project Structure */}
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-4 md:p-6 flex flex-col min-h-[400px] max-h-[800px] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-palladian rounded-xl border border-oatmeal">
              <FolderOpen className="w-6 h-6 text-abyssal" />
            </div>
            <h2 className="text-2xl font-serif font-normal text-abyssal">Project Structure</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-palladian/50 rounded-xl border border-oatmeal/50">
            {data.fileTree && data.fileTree.length > 0 ? (
              <FileTreeViewer paths={data.fileTree} />
            ) : (
              <div className="text-abyssal/50 text-center mt-20">File tree unavailable for this repository.</div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/40 border border-oatmeal rounded-3xl p-4 md:p-6 flex flex-col min-h-[400px] max-h-[800px] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-palladian rounded-xl border border-oatmeal">
              <Wrench className="w-6 h-6 text-truffle" />
            </div>
            <h2 className="text-2xl font-serif font-normal text-abyssal">Recommendations</h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <RecommendationGroup title="Issues & Bugs" items={issues} type="Issue" description="Potential runtime errors, logic flaws, and critical bugs." />
            <RecommendationGroup title="Suggested Automations" items={automations} type="Automation" description="CI/CD pipelines, linting rules, and workflow improvements." />
            <RecommendationGroup title="Code Refactoring" items={refactors} type="Refactor" description="Structural improvements, clean code suggestions, and technical debt reduction." />
          </div>
        </div>

      </div>

      {/* Bottom Action: Analyze Another */}
      <div className="flex justify-center mb-8 md:mb-12">
        <button
          onClick={onBack}
          className="bg-abyssal hover:bg-truffle text-palladian px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all shadow-lg shadow-abyssal/20 hover:shadow-truffle/20 flex items-center gap-2 md:gap-3 text-base md:text-lg font-mono border border-transparent hover:border-oatmeal w-full sm:w-auto justify-center"
        >
          <FolderSearch className="h-5 w-5" />
          <span>Analyze Another Repo</span>
        </button>
      </div>

    </motion.div>
  );
}

// -- Helper Components --

function OverallScoreCircle({ score }: { score: number }) {
  // Using a larger viewBox size ensures stroke caps aren't clipped
  const size = 180;
  const strokeWidth = 14;
  const radius = 70; // Defines safe area within size
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Updated Colors: Red (<60), Orange (60-79), Green (80+)
  let rating = "Needs Improvement";
  let ratingStyles = "bg-red-100 text-red-800 border-red-200";
  let strokeColor = "#ef4444"; // red-500

  if (score >= 60) {
    rating = "Good";
    ratingStyles = "bg-orange-100 text-orange-800 border-orange-200";
    strokeColor = "#f97316"; // orange-500
  }
  if (score >= 80) {
    rating = "Excellent";
    ratingStyles = "bg-emerald-100 text-emerald-800 border-emerald-200";
    strokeColor = "#10b981"; // emerald-500
  }

  return (
    <div className="bg-palladian rounded-2xl md:rounded-3xl p-4 md:p-6 border border-oatmeal shadow-md relative">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-white rounded-lg border border-oatmeal shadow-sm hidden sm:block">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-abyssal" />
          </div>
          <span className="font-serif text-lg md:text-xl text-abyssal">Repository Score</span>
        </div>
        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-mono border ${ratingStyles} font-bold uppercase tracking-wide`}>
          {rating}
        </span>
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="relative w-48 h-48">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full transform -rotate-90"
            style={{ overflow: 'visible' }} // Ensure no clipping happens on the SVG element itself
          >
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-oatmeal/30"
            />
            {/* Progress Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
            <span className="text-6xl font-bold font-mono text-abyssal tracking-tighter leading-none">
              {score}
            </span>
            <span className="text-abyssal/50 text-xs font-mono mt-1 font-medium">
              out of 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
      <div className="p-2 md:p-3 bg-palladian rounded-xl border border-oatmeal">
        {React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement<any>, {
            className: `w-5 h-5 md:w-6 md:h-6 ${(icon.props as any).className || ''}`
          })
        ) : icon}
      </div>
      <h2 className="text-2xl md:text-4xl font-serif font-normal text-abyssal">{title}</h2>
    </div>
  )
}

function ScoreCard({ label, score }: { label: string, score: number }) {
  // Updated Colors: Red (<60), Orange (60-79), Green (80+)
  let color = 'bg-red-500';
  let textColor = 'text-red-600';

  if (score >= 60) {
    color = 'bg-orange-500';
    textColor = 'text-orange-600';
  }
  if (score >= 80) {
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-oatmeal flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 hover:border-abyssal transition-colors shadow-sm">
      <span className="text-abyssal/70 font-medium text-base sm:text-lg font-mono">{label}</span>
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex-1 sm:w-32 h-3 bg-palladian border border-oatmeal/30 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }}></div>
        </div>
        <span className={`font-mono font-bold w-10 text-right text-lg sm:text-xl ${textColor}`}>{score}</span>
      </div>
    </div>
  );
}

// -- Recommendation Group Component --

function RecommendationGroup({ title, items, type, description }: { title: string, items: any[], type: string, description: string }) {
  const [isOpen, setIsOpen] = useState(false);

  let Icon = AlertCircle;
  let color = 'text-truffle';
  let bgColor = 'bg-truffle/5';
  let borderColor = 'border-truffle/20';
  let barColor = 'bg-truffle';

  if (type === 'Automation') {
    Icon = Zap;
    color = 'text-abyssal';
    bgColor = 'bg-burningFlame/10';
    borderColor = 'border-burningFlame/30';
    barColor = 'bg-burningFlame';
  } else if (type === 'Refactor') {
    Icon = RefreshCw;
    color = 'text-abyssal';
    bgColor = 'bg-abyssal/5';
    borderColor = 'border-abyssal/10';
    barColor = 'bg-abyssal';
  }

  if (items.length === 0) return null;

  return (
    <div className="border border-oatmeal bg-white/50 rounded-2xl overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white transition-colors group"
      >
        <div className="flex items-start md:items-center gap-4 text-left">
          <div className={`p-3 rounded-xl ${bgColor} ${borderColor} border mt-1 md:mt-0`}>
            <Icon className={`h-6 w-6 ${type === 'Automation' ? 'text-burningFlame' : 'text-truffle'}`} />
          </div>
          <div>
            <h3 className="text-xl font-normal text-abyssal flex items-center gap-3 font-serif">
              {title}
              <span className="px-2.5 py-0.5 rounded-full bg-palladian text-abyssal text-xs font-mono border border-oatmeal">{items.length}</span>
            </h3>
            <p className="text-abyssal/60 text-sm mt-1 font-mono">{description}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-palladian border border-oatmeal text-abyssal group-hover:text-truffle transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>

      {isOpen && (
        <div className="p-6 pt-0 space-y-4 animate-fade-in-down">
          <div className="h-px bg-oatmeal/30 w-full mb-6" />
          <div className="flex flex-col gap-4">
            {items.map((rec, i) => (
              <div key={i} className="bg-white border border-oatmeal p-5 rounded-xl relative overflow-hidden hover:border-truffle transition-all hover:shadow-md">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`}></div>
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${bgColor} ${color} ${borderColor} font-mono`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="font-semibold text-abyssal text-base mb-2 font-mono">{rec.title}</h4>
                  <p className="text-sm text-abyssal/70 leading-relaxed mb-3 font-mono">{rec.description}</p>
                  {rec.affectedFiles && rec.affectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {rec.affectedFiles.map((file: string) => (
                        <span key={file} className="text-[10px] bg-palladian px-2 py-1 rounded-md text-abyssal/60 border border-oatmeal font-mono flex items-center gap-1">
                          <File className="w-3 h-3" /> {file}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -- File Tree Components --

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: TreeNode[];
}

function buildFileTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  paths.forEach(path => {
    const parts = path.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existingNode = currentLevel.find(node => node.name === part);

      if (existingNode) {
        currentLevel = existingNode.children;
      } else {
        const newNode: TreeNode = {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          children: []
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    });
  });

  // Sort folders first, then files
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
    nodes.forEach(node => sortNodes(node.children));
  };

  sortNodes(root);
  return root;
}

function FileTreeViewer({ paths }: { paths: string[] }) {
  const tree = useMemo(() => buildFileTree(paths), [paths]);
  return (
    <div className="font-mono text-sm select-none p-2">
      {tree.map((node) => (
        <FileTreeNode key={node.path} node={node} level={0} />
      ))}
    </div>
  );
}

const FileTreeNode: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Open top level by default

  const handleToggle = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition-colors ${level > 0 ? 'ml-6' : ''}`}
        onClick={handleToggle}
      >
        {node.type === 'folder' && (
          <div className="text-abyssal/50">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
        {node.type === 'file' && <File className="h-4 w-4 text-abyssal/40 ml-[22px]" />} {/* Indent file to align with folder icon */}

        {node.type === 'folder' ? (
          <span className="text-abyssal font-medium flex items-center gap-2 font-mono">
            <FolderOpen className="h-4 w-4 text-burningFlame" />
            {node.name}
          </span>
        ) : (
          <span className="text-abyssal/80 group-hover:text-truffle transition-colors font-mono">{node.name}</span>
        )}
      </div>

      {node.type === 'folder' && isOpen && (
        <div className="border-l border-oatmeal/30 ml-[19px] pl-1">
          {node.children.map(child => (
            <FileTreeNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="flex flex-1 md:flex-none flex-col items-center bg-white border border-oatmeal px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl min-w-[30%] md:min-w-[120px] shadow-sm">
      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
        {React.isValidElement(icon) ? (
          React.cloneElement(icon as React.ReactElement<any>, {
            className: `w-4 h-4 md:w-5 md:h-5 ${(icon.props as any).className || ''}`
          })
        ) : icon}
        <span className="text-[10px] md:text-xs text-abyssal/50 font-bold uppercase tracking-wider font-mono">{label}</span>
      </div>
      <span className="font-mono font-bold text-2xl md:text-3xl text-abyssal">
        {Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(value)}
      </span>
    </div>
  );
}