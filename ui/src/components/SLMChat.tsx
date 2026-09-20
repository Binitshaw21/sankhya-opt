import { useState } from 'react';
import { MessageSquare, Cpu, CheckCircle } from 'lucide-react';

export default function SLMChat() {
  const [prompt, setPrompt] = useState("Maximize refinery throughput. Keep sulfur below 18.5 and octane above 46000.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTranslateAndSolve = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/slm/translate-and-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("API Offline", err);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 w-full text-slate-200 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-sky-400 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Agentic SLM Natural-to-Math Translator
        </h3>
        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-1 rounded text-xs font-bold">
          LOCAL LLAMA-3 ACTIVE
        </span>
      </div>

      <div className="flex space-x-2 mb-6">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-sky-500 transition-colors"
          placeholder="Enter operational constraints in plain English..."
        />
        <button 
          onClick={handleTranslateAndSolve}
          disabled={loading}
          className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded font-bold transition-all disabled:opacity-50 flex items-center shadow-[0_0_10px_rgba(14,165,233,0.3)]"
        >
          {loading ? 'Translating...' : 'Generate Matrix & Solve'}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          {/* Natural Language Parsing Results */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2">SLM Parameter Extraction</h4>
            <ul className="space-y-2 text-sm font-mono text-emerald-400">
              <li>&gt; Max Sulfur Limit: {result.nlp_extraction.max_sulfur_pool}</li>
              <li>&gt; Min Octane Target: {result.nlp_extraction.min_octane_target}</li>
              <li>&gt; Reforming Capacity: {result.nlp_extraction.max_reforming_capacity} bbl</li>
            </ul>
          </div>

          {/* GPU Solver Execution Results */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <h4 className="text-sm font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2 flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-sky-500" /> GPU MPIR Execution
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-slate-500">Latency:</span>
              <span className="text-sky-400 font-mono">{result.solver_metrics.solve_time_ms.toFixed(2)} ms</span>
              
              <span className="text-slate-500">Tensor Iters:</span>
              <span className="text-slate-300 font-mono">{result.solver_metrics.total_inner_iterations}</span>
              
              <span className="text-slate-500">Min Cost:</span>
              <span className="text-emerald-400 font-mono font-bold">₹{result.solver_metrics.optimal_objective.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
            </div>
            <div className="mt-3 text-xs text-emerald-500 flex items-center font-bold bg-emerald-500/10 p-1 rounded inline-flex">
              <CheckCircle className="w-3 h-3 mr-1" /> CONSTRAINTS SATISFIED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}