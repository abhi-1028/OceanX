from __future__ import annotations
import json, math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import numpy as np
try:
 import xarray as xr
except Exception:
 xr=None

ROOT=Path(__file__).resolve().parents[3]
CATALOG=ROOT/'data'/'demo'/'catalog.json'
NETCDF=ROOT/'data'/'demo'/'oceanx_demo.nc'
CATALOG_DATA=json.loads(CATALOG.read_text())

def regions(): return CATALOG_DATA['regions']
def variables(): return CATALOG_DATA['variables']
def observations(): return CATALOG_DATA['observations']

def region(region_id):
    return next((r for r in regions() if r['id']==region_id), None)

def observation(platform_id):
    return next((o for o in observations() if o['platform_id']==platform_id), None)

def synthetic_value(variable:str, region_id:str, depth:float, time_index:int=2, lat:float=15, lon:float=80):
    phase=(sum(ord(c) for c in region_id)%17)/10
    if variable=='temperature': return 28.0 - 0.0072*depth + 0.55*math.sin(math.radians(lat*3)+phase) + 0.38*time_index
    if variable=='salinity': return 34.6 + 0.0017*depth + 0.12*math.cos(math.radians(lon+lat)+phase) + 0.045*time_index
    if variable=='chlorophyll': return max(0.05,1.65*math.exp(-depth/180)*(1+0.2*math.sin(math.radians(lat*5)+phase))*(1+0.055*time_index))
    if variable=='current_speed': return max(0.05,0.42+0.22*math.sin(math.radians(lon)+phase)+0.08*math.cos(depth/120)+0.045*time_index)
    if variable=='wind_speed': return 7.5+2.5*math.sin(math.radians(lat*2)+phase)+0.7*time_index
    if variable=='wind_direction': return (235+25*math.sin(math.radians(lon)+phase)+11*time_index)%360
    if variable=='sea_surface_height': return 0.15*math.sin(math.radians(lon*2+lat)+phase) + 0.028*time_index
    if variable=='pressure': return depth*1.01
    if variable=='density': return 1023.5+0.004*depth+0.2*math.sin(math.radians(lat)+phase)
    return 0.0

def time_index(time:str)->int:
    if time in CATALOG_DATA['times']:
        return CATALOG_DATA['times'].index(time)
    target=datetime.fromisoformat(time.replace('Z','+00:00')) if time else datetime.now(timezone.utc)
    return min(range(len(CATALOG_DATA['times'])), key=lambda i: abs(datetime.fromisoformat(CATALOG_DATA['times'][i].replace('Z','+00:00'))-target)) if CATALOG_DATA['times'] else 0

def model_field(region_id, variable, depth_m, time):
    r=region(region_id)
    if not r: raise KeyError('REGION_NOT_FOUND')
    ti=time_index(time)
    lat0,lon0=r['center'][1],r['center'][0]
    points=[]
    for i in range(72):
        a=(i/72)*math.tau
        rad=4.0 + 1.8*math.sin(i*1.7+ti)
        lat=lat0+math.sin(a)*rad
        lon=lon0+math.cos(a)*rad*1.4
        value=synthetic_value(variable,region_id,depth_m,ti,lat,lon)
        points.append({'latitude':round(lat,4),'longitude':round(lon,4),'value':round(value,4)})
    meta=next(v for v in variables() if v['id']==variable)
    return {'dataset_id':'oceanx-demo-v1','region_id':region_id,'variable':variable,'units':meta['unit'],'time':time,'depth_m':depth_m,'source':'simulated','quality':'simulated','points':points}

def profile(region_id, lat, lon, variable, time):
    vals=[]
    for d in CATALOG_DATA['depths']:
        vals.append({'depth_m':d,'value':round(synthetic_value(variable,region_id,d,time_index(time),lat,lon),4)})
    meta=next(v for v in variables() if v['id']==variable)
    return {'region_id':region_id,'variable':variable,'units':meta['unit'],'latitude':lat,'longitude':lon,'time':time,'source':'simulated','profile':vals}

def filtered_observations(region_id=None, platform_type=None, variable=None):
    r=region(region_id) if region_id else None
    data=observations()
    if platform_type: data=[o for o in data if o['platform_type']==platform_type]
    if r:
        data=[o for o in data if r['bbox'][0]<=o['longitude']<=r['bbox'][1] and r['bbox'][2]<=o['latitude']<=r['bbox'][3]]
    return data
