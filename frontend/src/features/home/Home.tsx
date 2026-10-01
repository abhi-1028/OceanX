import { useEffect, useState } from 'react';
import { ArrowRight, Compass, Activity, Database, LogOut, Globe2, Satellite, BrainCircuit, Layers3, ChevronRight, Wind, Navigation, BarChart3, Waves, LockKeyhole } from 'lucide-react';
import { api } from '../../services/api';
import { useOceanStore } from '../../store/useOceanStore';
import logo from '../../assets/oceanx-logo.png';
import mark from '../../assets/oceanx-mark.png';
import { UnderwaterBackground } from '../explore/UnderwaterBackground';

export function Home(){
 const {set,regions,variables,user}=useOceanStore();
 const [news,setNews]=useState<{title:string;summary:string;tag:string}[]>([]);
 useEffect(()=>{api.news().then(r=>setNews(r.items)).catch(()=>{})},[]);
 const featured=regions;
 const openTwin=()=>set('screen','twin');
 const openRegion=(id:string)=>{set('regionId',id);set('screen','region-info')};
 const openVariable=(id:string)=>{set('variableId',id);set('screen','variable-info')};
 const locked=user?.guest;
 return <main className="home"><UnderwaterBackground />
  <header className="topbar home-topbar">
   <button className="brand brand-image" onClick={()=>set('screen','home')} aria-label="OceanX home"><img src={mark} alt=""/><span>OCEAN<span className="brand-x">X</span></span></button>
   <nav className="home-nav"><button className="nav-active" onClick={()=>set('screen','home')}>Home</button><button onClick={openTwin}>Digital Twin</button><button onClick={()=>set('screen','observations')}>Observations</button><button onClick={()=>set('screen','insights')}>AI Insights</button><button onClick={()=>set('screen','analytics')}>Analytics</button></nav>
   <div className="top-status"><span className="status-dot"/> DEMO DATA CORE ONLINE</div><button className="icon-btn" onClick={()=>useOceanStore.getState().signOut()} title="Sign out"><LogOut size={17}/></button>
  </header>
  <section className="hero premium-hero">
   <div className="hero-content"><span className="eyebrow">BROWSER-NATIVE OCEAN DIGITAL TWIN / SIH26067</span><h1>The Ocean Connects<br/><em>Us All.</em></h1><p>Explore ocean state, observations, marine life and scientific analytics across a living 3D environment — from the surface to the deep ocean.</p><div className="hero-actions"><button className="primary-btn hero-btn" onClick={openTwin}>ENTER DIGITAL TWIN <ArrowRight size={18}/></button><button className="secondary-btn" onClick={()=>set('screen','ocean-info')}><Globe2 size={16}/> EXPLORE OCEAN DATA</button></div><div className="hero-tags"><span>REAL-TIME READY</span><span>SCIENTIFIC VISUALIZATION</span><span>EXPLAINABLE AI</span></div></div>
   <div className="hero-visual"><div className="hero-glow"/><img src={logo} alt="OceanX"/><div className="hero-data-ring"><span>MODEL</span><span>ARGO</span><span>AI</span><span>3D</span></div></div>
  </section>
  <section className="metric-row advanced-metrics"><div><Activity/><span><b>28.1°C</b> representative surface temperature<small>Model field • Indian Ocean</small></span></div><div><Compass/><span><b>0.42 m/s</b> representative current speed<small>Calculated demo signal</small></span></div><div><Database/><span><b>72 FIELD POINTS</b> active visualization<small>Deterministic demo provenance</small></span></div><div><Satellite/><span><b>ARGO READY</b> observation layer<small>Profiles • platform detail</small></span></div></section>
  <section className="ocean-facts panel-wide"><div className="section-head"><div><span className="eyebrow">OCEAN INFORMATION</span><h2>A scientific window into the global ocean</h2></div><button className="text-btn" onClick={()=>set('screen','ocean-info')}>Open ocean information <ChevronRight size={15}/></button></div><div className="fact-grid"><article><span>71%</span><strong>of Earth's surface</strong><p>Ocean coverage shapes weather, climate and planetary energy exchange.</p></article><article><span>3,682 m</span><strong>average depth</strong><p>From sunlit surface waters to complex deep-ocean layers.</p></article><article><span>~230,000</span><strong>marine species</strong><p>A living system observed through satellites, floats, gliders and ships.</p></article><article><span>50%</span><strong>planetary oxygen</strong><p>Marine ecosystems and phytoplankton support global biogeochemical cycles.</p></article></div></section>
  <section className="home-grid advanced-grid"><div className="panel regions-panel"><div className="section-head"><div><span className="eyebrow">REGIONAL WINDOWS</span><h2>Explore ocean regions</h2></div><span className="pill">07 SUPPORTED</span></div><div className="region-cards">{featured.map((r,i)=><button key={r.id} className="region-card premium-card" onClick={()=>openRegion(r.id)}><div className="region-index">0{i+1}</div><div className="region-icon"><Globe2 size={17}/></div><span>{r.type.toUpperCase()}</span><strong>{r.name}</strong><small>{r.facts[0]}</small><ChevronRight className="region-arrow" size={17}/></button>)}</div></div>
   <div className="panel science-panel"><div className="section-head"><div><span className="eyebrow">SCIENTIFIC DATA</span><h2>What OceanX can analyze</h2></div></div><div className="science-list">{variables.slice(0,7).map(v=><button key={v.id} onClick={()=>openVariable(v.id)}><span className="science-icon">{v.id==='temperature'?<Activity size={15}/>:v.id==='wind_speed'?<Wind size={15}/>:v.id==='current_speed'?<Navigation size={15}/>:v.id==='chlorophyll'?<Layers3 size={15}/>:<BarChart3 size={15}/>}</span><span><strong>{v.name}</strong><small>{v.min} to {v.max} {v.unit} • {v.source==='model'?'Model field':'Calculated'}</small></span><ChevronRight size={14}/></button>)}</div></div>
  </section>
  <section className="home-grid lower-grid"><div className="panel insight-preview"><div className="section-head"><div><span className="eyebrow">EXPLAINABLE INTELLIGENCE</span><h2>AI insights</h2></div><BrainCircuit size={20}/></div><div className="ai-preview-card"><span>DETERMINISTIC PROTOTYPE ANALYSIS</span><strong>Evidence before inference</strong><p>OceanX compares selected model fields and observations to surface useful signals, with provenance and limitations visible to the analyst.</p><button onClick={()=>set('screen','insights')}>Open insights <ArrowRight size={15}/></button></div></div><div className="panel news-panel"><div className="section-head"><div><span className="eyebrow">INFORMATION FEED</span><h2>Ocean briefs</h2></div><span className="pill">CURATED DEMO</span></div>{news.map(n=><article key={n.title}><span>{n.tag}</span><h3>{n.title}</h3><p>{n.summary}</p></article>)}</div></section>
  <footer className="premium-footer"><div><img src={mark} alt=""/><strong>OceanX</strong><span>From Surface to Seafloor — A Smarter Ocean, Together.</span></div><div className="footer-capabilities"><span>Interactive 3D globe</span><span>ARGO observations</span><span>Underwater exploration</span></div><div className="footer-legal"><b>© 2026 Team Apex Coders — All rights reserved</b><br/>SIH 2026 • SIH26067 {locked&&<><br/><LockKeyhole size={11}/> Exploration Access</>}</div></footer>
 </main>
}
