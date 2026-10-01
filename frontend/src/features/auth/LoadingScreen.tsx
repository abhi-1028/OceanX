import { useEffect, useState } from 'react';
import logo from '../../assets/oceanx-logo.png';

export function LoadingScreen(){
  const [progress,setProgress]=useState(8);
  useEffect(()=>{
    const started=performance.now();
    const id=window.setInterval(()=>{
      const elapsed=performance.now()-started;
      setProgress(Math.min(96,8+elapsed/26));
    },50);
    return()=>window.clearInterval(id);
  },[]);
  return <div className="loading-screen">
    <div className="loading-grid"/>
    <div className="loading-aura"/>
    <div className="loading-orbit orbit-a"><span/></div>
    <div className="loading-orbit orbit-b"><span/></div>
    <div className="loading-logo-wrap"><img src={logo} alt="OceanX" className="loading-logo"/></div>
    <div className="loading-copy">
      <span className="eyebrow">SIH26067 • SCIENTIFIC OCEAN DIGITAL TWIN</span>
      <h1>EXPLORE <em>•</em> ANALYZE <em>•</em> PRESERVE</h1>
      <p>Initializing the OceanX scientific visualization workspace</p>
    </div>
    <div className="loading-progress"><div style={{width:`${progress}%`}}/><span>{Math.round(progress)}%</span></div>
    <div className="loading-meta"><span>MODEL LAYER</span><i/> <span>OBSERVATIONS</span><i/> <span>ANALYTICS</span><i/> <span>3D ENGINE</span></div>
    <small>TEAM APEX CODERS • DEMO BUILD • 2026</small>
  </div>
}
