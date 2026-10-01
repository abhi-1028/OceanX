import type {Comparison,Insight,Observation,Region,Variable} from '../types';
export const API=import.meta.env.VITE_API_BASE_URL||'http://127.0.0.1:8000/api/v1';
async function request<T>(path:string, init?:RequestInit):Promise<T>{const r=await fetch(`${API}${path}`,{cache:'no-store',...init}); if(!r.ok){let m='Request failed';try{const j=await r.json();m=j.detail?.error?.message||m}catch{} throw new Error(m)} return r.json();}
export const api={
 login:(user_id:string,password:string)=>request<{authenticated:boolean;user:{id:string;display_name:string}}>('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id,password})}),
 regions:()=>request<{regions:Region[]}>('/regions'), variables:()=>request<{variables:Variable[]}>('/variables'),
 observations:(region:string)=>request<{observations:Observation[]}>(`/observations?region_id=${encodeURIComponent(region)}&limit=100`),
 observation:(id:string)=>request<Observation>(`/observations/${encodeURIComponent(id)}`),
 comparison:(id:string,variable:string,depth:number,time:string)=>request<Comparison>(`/comparison?observation_id=${encodeURIComponent(id)}&variable=${variable}&depth_m=${depth}&time=${encodeURIComponent(time)}`),
 insight:(region:string,variable:string,depth:number,time:string)=>request<Insight>(`/insights?region_id=${region}&variable=${variable}&depth_m=${depth}&time=${encodeURIComponent(time)}`),
 news:()=>request<{source_type:string;items:{id:string;title:string;summary:string;tag:string}[]}>('/news'),
};
