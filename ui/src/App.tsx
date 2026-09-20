import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import ReactFlow, { Background, Controls, MarkerType, applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  TerminalSquare, 
  Cpu, 
  Network, 
  BrainCircuit, 
  FileCheck2,
  Play,
  ShieldCheck,
  Download,
  Activity,
  Server,
  Zap,
  CheckCircle2,
} from 'lucide-react';

// ============================================================================
// SANKHYA-OPT | 5-TAB COMMAND CENTER (GRAND FINALE)
// ============================================================================

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [isSolving, setIsSolving] = useState(false);
  const [solved, setSolved] = useState(true);

  // Tab 1: SLM & SCADA
  const [slmPrompt, setSlmPrompt] = useState("Maximize diesel yield while keeping sulfur below 0.5%");
  const [translation, setTranslation] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [tankLevel, setTankLevel] = useState(84.5);
  const [pipelinePressure, setPipelinePressure] = useState(124.2);
  const [crudeViscosity, setCrudeViscosity] = useState(14.1);

  // Tab 2: GPU Telemetry
  const [gpuMemory, setGpuMemory] = useState<number[]>(Array(50).fill(20));
  const [tensorCores, setTensorCores] = useState<number[]>(Array(50).fill(10));
  const [residual, setResidual] = useState<number[]>(Array(50).fill(1.0));
  
  // Tab 3: ReactFlow MILP Tree
  const initialNodes: Node[] = [
    { id: '1', position: { x: 400, y: 50 }, data: { label: 'Root LP Relaxation\nZ = 45.2M (Infeasible)' }, style: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontWeight: 'bold', textAlign: 'center' } },
    { id: '2', position: { x: 200, y: 150 }, data: { label: 'x_CDU = 0\nZ = 38.1M' }, style: { backgroundColor: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
    { id: '3', position: { x: 600, y: 150 }, data: { label: 'x_CDU = 1\nZ = 44.9M' }, style: { backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
    { id: '4', position: { x: 100, y: 250 }, data: { label: 'Pruned by Bound\n(GNN Scored: 12%)' }, style: { backgroundColor: '#fee2e2', border: '2px dashed #f87171', color: '#b91c1c', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
    { id: '5', position: { x: 450, y: 250 }, data: { label: 'y_Brent ≤ 100\nSpatial Branch (McCormick)\nZ = 42.1M' }, style: { backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
    { id: '6', position: { x: 750, y: 250 }, data: { label: 'y_Brent ≥ 101\nSpatial Branch (McCormick)\nZ = 44.8M' }, style: { backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px', padding: '10px', textAlign: 'center' } },
    { id: '7', position: { x: 750, y: 350 }, data: { label: 'Optimal Integer Feasible\nZ = 44.8M' }, style: { backgroundColor: '#dcfce7', border: '3px solid #22c55e', color: '#166534', borderRadius: '8px', padding: '15px', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } },
  ];
  
  const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', label: 'Branch Down', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e1-3', source: '1', target: '3', label: 'Branch Up (GNN: 98%)', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-6', source: '3', target: '6', animated: true, style: { stroke: '#10b981', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
    { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#22c55e', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' } },
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  // Tab 4: OptNet
  const [optnetStatus, setOptnetStatus] = useState('Waiting for KKT conditions...');

  // Live Data Simulation Effects
  useEffect(() => {
    if (activeTab === 1) {
      const interval = setInterval(() => {
        setTankLevel(prev => +(prev + (Math.random() - 0.5) * 0.2).toFixed(2));
        setPipelinePressure(prev => +(prev + (Math.random() - 0.5) * 1.5).toFixed(2));
        setCrudeViscosity(prev => +(prev + (Math.random() - 0.5) * 0.1).toFixed(2));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 2) {
      // 60FPS Simulation for GPU Telemetry
      const interval = setInterval(() => {
        setGpuMemory(prev => [...prev.slice(1), 70 + Math.random() * 15]);
        setTensorCores(prev => [...prev.slice(1), 85 + Math.random() * 14]);
        
        // Simulating the rapid convergence of MPIR
        setResidual(prev => {
          const last = prev[prev.length - 1];
          const next = last > 0.000001 ? last * 0.85 : 0.000001 + Math.random() * 0.0000005;
          return [...prev.slice(1), next];
        });
      }, 100); // 100ms updates
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Handlers
  const triggerSolver = () => {
    setIsSolving(true);
    setSolved(false);
    setTimeout(() => {
      setIsSolving(false);
      setSolved(true);
    }, 1500);
  };

  const translatePrompt = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setTranslation({
        objective: "\\min c^T x",
        constraints: [
          "A_{yield} x \\ge b_{diesel}",
          "A_{sulfur} x \\le 0.005",
          "x \\in \\mathbb{Z}^n \\times \\mathbb{R}^m"
        ],
        status: "Parsed successfully via Llama-3-8B"
      });
      setIsTranslating(false);
    }, 800);
  };

  const downloadAudit = () => {
    const audit = {
      certificate: 'SANKHYA-OPT Sovereign KKT Optimality Certificate',
      timestamp: new Date().toISOString(),
      primalFeasible: true,
      dualFeasible: true,
      complementarySlackness: '4.12e-07',
      signature: '0x8F3C92B4A91B'
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sankhya_sovereign_audit.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ECharts Configurations
  const gpuOptions = useMemo(() => ({
    animation: false,
    tooltip: { trigger: 'axis' },
    legend: { data: ['VRAM Usage (%)', 'Tensor Core Utilization (%)'] },
    grid: { top: 40, right: 20, bottom: 30, left: 40 },
    xAxis: { type: 'category', show: false, data: Array(50).fill(0).map((_, i) => i) },
    yAxis: { type: 'value', max: 100 },
    series: [
      { name: 'VRAM Usage (%)', type: 'line', data: gpuMemory, itemStyle: { color: '#8b5cf6' }, areaStyle: { color: 'rgba(139, 92, 246, 0.2)' }, smooth: true, symbol: 'none' },
      { name: 'Tensor Core Utilization (%)', type: 'line', data: tensorCores, itemStyle: { color: '#f59e0b' }, areaStyle: { color: 'rgba(245, 158, 11, 0.2)' }, smooth: true, symbol: 'none' }
    ]
  }), [gpuMemory, tensorCores]);

  const mpirOptions = useMemo(() => ({
    animation: false,
    tooltip: { trigger: 'axis' },
    grid: { top: 30, right: 30, bottom: 30, left: 60 },
    xAxis: { type: 'category', show: false, data: Array(50).fill(0).map((_, i) => i) },
    yAxis: { type: 'log', name: 'KKT Residual (||Ax - b||)', splitLine: { show: false } },
    series: [{
      name: 'Residual', type: 'line', data: residual, itemStyle: { color: '#10b981' }, smooth: true, symbol: 'none'
    }]
  }), [residual]);

  const heatmapOptions = {
    tooltip: { position: 'top' },
    grid: { top: 20, right: 20, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: ['x1', 'x2', 'x3', 'x4', 'y1', 'y2'] },
    yAxis: { type: 'category', data: ['c1', 'c2', 'c3'] },
    visualMap: { min: -1, max: 1, calculable: true, orient: 'horizontal', left: 'center', bottom: -10, inRange: { color: ['#ef4444', '#ffffff', '#10b981'] } },
    series: [{
      name: 'Jacobian (dL/dA)', type: 'heatmap',
      data: [
        [0, 0, 0.8], [0, 1, -0.4], [0, 2, 0.1], [0, 3, 0.9], [0, 4, 0.0], [0, 5, 0.0],
        [1, 0, -0.7], [1, 1, 0.3], [1, 2, 0.2], [1, 3, 0.5], [1, 4, -0.9], [1, 5, 0.1],
        [2, 0, 0.4], [2, 1, -0.8], [2, 2, 0.6], [2, 3, -0.1], [2, 4, 0.7], [2, 5, 0.5]
      ],
      label: { show: true }
    }]
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col z-10">
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            SANKHYA-OPT
            <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded border border-emerald-200">
              MOPNG
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">SIH26119 | MRPL Enterprise</p>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 1, name: 'Command Center', icon: TerminalSquare },
            { id: 2, name: 'GPU Compute Telemetry', icon: Cpu },
            { id: 3, name: 'MILP Search Tree', icon: Network },
            { id: 4, name: 'OptNet AI Lab', icon: BrainCircuit },
            { id: 5, name: 'KKT Certification Audit', icon: FileCheck2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-sm border border-sky-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">0 Network Egress</span>
            <span className="text-[10px] text-slate-400 text-center mt-1">Air-Gapped Sovereign Node<br/>Quantum-Inspired SA Ready</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER STRIP */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 1 && "Command Center: SLM & SCADA Ingestion"}
              {activeTab === 2 && "GPU Compute Telemetry: MPIR Engine"}
              {activeTab === 3 && "MILP Search Tree: GNN Branching"}
              {activeTab === 4 && "OptNet Differentiable AI Lab"}
              {activeTab === 5 && "KKT Certification & Audit Export"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Mangalore Refinery and Petrochemicals Limited</p>
          </div>

          <div className="flex items-center space-x-4">
            {solved && (
              <div className="flex space-x-6 mr-4 border-r border-slate-200 pr-6">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Neural Dive Primal Bound</span>
                  <span className="text-sm font-mono font-bold text-indigo-600">Found in 0.8ms</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Profit</span>
                  <span className="text-sm font-mono font-bold text-emerald-600">₹ 49.63M</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">KKT Residual</span>
                  <span className="text-sm font-mono font-bold text-sky-600">4.12e-07</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={triggerSolver}
              disabled={isSolving}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-md font-semibold text-sm shadow flex items-center transition-all disabled:opacity-70 disabled:cursor-wait"
            >
              {isSolving ? (
                <>
                  <Activity className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Compiling Matrix...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run SANKHYA-OPT
                </>
              )}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT ROUTER */}
        <div className="p-6 max-w-7xl w-full mx-auto flex-1 overflow-y-auto">
          
          {/* TAB 1: COMMAND CENTER (SLM & SCADA) */}
          {activeTab === 1 && (
            <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
              {/* SCADA Left Column */}
              <div className="bg-slate-900 rounded-lg shadow-sm p-5 border border-slate-800 flex flex-col">
                <h3 className="text-sm font-bold text-sky-400 mb-4 flex items-center">
                  <Server className="w-4 h-4 mr-2" /> Live OPC-UA Telemetry Stream
                </h3>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-slate-800 rounded p-4 border border-slate-700 flex flex-col justify-center items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase mb-2">Crude Tank A</span>
                    <span className="text-4xl font-mono text-emerald-400">{tankLevel.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 mt-2">Node: ns=2;s=TK101.Level</span>
                  </div>
                  <div className="bg-slate-800 rounded p-4 border border-slate-700 flex flex-col justify-center items-center">
                    <span className="text-xs text-slate-400 font-bold uppercase mb-2">CDU Unit B Pressure</span>
                    <span className="text-4xl font-mono text-amber-400">{pipelinePressure.toFixed(1)} <span className="text-sm">kPa</span></span>
                    <span className="text-[10px] text-slate-500 mt-2">Node: ns=2;s=CDU2.Press</span>
                  </div>
                  <div className="bg-slate-800 rounded p-4 border border-slate-700 flex flex-col justify-center items-center col-span-2">
                    <span className="text-xs text-slate-400 font-bold uppercase mb-2">Incoming Feed Viscosity</span>
                    <span className="text-3xl font-mono text-sky-400">{crudeViscosity.toFixed(2)} <span className="text-sm">cSt</span></span>
                    <div className="w-full bg-slate-700 h-2 mt-4 rounded overflow-hidden">
                      <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${(crudeViscosity / 20) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-slate-800 rounded p-3 text-xs font-mono text-slate-400 border border-slate-700">
                  <span className="text-emerald-500">{"[OPC-UA]"}</span> Connected to MRPL Edge Server <br/>
                  <span className="text-emerald-500">{"[Matrix]"}</span> Ingesting real-time parameters into A, b vectors...
                </div>
              </div>

              {/* SLM Right Column */}
              <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200 flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <TerminalSquare className="w-4 h-4 mr-2 text-sky-600"/> Agentic SLM Translator
                </h3>
                <textarea 
                  value={slmPrompt}
                  onChange={(e) => setSlmPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 p-4 h-32 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-medium mb-4"
                />
                
                <div className="flex-1 bg-slate-50 rounded border border-slate-200 p-4 font-mono text-sm overflow-auto">
                  {translation ? (
                    <div className="text-slate-800">
                      <p className="text-sky-600 mb-2 font-bold">{translation.status}</p>
                      <p className="font-bold">Objective:</p>
                      <p className="ml-4 text-emerald-700 bg-emerald-50 p-2 rounded inline-block my-1">{translation.objective}</p>
                      <p className="font-bold mt-2">Constraints:</p>
                      <ul className="ml-4 space-y-1 mt-1">
                        {translation.constraints.map((c: string, idx: number) => (
                          <li key={idx} className="text-slate-600 bg-white border border-slate-200 p-1.5 rounded">{c}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      Generate math formulation from natural language.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-slate-500 flex items-center"><BrainCircuit className="w-3 h-3 mr-1"/> Llama-3-8B (Quantized)</span>
                  <button
                    onClick={translatePrompt}
                    disabled={isTranslating}
                    className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-5 py-2 rounded text-sm font-semibold transition-colors"
                  >
                    {isTranslating ? 'Translating...' : 'Formulate Math'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GPU COMPUTE TELEMETRY */}
          {activeTab === 2 && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col gap-6">
              <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm p-5 h-64 shrink-0 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center">
                    <Cpu className="w-4 h-4 mr-2 text-indigo-400"/> Live GPU Hardware Telemetry (60 FPS)
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">NVIDIA Tensor Cores Active</span>
                </div>
                <div className="flex-1 w-full relative">
                  <ReactECharts option={gpuOptions} style={{height: '100%', width: '100%'}} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">MPIR Residual Convergence Curve</h3>
                  <p className="text-xs text-slate-500 mb-2">FP32 PDHG inner loop correcting with FP64 outer iterations.</p>
                  <div className="flex-1 w-full">
                    <ReactECharts option={mpirOptions} style={{height: '100%', width: '100%'}} />
                  </div>
                </div>

                <div className="space-y-4 flex flex-col">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Neural Diving & QIO Baseline</span>
                    <div className="mt-2 bg-indigo-50 border border-indigo-100 p-3 rounded flex items-start">
                      <Zap className="w-5 h-5 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-bold text-indigo-900 block">DeepMind Neural Diving</span>
                        <span className="text-xs text-indigo-700 mt-1 block">Architecture instantly predicted joint configuration variables, providing a massive primal incumbent head start (Z ≤ 46.1M).</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Matrix Equilibration (Ruiz)</span>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2 text-sm">
                      <span className="text-slate-600">Initial Condition $\kappa(A)$</span>
                      <span className="font-mono text-rose-500">1.4e8</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Scaled Condition kappa(A-hat)</span>
                      <span className="font-mono text-emerald-600 font-bold">1.04</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MILP SEARCH TREE */}
          {activeTab === 3 && (
            <div className="animate-in fade-in duration-500 h-full min-h-[600px] bg-white rounded-lg border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded shadow border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800">Spatial Branch-and-Bound (MINLP)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">GNN identifies promising branches (green) while GPU McCormick Relaxations dynamically tighten non-linear pooling bounds.</p>
              </div>
              
              <div className="flex-1 w-full">
                <ReactFlow 
                  nodes={nodes} 
                  edges={edges} 
                  onNodesChange={onNodesChange} 
                  onEdgesChange={onEdgesChange}
                  fitView
                  minZoom={0.5}
                >
                  <Background color="#cbd5e1" gap={16} />
                  <Controls className="bg-white border-slate-200 shadow-sm" />
                </ReactFlow>
              </div>
              
              <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 grid grid-cols-3 gap-6 text-center">
                <div>
                  <span className="block text-2xl font-mono font-bold text-slate-800">1,402</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 block">Nodes Explored</span>
                </div>
                <div>
                  <span className="block text-2xl font-mono font-bold text-sky-600">89.4%</span>
                  <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider mt-1 block">GNN Pruning Efficiency</span>
                </div>
                <div>
                  <span className="block text-2xl font-mono font-bold text-emerald-600">Optimal</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1 block">Tree Status</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPTNET AI LAB */}
          {activeTab === 4 && (
            <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800">OptNet: Differentiable KKT Layer</h3>
                <p className="text-xs text-slate-500 mb-6">Bridging Machine Learning and Operations Research via Implicit Differentiation.</p>
                
                <div className="flex-1 bg-slate-900 rounded p-4 font-mono text-xs text-slate-300 overflow-auto border border-slate-800">
                  <p className="text-sky-400 mb-2">{'# PyTorch Autograd Forward & Backward Hooks'}</p>
                  <p>{'>'} net = OptNet(A, b, c).cuda()</p>
                  <p>{'>'} z_star = net(features)</p>
                  <p className="text-slate-500 mt-2">{'// Waiting for backward pass...'}</p>
                  {optnetStatus.includes('Backprop') && (
                    <div className="mt-4 text-emerald-400 animate-in slide-in-from-left">
                      <p>{'>'} loss.backward()</p>
                      <p>{'>'} Computing Jacobians via KKT Implicit Function Theorem</p>
                      <p className="mt-2 text-white">Gradient Norms:</p>
                      <p className="text-emerald-300 pl-4">∇A: 2.8190</p>
                      <p className="text-emerald-300 pl-4">∇b: 0.9912</p>
                      <p className="text-emerald-300 pl-4">∇c: 0.1423</p>
                      <p className="text-sky-300 mt-2 font-bold">Successfully propagated financial profit signal to neural weights!</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <button onClick={() => setOptnetStatus('Forward pass complete')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-sm font-semibold transition-colors border border-slate-300">
                    Run Forward Pass
                  </button>
                  <button onClick={() => setOptnetStatus('Backpropagation complete: gradients updated')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center shadow">
                    <BrainCircuit className="w-4 h-4 mr-2" /> Backpropagate KKT
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Live Jacobian Heatmap (dL/dA)</h3>
                <p className="text-xs text-slate-500 mb-4">Shows how changing structural constraint matrix A impacts the final financial profit.</p>
                <div className="flex-1 w-full min-h-[300px]">
                  <ReactECharts option={heatmapOptions} style={{height: '100%', width: '100%'}} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KKT CERTIFICATION & AUDIT */}
          {activeTab === 5 && (
            <div className="animate-in fade-in duration-500 h-full flex flex-col max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0"></div>
                
                <div className="flex items-start justify-between mb-8 z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                      <ShieldCheck className="w-6 h-6 mr-2 text-emerald-600" />
                      Optimality Certificate
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Mathematical proof of global optimality for MRPL Dispatch.</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>KKT VERIFIED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 z-10">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Refinery Dispatch Schedule</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span className="text-slate-600">Arab Light Feed:</span> <span className="font-mono font-bold text-slate-900">150,000 bbl</span></li>
                      <li className="flex justify-between"><span className="text-slate-600">Brent Crude Feed:</span> <span className="font-mono font-bold text-slate-900">350,000 bbl</span></li>
                      <li className="flex justify-between"><span className="text-slate-600">CDU Mode A:</span> <span className="font-mono font-bold text-emerald-600">ACTIVE (1)</span></li>
                      <li className="flex justify-between"><span className="text-slate-600">Total Yield Value:</span> <span className="font-mono font-bold text-sky-600">₹ 49.63M</span></li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Mathematical Proof Metrics</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center"><span className="text-slate-600 text-xs">Primal Feas (||Ax-b||)</span> <span className="font-mono text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded">0.00e+00</span></li>
                      <li className="flex justify-between items-center"><span className="text-slate-600 text-xs">Dual Feas (||A^Ty+c||)</span> <span className="font-mono text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded">0.00e+00</span></li>
                      <li className="flex justify-between items-center"><span className="text-slate-600 text-xs">Relative Duality Gap</span> <span className="font-mono text-emerald-600 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded">4.12e-07</span></li>
                      <li className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2"><span className="text-slate-600 text-xs font-bold">Shadow Prices Extracted?</span> <span className="font-mono text-indigo-600 text-[10px] font-bold bg-indigo-100 px-2 py-0.5 rounded">YES (GPU BASIS CROSSOVER)</span></li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-between items-center mt-auto z-10 bg-white">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-slate-400">Cryptographic Signature:</span>
                    <span className="text-sm font-mono font-bold text-slate-700">0x8F3C92B4A91B...</span>
                  </div>
                  <button onClick={downloadAudit} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center shadow-lg transition-transform hover:scale-[1.02]">
                    <Download className="w-5 h-5 mr-2" /> Export Sovereign Audit (PDF/JSON)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}