import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, AlertCircle, Database, Eye, Globe, Search, Terminal, TrendingUp, X, Zap, Shield, Cpu, Layers, CheckCircle2, Loader2 } from "lucide-react";

// --- MOCK DATA ---
const trendData = [
  { time: "T-4h", sentiment: 0.12, lower: 0.05, upper: 0.19 },
  { time: "T-3h", sentiment: 0.15, lower: 0.08, upper: 0.22 },
  { time: "T-2h", sentiment: 0.08, lower: -0.01, upper: 0.17 },
  { time: "T-1h", sentiment: -0.05, lower: -0.15, upper: 0.05 },
  { time: "NOW", sentiment: -0.20, lower: -0.32, upper: -0.08 },
  { time: "T+1h", sentiment: -0.25, lower: -0.40, upper: -0.10, isProj: true },
  { time: "T+2h", sentiment: -0.28, lower: -0.45, upper: -0.11, isProj: true },
  { time: "T+3h", sentiment: -0.30, lower: -0.50, upper: -0.10, isProj: true },
];

const simulatedTrendData = [
  { time: "T-4h", sentiment: 0.12, lower: 0.05, upper: 0.19 },
  { time: "T-3h", sentiment: 0.15, lower: 0.08, upper: 0.22 },
  { time: "T-2h", sentiment: 0.08, lower: -0.01, upper: 0.17 },
  { time: "T-1h", sentiment: -0.05, lower: -0.15, upper: 0.05 },
  { time: "NOW", sentiment: -0.20, lower: -0.32, upper: -0.08 },
  { time: "T+1h", sentiment: -0.05, lower: -0.15, upper: 0.05, isProj: true },
  { time: "T+2h", sentiment: 0.10, lower: 0.00, upper: 0.20, isProj: true },
  { time: "T+3h", sentiment: 0.15, lower: 0.05, upper: 0.25, isProj: true },
];

const alertsData = [
  { id: 1, time: "14:32:11", type: "CRISIS", msg: "Wardha (MH) - Localized sentiment drop detected. People are reacting to farm policy rumors.", color: "text-[#D32F2F]", border: "border-[#D32F2F]/50", bg: "bg-[#D32F2F]/5" },
  { id: 2, time: "14:30:02", type: "VIRAL", msg: "Fuel Prices - Narrative hitting high speed. Expected to reach 1M impressions in 45 mins.", color: "text-[#FF6600]", border: "border-[#FF6600]/50", bg: "bg-[#FF6600]/5" },
  { id: 3, time: "14:15:44", type: "DRIFT", msg: "Nashik - Shift in urban demographic detected. Monitoring infrastructure grievances.", color: "text-[#FFA000]", border: "border-[#FFA000]/50", bg: "bg-[#FFA000]/5" },
  { id: 4, time: "13:45:10", type: "STABLE", msg: "Pune - Smart City narrative holding positive momentum. No intervention needed.", color: "text-[#2E7D32]", border: "border-[#2E7D32]/50", bg: "bg-[#2E7D32]/5" },
];

const rawDataStreamPool = [
  { id: "RAW_001", src: "X_FIREHOSE", lang: "MARATHI", text: "शेतमालाला भाव नाही, सरकार काय करतंय? (No price for crops, what is gov doing?)", sent: -0.84, prob: 0.92, geo: "Wardha, MH", model: "LaBSE_v3" },
  { id: "RAW_002", src: "TG_CLUSTER_9", lang: "HINDI", text: "नई सड़क परियोजना से बहुत फायदा होगा। (New road project will be beneficial.)", sent: 0.61, prob: 0.88, geo: "Indore, GJ", model: "LaBSE_v3" },
  { id: "RAW_003", src: "REDDIT_API", lang: "ENGLISH", text: "Inflation is killing the middle class savings in tier 2 cities.", sent: -0.65, prob: 0.95, geo: "Pune, MH", model: "RoBERTa_Ensemble" },
  { id: "RAW_004", src: "FB_GRP_SCRAPE", lang: "GUJARATI", text: "નવી હોસ્પિટલની સુવિધા સારી છે. (New hospital facility is good.)", sent: 0.72, prob: 0.81, geo: "Ahmedabad, GJ", model: "LaBSE_v3" },
  { id: "RAW_005", src: "NEWS_API", lang: "TAMIL", text: "பெட்ரோல் விலை உயர்வு மக்களை பாதிக்கிறது. (Petrol price hike affects people.)", sent: -0.58, prob: 0.89, geo: "Chennai, TN", model: "LaBSE_v3" },
  { id: "RAW_006", src: "X_FIREHOSE", lang: "TELUGU", text: "రైతులకు సబ్సిడీలు పెంచాలి. (Subsidies for farmers should be increased.)", sent: -0.35, prob: 0.76, geo: "Hyderabad, TS", model: "LaBSE_v3" },
  { id: "RAW_007", src: "LOCAL_NEWS", lang: "ENGLISH", text: "Massive rally today in the tech park area disrupts traffic.", sent: -0.15, prob: 0.65, geo: "Bengaluru, KA", model: "VADER_Fast" }
];

const indiaSVGPath = "M31.6 17.1L32 15.3L33.7 13.9L35.2 12.8L35.8 10L35.3 7.8L35.8 5.7L36.8 5.2L39.8 5.5L41.3 4.2L42.5 3.3L44 3.7L45.4 3.8L46.6 4L47.5 5.5L48.6 5.9L50.4 6.8L51.4 7.6L52.8 9.5L53.7 11.2L55.5 12L56 13.3L56 14.9L54.7 16.5L53.6 17.6L51 17.5L50.2 18.5L51.3 20.2L52 21.6L53.7 22.3L54.7 23.3L54.5 24.8L53.5 26.2L52.5 27.7L51.5 29.5L51 31L50 32L49 33L48.2 34.4L47 35.3L46 36.8L46 38L47.6 39L49 38.6L51.3 38.5L53.3 39L55.2 40L57 41.5L59 41.6L61 41.3L63 41.2L65 41L67 41L68.5 41L70.5 40.5L72.5 40.3L74 40.4L75.5 40L76.5 38.8L78 39.5L80 38L81 37.2L82.2 36L83 35L84.2 33.6L85.6 32L87 31.8L88 32.5L89 33.3L89.5 35L89.2 36.6L88 38.5L86.6 40L85.5 41.5L84.6 42.5L83.5 43.6L82.3 45L80.5 45.6L79.4 46.8L78 48L77 49L75.8 50L75.5 51L74.8 52.3L74 53.5L73.2 54.5L72 55.3L70.5 55L69 55.4L68.5 56.4L67 57.5L66 58.8L65 60.5L63.5 61.5L62.2 62.8L61 63.5L60 64L58.5 64L57.5 64.8L56 66L55 67.5L53.5 69.5L52.5 71.5L51 74L49.5 76L48 78L46.8 80.5L45.5 83L44 85L42.5 87L41.3 89.5L40 91.5L38.8 93.5L37.5 95L36.3 96L35.2 96L34.3 95L33.3 94L32 93L31 92L29.6 90.5L28.3 89.5L27 88L25.8 86.5L24.8 85L23.6 83L22.6 81L21.3 79.5L20.2 78L19.2 76.5L18 74L16.8 71.5L15.6 69L14.6 67L13.2 65L12 63.5L10.8 62L9.5 60L8 58.5L6.6 57L5.5 55.5L4.5 54L3.6 53L3 51.5L2 50.5L1.5 49L2.6 48L4.2 48.5L5 47L6 46L7 45.5L8.5 45L10.3 44.5L11.5 43L13.2 42.5L14.8 42L16.3 41.5L17.5 40.5L18.6 39.5L19.8 38L21 37.3L22.5 36.5L24 36L25.5 35.8L27 35.3L28.5 35L29.6 34.6L30.6 34.6L31 33.5L30.5 32L30 30L29.5 28L28.6 26L27.6 24L26.6 22L25.6 20.2L24.8 18.2L24.6 16L24.8 14L25.8 12.5L27.4 10.6L29 9L30.5 7.6L31.6 6.5L32.4 8L33.2 9.5L33.6 11.2L34 13L33.2 14.5L32.6 15.6Z";

