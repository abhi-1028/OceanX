from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_health(): assert client.get('/api/v1/health').status_code==200
def test_login():
 r=client.post('/api/v1/auth/login',json={'user_id':'Team Apex Coders','password':'SIH@2026'}); assert r.status_code==200 and r.json()['authenticated']
def test_regions_variables():
 assert len(client.get('/api/v1/regions').json()['regions'])>=7
 assert len(client.get('/api/v1/variables').json()['variables'])>=6
def test_comparison_insight():
 assert client.get('/api/v1/comparison',params={'observation_id':'ARGO-BOB-001','variable':'temperature','depth_m':100}).status_code==200
 assert client.get('/api/v1/insights',params={'region_id':'bay-of-bengal','variable':'temperature','depth_m':100}).status_code==200


def test_depth_and_time_change():
 r0=client.get('/api/v1/model/field',params={'region_id':'bay-of-bengal','variable':'temperature','depth_m':0,'time':'2026-09-28T00:00:00Z'}).json()
 r1=client.get('/api/v1/model/field',params={'region_id':'bay-of-bengal','variable':'temperature','depth_m':1000,'time':'2026-09-28T00:00:00Z'}).json()
 assert r0['points'][0]['value'] != r1['points'][0]['value']
 c0=client.get('/api/v1/comparison',params={'observation_id':'ARGO-BOB-001','variable':'temperature','depth_m':100,'time':'2026-09-24T00:00:00Z'}).json()
 c1=client.get('/api/v1/comparison',params={'observation_id':'ARGO-BOB-001','variable':'temperature','depth_m':100,'time':'2026-09-28T00:00:00Z'}).json()
 assert c0['time'] != c1['time'] and c0['model'] != c1['model']
