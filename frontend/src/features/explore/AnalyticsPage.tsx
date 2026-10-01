import { BarChart3, ArrowRight, LockKeyhole, Activity, Database } from 'lucide-react';
import { PageShell } from './PageShell';
import { useOceanStore } from '../../store/useOceanStore';

export function AnalyticsPage(){
 const s=useOceanStore();
 if(s.user?.guest) return <PageShell eyebrow="ANALYTICS / ADVANCED" title="Analytics"><section className="locked-panel"><LockKeyhole size={36}/><span className="eyebrow">EXPLORATION ACCESS</span><h1>Advanced Analysis Locked</h1><p>Sign in to Team Apex Coders access to unlock model–observation comparison, advanced analytics and extended scientific insights.</p><button className="primary-btn" onClick={()=>s.signOut()}>RETURN TO LOGIN</button></section></PageShell>;
 return <PageShell eyebrow="ANALYTICS / SCIENTIFIC WORKSPACE" title="Ocean Analytics">
  <section className="analytics-hero"><BarChart3 size={42}/><div><span className="eyebrow">MODEL ↔ OBSERVATION</span><h1>Compare, quantify, explain.</h1><p>Use the Digital Twin to select a real region, variable, depth and time. Then inspect observation profiles and deterministic comparison metrics.</p></div></section>
  <div className="analytics-cards"><article><Activity/><strong>Field coverage</strong><b>72</b><span>demo sampled points</span></article><article><Database/><strong>Observation platforms</strong><b>07</b><span>ARGO / GLIDER / CTD / BGC</span></article><article><BarChart3/><strong>Comparison metrics</strong><b>RMSE</b><span>difference • bias • quality</span></article></div>
  <section className="analytics-workflow"><div><span className="eyebrow">WORKFLOW</span><h2>One scientific path</h2><ol><li>Choose the real ocean region on the globe.</li><li>Choose a physical or biogeochemical variable.</li><li>Adjust depth and time.</li><li>Open an in-situ platform and inspect its profile.</li><li>Compare model and observation values with provenance labels.</li></ol></div><button className="primary-btn" onClick={()=>s.set('screen','twin')}>START ANALYSIS <ArrowRight size={16}/></button></section>
 </PageShell>
}
