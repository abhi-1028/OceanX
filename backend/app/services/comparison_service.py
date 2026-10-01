import math
from .data_service import observation, synthetic_value, time_index

def compare(platform_id, variable, depth_m, time):
    o=observation(platform_id)
    if not o: raise KeyError('OBSERVATION_NOT_FOUND')
    p=min(o['profiles'], key=lambda x:abs(x['depth_m']-depth_m))
    key={'temperature':'temperature_c','salinity':'salinity_psu','chlorophyll':'chlorophyll_mg_m3'}[variable]
    observed=float(p[key]); ti=time_index(time); model=float(synthetic_value(variable,'indian' if 'IND' in platform_id or 'BOB' in platform_id or 'ARA' in platform_id else 'pacific',p['depth_m'],ti,o['latitude'],o['longitude']))
    diff=model-observed
    profile_pairs=[]
    for pp in o['profiles']:
        ov=float(pp[key]); mv=float(synthetic_value(variable,'indian' if 'IND' in platform_id or 'BOB' in platform_id or 'ARA' in platform_id else 'pacific',pp['depth_m'],ti,o['latitude'],o['longitude']))
        profile_pairs.append((mv-ov)**2)
    rmse=math.sqrt(sum(profile_pairs)/len(profile_pairs))
    return {'platform_id':platform_id,'variable':variable,'depth_m':p['depth_m'],'requested_depth_m':depth_m,'time':time,'observed':round(observed,4),'model':round(model,4),'difference':round(diff,4),'bias':round(diff,4),'rmse':round(rmse,4),'unit':{'temperature':'°C','salinity':'PSU','chlorophyll':'mg/m³'}[variable],'model_source':'simulated model field','observation_source':'demo observation profile','quality':o['quality'],'observation_timestamp':o['timestamp']}
