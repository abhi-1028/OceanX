import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Float } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import textureUrl from '../../assets/earth-texture.png';
import type { Observation, Region } from '../../types';

const R = 2.45;
const EARTH_MAP = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_NORMAL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg';
const EARTH_SPECULAR = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg';
const EARTH_CLOUDS = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png';

function pos(lat:number,lon:number,r=R){const phi=(90-lat)*Math.PI/180,theta=(lon+180)*Math.PI/180;return[-(r*Math.sin(phi)*Math.cos(theta)),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)] as [number,number,number]}
function UnderwaterEnvironment({depth}:{depth:number}){
 const particles=useMemo(()=>Array.from({length:180},(_,i)=>({x:(Math.random()-.5)*10,y:(Math.random()-.5)*8,z:(Math.random()-.5)*10,s:.008+Math.random()*.018})),[]);
 return <group>{particles.map((p,i)=><mesh key={i} position={[p.x,p.y,p.z]}><sphereGeometry args={[p.s,6,6]}/><meshBasicMaterial color={i%7===0?'#9ef4ff':'#4bc7ee'} transparent opacity={.42} /></mesh>)}<mesh scale={[6,6,6]}><sphereGeometry args={[1,48,48]}/><meshBasicMaterial color="#087db5" transparent opacity={.035} side={THREE.BackSide}/></mesh><Html position={[-3.1,2.2,0]}><div className="dive-depth-readout"><span>SUBSURFACE DIVE</span><b>{depth} m</b><small>Water-column exploration</small></div></Html></group>
}

function colorForValue(t:number){
 const stops=[[0,'#2448ff'],[.2,'#00a9ff'],[.42,'#14d9c0'],[.62,'#39e56b'],[.78,'#ffe14a'],[.9,'#ff8a36'],[1,'#ff3e3e']] as const;
 const clamped=Math.max(0,Math.min(1,t));
 for(let i=1;i<stops.length;i++) if(clamped<=stops[i][0]){const [a,ca]=stops[i-1];const [b,cb]=stops[i];const x=(clamped-a)/(b-a);return new THREE.Color(ca).lerp(new THREE.Color(cb),x)}
 return new THREE.Color(stops[stops.length-1][1]);
}

function heatmapTexture(field:{latitude:number;longitude:number;value:number}[],variable:string,baseImage?:HTMLImageElement){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d')!;const image=ctx.createImageData(canvas.width,canvas.height);
 const ranges:Record<string,[number,number]>={temperature:[-2,35],salinity:[30,40],chlorophyll:[0,4],wind_speed:[0,22],current_speed:[0,2.2],wind_direction:[0,360],sea_surface_height:[-1,1],pressure:[0,1000],density:[1020,1030]};
 const [min,max]=ranges[variable]||[0,1];
 const points=field.map(p=>({u:(p.longitude+180)/360,v:(90-p.latitude)/180,value:Math.max(0,Math.min(1,(p.value-min)/(max-min)))}));
 const sigma=.034,sigma2=sigma*sigma*2;
 let baseCtx:CanvasRenderingContext2D|null=null;
 if(baseImage){try{const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;baseCtx=c.getContext('2d');baseCtx?.drawImage(baseImage,0,0,canvas.width,canvas.height);baseCtx?.getImageData(0,0,1,1)}catch{baseCtx=null}}
 for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++){
   const u=(x+.5)/canvas.width,v=(y+.5)/canvas.height;let weightSum=0,valueSum=0;
   for(const p of points){let du=Math.abs(u-p.u);du=Math.min(du,1-du);const dv=v-p.v;const d2=du*du+dv*dv;if(d2>.055)continue;const w=Math.exp(-d2/sigma2);weightSum+=w;valueSum+=w*p.value}
   const idx=(y*canvas.width+x)*4;if(weightSum<.12){image.data[idx+3]=0;continue}
   const t=valueSum/weightSum,c=colorForValue(t);
   let oceanMask=1;
   if(baseCtx){const px=baseCtx.getImageData(x,y,1,1).data;const r=px[0]/255,g=px[1]/255,b=px[2]/255;const ocean=(b-r*.62)+(b-g*.52);const land=(g-r*.15)+(r-b*.15);oceanMask=Math.max(0,Math.min(1,(ocean-land*.18)*4.2));if(r>.82&&g>.82&&b>.82)oceanMask=.12}
   const alpha=Math.round(Math.min(145,28+118*(1-Math.exp(-weightSum*1.6)))*oceanMask);
   image.data[idx]=Math.round(c.r*255);image.data[idx+1]=Math.round(c.g*255);image.data[idx+2]=Math.round(c.b*255);image.data[idx+3]=alpha;
 }
 ctx.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;return texture;
}

