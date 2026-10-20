import React, { useState } from 'react';
import { Calculator, Trees, Droplets, Zap, Sparkles, TrendingUp, Shield, ArrowRight, Cpu, CheckCircle2, XCircle, Copy, Check, Terminal } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

interface EcoCalculatorProps {
  onOpenLogModal: () => void;
}

export const EcoCalculator: React.FC<EcoCalculatorProps> = ({ onOpenLogModal }) => {
  const [studentCount, setStudentCount] = useState<number>(30);
  const [disposalsPerWeek, setDisposalsPerWeek] = useState<number>(5);

  // Raspberry Pi API Live Tester State
  const [testEcoNum, setTestEcoNum] = useState<string>('83152');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleTestApi = async () => {
    setApiLoading(true);
    try {
      const res = await fetch(getApiUrl(`/econumberExists?n=${encodeURIComponent(testEcoNum.trim())}`));
      const data = await res.json();
      setApiResult(data);
    } catch (err: any) {
      setApiResult({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  const pythonSnippet = `import requests

# 1. Check if student's Eco Number exists on Verde Tech
eco_number = "${testEcoNum || '83152'}"
url = f"https://${typeof window !== 'undefined' ? window.location.host : 'verdesystems.ai.studio'}/econumberExists?n={eco_number}"

response = requests.get(url)
data = response.json()

if data.get("exists"):
    print(f"Verified! Welcome {data.get('name')} ({data.get('ecoNumber')})")
    print(f"Current Points: {data.get('points')}")
    # Trigger servo motor to open smart bin door!
else:
    print(f"Access Denied: Eco Number {eco_number} not found.")`;

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(pythonSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Calculations for Smart Bin waste disposal
  const pointsPerDisposal = 50;
  const co2PerDisposal = 0.5; // kg
  const wastePerDisposal = 1.0; // kg

  const weeklyPoints = studentCount * disposalsPerWeek * pointsPerDisposal;
  const monthlyCo2Saved = studentCount * disposalsPerWeek * 4 * co2PerDisposal;
  const monthlyWasteDiverted = studentCount * disposalsPerWeek * 4 * wastePerDisposal;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart Bin Impact Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart Bin Eco Impact Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate how regular Smart Bin waste disposal requests multiply Verde Points and waste diversion overall!
          </p>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders & Controls */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Smart Bin Simulation Parameters</span>
          </h3>

          {/* Action Focus Display */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Primary Eco Action:</span>
            <div className="text-sm font-extrabold text-white mt-0.5">
              🗑️ Waste Disposal in Smart Bin (+50 Points / disposal)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Requests are logged and verified by the admin against physical Smart Bin records.
            </p>
          </div>

          {/* Participating Students Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Participating Students:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{studentCount} students</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={studentCount}
              onChange={(e) => setStudentCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Frequency Disposals Per Week Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-300">Smart Bin Disposals per Student / Week:</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{disposalsPerWeek} disposals/week</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={1}
              value={disposalsPerWeek}
              onChange={(e) => setDisposalsPerWeek(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Impact calculation summary */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs text-slate-400 font-medium">Estimated Weekly Collective Boost</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              +{weeklyPoints.toLocaleString()} pts
            </div>
          </div>

        </div>

        {/* Projected Impact Results */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Projected Environmental Impact</span>
            </h3>

            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 text-center space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                Weekly Point Generation
              </span>
              <div className="text-4xl font-black text-emerald-400 font-mono">
                +{weeklyPoints.toLocaleString()} <span className="text-sm font-normal text-slate-400">pts/week</span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                Verified Smart Bin usage keeps community waste segregated and clean.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Monthly CO₂ Saved</div>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {monthlyCo2Saved.toFixed(0)} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Monthly Waste Diverted</div>
                <div className="text-2xl font-black text-teal-400 mt-1 font-mono">
                  {monthlyWasteDiverted.toFixed(0)} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onOpenLogModal}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Submit Smart Bin Request Now</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>

      {/* Raspberry Pi Hardware & Smart Bin API Integration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mt-1">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono tracking-wider uppercase border border-emerald-500/30">
                  Live Hardware API
                </span>
                <span className="text-xs text-slate-400">Endpoint Ready</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Raspberry Pi Smart Bin Backend
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
                Physical Smart Bins powered by Raspberry Pi or Arduino query this backend directly via HTTP GET to verify student Eco Numbers before unlocking the bin.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GET /econumberExists?n={testEcoNum}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Tester */}
          <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Test Live Hardware Request</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Python requests simulator</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Enter Eco Number (or GR No) to test:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testEcoNum}
                  onChange={(e) => setTestEcoNum(e.target.value)}
                  placeholder="e.g. 83152, 83502, 266136"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleTestApi}
                  disabled={apiLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {apiLoading ? 'Checking...' : 'Send Query'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 text-[11px] text-slate-400">
                <span>Quick tests:</span>
                <button onClick={() => { setTestEcoNum('83152'); }} className="underline hover:text-emerald-400 cursor-pointer">83152</button>
                <span>•</span>
                <button onClick={() => { setTestEcoNum('83502'); }} className="underline hover:text-emerald-400 cursor-pointer">83502 (Laxman)</button>
                <span>•</span>
                <button onClick={() => { setTestEcoNum('266136'); }} className="underline hover:text-emerald-400 cursor-pointer">266136 (Dhruv)</button>
                <span>•</span>
                <button onClick={() => { setTestEcoNum('999999'); }} className="underline hover:text-rose-400 cursor-pointer">999999 (Invalid)</button>
              </div>
            </div>

            {/* Live Result View */}
            {apiResult && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-xs font-mono space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <div className="flex items-center space-x-1.5">
                    {apiResult.exists ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">200 OK — Student Exists</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span className="text-rose-400 font-bold">200 OK — Eco Number Not Found</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">HTTP GET</span>
                </div>

                <pre className="text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Python Code Display */}
          <div className="lg:col-span-7 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-300">Raspberry Pi Python Implementation</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">smart_bin.py</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Python Code'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  {pythonSnippet}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-300">Supported query formats:</span>
                <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">?n=83152</code>
                <code className="text-slate-400 bg-slate-900 px-1 py-0.5 rounded">?n=83152&format=text</code>
              </div>
              <span className="text-slate-400 font-mono">CORS: Enabled (*)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
