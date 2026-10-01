import { useEffect, useState } from 'react';
import { ArrowRight, Database, MapPin, Waves } from 'lucide-react';
import { PageShell } from './PageShell';
import { api } from '../../services/api';
import { useOceanStore } from '../../store/useOceanStore';
import type { Observation } from '../../types';

export function ObservationExplorer(){
 const s=useOceanStore(); const [items,setItems]=useState<Observation[]>([]);
 useEffect(()=>{const ids=s.regions.filter(r=>r.type==='ocean'||r.type==='region').map(r=>r.id);Promise.all(ids.map(id=>api.observations(id).catch(()=>({observations:[]})))).then(rs=>{const all=rs.flatMap(x=>x.observations);const seen=new Set<string>();setItems(all.filter(x=>!seen.has(x.platform_id)&&seen.add(x.platform_id)))})},[s.regions]);
 return <PageShell eyebrow="OBSERVATIONS / IN-SITU" title="Observation Explorer">
  <section className="info-hero compact"><div><span className="eyebrow">ARGO • GLIDER • CTD • BGC</span><h1>Observe the ocean<br/><em>beneath the surface.</em></h1><p>Inspect deterministic demonstration profiles, platform positions and vertical observations. The same platform can be selected directly on the 3D globe.</p></div><div className="ocean-orb small"><Database size={90}/><span>{items.length}<small>demo platforms</small></span></div></section>
  <div className="observation-grid">{items.map(o=><article key={o.platform_id}><div className="obs-card-top"><span className="platform-badge">{o.platform_type}</span><span>{o.quality}</span></div><h3>{o.platform_id}</h3><div className="obs-coords"><MapPin size={14}/>{o.latitude.toFixed(2)}°, {o.longitude.toFixed(2)}°</div><p>{o.profiles.length} vertical levels • {new Date(o.timestamp).toLocaleString()}</p><div className="profile-mini">{o.profiles.map(p=><span key={p.depth_m} style={{height:`${Math.max(10,Math.min(100,p.temperature_c*2.4))}%`}} title={`${p.depth_m}m`}/>)}</div><button onClick={()=>{s.set('regionId',o.platform_id.includes('PAC')?'pacific':o.platform_id.includes('ATL')?'atlantic':'indian');s.set('screen','twin')}}>OPEN IN DIGITAL TWIN <ArrowRight size={14}/></button></article>)}</div>
  <div className="source-line"><Waves size={13}/> Provenance: deterministic demo observations bundled with OceanX. They are labelled simulated and are not live operational observations.</div>
 </PageShell>
}
