from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import Optional
import os, uuid, json
from .schemas.api import LoginRequest, PredictRequest
from .services.data_service import regions, region, variables, model_field, profile, filtered_observations, observation
from .services.comparison_service import compare
from .services.insight_service import insight

app=FastAPI(title='OceanX API',version='1.0.0',description='SIH26067 Ocean Digital Twin API')
origins=os.getenv('CORS_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',')
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])

def err(code,msg,status=400): raise HTTPException(status_code=status,detail={'error':{'code':code,'message':msg,'request_id':str(uuid.uuid4())}})

@app.get('/api/v1/health')
def health(): return {'status':'ok','service':'oceanx-api','demo_mode':True}

@app.post('/api/v1/auth/login')
def login(body:LoginRequest):
    uid=os.getenv('DEMO_USER_ID','Team Apex Coders'); pwd=os.getenv('DEMO_PASSWORD','SIH@2026')
    if body.user_id!=uid or body.password!=pwd: err('INVALID_CREDENTIALS','Invalid demo credentials.',401)
    return {'authenticated':True,'user':{'id':uid,'display_name':'Demo Ocean Analyst'}}

@app.get('/api/v1/regions')
def get_regions(): return {'regions':regions()}
@app.get('/api/v1/regions/{region_id}')
def get_region(region_id:str):
    r=region(region_id)
    if not r: err('REGION_NOT_FOUND','Unsupported ocean or region.',404)
    return r
@app.get('/api/v1/variables')
def get_variables(): return {'variables':variables()}

@app.get('/api/v1/model/field')
def get_field(region_id:str, variable:str, depth_m:float=0, time:str='2026-09-26T00:00:00Z'):
    try: return model_field(region_id,variable,depth_m,time)
    except KeyError as e: err(str(e).strip("'"),'Requested field is not available.',404)
@app.get('/api/v1/model/profile')
def get_profile(region_id:str,latitude:float,longitude:float,variable:str,time:str='2026-09-26T00:00:00Z'): return profile(region_id,latitude,longitude,variable,time)

@app.get('/api/v1/observations')
def get_observations(region_id:Optional[str]=None,platform_type:Optional[str]=None,variable:Optional[str]=None,limit:int=100):
    return {'observations':filtered_observations(region_id,platform_type,variable)[:max(1,min(limit,200))]}
@app.get('/api/v1/observations/{platform_id}')
def get_observation(platform_id:str):
    o=observation(platform_id)
    if not o: err('OBSERVATION_NOT_FOUND','Observation platform was not found.',404)
    return o
@app.get('/api/v1/comparison')
def get_comparison(observation_id:str,variable:str,depth_m:float=100,time:str='2026-09-26T00:00:00Z'):
    try: return compare(observation_id,variable,depth_m,time)
    except KeyError as e: err(str(e).strip("'"),'Comparison is unavailable for the requested variable/platform.',400)
@app.get('/api/v1/insights')
def get_insight(region_id:str,variable:str,depth_m:float=100,time:str='2026-09-26T00:00:00Z'): return insight(region_id,variable,depth_m,time)
@app.post('/api/v1/insights/predict')
def predict(body:PredictRequest):
    vals=list(body.features.values()); base=sum(vals)/len(vals) if vals else 0
    return {'type':'AI_PREDICTION','variable':body.variable,'prediction':round(base,4),'unit':{'temperature':'°C','salinity':'PSU','chlorophyll':'mg/m³'}.get(body.variable,''),'horizon_hours':body.horizon_hours,'uncertainty':'Not scientifically validated','limitations':'Prototype statistical persistence estimate; not a validated forecast model.','model_version':'demo-persistence-0.1'}

@app.get('/api/v1/news')
def news():
    return {'source_type':'curated_demo','items':[
      {'id':'n1','title':'Monsoon season reshapes Indian Ocean upper-layer structure','summary':'A demo briefing on how seasonal forcing changes surface and subsurface conditions.','tag':'SCIENCE BRIEF'},
      {'id':'n2','title':'Argo profiles expand the ocean observing picture','summary':'Explore how autonomous profiling floats provide repeated temperature and salinity observations.','tag':'OBSERVATIONS'},
      {'id':'n3','title':'From model grids to interactive digital twins','summary':'OceanX demonstrates a browser-native path from multidimensional data to visual analysis.','tag':'DIGITAL TWIN'}]}

@app.post('/api/v1/datasets/validate')
async def validate_dataset(file:UploadFile=File(...)):
    name=file.filename or ''; ext=Path(name).suffix.lower()
    if ext not in {'.nc','.netcdf'}: err('UNSUPPORTED_FILE','Only NetCDF files are accepted by the prototype.',400)
    content=await file.read();
    if len(content)>50*1024*1024: err('FILE_TOO_LARGE','Dataset exceeds the 50 MB prototype limit.',400)
    return {'valid':True,'filename':name,'size_bytes':len(content),'message':'File type and size accepted. Full scientific validation remains dataset-dependent.'}

@app.get('/api/v1/datasets/demo')
def demo_dataset(): return {'dataset_id':'oceanx-demo-v1','format':'NetCDF + JSON catalog','path':'data/demo/oceanx_demo.nc','source_type':'simulated'}
