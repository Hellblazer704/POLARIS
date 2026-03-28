import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, LineChart, Line } from "recharts";
import { Activity, AlertCircle, Database, Eye, Globe, Search, Terminal, TrendingUp, X, Zap } from "lucide-react";

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
  { id: 1, time: "14:32:11", type: "CRISIS", msg: "Wardha (MH) - Sentiment trajectory <-0.08/hr. Gaussian Kernel detects critical booth-level collapse.", color: "text-[#FF003C]", border: "border-[#FF003C]/50", bg: "bg-[#FF003C]/10" },
  { id: 2, time: "14:30:02", type: "VIRAL", msg: "Fuel Prices - Virality threshold V(t) > 0.65. Opinion scaling to 1M impressions (Est. 47m).", color: "text-[#FF9900]", border: "border-[#FF9900]/50", bg: "bg-[#FF9900]/10" },
  { id: 3, time: "14:15:44", type: "DRIFT", msg: "Nashik - Unplanned narrative shift detected in semi-urban demographic clusters.", color: "text-[#FFCC00]", border: "border-[#FFCC00]/50", bg: "bg-[#FFCC00]/10" },
  { id: 4, time: "13:45:10", type: "STABLE", msg: "Pune - Infrastructure narrative holding positive +0.12/hr. Attention-GRU stable.", color: "text-[#00FF66]", border: "border-[#00FF66]/50", bg: "bg-[#00FF66]/10" },
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
    const timeout = setTimeout(() => setBooted(true), 2000); 
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!booted) return <BootSequence />;

  return (
    <div className="min-h-screen bg-[#000000] text-[#00F0FF] font-sans selection:bg-[#00F0FF]/30 overflow-x-hidden flex flex-col relative">
      <AnimatePresence>
        {currentView !== "landing" && (
          <motion.nav 
            initial={{ y: -100 }} animate={{ y: 0 }}
            className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-xl border-b border-[#00F0FF]/20 px-4 py-2 flex justify-between items-center shadow-[0_0_30px_rgba(0,240,255,0.05)]"
          >
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView("landing")}>
              <div className="relative h-10 w-10 flex items-center justify-center border border-[#00F0FF]/30 rounded-sm bg-black group-hover:border-[#00F0FF] transition-all">
                <Globe className="text-[#00F0FF] w-5 h-5" />
                <div className="absolute inset-0 border border-[#00F0FF] animate-ping opacity-10"></div>
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-black text-white tracking-[0.4em] uppercase leading-none">POLARIS</span>
                <span className="block text-[8px] text-[#00F0FF]/60 tracking-[0.3em] uppercase mt-1 font-mono">Decision Intel</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 px-6 border-l border-r border-[#00F0FF]/20">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between w-24 text-[7px] font-mono text-gray-500 tracking-widest"><span>CPU</span><span>78%</span></div>
                <div className="h-1 w-24 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-[#00F0FF] w-[78%]"></div></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between w-24 text-[7px] font-mono text-gray-500 tracking-widest"><span>MEM</span><span>32TB</span></div>
                <div className="h-1 w-24 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-[#FF9900] w-[64%]"></div></div>
              </div>
              <div className="text-[8px] font-mono text-[#00FF66] tracking-widest flex items-center gap-1">
                <Activity className="w-3 h-3" /> LATENCY: 12ms
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <NavButton active={currentView === "dashboard"} onClick={() => setCurrentView("dashboard")} icon={<Activity className="w-4 h-4" />}>COMMAND_CENTER</NavButton>
              <NavButton active={currentView === "guide"} onClick={() => setCurrentView("guide")} icon={<Search className="w-4 h-4" />}>MANUAL</NavButton>
              <div className="hidden md:flex font-mono text-[10px] tracking-[0.2em] text-white bg-[#00F0FF]/10 px-4 py-1.5 rounded-sm border border-[#00F0FF]/30 items-center gap-2">
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
      
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)] opacity-90 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-[101] opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
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
      "ESTABLISHING KERNEL CONNECTION [TCP/IP: 192.168.0.1]...",
      "LOADING ATTENTION-GRU ARCHITECTURE...",
      "INITIALIZING GEOPANDAS SPATIAL KRIGING...",
      "BYPASSING STATE AVERAGES...",
      "ACCESSING 1.4 BILLION MULTILINGUAL NODES...",
      "LaBSE EMBEDDINGS ACTIVE [22 LANGUAGES, 780 DIALECTS]...",
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
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#000] flex flex-col items-start justify-center p-12 font-mono text-[#00F0FF] text-sm tracking-widest z-[999] relative overflow-hidden">
      <div className="mb-10 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Zap className="w-12 h-12 text-[#00F0FF] animate-pulse" />
          <h1 className="text-5xl font-black text-white tracking-[0.5em]">POLARIS</h1>
        </div>
        <div className="h-px w-64 bg-gradient-to-r from-[#00F0FF] to-transparent"></div>
      </div>
      <div className="z-10 w-full max-w-3xl">
        {logs.map((log, idx) => (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={`bootlog-${idx}`} className="mb-2 flex items-center gap-3 text-xs md:text-sm">
            <span className="text-white/30">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span> <span className="text-[#00F0FF]">&gt;</span> {log}
          </motion.div>
        ))}
        <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="mt-4 w-4 h-6 bg-[#00F0FF]"></motion.div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
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
      className={`px-4 py-1.5 text-[8px] font-bold tracking-[0.3em] flex items-center gap-2 transition-all font-mono uppercase rounded-sm ${
        active 
          ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/50 shadow-[inset_0_0_15px_rgba(0,240,255,0.2)]" 
          : "text-gray-500 hover:text-white border border-transparent"
      }`}
    >
      {icon} <span>{children}</span>
    </button>
  );
}

function KpiCard({ title, value, sub, type, alert, sparklineData }) {
  const colorMap = {
    danger: "text-[#FF003C] border-[#FF003C]/30 bg-[#FF003C]/5",
    warning: "text-[#FFCC00] border-[#FFCC00]/30 bg-[#FFCC00]/5",
    safe: "text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/5"
  };
  const glow = colorMap[type] || colorMap.safe;
  const strokeColor = type === 'danger' ? '#FF003C' : type === 'warning' ? '#FFCC00' : '#00F0FF';

  const data = sparklineData ? sparklineData.map((val, i) => ({ v: val, i })) : [];

  return (
    <div className={`p-5 border bg-black relative overflow-hidden flex flex-col justify-between group ${glow}`}>
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${glow.split(' ')[2].replace('border-', 'border-')}`}></div>
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${glow.split(' ')[2].replace('border-', 'border-')}`}></div>

      {alert && <div className={`absolute top-0 left-0 w-full h-0.5 ${glow.split(' ')[0].replace('text-', 'bg-')} animate-pulse opacity-80`}></div>}
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <h3 className="text-[8px] font-mono font-bold text-gray-500 tracking-[0.3em] uppercase">{title}</h3>
      </div>

      <div className="relative z-10 flex justify-between items-end">
        <div>
          <div className={`text-3xl lg:text-4xl font-black tracking-widest font-mono mb-1 text-white`}>{value}</div>
          <div className={`text-[7px] font-mono tracking-widest uppercase ${glow.split(' ')[0]}`}>{sub}</div>
        </div>
        
        {data.length > 0 && (
          <div className="w-16 h-8 opacity-50 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
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
    <div className={`flex flex-col h-full bg-[#020202] border border-white/10 relative overflow-hidden ${className}`}>
      <div className="bg-[#050505] border-b border-white/10 px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-[8px] font-bold font-mono text-white/70 uppercase tracking-[0.4em]">{title}</h2>
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
      <div className={`bg-[#000] border p-3 shadow-2xl ${isSim ? 'border-[#00FF66]/50 shadow-[0_0_20px_rgba(0,255,102,0.15)]' : 'border-[#00F0FF]/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]'}`}>
        <p className={`text-[9px] font-mono mb-2 border-b pb-1 ${isSim ? 'text-[#00FF66]/60 border-[#00FF66]/20' : 'text-[#00F0FF]/60 border-[#00F0FF]/20'}`}>T_VAL: {label}</p>
        <p className={`text-sm font-bold font-mono mb-1 ${isSim ? 'text-[#00FF66]' : 'text-[#00F0FF]'}`}>S_SCORE: {data.sentiment?.toFixed(2) || 'N/A'}</p>
        <p className="text-[8px] text-gray-500 font-mono">VaR BOUNDS: [{data.lower?.toFixed(2) || 'N/A'}, {data.upper?.toFixed(2) || 'N/A'}]</p>
        {isSim && <p className="text-[7px] bg-[#FFCC00]/20 text-[#FFCC00] px-1 py-0.5 inline-block mt-2 uppercase tracking-widest border border-[#FFCC00]/50">PROJECTION</p>}
      </div>
    );
  }
  return null;
}

function TacticalRadarMap() {
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <GlassPanel title="Spatial Kriging Radar Map" icon={<Globe className="w-4 h-4 text-[#00F0FF]" />} className="relative overflow-hidden p-0 border-[#00F0FF]/20" rightAction={<span className="text-[7px] font-mono text-[#00F0FF]/50 tracking-widest">RES: BOOTH_LEVEL</span>}>
      <div className="absolute inset-0 bg-[#020202]">
        

        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-[#00F0FF]/15 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-[#00F0FF]/25 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border border-[#00F0FF]/35 rounded-full"></div>
        
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#00F0FF]/20"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[#00F0FF]/20"></div>

        <motion.div 
          className="absolute top-1/2 left-1/2 w-[80%] h-[80%] origin-bottom-right bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(0,240,255,0.15)_360deg)] pointer-events-none rounded-full"
          style={{ marginTop: '-80%', marginLeft: '-80%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {mapNodes.map((node) => {
          const isCrisis = node.type === 'crisis';
          const nodeColor = isCrisis ? 'bg-[#FF003C]' : node.type === 'warning' ? 'bg-[#FFCC00]' : node.type === 'drift' ? 'bg-[#00F0FF]' : 'bg-[#00FF66]';
          const shadowColor = isCrisis ? 'shadow-[0_0_20px_rgba(255,0,60,1)]' : 'shadow-[0_0_10px_rgba(0,255,102,0.5)]';

          return (
            <div 
              key={`node-${node.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-20 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {isCrisis && <div className={`absolute inset-0 rounded-full ${nodeColor} animate-ping opacity-80`}></div>}
              <div className={`w-2.5 h-2.5 rounded-full ${nodeColor} ${shadowColor} border border-black relative z-10 transition-transform group-hover:scale-150`}></div>
              
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="w-px h-2 bg-white/30 mb-0.5"></div>
                <div className="text-[7px] font-mono tracking-widest text-white bg-black/90 px-1 border border-white/20 whitespace-nowrap shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                  {node.name.toUpperCase()}
                </div>
              </div>
            </div>
          );
        })}

        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute bottom-6 left-6 z-30 p-4 bg-[#020202]/95 border border-[#00F0FF]/40 min-w-[220px] pointer-events-none shadow-[0_0_40px_rgba(0,240,255,0.15)]"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00F0FF]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00F0FF]"></div>

              <div className="flex items-center justify-between mb-3 border-b border-[#00F0FF]/20 pb-2">
                <h3 className="text-[10px] font-bold font-mono text-white tracking-widest uppercase flex items-center gap-2">
                  <Zap className="w-3 h-3 text-[#00F0FF]" />
                  {hoveredNode.name}
                </h3>
                <span className={`text-[6px] px-1.5 py-0.5 uppercase font-bold tracking-widest border ${hoveredNode.type === 'crisis' ? 'text-[#FF003C] border-[#FF003C]' : 'text-[#00F0FF] border-[#00F0FF]'}`}>
                  {hoveredNode.type}
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[8px]">
                <div className="flex justify-between items-center bg-white/5 px-2 py-1">
                  <span className="text-gray-400">S_SCORE</span>
                  <span className={hoveredNode.sentiment < 0 ? "text-[#FF003C] font-bold text-[9px]" : "text-[#00FF66] font-bold text-[9px]"}>{hoveredNode.sentiment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1">
                  <span className="text-gray-400">VOLATILITY</span>
                  <span className={hoveredNode.volatility === 'Critical' ? 'text-[#FF003C] font-bold' : 'text-gray-300'}>{hoveredNode.volatility}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 px-2 py-1">
                  <span className="text-gray-400">VAR CONFIDENCE</span>
                  <span className="text-white font-bold">{hoveredNode.confidence}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute top-4 right-4 text-[7px] font-mono text-[#00F0FF]/40 text-right leading-loose tracking-[0.2em] border-r border-[#00F0FF]/30 pr-2">
          <div>GEO_REF: 28.6139N, 77.2090E</div>
          <div>MODEL: GAUSSIAN_KERNEL</div>
          <div>STS: LIVE_TRACKING</div>
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
      "> INITIATING MONTE CARLO ROLLOUT (T+6H)",
      "> INJECTING PAYLOAD U(t)",
      "> COMPUTING SPATIAL KRIGING BOUNDS...",
      "> SAMPLING M PATHS FROM P(Z|X)...",
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
    <GlassPanel title="Simulation Terminal" icon={<Terminal className="w-4 h-4 text-[#00F0FF]" />} className="border-[#00F0FF]/20">
      <div className="flex flex-col h-full relative p-1">
        <form onSubmit={runSimulation} className="space-y-4">
          <div>
            <label className="block text-[7px] font-mono text-[#00F0FF]/60 uppercase tracking-[0.3em] mb-1.5">TARGET_VECTOR_SPACE</label>
            <div className="relative border border-white/10 bg-black">
              <select disabled={status === 'loading'} className="w-full bg-transparent p-2.5 text-[9px] text-white focus:outline-none focus:border-[#00F0FF] appearance-none font-mono tracking-widest">
                <option>WARDHA_CRISIS_ZONE</option>
                <option>NASHIK_DRIFT_SECTOR</option>
                <option>GLOBAL_BROADCAST</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[7px] font-mono text-[#00F0FF]/60 uppercase tracking-[0.3em] mb-1.5">PAYLOAD_U(t)</label>
            <textarea 
              disabled={status === 'loading'}
              rows={2} 
              className="w-full bg-black border border-white/10 p-3 text-[9px] text-white focus:outline-none focus:border-[#00F0FF] resize-none font-mono custom-scrollbar leading-relaxed"
              defaultValue="Injecting immediate relief narrative. 24hr."
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-[#00F0FF]/5 border border-[#00F0FF]/30 text-[#00F0FF] py-3 text-[9px] font-bold tracking-[0.4em] uppercase transition-all hover:bg-[#00F0FF] hover:text-black hover:border-[#00F0FF] disabled:opacity-50 font-mono shadow-[0_0_15px_rgba(0,240,255,0.05)]"
          >
            {status === "loading" ? `COMPUTING [${progress}%]` : "[ EXECUTE SIMULATION ]"}
          </button>
        </form>

        <div className="mt-5 flex-grow bg-[#020202] border border-white/5 p-4 font-mono text-[8px] text-gray-500 overflow-y-auto relative tracking-widest leading-loose">
          {logs.length === 0 && status === "idle" && (
             <div className="h-full flex items-center justify-center opacity-30 animate-pulse">AWAITING_COMMAND_INPUT</div>
          )}

          {logs.map((log, i) => (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`sim-log-${i}`}>{log}</motion.div>
          ))}
          
          {status === "complete" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-[#00FF66] mb-1 bg-[#00FF66]/5 p-2">
                <span>EST_SHIFT:</span>
                <span className="font-bold text-[10px]">+0.15</span>
              </div>
              <div className="flex justify-between items-center text-white mb-2 bg-white/5 p-2">
                <span>P(SUCCESS):</span>
                <span className="font-bold text-[10px]">0.94</span>
              </div>
              <div className="text-black bg-[#00FF66] p-2 font-bold tracking-widest text-center mt-2">
                [ ACTION APPROVED ]
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

function InterceptSnapshotModal({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }} 
         onClick={onClose} 
         className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
       />
       <motion.div 
         initial={{ scale: 0.95, opacity: 0, y: 20 }} 
         animate={{ scale: 1, opacity: 1, y: 0 }} 
         exit={{ scale: 0.95, opacity: 0, y: 20 }} 
         className="relative bg-[#020202] border-2 border-[#00F0FF]/50 p-6 shadow-[0_0_50px_rgba(0,240,255,0.15)] w-full max-w-3xl z-10 flex flex-col gap-6"
       >
         <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00F0FF]"></div>
         <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00F0FF]"></div>

         <div className="flex justify-between items-center border-b border-[#00F0FF]/30 pb-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#00F0FF]" />
              <span className="font-mono font-bold text-[#00F0FF] text-lg tracking-[0.3em] uppercase">SIGNAL_SNAPSHOT</span>
            </div>
            <button onClick={onClose} className="text-[#00F0FF]/60 hover:text-white font-mono text-[10px] tracking-widest flex items-center gap-1 border border-transparent hover:border-white/30 px-2 py-1 transition-all">
              [ CLOSE ] <X className="w-3 h-3" />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 p-4">
                <div className="text-[8px] font-mono text-gray-500 tracking-widest mb-1 uppercase">RAW_INTERCEPT_ID</div>
                <div className="font-mono text-[#00F0FF] text-sm tracking-widest">{data.id}</div>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-4 flex-grow">
                <div className="text-[8px] font-mono text-gray-500 tracking-widest mb-2 uppercase">SOURCE_PAYLOAD</div>
                <div className="flex gap-2 mb-3">
                  <span className="text-[8px] bg-black border border-white/20 px-2 py-1 font-mono text-white">{data.src}</span>
                  <span className="text-[8px] bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-2 py-1 font-mono text-[#00F0FF]">{data.lang}</span>
                </div>
                <p className="font-mono text-gray-300 text-sm leading-relaxed border-l-2 border-[#00F0FF]/50 pl-3">
                  "{data.text}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-black border border-white/10 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#00F0FF] opacity-[0.03] rounded-bl-full"></div>
                <div className="text-[8px] font-mono text-gray-500 tracking-widest mb-3 uppercase">ML_PIPELINE_ANALYSIS</div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-mono text-[9px] text-gray-400">EMBEDDING_MODEL</span>
                    <span className="font-mono text-[10px] text-white bg-white/10 px-1">{data.model}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-mono text-[9px] text-gray-400">AUTHENTICITY_PROB</span>
                    <span className="font-mono text-[10px] text-[#00FF66] font-bold">{(data.prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1">
                    <span className="font-mono text-[9px] text-gray-400">VALENCE_SCORE</span>
                    <span className={`font-mono text-[10px] font-bold ${data.sent < 0 ? 'text-[#FF003C]' : 'text-[#00FF66]'}`}>{data.sent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-gray-400">SPATIAL_KRIGING_NODE</span>
                    <span className="font-mono text-[10px] text-white flex items-center gap-1">
                      <Globe className="w-3 h-3 text-[#00F0FF]" /> {data.geo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-[#FF003C]/10 border border-[#FF003C]/40 text-[#FF003C] hover:bg-[#FF003C] hover:text-black font-mono text-[9px] py-2 tracking-widest transition-all">
                  FLAG_ANOMALY
                </button>
                <button className="flex-1 bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black font-mono text-[9px] py-2 tracking-widest transition-all">
                  TRACE_ORIGIN
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
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="bg-[#000] min-h-screen relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:4vw_4vw] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none"></div>

      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 lg:p-16 z-10 border-b border-[#00F0FF]/10">
        <div className="absolute top-8 left-8 flex gap-2 items-center border border-[#FF003C]/30 bg-[#FF003C]/10 px-3 py-1">
          <div className="w-2 h-2 bg-[#FF003C] animate-pulse"></div>
          <span className="text-[9px] font-mono text-[#FF003C] tracking-[0.2em] uppercase">REC // HIGH CLEARANCE</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl text-center flex flex-col items-center relative z-10">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8">
            PREDICT. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-blue-700 drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]">NEVER REACT.</span>
          </h1>
          
          <p className="text-sm md:text-xl text-gray-400 font-mono tracking-widest leading-relaxed mb-12 max-w-3xl border-l-2 border-[#00F0FF] pl-6 text-left bg-black/50 p-6 backdrop-blur-sm">
            <span className="text-white">The Intelligence Gap:</span> Opinion scales to 1M impressions in 47 minutes. Campaign response takes 6-8 days.<br/><br/>
            <strong className="text-[#00F0FF]">POLARIS</strong> is the decision intelligence layer bridging the gap. We ingest 1.4 billion multilingual voices to predict crises before the narrative window closes.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0,240,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="group relative px-10 py-5 bg-black border-2 border-[#00F0FF] text-[#00F0FF] font-mono tracking-[0.3em] text-sm font-bold uppercase overflow-hidden"
            >
              <div className="absolute inset-0 w-0 bg-[#00F0FF] group-hover:w-full transition-all duration-300 ease-out z-0"></div>
              <span className="relative z-10 group-hover:text-black transition-colors flex items-center gap-3">
                [ INITIATE COMMAND CENTER ] <Terminal className="w-5 h-5" />
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(0,240,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewGuide}
              className="group relative px-10 py-5 bg-transparent border border-white/20 text-gray-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/50 font-mono tracking-[0.3em] text-sm font-bold uppercase transition-all"
            >
              <span className="relative z-10 flex items-center gap-3">
                [ READ MANUAL ] <Search className="w-5 h-5" />
              </span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div style={{ y: yBg }} className="absolute right-[-10%] top-[10%] opacity-20 pointer-events-none hidden lg:block scale-150">
          <svg width="400" height="400" viewBox="0 0 100 100">
             <path d={indiaSVGPath} fill="none" stroke="#00F0FF" strokeWidth="0.2" strokeDasharray="1 1" />
             {mapEdges.map((edge, i) => {
               const n1 = mapNodes.find(n => n.id === edge.from);
               const n2 = mapNodes.find(n => n.id === edge.to);
               if (!n1 || !n2) return null;
               return <line key={`hero-edge-${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#00F0FF" strokeWidth="0.1" opacity={edge.weight} />;
             })}
          </svg>
        </motion.div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 border-b border-[#00F0FF]/10 bg-[#020202]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex items-end gap-4 border-b border-[#00F0FF]/20 pb-6">
            <span className="text-7xl font-black text-[#00F0FF]/20 font-mono leading-none">01</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase">The Intelligence Failure</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProblemCard 
              icon={<TrendingUp className="w-8 h-8 text-[#FF003C]" />}
              title="The Reactive Trap" 
              stat="47 MINS vs 6-8 DAYS"
              desc="Opinion scales to 1M impressions in 47 minutes. The narrative window closes in 4-6 hours. Campaigns responding 6 days later are optimizing for dead intelligence."
            />
            <ProblemCard 
              icon={<Globe className="w-8 h-8 text-[#FFCC00]" />}
              title="Language Blind Spot" 
              stat="22 LANGUAGES | 780 DIALECTS"
              desc="80% of voter expression occurs in regional dialects. English-only NLP tools track just 11%, missing the rural and semi-urban tipping points entirely."
            />
            <ProblemCard 
              icon={<Database className="w-8 h-8 text-[#00F0FF]" />}
              title="Aggregation Illusion" 
              stat="MAHARASHTRA: +0.08 vs -0.4 SD"
              desc="State-level averages (e.g., +0.08) mask severe booth-level distress (-0.4 across regions). Elections are won booth-by-booth, not state-by-state."
            />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 border-b border-[#00F0FF]/10 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex items-end gap-4 border-b border-[#00F0FF]/20 pb-6">
            <span className="text-7xl font-black text-[#00F0FF]/20 font-mono leading-none">02</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase">Architecture Pipeline</h2>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-stretch relative">
            <div className="hidden lg:block absolute top-[40%] left-0 w-full h-px bg-[#00F0FF]/30 -translate-y-1/2 z-0 border-b border-dashed border-[#00F0FF]/20"></div>
            
            <PipelineNode num="I" icon={<Database className="w-6 h-6" />} title="Data Ingestion" tech="PostgreSQL + TimescaleDB" desc="Multilingual Social & Web Scrape" />
            <PipelineNode num="II" icon={<Activity className="w-6 h-6" />} title="Signal Process" tech="LaBSE + VADER + RoBERTa" desc="Multilingual Embedding Extraction" />
            <PipelineNode num="III" icon={<Terminal className="w-6 h-6" />} title="State Modeling" tech="Attention-GRU & Kriging" desc="Temporal & Spatial Dependency" />
            <PipelineNode num="IV" icon={<Zap className="w-6 h-6" />} title="Simulation" tech="Monte Carlo Engine" desc="Probabilistic Trajectory Sampling" />
            <PipelineNode num="V" icon={<AlertCircle className="w-6 h-6 text-[#00FF66]" />} title="Decision" tech="Bayesian Inference" desc="Risk-Aware Strategy Output" highlight />
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 border-b border-[#00F0FF]/10 bg-[#020202]">
        <div className="max-w-6xl mx-auto">
           <div className="mb-20 flex items-end gap-4 border-b border-[#00F0FF]/20 pb-6">
            <span className="text-7xl font-black text-[#00F0FF]/20 font-mono leading-none">03</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-[0.2em] uppercase">Standard Operating Procedure</h2>
          </div>

          <div className="space-y-6">
            <WorkflowStep num="STEP 01" action="OBSERVE" detail="Gaussian Kernel Regression on the geospatial radar detects a localized sentiment plunge. The Stability Index drops below 0.3." icon={<Eye className="text-[#00F0FF] w-8 h-8"/>} />
            <WorkflowStep num="STEP 02" action="ANALYZE" detail="System isolates the narrative drift. LaBSE embeddings map regional dialect vectors to specific policy grievances." icon={<Search className="text-[#FFCC00] w-8 h-8"/>} />
            <WorkflowStep num="STEP 03" action="SIMULATE" detail="Operator inputs counter-narrative U(t). The Monte Carlo engine samples M paths from the posterior to project T+6h trajectory." icon={<Terminal className="text-[#00F0FF] w-8 h-8"/>} />
            <WorkflowStep num="STEP 04" action="EXECUTE" detail="If VaR bounds confirm low backlash risk, Bayesian Inference greenlights the payload for cross-platform deployment." icon={<Zap className="text-[#00FF66] w-8 h-8"/>} />
          </div>
          
          <div className="mt-16 flex justify-center">
            <button onClick={onViewGuide} className="px-8 py-4 border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs tracking-[0.2em] uppercase hover:bg-[#00F0FF]/10 transition-colors flex items-center gap-3">
              <Search className="w-4 h-4" /> Access Full Operator Documentation
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 lg:px-16 z-10 bg-black">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-[0.2em] mb-6 uppercase">Live Simulation Protocol</h2>
            <p className="text-sm text-gray-400 font-mono tracking-widest max-w-2xl mx-auto">
              Access the sandbox to test the Forward Simulation Engine. Inject a narrative payload and observe the predicted sentiment trajectory via Attention-GRU.
            </p>
          </div>
          
          <DemoSandbox />
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,240,255,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="mt-24 px-16 py-6 bg-[#00F0FF] text-black font-mono tracking-[0.3em] text-sm font-bold uppercase hover:bg-white transition-colors"
          >
            Access Full Command Center
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
    const interval = setInterval(fetchNextItem, 3200);
    return () => clearInterval(interval);
  }, [fetchNextItem]);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="p-4 md:p-6 max-w-[1800px] mx-auto w-full grid grid-cols-12 gap-4 relative z-10"
    >
      <AnimatePresence>
        {selectedIntercept && <InterceptSnapshotModal data={selectedIntercept} onClose={() => setSelectedIntercept(null)} />}
      </AnimatePresence>

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="National Sentiment" value="-0.04" sub="DRIFT: -0.02 [1H]" type="danger" sparklineData={[0, 0.1, -0.05, -0.1, -0.04]} />
        <KpiCard title="Stability Index (SI)" value="0.28" sub="STATUS: UNSTABLE (<0.3)" type="warning" alert sparklineData={[0.4, 0.35, 0.32, 0.3, 0.28]} />
        <KpiCard title="Virality Threshold V(t)" value="0.72" sub="BURST ZONE ACTIVE" type="danger" alert sparklineData={[0.3, 0.4, 0.5, 0.65, 0.72]} />
        <KpiCard title="Model Confidence" value="88%" sub="VaR BOUNDS ALIGNED" type="safe" sparklineData={[80, 82, 85, 86, 88]} />
      </div>

      <div className="col-span-12 lg:col-span-8 h-[550px]">
        <TacticalRadarMap />
      </div>
      
      <div className="col-span-12 lg:col-span-4 h-[550px]">
        <GlassPanel title="LaBSE Data Ingestion Stream" icon={<Database className="w-4 h-4 text-gray-400" />} rightAction={<span className="text-[8px] text-[#00FF66] animate-pulse">LIVE 1.4B</span>}>
          <div className="space-y-2 h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col justify-end">
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"></div>
            <AnimatePresence initial={false}>
              {liveFeed.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20, backgroundColor: "rgba(0,240,255,0.2)" }} 
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0.4)" }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={item.id} 
                  onClick={() => setSelectedIntercept(item)}
                  className="p-3 border-l-2 border border-white/5 bg-[#050505] relative overflow-hidden cursor-pointer hover:border-[#00F0FF]/50 group flex-shrink-0"
                  style={{ borderLeftColor: item.sent < 0 ? '#FF003C' : '#00FF66' }}
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[7px] font-mono text-[#00F0FF] border border-[#00F0FF]/50 px-1">VIEW_SIGNAL</span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-white/10 pr-16">
                    <div className="flex gap-2 items-center">
                       <span className="text-[8px] font-mono tracking-widest uppercase bg-white/10 px-1 text-white">{item.lang}</span>
                       <span className="text-[7px] font-mono tracking-widest uppercase text-gray-500">{item.src}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[7px] font-mono text-gray-500">P:{item.prob}</span>
                      <span className={`text-[8px] font-bold font-mono tracking-widest ${item.sent < 0 ? 'text-[#FF003C]' : 'text-[#00FF66]'}`}>
                        S:{item.sent}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 font-mono tracking-wider leading-relaxed line-clamp-2">{item.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassPanel>
      </div>

      <div className="col-span-12 lg:col-span-6 h-[450px]">
        <GlassPanel title="State Trajectory [Attention-GRU]" icon={<Activity className="w-4 h-4 text-[#00F0FF]" />}
          action={
            <div className="flex bg-[#000] border border-[#00F0FF]/30 text-[9px] font-mono">
              <button onClick={()=>setDataMode("live")} className={`px-4 py-1.5 transition-colors ${dataMode==='live' ? 'bg-[#00F0FF] text-black font-bold' : 'text-gray-500 hover:text-[#00F0FF]'}`}>LIVE_FEED</button>
              <button onClick={()=>setDataMode("sim")} className={`px-4 py-1.5 transition-colors ${dataMode==='sim' ? 'bg-[#00FF66] text-black font-bold' : 'text-gray-500 hover:text-[#00FF66]'}`}>SIM_MODE</button>
            </div>
          }
        >
          <div className="w-full h-full pt-4 pb-6 pr-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataMode === 'live' ? trendData : simulatedTrendData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={dataMode==='live' ? "#00F0FF" : "#00FF66"} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={dataMode==='live' ? "#00F0FF" : "#00FF66"} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 4" stroke="#ffffff" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff" strokeOpacity={0.3} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff" strokeOpacity={0.3} domain={[-0.6, 0.4]} tick={{ fill: '#ffffff', opacity: 0.5, fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#colorBand)" fillOpacity={1} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#020202" fillOpacity={1} /> 

                <Area type="monotone" dataKey="sentiment" stroke={dataMode==='live' ? "#00F0FF" : "#00FF66"} strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                
                <ReferenceLine x="NOW" stroke="#FFCC00" strokeDasharray="3 3" label={{ position: 'top', value: 'CURRENT_T', fill: '#FFCC00', fontSize: 9, fontFamily: 'monospace' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <div className="col-span-12 lg:col-span-3 h-[450px]">
        <TerminalSimulator />
      </div>

      <div className="col-span-12 lg:col-span-3 h-[450px] grid grid-rows-2 gap-4">
        <GlassPanel title="Bayesian Decision Output" icon={<Terminal className="w-4 h-4 text-[#00FF66]" />} className="border-[#00FF66]/30">
          <div className="flex flex-col h-full justify-center space-y-3">
            <div className="flex gap-3 items-start bg-black border border-[#FF003C]/30 p-3 relative group">
              <div className="absolute left-0 top-0 w-1 h-full bg-[#FF003C]"></div>
              <AlertCircle className="w-4 h-4 text-[#FF003C] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[9px] font-bold font-mono text-[#FF003C] uppercase tracking-[0.2em] mb-1">AVOID: P(Risk) 0.85</h4>
                <p className="text-[9px] font-mono text-gray-400 leading-relaxed">Farm law rhetoric in Maharashtra. High structural volatility detected via Spatial Kriging.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-black border border-[#00FF66]/30 p-3 relative group">
               <div className="absolute left-0 top-0 w-1 h-full bg-[#00FF66]"></div>
              <Zap className="w-4 h-4 text-[#00FF66] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-[9px] font-bold font-mono text-[#00FF66] uppercase tracking-[0.2em] mb-1">PIVOT: P(Success) 0.92</h4>
                <p className="text-[9px] font-mono text-gray-400 leading-relaxed">Infrastructure deployment timeline in adjacent regions. Low variance expected.</p>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title="System Alerts Log" icon={<Activity className="w-4 h-4 text-gray-400" />}>
          <div className="space-y-2 overflow-y-auto h-full custom-scrollbar pr-2">
            {alertsData.map((alert) => (
              <div key={`alert-log-${alert.id}`} className={`p-3 border-l-2 ${alert.border} bg-[#050505]`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-[8px] font-bold font-mono tracking-widest uppercase ${alert.color}`}>{alert.type}</span>
                  <span className="text-[8px] font-mono text-gray-600 border border-gray-800 px-1">{alert.time}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-mono leading-relaxed line-clamp-2">{alert.msg}</p>
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
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="p-4 md:p-8 max-w-[1400px] mx-auto w-full z-10 relative"
    >
      <div className="mb-10 border-b border-[#00F0FF]/30 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Search className="w-8 h-8 text-[#00F0FF]" />
          <h1 className="text-3xl font-black text-white tracking-[0.3em] uppercase">OPERATOR MANUAL</h1>
        </div>
        <p className="text-xs font-mono text-gray-400 tracking-widest uppercase">CLASSIFIED // SYSTEM DOCUMENTATION v2.4 // POLARIS CORE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <GuideSection title="01. Key Performance Indicators (KPI)" icon={<Activity className="text-[#00F0FF]" />}>
          <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-4">
            The top command row tracks the macro-state of the nation. It aggregates local intelligence into 4 critical indices:
          </p>
          <ul className="space-y-3">
            <GuideListItem label="National Sentiment" desc="The aggregated S-Score (-1.0 to +1.0). Track the DRIFT to anticipate direction." color="text-[#00F0FF]" />
            <GuideListItem label="Stability Index (SI)" desc="Crucial regime metric. If SI drops below 0.30, the system enters an unstable, highly volatile state. Intervene immediately." color="text-[#FFCC00]" />
            <GuideListItem label="Virality Threshold V(t)" desc="Uses SEIR/Hawkes models. V(t) > 0.65 indicates a 'Burst Zone'—a narrative will reach 1M+ voters within 47 mins." color="text-[#FF003C]" />
            <GuideListItem label="Model Confidence" desc="Statistical certainty based on VaR (Value at Risk) bounds. Do not execute simulations if confidence < 75%." color="text-[#00FF66]" />
          </ul>
        </GuideSection>

        <GuideSection title="02. Spatial Kriging Radar Map" icon={<Globe className="text-[#00F0FF]" />}>
          <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-4">
            Avoid the "Aggregation Illusion". The map bypasses state averages to show booth-level distress via Gaussian Kernel Regression.
          </p>
          <div className="bg-[#050505] border border-white/10 p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#FF003C] shadow-[0_0_10px_rgba(255,0,60,1)]"></div>
              <span className="text-[10px] font-mono text-white tracking-widest">CRISIS NODE (RED)</span>
            </div>
            <p className="text-[9px] font-mono text-gray-500 pl-5">Severe localized distress. Often pulses. Requires immediate counter-messaging.</p>
          </div>
          <div className="bg-[#050505] border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
              <span className="text-[10px] font-mono text-white tracking-widest">DRIFT NODE (CYAN)</span>
            </div>
            <p className="text-[9px] font-mono text-gray-500 pl-5">Sentiment is shifting away from baseline. Monitor closely via LaBSE stream.</p>
          </div>
        </GuideSection>

        <GuideSection title="03. Simulation Terminal & AI Engine" icon={<Terminal className="text-[#00F0FF]" />}>
          <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-4">
            NEVER deploy an intervention blind. Use the Monte Carlo simulator to predict the outcome of a narrative injection before going public.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[10px] font-mono text-gray-300 leading-relaxed marker:text-[#00F0FF] marker:font-bold">
            <li>Select the target vector space (e.g., Wardha Crisis Zone).</li>
            <li>Input your exact proposed messaging payload U(t).</li>
            <li>Click Execute. The system will sample probability paths P(Z|X).</li>
            <li>Review the Bayesian Decision Output (Bottom Right). If P(Risk) is high, ABORT. If P(Success) &gt; 0.85, PIVOT and deploy.</li>
          </ol>
        </GuideSection>

        <GuideSection title="04. LaBSE Ingestion Stream & Snapshots" icon={<Database className="text-[#00F0FF]" />}>
          <p className="text-[11px] font-mono text-gray-400 leading-relaxed mb-4">
            Monitors the 80% of voices typically ignored by English-only NLP. Connects to the raw firehose across 22 languages.
            <br/><br/>
            <span className="text-[#00F0FF] font-bold">INTERACTIVE SNAPSHOTS:</span> Click on any incoming intercept in the Command Center to freeze the stream and view a detailed Signal Analysis Modal, revealing the exact ML pipeline execution for that message.
          </p>
          <div className="space-y-2 border-l border-[#00F0FF]/30 pl-4 mt-4">
            <p className="text-[10px] font-mono text-gray-300"><span className="text-[#00F0FF] font-bold">P-SCORE (Probability):</span> AI's confidence that the intercepted message is from an authentic, geographically-verified voter (filters bot nets).</p>
            <p className="text-[10px] font-mono text-gray-300"><span className="text-[#00FF66] font-bold">S-SCORE (Sentiment):</span> Valence of the message. Negative S-Scores combined with high Virality V(t) triggers system alerts.</p>
          </div>
        </GuideSection>
      </div>

      <div className="mt-12 flex justify-center">
        <button onClick={onEnter} className="px-12 py-4 bg-[#00F0FF]/10 border border-[#00F0FF] text-[#00F0FF] font-mono tracking-[0.3em] text-xs font-bold uppercase hover:bg-[#00F0FF] hover:text-black transition-all">
          [ RETURN TO COMMAND CENTER ]
        </button>
      </div>
    </motion.div>
  );
}

function ProblemCard({ title, desc, icon, stat }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-black border border-white/10 p-8 relative overflow-hidden group hover:border-[#00F0FF]/50 transition-colors flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00F0FF]/20 group-hover:bg-[#00F0FF] transition-colors"></div>
      <div className="mb-6 flex justify-between items-start">
        <div className="bg-white/5 p-4 rounded-sm border border-white/10 group-hover:border-[#00F0FF]/30">{icon}</div>
        <div className="text-[9px] font-mono text-[#00F0FF] border border-[#00F0FF]/30 px-2 py-1 bg-[#00F0FF]/10">{stat}</div>
      </div>
      <h3 className="text-xl font-black text-white mb-4 tracking-widest uppercase font-mono">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-xs font-mono tracking-wide">{desc}</p>
      <div className="mt-auto pt-6 flex justify-end opacity-20 group-hover:opacity-100 transition-opacity">
        <Search className="w-6 h-6 text-[#00F0FF]" />
      </div>
    </motion.div>
  );
}

function PipelineNode({ num, icon, title, tech, desc, highlight }) {
  return (
    <motion.div whileHover={{ y: -5 }} className={`z-10 bg-black border ${highlight ? 'border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.15)]' : 'border-[#00F0FF]/30'} p-6 w-full lg:w-[220px] flex flex-col relative flex-grow min-h-[220px]`}>
      <span className="absolute top-3 right-4 text-[12px] font-mono text-gray-700 font-bold">{num}</span>
      <div className={`mb-6 p-3 inline-block bg-white/5 border border-white/10 rounded-sm w-fit ${highlight ? 'text-[#00FF66]' : 'text-[#00F0FF]'}`}>
        {icon}
      </div>
      <h4 className="text-sm font-black text-white mb-1 uppercase tracking-widest">{title}</h4>
      <div className={`text-[8px] font-mono tracking-widest mb-3 border-b pb-2 ${highlight ? 'text-[#00FF66] border-[#00FF66]/30' : 'text-[#00F0FF] border-[#00F0FF]/30'}`}>{tech}</div>
      <p className="text-[10px] text-gray-500 font-mono tracking-wider leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function WorkflowStep({ num, action, detail, icon }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start bg-black border border-white/10 p-8 hover:border-[#00F0FF]/40 transition-colors group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/20 group-hover:border-[#00F0FF] transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 group-hover:border-[#00F0FF] transition-colors"></div>

      <div className="flex-shrink-0 flex flex-col items-center md:w-32 border-r border-white/10 pr-6">
        <div className="text-[10px] font-mono tracking-[0.2em] text-gray-500 mb-4">{num}</div>
        <div className="p-5 bg-white/5 border border-white/10 rounded-sm group-hover:border-[#00F0FF]/50 transition-colors group-hover:bg-[#00F0FF]/5">{icon}</div>
      </div>
      <div className="flex-col justify-center pt-2">
        <h3 className="text-2xl font-black text-white tracking-[0.3em] mb-4 uppercase group-hover:text-[#00F0FF] transition-colors">{action}</h3>
        <p className="text-sm font-mono text-gray-400 tracking-wider leading-relaxed max-w-3xl">{detail}</p>
      </div>
    </motion.div>
  );
}

function DemoSandbox() {
  const [demoState, setDemoState] = useState("idle"); 

  return (
    <div className="w-full bg-[#050505] border border-[#00F0FF]/40 shadow-[0_0_50px_rgba(0,240,255,0.1)] flex flex-col md:flex-row text-left relative overflow-hidden rounded-sm">
      {demoState === 'crisis' && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-[#FF003C]/10 mix-blend-screen animate-pulse border-4 border-[#FF003C]">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,0,60,0.1)_50%)] bg-[length:100%_4px]"></div>
        </div>
      )}

      <div className="w-full md:w-1/2 p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#00F0FF]/20 relative z-10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="font-mono text-sm font-bold tracking-[0.3em] text-[#00F0FF]">PAYLOAD_INJECTOR</h3>
          </div>
          <span className="text-[9px] font-mono text-gray-600 border border-gray-700 px-2 py-1">SYS.AUTH.REQ</span>
        </div>
        
        <label className="text-[9px] font-mono text-gray-500 tracking-widest uppercase mb-2 block">Define Intervention U(t)</label>
        <textarea 
          disabled={demoState !== 'idle'}
          className="w-full bg-[#020202] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-[#00F0FF] resize-none mb-8 p-4 tracking-wider leading-loose custom-scrollbar shadow-inner"
          rows={4}
          defaultValue="Action: Reduce agricultural subsidies by 15% across key states to reallocate budget for tech infrastructure."
        />
        
        <button 
          onClick={() => {
            setDemoState("computing");
            setTimeout(() => setDemoState("crisis"), 2500);
            setTimeout(() => setDemoState("idle"), 8000);
          }}
          disabled={demoState !== 'idle'}
          className={`w-full py-4 font-mono text-xs tracking-[0.4em] font-bold border-2 ${demoState === 'idle' ? 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF] hover:text-black' : 'border-gray-700 text-gray-700 bg-transparent'} transition-all uppercase`}
        >
          {demoState === 'idle' ? '[ RUN MONTE CARLO SIM ]' : demoState === 'computing' ? 'PROCESSING P(Z|X)...' : 'SYSTEM LOCKED'}
        </button>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-10 relative z-10 flex flex-col justify-center bg-[#020202]">
        <AnimatePresence mode="wait">
          {demoState === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-gray-600 text-sm tracking-[0.2em] text-center w-full py-20 border border-gray-800 border-dashed">
              [ AWAITING_INPUT_VECTOR ]
            </motion.div>
          )}

          {demoState === 'computing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full py-20">
              <div className="w-20 h-20 border-2 border-[#00F0FF]/20 border-t-[#00F0FF] border-r-[#00F0FF] rounded-full animate-spin mb-6"></div>
              <div className="font-mono text-[10px] text-[#00F0FF] tracking-[0.4em] uppercase animate-pulse">Projecting T+6H Statespace...</div>
            </motion.div>
          )}

          {demoState === 'crisis' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-[#FF003C]/10 border border-[#FF003C]/50 p-8 relative shadow-[0_0_30px_rgba(255,0,60,0.15)]">
              <div className="flex items-center gap-4 mb-8">
                <AlertCircle className="w-10 h-10 text-[#FF003C] animate-pulse" />
                <div>
                  <h2 className="text-2xl font-black text-[#FF003C] tracking-widest font-mono uppercase leading-none">CRISIS PREDICTED</h2>
                  <div className="text-[9px] font-mono text-[#FF003C]/70 tracking-[0.2em] mt-2">SEIR VIRALITY &gt; 0.89</div>
                </div>
              </div>
              
              <div className="space-y-5 font-mono text-xs">
                <div className="flex justify-between border-b border-[#FF003C]/30 pb-2">
                  <span className="text-gray-400">SHIFT TRAJECTORY (3H)</span>
                  <span className="text-[#FF003C] font-bold text-sm">-0.72 (SEVERE)</span>
                </div>
                <div className="flex justify-between border-b border-[#FF003C]/30 pb-2">
                  <span className="text-gray-400">HAWKES DECAY PROB.</span>
                  <span className="text-white font-bold">12% (SUSTAINED THREAT)</span>
                </div>
                <div className="mt-8 bg-[#000] p-5 border-l-4 border-[#FF003C] text-gray-300 leading-relaxed text-[11px] tracking-wider">
                  <span className="text-[#FF003C] font-bold block mb-2 text-sm">STRATEGY REJECTED:</span> 
                  Model detects severe structural backlash in agrarian nodes overriding tech infrastructure gains. Do not deploy.
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
    <div className="bg-black border border-white/10 p-6 md:p-8 relative group hover:border-[#00F0FF]/40 transition-colors">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30 group-hover:border-[#00F0FF] transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30 group-hover:border-[#00F0FF] transition-colors"></div>
      
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
        {icon}
        <h2 className="text-sm font-bold font-mono text-white tracking-widest uppercase">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function GuideListItem({ label, desc, color }) {
  return (
    <li className="flex flex-col mb-2">
      <span className={`text-[10px] font-bold font-mono uppercase tracking-widest mb-1 ${color}`}>{label}</span>
      <span className="text-[10px] font-mono text-gray-500 leading-relaxed">{desc}</span>
    </li>
  );
}