const mapNodes = [
  { id: "N01", name: "Srinagar", x: 42, y: 12, sentiment: -0.4, volatility: "Medium", confidence: "85%", type: "warning" },
  { id: "N02", name: "Delhi", x: 45, y: 32, sentiment: -0.2, volatility: "High", confidence: "92%", type: "warning" },
  { id: "N03", name: "Ahmedabad", x: 25, y: 48, sentiment: 0.5, volatility: "Low", confidence: "94%", type: "stable" },
  { id: "N04", name: "Mumbai", x: 28, y: 62, sentiment: 0.35, volatility: "Low", confidence: "88%", type: "stable" },
  { id: "N05", name: "Wardha", x: 45, y: 56, sentiment: -0.8, volatility: "Critical", confidence: "95%", type: "crisis" },
  { id: "N06", name: "Bengaluru", x: 42, y: 78, sentiment: 0.6, volatility: "Low", confidence: "95%", type: "stable" },
  { id: "N07", name: "Kolkata", x: 68, y: 48, sentiment: -0.1, volatility: "Medium", confidence: "81%", type: "drift" },
  { id: "N08", name: "Chennai", x: 48, y: 82, sentiment: 0.1, volatility: "Medium", confidence: "89%", type: "stable" },
  { id: "N09", name: "Guwahati", x: 78, y: 40, sentiment: 0.2, volatility: "Low", confidence: "86%", type: "stable" },
  { id: "N10", name: "Hyderabad", x: 45, y: 68, sentiment: 0.4, volatility: "Low", confidence: "90%", type: "stable" }
];

const mapEdges = [
  { from: "N02", to: "N05", weight: 0.8 }, { from: "N04", to: "N05", weight: 0.9 },
  { from: "N02", to: "N03", weight: 0.4 }, { from: "N05", to: "N10", weight: 0.7 },
  { from: "N10", to: "N06", weight: 0.5 }, { from: "N06", to: "N08", weight: 0.6 },
  { from: "N02", to: "N07", weight: 0.3 }, { from: "N07", to: "N09", weight: 0.4 },
  { from: "N01", to: "N02", weight: 0.5 }
];

