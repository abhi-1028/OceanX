import { useEffect } from 'react';
import { ArrowRight, BrainCircuit, LockKeyhole, ShieldCheck, Sparkles, Target, Eye, CloudSun, Activity, Waves, AlertTriangle, Database, Gauge } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageShell } from './PageShell';
import { useOceanStore } from '../../store/useOceanStore';
import { api } from '../../services/api';

const fmt = (value:number|undefined, digits=2) => value === undefined ? '—' : value.toFixed(digits);

export function InsightsPage(){
 const s=useOceanStore();
 const locked=!!s.user?.guest;
 const region=s.regions.find(r=>r.id===s.regionId);
 const variable=s.variables.find(v=>v.id===s.variableId);
 useEffect(()=>{
   if(region&&variable&&!locked) api.insight(region.id,variable.id,s.depth,s.time).then(x=>s.set('insight',x)).catch(()=>{});
 },[region?.id,variable?.id,s.depth,s.time,locked]);
 const insight=s.insight;
 const forecast=insight?.forecast;

 return <PageShell eyebrow="AI / EXPLAINABLE ANALYSIS" title="Ocean Insights">
  {locked?<section className="locked-panel"><LockKeyhole size={36}/><span className="eyebrow">EXPLORATION ACCESS</span><h1>Advanced Analysis Locked</h1><p>Sign in to Team Apex Coders access to unlock model–observation comparison, advanced analytics and extended scientific insights.</p><button className="primary-btn" onClick={()=>s.signOut()}>RETURN TO LOGIN</button></section>:<>
   <section className="insight-page-hero">
    <div className="insight-hero-icon"><BrainCircuit size={44}/><span>AI</span></div>
    <div><span className="eyebrow">DETERMINISTIC AI PROTOTYPE / OUTLOOK ENGINE</span><h1>Evidence first. Outlook next.</h1><p>OceanX turns the selected model field into an explainable signal and then projects a short-term scenario. The outlook can describe possible changes in ocean state or weather-related forcing, but it is clearly labelled as a prototype and not an operational forecast.</p></div>
   </section>

   <section className="insight-context-strip">
    <div><span>REGION</span><strong>{region?.name||'No region selected'}</strong></div>
    <div><span>VARIABLE</span><strong>{variable?.name||'Select a variable'}</strong></div>
    <div><span>DEPTH</span><strong>{s.depth} m</strong></div>
    <div><span>ANALYSIS TIME</span><strong>{new Date(s.time).toLocaleString([], {dateStyle:'medium',timeStyle:'short'})}</strong></div>
   </section>

   {!insight ? <section className="insight-empty-state"><Sparkles/><span className="eyebrow">WAITING FOR SCIENTIFIC CONTEXT</span><h2>Open the Digital Twin and select a region + variable.</h2><p>OceanX will calculate the evidence block and generate a deterministic next-window scenario from the same selected depth and analysis time.</p><button className="primary-btn" onClick={()=>s.set('screen','twin')}>OPEN DIGITAL TWIN <ArrowRight size={16}/></button></section> : <>
    <section className="insight-result insight-main-result">
      <div className="result-heading"><div><span className="eyebrow">CURRENT SIGNAL</span><h2>{insight.title}</h2><p>{insight.summary}</p></div><div className="confidence-badge"><span>AI CONFIDENCE</span><b>{Math.round(insight.confidence*100)}%</b></div></div>
      <div className="evidence-grid">{insight.evidence?.map(e=><article key={e.label}><span>{e.label}</span><strong>{e.value} {e.unit}</strong><small>Calculated evidence</small></article>)}</div>
      <div className="source-line"><ShieldCheck size={13}/> Source: {insight.source} • Depth/time are carried directly from the Digital Twin.</div>
    </section>

    {forecast && <section className="forecast-section">
      <div className="section-head"><div><span className="eyebrow">PREDICTIVE OUTLOOK / NEXT 24–72 HOURS</span><h2>What might happen next?</h2></div><span className="forecast-pill"><Activity size={13}/> PROTOTYPE SCENARIO</span></div>
      <div className="forecast-grid">
       <article className="forecast-narrative"><div className="forecast-label"><Target size={16}/> <span>24-HOUR OUTLOOK</span></div><h3>{forecast.outlook}</h3><p>This projection uses the selected field, local synthetic trend and a bounded deterministic persistence pattern. It is designed to demonstrate the AI reasoning flow judges can inspect — not to replace a numerical weather or ocean forecast system.</p><div className="forecast-number"><span>Projected value</span><strong>{fmt(forecast.projected_value)} {forecast.unit}</strong><small>+24 h • confidence {Math.round(forecast.confidence*100)}%</small></div></article>
       <article className="forecast-chart-card"><div className="chart-heading"><span>SCENARIO TRAJECTORY</span><b>Now → +72 h</b></div><div className="forecast-chart"><ResponsiveContainer width="100%" height={220}><LineChart data={forecast.series}><CartesianGrid stroke="rgba(120,200,230,.10)" vertical={false}/><XAxis dataKey="label" tick={{fill:'#6d91a3',fontSize:9}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#6d91a3',fontSize:9}} axisLine={false} tickLine={false} width={42}/><Tooltip contentStyle={{background:'#061b2a',border:'1px solid rgba(92,220,255,.22)',borderRadius:8,color:'#dff9ff',fontSize:11}} formatter={(value:any)=>[`${Number(value).toFixed(3)} ${forecast.unit}`,'Scenario']}/><Line type="monotone" dataKey="value" stroke="#62e5ff" strokeWidth={2.5} dot={{r:3,fill:'#62e5ff',strokeWidth:0}} activeDot={{r:5}} /></LineChart></ResponsiveContainer></div><small>Scenario values are deterministic demo outputs.</small></article>
      </div>
      <div className="forecast-metrics"><div><span>24 H CHANGE</span><b>{forecast.change_24h >= 0 ? '+' : ''}{fmt(forecast.change_24h)} {forecast.unit}</b></div><div><span>48 H CHANGE</span><b>{forecast.change_48h >= 0 ? '+' : ''}{fmt(forecast.change_48h)} {forecast.unit}</b></div><div><span>24 H CONFIDENCE</span><b>{Math.round(forecast.confidence*100)}%</b></div><div><span>WEATHER RELEVANCE</span><b>{forecast.weather_relevance?'YES':'CONTEXTUAL'}</b></div></div>
    </section>}

    {forecast && <section className="insight-detail-grid">
      <article className="large-info-card"><div className="section-head"><div><span className="eyebrow">WHY THE MODEL SAYS THIS</span><h2>Drivers & evidence chain</h2></div><Gauge/></div><div className="ai-chain"><div><b>01</b><span>Observe</span><p>Read the selected {variable?.name?.toLowerCase()} field at {s.depth} m.</p></div><div><b>02</b><span>Compare</span><p>Measure the signal against the bundled deterministic baseline.</p></div><div><b>03</b><span>Project</span><p>Extend the local trend into a short, bounded scenario window.</p></div></div><div className="fact-pills">{forecast.drivers.map(x=><span key={x}>{x}</span>)}</div></article>
      <article className="large-info-card"><div className="section-head"><div><span className="eyebrow">WHAT TO WATCH</span><h2>Next observations to validate</h2></div><Eye/></div><ul className="watch-list">{forecast.watch_for.map((x,i)=><li key={x}><i>{String(i+1).padStart(2,'0')}</i><span>{x}</span></li>)}</ul><div className="validation-note"><Database size={15}/><span>Best practice: compare this scenario against future ARGO/BGC, satellite, glider or other validated observations before treating it as evidence of a real event.</span></div></article>
    </section>}

    <section className="ai-method-section"><div className="section-head"><div><span className="eyebrow">EXPLAINABILITY & LIMITATIONS</span><h2>How OceanX AI should be interpreted</h2></div><ShieldCheck/></div><div className="method-grid"><article><BrainCircuit/><h3>Deterministic</h3><p>Same region, variable, depth and time produce the same demo result. There is no hidden randomness in the scenario engine.</p></article><article><CloudSun/><h3>Forecast-like, not a forecast</h3><p>{forecast?.method || 'Prototype persistence and trend logic'} is used to demonstrate how a future-looking insight could be surfaced.</p></article><article><AlertTriangle/><h3>Validation required</h3><p>{insight.limitations}</p></article><article><Waves/><h3>Scientific extension path</h3><p>The architecture can later connect to validated numerical models, live observations and trained forecasting models without changing the analyst-facing workflow.</p></article></div></section>

    <div className="center-action"><button className="primary-btn" onClick={()=>s.set('screen','twin')}>OPEN DIGITAL TWIN <ArrowRight size={16}/></button></div>
   </>}
  </>}
 </PageShell>
}
