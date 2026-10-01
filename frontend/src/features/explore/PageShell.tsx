import type { ReactNode } from 'react';
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { useOceanStore } from '../../store/useOceanStore';
import mark from '../../assets/oceanx-mark.png';
import { UnderwaterBackground } from './UnderwaterBackground';

export function PageShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
 const { set, user } = useOceanStore();
 return <main className="explore-page"><UnderwaterBackground />
  <header className="explore-topbar"><button className="icon-btn" onClick={()=>set('screen','home')} title="Back home"><ArrowLeft size={18}/></button><button className="brand brand-image" onClick={()=>set('screen','home')}><img src={mark} alt=""/><span>OCEAN<span className="brand-x">X</span></span></button><div className="explore-title"><span>{eyebrow}</span><strong>{title}</strong></div><div className="explore-actions"><button className="top-link" onClick={()=>set('screen','home')}><Home size={15}/> Home</button><span className="signed-in">{user?.display_name || 'Explorer'}</span><button className="icon-btn" onClick={()=>useOceanStore.getState().signOut()} title="Sign out"><LogOut size={16}/></button></div></header>
  <div className="explore-body">{children}</div>
 </main>
}
