import { FormEvent, useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Satellite, Activity, Waves } from 'lucide-react';
import { api } from '../../services/api';
import { useOceanStore } from '../../store/useOceanStore';
import logo from '../../assets/oceanx-logo.png';

export function Login() {
  const set = useOceanStore(s => s.set);
  const [uid, setUid] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const r = await api.login(uid.trim(), pw);
      set('user', r.user); set('screen', 'home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to authenticate');
    } finally { setBusy(false); }
  }

  function guest() {
    set('user', { id: 'guest', display_name: 'Guest Explorer', guest: true });
    set('screen', 'home');
  }

  return <main className="auth-shell">
    <div className="auth-visual">
      <div className="auth-water"/><div className="auth-grid"/>
      <div className="auth-orbit o1"/><div className="auth-orbit o2"/>
      <img src={logo} alt="OceanX" className="auth-logo"/>
      <div className="auth-copy"><span className="eyebrow">OCEANX / MISSION CONTROL</span><h1>The ocean is a<br/><em>living system.</em></h1><p>Connect model fields, in-situ observations and explainable analytics in one browser-native scientific workspace.</p>
        <div className="auth-metrics"><span><b>07</b> regions</span><span><b>09</b> variables</span><span><b>3D</b> scientific globe</span></div>
      </div>
      <div className="auth-feature-strip"><span><Satellite size={15}/> MODEL FIELDS</span><span><Activity size={15}/> OBSERVATIONS</span><span><Waves size={15}/> OCEAN LIFE</span></div>
    </div>
    <section className="auth-card">
      <div className="auth-card-brand"><img src={logo} alt="OceanX"/></div>
      <span className="eyebrow">SECURE DEMO ACCESS</span><h2>Welcome to OceanX</h2><p className="muted">Sign in for the complete scientific console, or explore the public demo as a guest.</p>
      <form onSubmit={submit}>
        <label>User ID<input value={uid} onChange={e=>setUid(e.target.value)} autoComplete="username" placeholder="Enter your User ID" required/></label>
        <label>Password<div className="password-wrap"><input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required/><button type="button" onClick={()=>setShow(!show)} aria-label="Toggle password visibility">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
        {error&&<div className="error-box">{error}</div>}
        <button className="primary-btn" disabled={busy||!uid||!pw}>{busy?'AUTHENTICATING…':'LOGIN'}<ArrowRight size={18}/></button>
      </form>
      <button className="secondary-btn guest-btn" onClick={guest}>CONTINUE AS GUEST <Waves size={16}/></button>
      <div className="guest-note"><ShieldCheck size={16}/><span>Exploration Access: home, ocean information, 3D globe, observations, profiles and underwater dive. Advanced analysis remains locked.</span></div>
      <div className="login-owner">© 2026 Team Apex Coders — All rights reserved</div>
    </section>
  </main>
}