function solidTexture(r:number,g:number,b:number,a=255){const data=new Uint8Array([r,g,b,a]);const t=new THREE.DataTexture(data,1,1,THREE.RGBAFormat);t.needsUpdate=true;return t}
function Earth({regions,selected,onSelect,observations,showObs,field,variable,dive,depth,lightingMode,recenterSignal}:{regions:Region[];selected:string;onSelect:(id:string)=>void;observations:Observation[];showObs:boolean;field:{latitude:number;longitude:number;value:number}[];variable:string;dive:boolean;depth:number;lightingMode:'day'|'night';recenterSignal:number}){
 const {camera}=useThree();
 const controls=useRef<any>(null);const globeRef=useRef<THREE.Group>(null);const cloudRef=useRef<THREE.Mesh>(null);
 const [texture,setTexture]=useState<THREE.Texture>(()=>{
   // Start from a real ocean-blue material instead of an unloaded TextureLoader
   // texture. Three.js textures load asynchronously; an unloaded map otherwise
   // renders as a bright white sphere for a moment.
   return solidTexture(8,62,104);
 });
 const [normal,setNormal]=useState<THREE.Texture>(()=>solidTexture(128,128,255));
 const [specular,setSpecular]=useState<THREE.Texture>(()=>solidTexture(18,18,18));
 const [clouds,setClouds]=useState<THREE.Texture>();
 const [maskImage,setMaskImage]=useState<HTMLImageElement>();
 const [earthReady,setEarthReady]=useState(false);
 const targetQuaternion=useRef(new THREE.Quaternion());const rotating=useRef(false);
 useEffect(()=>{
   const loader=new THREE.TextureLoader();
   loader.setCrossOrigin('anonymous');

   const applyEarthMap=(t:THREE.Texture)=>{
     t.colorSpace=THREE.SRGBColorSpace;
     t.anisotropy=8;
     setTexture(t);
     if(t.image) setMaskImage(t.image as HTMLImageElement);
     setEarthReady(true);
   };

   // Prefer the high-resolution Three.js planet texture. If it is unavailable,
   // the bundled map is loaded instead. Either way the initial blue sphere keeps
   // the renderer visually stable while the image is decoded.
   loader.load(EARTH_MAP,applyEarthMap,undefined,()=>{
     loader.load(textureUrl,applyEarthMap,undefined,()=>setEarthReady(false));
   });
   loader.load(EARTH_NORMAL,t=>{t.colorSpace=THREE.LinearSRGBColorSpace;t.anisotropy=4;setNormal(t)},undefined,()=>{});
   loader.load(EARTH_SPECULAR,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;setSpecular(t)},undefined,()=>{});
   loader.load(EARTH_CLOUDS,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;setClouds(t)},undefined,()=>{});
 },[]);
 useEffect(()=>{
   // Recenter means reset the camera orbit as well as the globe orientation.
   // Without this, OrbitControls can leave the camera looking from a different
   // azimuth and a mathematically correct globe rotation can still appear off-center.
   camera.position.set(0,1.05,7.2);
   if(controls.current){controls.current.target.set(0,0,0);controls.current.update()}
   if(!selected){targetQuaternion.current.identity();rotating.current=true;return}
   const r=regions.find(x=>x.id===selected);if(!r||!globeRef.current)return;
   const p=new THREE.Vector3(...pos(r.center[1],r.center[0],1)).normalize();
   // Aim the selected geographic vector at the actual camera direction.
   // The camera sits slightly above the equator, so using a hard-coded +Z
   // direction leaves the selected region visibly off-center.
   const cameraDirection=camera.position.clone().normalize();
   targetQuaternion.current.setFromUnitVectors(p,cameraDirection);
   rotating.current=true;
 },[selected,regions,recenterSignal,camera]);
 useEffect(()=>{if(controls.current){controls.current.target.set(0,0,0);controls.current.update()}camera.position.set(0,1.05,7.2)},[camera]);
 useFrame((_,delta)=>{if(cloudRef.current&&!dive){cloudRef.current.rotation.y+=delta*0.018}if(rotating.current&&globeRef.current){globeRef.current.quaternion.slerp(targetQuaternion.current,.075);if(globeRef.current.quaternion.angleTo(targetQuaternion.current)<.002){globeRef.current.quaternion.copy(targetQuaternion.current);rotating.current=false}}});
 const effectiveMaskImage=maskImage||(texture?.image as HTMLImageElement|undefined);
 const heatmap=useMemo(()=>field.length&&variable?heatmapTexture(field,variable,effectiveMaskImage):null,[field,variable,effectiveMaskImage]);useEffect(()=>()=>heatmap?.dispose(),[heatmap]);
 return <>
  <group ref={globeRef}>
   {!dive&&<>
    <mesh>
      <sphereGeometry args={[R,192,192]}/>
      <meshPhongMaterial map={texture} normalMap={normal} normalScale={new THREE.Vector2(.55,.55)} specularMap={specular} specular={new THREE.Color('#bfeaff')} shininess={16} color={lightingMode==='night'?'#7fa7c2':'#ffffff'} emissive={new THREE.Color(lightingMode==='night'?'#001426':'#000000')} emissiveIntensity={lightingMode==='night'?.38:0}/>
    </mesh>
    {clouds&&<mesh ref={cloudRef} scale={[1.012,1.012,1.012]}><sphereGeometry args={[R,160,160]}/><meshPhongMaterial map={clouds} transparent opacity={lightingMode==='night'?.18:.28} depthWrite={false} blending={THREE.AdditiveBlending} color="#dff9ff"/></mesh>}
    {heatmap&&<mesh scale={[1.006,1.006,1.006]}><sphereGeometry args={[R,192,192]}/><meshBasicMaterial map={heatmap} transparent opacity={lightingMode==='night'?.48:.58} depthWrite={false} toneMapped={false}/></mesh>}
    <mesh scale={[1.018,1.018,1.018]}><sphereGeometry args={[R,128,128]}/><meshBasicMaterial color="#7be9ff" transparent opacity={.055} side={THREE.BackSide}/></mesh>
    <mesh scale={[1.045,1.045,1.045]}><sphereGeometry args={[R,96,96]}/><meshBasicMaterial color="#3dcfff" transparent opacity={.055} side={THREE.BackSide} blending={THREE.AdditiveBlending}/></mesh>
   </>}
   {regions.map(r=>{const p=pos(r.center[1],r.center[0],R+.13);const active=r.id===selected;return <group key={`region-${r.id}`} position={p}><Float speed={active?3:1.2} rotationIntensity={0} floatIntensity={active?.12:0}><mesh onClick={e=>{e.stopPropagation();onSelect(r.id)}}><sphereGeometry args={[active?.13:.055,18,18]}/><meshBasicMaterial color={active?'#ffffff':'#39d9ff'} toneMapped={false}/></mesh>{active&&<mesh scale={[2.4,2.4,2.4]}><ringGeometry args={[.055,.085,40]}/><meshBasicMaterial color="#63e9ff" transparent opacity={.85} side={THREE.DoubleSide}/></mesh>}</Float>{active&&<Html distanceFactor={8}><div className="globe-label"><b>{r.name}</b><small>{r.center[1].toFixed(1)}°, {r.center[0].toFixed(1)}°</small></div></Html>}</group>})}
   {showObs&&observations.map(o=>{const p=pos(o.latitude,o.longitude,R+.12);return <group key={o.platform_id} position={p}><mesh><sphereGeometry args={[.04,12,12]}/><meshBasicMaterial color={o.platform_type==='ARGO'?'#ffe06b':'#63f4ce'} toneMapped={false}/></mesh><Html distanceFactor={10}><button className="obs-pin" onClick={e=>{e.stopPropagation();window.dispatchEvent(new CustomEvent('oceanx-observation',{detail:o.platform_id}))}}>{o.platform_id.replace(/-.*/,'')}</button></Html></group>})}
   {dive&&<UnderwaterEnvironment depth={depth}/>} 
  </group>
  {!earthReady&&!dive&&<Html center position={[0,0,0]} style={{pointerEvents:'none'}}><div className="earth-sync"><span>EARTH ASSET SYNC</span><b>Preparing global surface</b><small>OceanX scientific globe</small></div></Html>}
  <OrbitControls ref={controls} enablePan={false} enableRotate enableZoom minDistance={dive?.8:3.5} maxDistance={dive?2.6:10} enableDamping dampingFactor={.08} rotateSpeed={.55} zoomSpeed={.8} autoRotate={false} target={[0,0,0]}/>
 </>
}

export function GlobeScene(props:{regions:Region[];selected:string;onSelect:(id:string)=>void;observations:Observation[];showObs:boolean;field:{latitude:number;longitude:number;value:number}[];variable:string;dive:boolean;depth?:number;lightingMode?:'day'|'night';recenterSignal?:number}){
 const night=props.lightingMode==='night';
 return <Canvas camera={{position:[0,1.05,7.2],fov:42}} dpr={[1,1.6]} gl={{antialias:true,powerPreference:'high-performance'}}><color attach="background" args={[night?'#01040a':'#010a14']}/><ambientLight intensity={night?.24:.72}/><hemisphereLight args={['#dff8ff','#06152a',night?.62:1.25]}/><directionalLight position={[5,4,7]} intensity={night?.95:3.7} color="#fff7e7"/><directionalLight position={[-4,-2,3]} intensity={night?.55:1.35} color="#62d9ff"/><pointLight position={[-2,3,5]} intensity={night?.65:1.25} color="#66ddff"/><Stars radius={55} depth={35} count={1300} factor={1.45} saturation={.25} fade speed={.1}/><Earth {...props} depth={props.depth||0} lightingMode={props.lightingMode||'day'} recenterSignal={props.recenterSignal||0}/></Canvas>
}