// ==========================================
// --- ROOT COMPONENT ---
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [currentTime, setCurrentTime] = useState("");
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) + " IST");
    updateTime();
    const interval = setInterval(updateTime, 1000);
    const timeout = setTimeout(() => setBooted(true), 1500); 
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!booted) return <BootSequence />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-[#FF6600]/30 overflow-x-hidden flex flex-col relative">
      <AnimatePresence>
        {currentView !== "landing" && (
          <motion.nav 
            initial={{ y: -100 }} animate={{ y: 0 }}
            className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#FF6600]/10 px-4 py-2 flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView("landing")}>
              <div className="relative h-10 w-10 flex items-center justify-center border border-[#FF6600]/30 rounded-md bg-white group-hover:border-[#FF6600] transition-all">
                <Globe className="text-[#FF6600] w-5 h-5" />
                <div className="absolute inset-0 border border-[#FF6600] animate-ping opacity-10"></div>
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-black text-[#FF6600] tracking-[0.4em] uppercase leading-none">POLARIS</span>
                <span className="block text-[8px] text-gray-500 tracking-[0.3em] uppercase mt-1 font-mono">Decision Intel</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 px-6 border-l border-r border-slate-200">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between w-24 text-[7px] font-mono text-slate-400 tracking-widest uppercase"><span>CPU</span><span>78%</span></div>
                <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#FF6600] w-[78%]"></div></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between w-24 text-[7px] font-mono text-slate-400 tracking-widest uppercase"><span>MEM</span><span>32TB</span></div>
                <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#1A1A1A] w-[64%]"></div></div>
              </div>
              <div className="text-[8px] font-mono text-[#2E7D32] tracking-widest flex items-center gap-1 uppercase">
                <Activity className="w-3 h-3" /> LATENCY: 12ms
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <NavButton active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} icon={<Activity className="w-4 h-4" />}>COMMAND_CENTER</NavButton>
              <NavButton active={currentView === "guide"} onClick={() => setCurrentView("guide")} icon={<Search className="w-4 h-4" />}>MANUAL</NavButton>
              <div className="hidden md:flex font-mono text-[10px] tracking-[0.2em] text-[#FF6600] bg-[#FF6600]/5 px-4 py-1.5 rounded-md border border-[#FF6600]/20 items-center gap-2">
                {currentTime}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          {currentView === "landing" && <DeepScrollLanding key="landing" onEnter={() => setCurrentView("dashboard")} onViewGuide={() => setCurrentView("guide")} />}
          {currentView === "dashboard" && <DashboardView key="dashboard" />}
          {currentView === "guide" && <UserGuideView key="guide" onEnter={() => setCurrentView("dashboard")} />}
        </AnimatePresence>
      </div>
      
      {/* Visual Overlays for texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.4)_100%)] opacity-40 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-[101] opacity-[0.03] bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
    </div>
  );
}

// ==========================================
// --- BOOT SEQUENCE ---
// ==========================================
function BootSequence() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const lines = [
      "ESTABLISHING KERNEL CONNECTION...",
      "LOADING ATTENTION-GRU ARCHITECTURE...",
      "INITIALIZING GEOPANDAS SPATIAL KRIGING...",
      "ACCESSING MULTILINGUAL NODES...",
      "LaBSE EMBEDDINGS ACTIVE [22 LANGUAGES]...",
      "SYSTEM READY. DECRYPTING FEED..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setLogs(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-white flex flex-col items-center justify-center font-mono text-[#FF6600] text-sm tracking-widest z-[999] relative overflow-hidden">
      <div className="mb-10 z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Zap className="w-12 h-12 text-[#FF6600] animate-pulse" />
          <h1 className="text-5xl font-black text-[#1A1A1A] tracking-[0.5em]">POLARIS</h1>
        </div>
        <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-[#FF6600] to-transparent mx-auto"></div>
      </div>
      <div className="z-10 w-full max-w-lg px-8">
        {logs.map((log, idx) => (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={`bootlog-${idx}`} className="mb-2 flex items-center gap-3 text-[10px] md:text-xs">
            <span className="text-slate-300">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span> <span className="text-[#FF6600]">&gt;</span> {log}
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="mt-4 w-3 h-5 bg-[#FF6600]"></motion.div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,102,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,102,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
    </div>
  );
}


// ==========================================
// --- SHARED UI COMPONENTS ---
// ==========================================

function NavButton({ children, active, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 text-[8px] font-bold tracking-[0.3em] flex items-center gap-2 transition-all font-mono uppercase rounded-md ${
        active 
          ? "bg-[#FF6600] text-white shadow-md shadow-[#FF6600]/20" 
          : "text-slate-400 hover:text-[#FF6600] hover:bg-[#FF6600]/5 border border-transparent"
      }`}
    >
      {icon} <span>{children}</span>
    </button>
  );
}

function KpiCard({ title, value, sub, type, alert, sparklineData }) {
  const colorMap = {
    danger: "text-[#D32F2F] border-[#D32F2F]/20 bg-white",
    warning: "text-[#FFA000] border-[#FFA000]/20 bg-white",
    safe: "text-[#FF6600] border-[#FF6600]/20 bg-white"
  };
  const glow = colorMap[type] || colorMap.safe;
  const strokeColor = type === 'danger' ? '#D32F2F' : type === 'warning' ? '#FFA000' : '#FF6600';

  const data = sparklineData ? sparklineData.map((val, i) => ({ v: val, i })) : [];

  return (
    <div className={`p-5 border relative overflow-hidden flex flex-col justify-between group rounded-lg shadow-sm ${glow}`}>
      {alert && <div className={`absolute top-0 left-0 w-full h-1 ${type === 'danger' ? 'bg-[#D32F2F]' : 'bg-[#FFA000]'} animate-pulse opacity-50`}></div>}
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-[8px] font-mono font-bold text-slate-400 tracking-[0.3em] uppercase">{title}</h3>
      </div>

      <div className="relative z-10 flex justify-between items-end">
        <div>
          <div className={`text-3xl lg:text-4xl font-black tracking-tight font-sans mb-0.5 text-slate-900`}>{value}</div>
          <div className={`text-[7px] font-mono font-bold tracking-widest uppercase ${glow.split(' ')[0]}`}>{sub}</div>
        </div>
        
        {data.length > 0 && (
          <div className="w-16 h-8 opacity-40 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function GlassPanel({ title, children, className = "", icon, action, rightAction }) {
  return (
    <div className={`flex flex-col h-full bg-white border border-slate-200 relative overflow-hidden rounded-lg shadow-sm ${className}`}>
      <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-[8px] font-bold font-mono text-slate-500 uppercase tracking-[0.4em]">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {rightAction && rightAction}
          {action && <div>{action}</div>}
        </div>
      </div>
      <div className="flex-grow p-4 overflow-hidden relative z-0">
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length > 0 && payload[0]) {
    const data = payload[0].payload;
    if (!data) return null;
    const isSim = data.isProj;
    return (
      <div className={`bg-white border p-3 shadow-xl rounded-md ${isSim ? 'border-[#2E7D32]/50' : 'border-[#FF6600]/50'}`}>
        <p className={`text-[9px] font-mono mb-2 border-b pb-1 text-slate-400 border-slate-100`}>T_VAL: {label}</p>
        <p className={`text-sm font-bold font-sans mb-1 ${isSim ? 'text-[#2E7D32]' : 'text-[#FF6600]'}`}>S_SCORE: {data.sentiment?.toFixed(2) || 'N/A'}</p>
        <p className="text-[8px] text-slate-400 font-mono">VaR BOUNDS: [{data.lower?.toFixed(2) || 'N/A'}, {data.upper?.toFixed(2) || 'N/A'}]</p>
        {isSim && <p className="text-[7px] bg-[#FFA000]/10 text-[#FFA000] px-1.5 py-0.5 inline-block mt-2 uppercase tracking-widest border border-[#FFA000]/20 rounded-sm">PROJECTION</p>}
      </div>
    );
  }
  return null;
}

function TacticalRadarMap() {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <GlassPanel title="Spatial Radar Map" icon={<Globe className="w-4 h-4 text-[#FF6600]" />} className="relative overflow-hidden p-0" rightAction={<span className="text-[7px] font-mono text-slate-400 tracking-widest uppercase">STATUS: LIVE SCAN</span>}>
      <div className="absolute inset-0 bg-[#FBFBFB]">
        {/* Radar Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-slate-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-slate-200 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border border-slate-200 rounded-full"></div>
        
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-200"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200"></div>

        <motion.div 
          className="absolute top-1/2 left-1/2 w-[80%] h-[80%] origin-bottom-right bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(255,102,0,0.1)_360deg)] pointer-events-none rounded-full"
          style={{ marginTop: '-80%', marginLeft: '-80%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {mapNodes.map((node) => {
          const isCrisis = node.type === 'crisis';
          const nodeColor = isCrisis ? 'bg-[#D32F2F]' : node.type === 'warning' ? 'bg-[#FFA000]' : node.type === 'drift' ? 'bg-[#FF6600]' : 'bg-[#2E7D32]';
          const shadowColor = isCrisis ? 'shadow-[0_0_15px_rgba(211,47,47,0.5)]' : 'shadow-sm';

          return (
            <div 
              key={`node-${node.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-20 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {isCrisis && <div className={`absolute inset-0 rounded-full ${nodeColor} animate-ping opacity-60`}></div>}
              <div className={`w-3 h-3 rounded-full ${nodeColor} ${shadowColor} border-2 border-white relative z-10 transition-transform group-hover:scale-125`}></div>
              
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-px h-2 bg-slate-300 mb-0.5"></div>
                <div className="text-[7px] font-mono tracking-widest text-white bg-slate-900 px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-md">
                  {node.name.toUpperCase()}
                </div>
              </div>
            </div>
          );
        })}

        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute bottom-6 left-6 z-30 p-4 bg-white border border-slate-200 rounded-lg min-w-[220px] pointer-events-none shadow-xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-bold font-sans text-slate-900 tracking-wide uppercase flex items-center gap-2">
                  <Zap className="w-3 h-3 text-[#FF6600]" />
                  {hoveredNode.name}
                </h3>
                <span className={`text-[6px] px-1.5 py-0.5 uppercase font-bold tracking-widest border rounded-sm ${hoveredNode.type === 'crisis' ? 'text-[#D32F2F] border-[#D32F2F]/20 bg-[#D32F2F]/5' : 'text-[#FF6600] border-[#FF6600]/20 bg-[#FF6600]/5'}`}>
                  {hoveredNode.type}
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[8px]">
                <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded-sm">
                  <span className="text-slate-400 uppercase">S_SCORE</span>
                  <span className={hoveredNode.sentiment < 0 ? "text-[#D32F2F] font-bold" : "text-[#2E7D32] font-bold"}>{hoveredNode.sentiment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded-sm">
                  <span className="text-slate-400 uppercase">VOLATILITY</span>
                  <span className={hoveredNode.volatility === 'Critical' ? 'text-[#D32F2F] font-bold' : 'text-slate-600'}>{hoveredNode.volatility}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded-sm">
                  <span className="text-slate-400 uppercase">VAR CONFIDENCE</span>
                  <span className="text-slate-900 font-bold">{hoveredNode.confidence}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute top-4 right-4 text-[7px] font-mono text-slate-400 text-right leading-loose tracking-[0.2em] border-r border-slate-200 pr-2">
          <div>GEO_REF: 28.6139N, 77.2090E</div>
          <div>STS: SCANNING_ACTIVE</div>
        </div>
      </div>
    </GlassPanel>
  );
}

function TerminalSimulator() {
  const [status, setStatus] = useState("idle"); 
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const runSimulation = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setLogs([]);
    setProgress(0);

    const sequence = [
      "> INITIATING SIMULATION ENGINE...",
      "> INJECTING MESSAGE PAYLOAD...",
      "> TESTING LOCAL REACTION...",
      "> CALCULATING PROBABILITY PATHS...",
      "> SIMULATION COMPLETE."
    ];

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setLogs(prev => [...prev, sequence[i]]);
      setProgress(Math.floor(((i + 1) / sequence.length) * 100));
    }
    setStatus("complete");
  };

  return (
    <GlassPanel title="Simulation Sandbox" icon={<Terminal className="w-4 h-4 text-[#FF6600]" />}>
      <div className="flex flex-col h-full relative p-1">
        <form onSubmit={runSimulation} className="space-y-4">
          <div>
            <label className="block text-[7px] font-mono text-slate-400 uppercase tracking-[0.3em] mb-1.5 font-bold">TARGET_LOCATION</label>
            <div className="relative border border-slate-200 bg-slate-50 rounded-md">
              <select disabled={status === 'loading'} className="w-full bg-transparent p-2.5 text-[9px] text-slate-800 focus:outline-none focus:border-[#FF6600] appearance-none font-mono font-bold tracking-widest">
                <option>WARDHA_REGION</option>
                <option>NASHIK_REGION</option>
                <option>NATIONAL_FEED</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[7px] font-mono text-slate-400 uppercase tracking-[0.3em] mb-1.5 font-bold">RESPONSE_TEXT</label>
            <textarea 
              disabled={status === 'loading'}
              rows={2} 
              className="w-full bg-slate-50 border border-slate-200 p-3 text-[9px] text-slate-800 focus:outline-none focus:border-[#FF6600] resize-none font-mono rounded-md leading-relaxed"
              defaultValue="Clarifying policy benefits for local farmers. Active 24h."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-[#FF6600] text-white py-3 text-[9px] font-bold tracking-[0.4em] uppercase transition-all hover:bg-[#E65C00] disabled:opacity-50 font-mono rounded-md shadow-sm"
          >
            {status === "loading" ? `TESTING [${progress}%]` : "[ TEST RESPONSE ]"}
          </button>
        </form>

        <div className="mt-5 flex-grow bg-slate-50 border border-slate-100 p-4 font-mono text-[8px] text-slate-400 overflow-y-auto relative tracking-widest leading-loose rounded-md">
          {logs.length === 0 && status === "idle" && (
             <div className="h-full flex items-center justify-center opacity-40 italic">AWAITING_INPUT</div>
          )}

          {logs.map((log, i) => (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`sim-log-${i}`} className="text-slate-600">{log}</motion.div>
          ))}
          
          {status === "complete" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex justify-between items-center text-[#2E7D32] mb-1 bg-[#2E7D32]/5 p-2 rounded-sm">
                <span className="font-bold">PREDICTED_GAINS:</span>
                <span className="font-black text-[10px]">+0.15</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 mb-2 bg-slate-200/30 p-2 rounded-sm">
                <span className="font-bold">SUCCESS_RATE:</span>
                <span className="font-black text-[10px]">94%</span>
              </div>
              <div className="bg-[#2E7D32] text-white p-2 font-bold tracking-widest text-center mt-2 rounded-sm text-[9px]">
                [ RESPONSE APPROVED ]
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

function InterceptSnapshotModal({ data, onClose }) {
  const [isFlagging, setIsFlagging] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);
  const [traceLogs, setTraceLogs] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [hasTraced, setHasTraced] = useState(false);

  if (!data) return null;

  const handleFlagError = () => {
    setIsFlagging(true);
    setTimeout(() => {
      setIsFlagging(false);
      setHasFlagged(true);
    }, 1500);
  };

  const handleTraceSource = async () => {
    setIsTracing(true);
    setTraceLogs([]);
    const steps = [
      "Connecting to Regional Node...",
      "Resolving Proxy Hops [1/3]...",
      "Analyzing Geolocation TTL...",
      "Matching User Signature...",
      "Source Identified."
    ];
    for(let step of steps) {
      setTraceLogs(prev => [...prev, step]);
      await new Promise(r => setTimeout(r, 600));
    }
    setIsTracing(false);
    setHasTraced(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }} 
         onClick={onClose} 
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
       />
       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 20 }} 
         animate={{ scale: 1, opacity: 1, y: 0 }} 
         exit={{ scale: 0.95, opacity: 0, y: 20 }} 
         className="relative bg-white border border-slate-200 p-6 shadow-2xl w-full max-w-3xl z-10 flex flex-col gap-6 rounded-xl"
       >
         <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#FF6600]" />
              <span className="font-sans font-black text-slate-900 text-lg tracking-tight uppercase">SIGNAL_SNAPSHOT</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-all">
              <X className="w-6 h-6" />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <div className="text-[8px] font-mono text-slate-400 tracking-widest mb-1 uppercase font-bold">INTERCEPT_ID</div>
                <div className="font-mono text-slate-900 text-sm tracking-widest font-bold">{data.id}</div>
              </div>
              
              <div className="bg-slate-50 border border-slate-100 p-4 flex-grow rounded-lg">
                <div className="text-[8px] font-mono text-slate-400 tracking-widest mb-2 uppercase font-bold">USER_MESSAGE</div>
                <div className="flex gap-2 mb-3">
                  <span className="text-[8px] bg-white border border-slate-200 px-2 py-1 font-mono text-slate-600 font-bold rounded-sm">{data.src}</span>
                  <span className="text-[8px] bg-[#FF6600]/10 border border-[#FF6600]/30 px-2 py-1 font-mono text-[#FF6600] font-bold rounded-sm">{data.lang}</span>
                </div>
                <p className="font-sans text-slate-700 text-sm leading-relaxed border-l-4 border-[#FF6600] pl-3">
                  "{data.text}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 relative overflow-hidden rounded-lg min-h-[160px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF6600] opacity-[0.05] rounded-bl-full"></div>
                <div className="text-[8px] font-mono text-slate-500 tracking-widest mb-3 uppercase font-bold">
                  {isTracing ? "SOURCE_TRACE_IN_PROGRESS" : "AI_ANALYSIS"}
                </div>
                
                {isTracing || hasTraced ? (
                  <div className="space-y-1.5 font-mono text-[9px] text-[#FF6600]">
                    {traceLogs.map((log, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-slate-600">&gt;</span> {log}
                      </div>
                    ))}
                    {hasTraced && (
                      <div className="mt-4 p-2 bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] flex items-center gap-2 rounded">
                        <CheckCircle2 className="w-3 h-3" /> TRACE COMPLETE: AUTHENTIC NODE VERIFIED
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="font-mono text-[9px] text-slate-400">ANALYSIS_MODEL</span>
                      <span className="font-mono text-[10px] text-white bg-slate-800 px-1 rounded-sm">{data.model}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="font-mono text-[9px] text-slate-400">AUTHENTICITY</span>
                      <span className="font-mono text-[10px] text-[#2E7D32] font-black">{(data.prob * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="font-mono text-[9px] text-slate-400">SENTIMENT_SCORE</span>
                      <span className={`font-mono text-[10px] font-black ${data.sent < 0 ? 'text-[#D32F2F]' : 'text-[#2E7D32]'}`}>{data.sent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-slate-400">REGION</span>
                      <span className="font-mono text-[10px] text-white flex items-center gap-1 font-bold">
                        <Globe className="w-3 h-3 text-[#FF6600]" /> {data.geo}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={handleFlagError}
                  disabled={isFlagging || hasFlagged}
                  className={`flex-1 border font-mono text-[9px] py-2.5 tracking-widest transition-all rounded-md font-bold flex items-center justify-center gap-2 ${
                    hasFlagged 
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32]' 
                    : 'bg-[#D32F2F]/5 border-[#D32F2F]/30 text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white'
                  }`}
                >
                  {isFlagging ? <Loader2 className="w-3 h-3 animate-spin" /> : hasFlagged ? <CheckCircle2 className="w-3 h-3" /> : null}
                  {isFlagging ? 'FLAGGING...' : hasFlagged ? 'REPORT SENT' : 'FLAG_ERROR'}
                </button>
                <button 
                  onClick={handleTraceSource}
                  disabled={isTracing || hasTraced}
                  className={`flex-1 border font-mono text-[9px] py-2.5 tracking-widest transition-all rounded-md font-bold flex items-center justify-center gap-2 ${
                    hasTraced
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-[#FF6600]/5 border-[#FF6600]/30 text-[#FF6600] hover:bg-[#FF6600] hover:text-white'
                  }`}
                >
                  {isTracing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {isTracing ? 'TRACING...' : hasTraced ? 'SOURCE_TRACED' : 'TRACE_SOURCE'}
                </button>
              </div>
            </div>
         </div>
       </motion.div>
    </div>
  );
}


// ==========================================
// --- VIEWS ---
// ==========================================

function DeepScrollLanding({ onEnter, onViewGuide }) {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="bg-white min-h-screen relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,102,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,102,0,0.02)_1px,transparent_1px)] bg-[size:4vw_4vw] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 lg:p-16 z-10">
        <div className="absolute top-8 left-8 flex gap-2 items-center border border-[#D32F2F]/20 bg-[#D32F2F]/5 px-3 py-1 rounded-sm">
          <div className="w-2 h-2 bg-[#D32F2F] animate-pulse"></div>
          <span className="text-[9px] font-mono text-[#D32F2F] tracking-[0.2em] uppercase font-bold">REC // HIGH CLEARANCE</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl text-center flex flex-col items-center relative z-10">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">
            PREDICT. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#E65C00] drop-shadow-sm">NEVER REACT.</span>
          </h1>
          
          <p className="text-sm md:text-lg text-slate-500 font-mono tracking-tight leading-relaxed mb-12 max-w-3xl border-l-4 border-[#FF6600] pl-6 text-left bg-slate-50 p-6 rounded-r-lg">
            <span className="text-slate-900 font-black uppercase text-xs block mb-2 tracking-widest">The Intelligence Gap:</span> Opinion scales to 1M impressions in 47 minutes. Campaign response takes 6-8 days.<br/><br/>
            <strong className="text-[#FF6600]">POLARIS</strong> is the decision intelligence layer bridging the gap. We ingest 1.4 billion multilingual voices to predict crises before the narrative window closes.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,102,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onEnter}
              className="group relative px-10 py-5 bg-[#FF6600] text-white font-mono tracking-[0.3em] text-sm font-black uppercase overflow-hidden rounded-md shadow-lg transition-colors"
            >
              <span className="relative z-10 flex items-center gap-3">
                [ OPEN COMMAND CENTER ] <Terminal className="w-5 h-5" />
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewGuide}
              className="group relative px-10 py-5 bg-transparent border-2 border-slate-200 text-slate-500 hover:text-[#FF6600] hover:border-[#FF6600]/40 font-mono tracking-[0.3em] text-sm font-black uppercase transition-all rounded-md"
            >
              <span className="relative z-10 flex items-center gap-3">
                [ READ USER MANUAL ] <Search className="w-5 h-5" />
              </span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div style={{ y: yBg }} className="absolute right-[-10%] top-[10%] opacity-[0.07] pointer-events-none hidden lg:block scale-150">
          <svg width="400" height="400" viewBox="0 0 100 100">
             <path d={indiaSVGPath} fill="none" stroke="#FF6600" strokeWidth="0.5" strokeDasharray="1 1" />
             {mapEdges.map((edge, i) => {
               const n1 = mapNodes.find(n => n.id === edge.from);
               const n2 = mapNodes.find(n => n.id === edge.to);
               if (!n1 || !n2) return null;
               return <line key={`hero-edge-${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#FF6600" strokeWidth="0.3" opacity={edge.weight} />;
             })}
          </svg>
        </motion.div>
      </section>

      {/* Sections with White/Light Gray alternates */}
      <section className="relative py-32 px-6 lg:px-16 z-10 border-t border-slate-100 bg-[#FBFBFB]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex items-end gap-4 border-b border-slate-200 pb-6">
            <span className="text-7xl font-black text-slate-200 font-mono leading-none">01</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">The Crisis Gap</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProblemCard 
              icon={<TrendingUp className="w-8 h-8 text-[#D32F2F]" />}
              title="Too Slow to React" 
              stat="47 MINS vs 6-8 DAYS"
              desc="Social media trends hit millions in under an hour. Traditional campaign teams take days to respond. By then, the damage is done."
            />
            <ProblemCard 
              icon={<Globe className="w-8 h-8 text-[#FFA000]" />}
              title="Language Blind Spot" 
              stat="22 LANGUAGES | 780 DIALECTS"
              desc="80% of voters use regional dialects. Most tools only track English, missing the real issues in rural and small-town areas."
            />
            <ProblemCard 
              icon={<Database className="w-8 h-8 text-[#FF6600]" />}
              title="Hidden Issues" 
              stat="LOCAL vs NATIONAL"
              desc="National averages look good, but local booth-level issues can lose an election. We find the small fires before they spread."
            />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex items-end gap-4 border-b border-slate-200 pb-6">
            <span className="text-7xl font-black text-slate-200 font-mono leading-none">02</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">How It Works</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch relative">
            <div className="hidden lg:block absolute top-[40%] left-0 w-full h-px bg-slate-200 -translate-y-1/2 z-0"></div>
            
            <PipelineNode num="I" icon={<Database className="w-6 h-6" />} title="Collect Data" tech="Web Firehose" desc="Scans social media and news in 22 languages." />
            <PipelineNode num="II" icon={<Activity className="w-6 h-6" />} title="AI Translation" tech="LaBSE Model" desc="Translates local dialects into technical sentiment." />
            <PipelineNode num="III" icon={<Terminal className="w-6 h-6" />} title="Pattern Find" tech="Spatial Mapping" desc="Identifies exactly where a crisis is starting." />
            <PipelineNode num="IV" icon={<Zap className="w-6 h-6" />} title="Simulate" tech="AI Testing" desc="Tests your response before you go public." />
            <PipelineNode num="V" icon={<AlertCircle className="w-6 h-6 text-[#2E7D32]" />} title="Decision" tech="Final Approval" desc="Approves responses with the highest success rate." highlight />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
            <div className="mb-20 flex items-end gap-4 border-b border-slate-200 pb-6">
            <span className="text-7xl font-black text-slate-200 font-mono leading-none">03</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">Standard Workflow</h2>
          </div>

          <div className="space-y-6">
            <WorkflowStep num="STEP 01" action="IDENTIFY" detail="The radar scans for local areas where sentiment is dropping. A 'Crisis Node' appears if a local issue is found." icon={<Eye className="text-[#FF6600] w-8 h-8"/>} />
            <WorkflowStep num="STEP 02" action="ANALYZE" detail="System translates local dialects to find out exactly what people are complaining about (e.g., fuel prices or road conditions)." icon={<Search className="text-[#FFA000] w-8 h-8"/>} />
            <WorkflowStep num="STEP 03" action="TEST" detail="The operator types a draft response. Our AI runs thousands of simulations to see if the response will calm the situation." icon={<Terminal className="text-[#FF6600] w-8 h-8"/>} />
            <WorkflowStep num="STEP 04" action="DEPLOY" detail="If the test shows a high success rate and low risk of backfiring, the response is approved and sent to local news/social feeds." icon={<Zap className="text-[#2E7D32] w-8 h-8"/>} />
          </div>
          
          <div className="mt-16 flex justify-center">
            <button onClick={onViewGuide} className="px-8 py-4 border border-slate-300 text-slate-600 font-mono text-xs tracking-[0.2em] uppercase hover:bg-slate-100 transition-colors flex items-center gap-3 rounded-md">
              <Search className="w-4 h-4" /> View Operator Guide
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 uppercase">Test the Simulator</h2>
            <p className="text-sm text-slate-400 font-mono tracking-widest max-w-2xl mx-auto">
              Use the sandbox below to try an intervention. Type a response and see how our AI predicts the outcome.
            </p>
          </div>
          
          <DemoSandbox />
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,102,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="mt-24 px-16 py-6 bg-[#FF6600] text-white font-mono tracking-[0.3em] text-sm font-black uppercase transition-colors rounded-md"
          >
            Enter Command Center
          </motion.button>
        </div>
      </section>
    </div>
  );
}

function DashboardView() {
  const [dataMode, setDataMode] = useState("live");
  const [liveFeed, setLiveFeed] = useState(() => 
    rawDataStreamPool.slice(0, 4).map(item => ({
      ...item,
      id: `${item.id}-${Math.random().toString(36).substr(2, 9)}`
    }))
  );
  const [selectedIntercept, setSelectedIntercept] = useState(null);

  const fetchNextItem = useCallback(() => {
    setLiveFeed(prev => {
      const nextItem = rawDataStreamPool[Math.floor(Math.random() * rawDataStreamPool.length)];
      const modifiedItem = { 
        ...nextItem, 
        id: `${nextItem.id}-${Math.random().toString(36).substr(2, 8).toUpperCase()}` 
      };
      const newFeed = [modifiedItem, ...prev];
      if (newFeed.length > 5) newFeed.pop(); 
      return newFeed;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNextItem, 4000);
    return () => clearInterval(interval);
  }, [fetchNextItem]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-[1800px] mx-auto w-full grid grid-cols-12 gap-6 relative z-10"
    >
      <AnimatePresence>
        {selectedIntercept && <InterceptSnapshotModal data={selectedIntercept} onClose={() => setSelectedIntercept(null)} />}
      </AnimatePresence>

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Overall Sentiment" value="-0.04" sub="TREND: -0.02 [1H]" type="danger" sparklineData={[0, 0.1, -0.05, -0.1, -0.04]} />
        <KpiCard title="Stability Index" value="0.28" sub="STATUS: UNSTABLE" type="warning" alert sparklineData={[0.4, 0.35, 0.32, 0.3, 0.28]} />
        <KpiCard title="Virality Speed" value="0.72" sub="HIGH SPEED BURST" type="danger" alert sparklineData={[0.3, 0.4, 0.5, 0.65, 0.72]} />
        <KpiCard title="AI Confidence" value="88%" sub="VALID DATA" type="safe" sparklineData={[80, 82, 85, 86, 88]} />
      </div>

      <div className="col-span-12 lg:col-span-8 h-[550px]">
        <TacticalRadarMap />
      </div>
      
      <div className="col-span-12 lg:col-span-4 h-[550px]">
        <GlassPanel title="Incoming Signals" icon={<Database className="w-4 h-4 text-slate-400" />} rightAction={<span className="text-[8px] text-[#2E7D32] font-bold animate-pulse uppercase">LIVE STREAM ACTIVE</span>}>
          <div className="space-y-3 h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col justify-end">
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <AnimatePresence initial={false}>
              {liveFeed.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10, scale: 0.98 }} 
                  animate={{ opacity: 1, x: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={item.id} 
                  onClick={() => setSelectedIntercept(item)}
                  className="p-3 border-l-4 border border-slate-100 bg-slate-50 relative overflow-hidden cursor-pointer hover:border-[#FF6600]/30 hover:bg-white group rounded-md shadow-sm"
                  style={{ borderLeftColor: item.sent < 0 ? '#D32F2F' : '#2E7D32' }}
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[7px] font-mono text-[#FF6600] font-bold">VIEW</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-200/50 pr-12">
                    <div className="flex gap-2 items-center">
                       <span className="text-[8px] font-mono font-bold uppercase bg-slate-200 text-slate-700 px-1 rounded-sm">{item.lang}</span>
                       <span className="text-[7px] font-mono uppercase text-slate-400 font-bold">{item.src}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[8px] font-black font-mono ${item.sent < 0 ? 'text-[#D32F2F]' : 'text-[#2E7D32]'}`}>
                        S:{item.sent}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 font-sans tracking-tight leading-relaxed line-clamp-2">{item.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassPanel>
      </div>

      <div className="col-span-12 lg:col-span-6 h-[450px]">
        <GlassPanel title="State Trend Graph" icon={<Activity className="w-4 h-4 text-[#FF6600]" />}
          action={
            <div className="flex bg-slate-100 border border-slate-200 rounded-md p-1 overflow-hidden">
              <button onClick={()=>setDataMode("live")} className={`px-4 py-1.5 text-[9px] font-mono transition-all rounded-sm ${dataMode==='live' ? 'bg-white text-[#FF6600] font-black shadow-sm' : 'text-slate-500'}`}>LIVE_TREND</button>
              <button onClick={()=>setDataMode("sim")} className={`px-4 py-1.5 text-[9px] font-mono transition-all rounded-sm ${dataMode==='sim' ? 'bg-white text-[#2E7D32] font-black shadow-sm' : 'text-slate-500'}`}>SIM_MODE</button>
            </div>
          }
        >
          <div className="w-full h-full pt-4 pb-6 pr-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataMode === 'live' ? trendData : simulatedTrendData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dataMode==='live' ? "#FF6600" : "#2E7D32"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={dataMode==='live' ? "#FF6600" : "#2E7D32"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={[-0.6, 0.4]} tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                <Area type="monotone" dataKey="sentiment" stroke={dataMode==='live' ? "#FF6600" : "#2E7D32"} strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                <ReferenceLine x="NOW" stroke="#FFA000" strokeDasharray="5 5" label={{ position: 'top', value: 'CURRENT', fill: '#FFA000', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <div className="col-span-12 lg:col-span-3 h-[450px]">
        <TerminalSimulator />
      </div>

      <div className="col-span-12 lg:col-span-3 h-[450px] grid grid-rows-2 gap-4">
        <GlassPanel title="AI Strategic Decision" icon={<Terminal className="w-4 h-4 text-[#2E7D32]" />} className="border-[#2E7D32]/20">
          <div className="flex flex-col h-full justify-center space-y-3">
            <div className="flex gap-3 items-start bg-slate-50 border border-[#D32F2F]/10 p-3 relative rounded-lg">
              <div className="absolute left-0 top-0 w-1.5 h-full bg-[#D32F2F] rounded-l-lg"></div>
              <AlertCircle className="w-4 h-4 text-[#D32F2F] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[9px] font-black font-sans text-[#D32F2F] uppercase tracking-tight mb-1">AVOID: HIGH RISK</h4>
                <p className="text-[9px] font-mono text-slate-500 leading-relaxed">Local issues in Maharashtra are sensitive. Standard slogans will backfire.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-slate-50 border border-[#2E7D32]/10 p-3 relative rounded-lg">
               <div className="absolute left-0 top-0 w-1.5 h-full bg-[#2E7D32] rounded-l-lg"></div>
              <Zap className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[9px] font-black font-sans text-[#2E7D32] uppercase tracking-tight mb-1">APPROVE: HIGH SUCCESS</h4>
                <p className="text-[9px] font-mono text-slate-500 leading-relaxed">Infrastructure updates are trending positively. Safe to deploy.</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title="Latest Alert Log" icon={<Activity className="w-4 h-4 text-slate-400" />}>
          <div className="space-y-2 overflow-y-auto h-full custom-scrollbar pr-2">
            {alertsData.map((alert) => (
              <div key={`alert-log-${alert.id}`} className={`p-3 border-l-4 rounded-md ${alert.border} bg-slate-50`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[8px] font-black font-mono tracking-widest uppercase ${alert.color}`}>{alert.type}</span>
                  <span className="text-[8px] font-mono text-slate-400">{alert.time}</span>
                </div>
                <p className="text-[9px] text-slate-600 font-sans leading-relaxed line-clamp-2">{alert.msg}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </motion.div>
  );
}

function UserGuideView({ onEnter }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="p-4 md:p-8 max-w-[1400px] mx-auto w-full z-10 relative"
    >
      <div className="mb-10 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-[#FF6600] rounded-lg shadow-lg shadow-[#FF6600]/20">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">OPERATOR MANUAL</h1>
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-widest uppercase font-bold">SYSTEM DOCUMENTATION // POLARIS v2.4</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <GuideSection title="01. Understanding KPIs" icon={<Activity className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4">
            The dashboard tracks how the nation feels using four simple scores:
          </p>
          <ul className="space-y-4">
            <GuideListItem label="Sentiment" desc="Aggregated mood from -1 (Negative) to +1 (Positive). If this drops, look for a crisis node." color="text-[#FF6600]" />
            <GuideListItem label="Stability Index" desc="Measures local peace. Below 0.3 means a region is becoming volatile." color="text-[#FFA000]" />
            <GuideListItem label="Virality Speed" desc="How fast news is spreading. Above 0.65 means the news will go viral nationwide in under an hour." color="text-[#D32F2F]" />
            <GuideListItem label="Confidence" desc="AI's certainty about the data. Higher is better." color="text-[#2E7D32]" />
          </ul>
        </GuideSection>

        <GuideSection title="02. The Radar Map" icon={<Globe className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4">
            The radar map shows you exactly where issues are starting geographically.
          </p>
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] shadow-sm"></div>
                <span className="text-[10px] font-mono text-slate-900 font-black">CRISIS NODE (RED)</span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 pl-5">A major local problem found. Click the node to see what people are saying.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6600] shadow-sm"></div>
                <span className="text-[10px] font-mono text-slate-900 font-black">DRIFT NODE (ORANGE)</span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 pl-5">People's opinions are starting to shift. Monitor this area for potential trouble.</p>
            </div>
          </div>
        </GuideSection>

        <GuideSection title="03. How to Simulate" icon={<Terminal className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4">
            Use the simulator to "test drive" a response before you release it.
          </p>
          <div className="space-y-2 border-l-2 border-slate-100 pl-4 py-1">
             <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest mb-1">Process:</p>
             <ol className="list-decimal list-inside space-y-2 text-[10px] font-mono text-slate-400 marker:text-[#FF6600] marker:font-bold">
               <li>Select the <span className="text-slate-700 font-bold">Location</span> on the map.</li>
               <li>Draft your <span className="text-slate-700 font-bold">Response</span> in the text box.</li>
               <li>Run the simulator.</li>
               <li>The AI will predict the mood shift for the next 6 hours.</li>
             </ol>
          </div>
        </GuideSection>

        <GuideSection title="04. Real-time Ingestion" icon={<Database className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4">
            We scan social media, news, and chat apps in 22 languages to find real voter opinions.
          </p>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black text-slate-900 uppercase block mb-1">Inspect Signals</span>
              <p className="text-[10px] font-mono text-slate-500">Click any message in the feed to see its full analysis, including where it's from and if it's likely written by a real person or a bot.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                <span className="text-[8px] font-black text-[#FF6600] uppercase block">Authenticity</span>
                <span className="text-[8px] font-mono text-slate-400">Probability that the message is from a real voter.</span>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-100 rounded">
                <span className="text-[8px] font-black text-[#2E7D32] uppercase block">Valence</span>
                <span className="text-[8px] font-mono text-slate-400">The underlying mood (Positive or Negative).</span>
              </div>
            </div>
          </div>
        </GuideSection>

        <GuideSection title="05. Smart Decisions" icon={<Shield className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4">
            The AI analyzes your simulation results to give a final recommendation.
          </p>
          <ul className="space-y-3">
            <GuideListItem label="AVOID (RED)" desc="The AI predicts the message will fail or cause backlash. Do not release." color="text-[#D32F2F]" />
            <GuideListItem label="PIVOT (GREEN)" desc="The AI predicts a positive shift. Release the message immediately." color="text-[#2E7D32]" />
            <GuideListItem label="STALL (YELLOW)" desc="The AI needs more data before it can recommend an action." color="text-[#FFA000]" />
          </ul>
        </GuideSection>

        <GuideSection title="06. Standard Steps" icon={<Layers className="text-[#FF6600]" />}>
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed mb-4 uppercase font-bold tracking-widest">Operator SOP:</p>
          <div className="space-y-3 relative">
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-black shrink-0">1</div>
              <div>
                <span className="text-[10px] font-black text-slate-900 uppercase">Find Crisis</span>
                <p className="text-[9px] font-mono text-slate-400">Look for Red Nodes on the map to find a local problem area.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-black shrink-0">2</div>
              <div>
                <span className="text-[10px] font-black text-slate-900 uppercase">Check Details</span>
                <p className="text-[9px] font-mono text-slate-400">Click the node to see exactly why people are angry or worried.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-black shrink-0">3</div>
              <div>
                <span className="text-[10px] font-black text-slate-900 uppercase">Test Draft</span>
                <p className="text-[9px] font-mono text-slate-400">Type a response in the Simulator to check if it will fix the issue.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-black shrink-0">4</div>
              <div>
                <span className="text-[10px] font-black text-slate-900 uppercase">Send Response</span>
                <p className="text-[9px] font-mono text-slate-400">If the AI approves, authorize the message for broad release.</p>
              </div>
            </div>
            <div className="absolute top-2 left-3 bottom-2 w-px bg-slate-200 z-0"></div>
          </div>
        </GuideSection>
      </div>

      <div className="mt-16 flex justify-center">
        <button onClick={onEnter} className="px-12 py-4 bg-[#FF6600] text-white font-mono tracking-[0.3em] text-xs font-black uppercase hover:bg-[#E65C00] transition-all rounded-md shadow-lg shadow-[#FF6600]/20">
          [ BACK TO DASHBOARD ]
        </button>
      </div>
    </motion.div>
  );
}

function ProblemCard({ title, desc, icon, stat }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white border border-slate-200 p-8 relative overflow-hidden group hover:border-[#FF6600]/30 transition-all flex flex-col rounded-xl shadow-sm">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 group-hover:bg-[#FF6600] transition-colors"></div>
      <div className="mb-6 flex justify-between items-start">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 group-hover:bg-[#FF6600]/5 group-hover:border-[#FF6600]/20 transition-all">{icon}</div>
        <div className="text-[9px] font-mono text-[#FF6600] font-black border border-[#FF6600]/20 px-2.5 py-1.5 bg-[#FF6600]/5 rounded-md">{stat}</div>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase font-sans leading-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-xs font-mono">{desc}</p>
    </motion.div>
  );
}

function PipelineNode({ num, icon, title, tech, desc, highlight }) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`z-10 bg-white border ${highlight ? 'border-[#2E7D32] shadow-lg shadow-[#2E7D32]/10' : 'border-slate-200'} p-6 w-full lg:w-[220px] flex flex-col relative flex-grow min-h-[220px] rounded-xl`}>
      <span className="absolute top-3 right-4 text-[12px] font-mono text-slate-300 font-black">{num}</span>
      <div className={`mb-6 p-3 inline-block bg-slate-50 border border-slate-100 rounded-lg w-fit ${highlight ? 'text-[#2E7D32] bg-[#2E7D32]/5' : 'text-[#FF6600]'}`}>
        {icon}
      </div>
      <h4 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">{title}</h4>
      <div className={`text-[8px] font-mono font-bold tracking-widest mb-3 border-b pb-2 ${highlight ? 'text-[#2E7D32] border-[#2E7D32]/20' : 'text-[#FF6600] border-[#FF6600]/20'}`}>{tech}</div>
      <p className="text-[10px] text-slate-500 font-mono tracking-wide leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function WorkflowStep({ num, action, detail, icon }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start bg-white border border-slate-200 p-8 hover:border-[#FF6600]/40 transition-all group relative overflow-hidden rounded-xl">
      <div className="flex-shrink-0 flex flex-col items-center md:w-32 border-r border-slate-100 pr-6">
        <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-300 mb-4">{num}</div>
        <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg group-hover:border-[#FF6600]/30 group-hover:bg-[#FF6600]/5 transition-all">{icon}</div>
      </div>
      <div className="flex-col justify-center pt-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 uppercase group-hover:text-[#FF6600] transition-colors">{action}</h3>
        <p className="text-sm font-mono text-slate-500 tracking-tight leading-relaxed max-w-3xl">{detail}</p>
      </div>
    </motion.div>
  );
}

function DemoSandbox() {
  const [demoState, setDemoState] = useState("idle"); 

  return (
    <div className="w-full bg-white border border-slate-200 shadow-2xl flex flex-col md:flex-row text-left relative overflow-hidden rounded-xl text-slate-900">
      <div className="w-full md:w-1/2 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 relative z-10 bg-white">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#FF6600]" />
            <h3 className="font-mono text-xs font-black tracking-widest text-slate-900 uppercase">Input Dashboard</h3>
          </div>
          <span className="text-[8px] font-mono text-slate-400 border border-slate-200 px-2 py-1 rounded-sm">AUTH: READY</span>
        </div>
        
        <label className="text-[9px] font-mono text-slate-400 font-black tracking-widest uppercase mb-2 block">Proposed Response</label>
        <textarea 
          disabled={demoState !== 'idle'}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-mono text-sm focus:outline-none focus:border-[#FF6600] resize-none mb-8 p-4 rounded-lg shadow-inner"
          rows={4}
          defaultValue="Drafting a local response to explain the new agrarian budget changes. Will it work?"
        />
        
        <button 
          onClick={() => {
            setDemoState("computing");
            setTimeout(() => setDemoState("crisis"), 2000);
            setTimeout(() => setDemoState("idle"), 8000);
          }}
          disabled={demoState !== 'idle'}
          className={`w-full py-4 font-mono text-xs tracking-[0.4em] font-black rounded-lg transition-all uppercase border-2 ${demoState === 'idle' ? 'border-[#FF6600] text-white bg-[#FF6600] hover:bg-[#E65C00]' : 'border-slate-200 text-slate-400 bg-slate-100'}`}
        >
          {demoState === 'idle' ? '[ TEST MY RESPONSE ]' : 'AI IS ANALYZING...'}
        </button>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-10 relative z-10 flex flex-col justify-center bg-slate-50">
        <AnimatePresence mode="wait">
          {demoState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-slate-300 text-sm tracking-[0.2em] text-center w-full py-20 border-2 border-slate-200 border-dashed rounded-xl">
              [ AWAITING_TEST_DRAFT ]
            </motion.div>
          )}

          {demoState === 'computing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full py-20">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-[#FF6600] rounded-full animate-spin mb-6"></div>
              <div className="font-mono text-[9px] text-slate-400 tracking-[0.4em] uppercase font-bold animate-pulse">Running AI Simulations...</div>
            </motion.div>
          )}

          {demoState === 'crisis' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-white border border-[#D32F2F]/20 p-8 relative shadow-xl rounded-xl">
              <div className="flex items-center gap-4 mb-8">
                <AlertCircle className="w-10 h-10 text-[#D32F2F] animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black text-[#D32F2F] tracking-tight font-sans uppercase leading-none">TEST FAILED</h2>
                  <div className="text-[9px] font-mono text-[#D32F2F]/70 tracking-[0.2em] mt-2 font-bold uppercase">HIGH BACKLASH RISK</div>
                </div>
              </div>
              
              <div className="space-y-5 font-mono text-[10px]">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400 uppercase">Predicted Mood Change</span>
                  <span className="text-[#D32F2F] font-black">-72% (DROPPING)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400 uppercase">Attention Duration</span>
                  <span className="text-slate-900 font-black">LONG (STAYING ACTIVE)</span>
                </div>
                <div className="mt-8 bg-slate-900 p-5 rounded-lg border-l-4 border-[#D32F2F] text-slate-300 text-[10px] leading-relaxed">
                  <span className="text-[#D32F2F] font-black block mb-2 text-xs uppercase tracking-widest">AI RECOMMENDATION:</span> 
                  Do not release this draft. People in the agrarian sectors find this response insensitive. Redraft focusing on direct subsidies.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GuideSection({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-200 p-8 relative group hover:border-[#FF6600]/30 transition-all rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-3">
        {icon}
        <h2 className="text-sm font-black font-sans text-slate-900 tracking-tight uppercase">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function GuideListItem({ label, desc, color }) {
  return (
    <li className="flex flex-col mb-4">
      <span className={`text-[10px] font-black font-mono uppercase tracking-widest mb-1 ${color}`}>{label}</span>
      <span className="text-[11px] font-mono text-slate-500 leading-relaxed">{desc}</span>
    </li>
  );
}
