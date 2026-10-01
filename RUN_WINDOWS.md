# OceanX — Windows Run Guide

## 1. Requirements
- Python 3.12
- Node.js + npm
- Windows PowerShell

## 2. Backend

```powershell
cd D:\OceanX\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -m pytest -q
uvicorn app.main:app --reload
```

Keep this terminal running. API: http://127.0.0.1:8000

## 3. Frontend

Open a second PowerShell terminal:

```powershell
cd D:\OceanX\frontend
npm install
npm run dev
```

Open http://localhost:5173

## 4. Login

- User ID: `Team Apex Coders`
- Password: `SIH@2026`

## 5. If PowerShell blocks virtual-environment activation

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\.venv\Scripts\Activate.ps1
```

## 6. Final demo flow

Home → Digital Twin → region → variable → depth → date → observations → Model vs Observation → AI Insights → 24–72h prototype outlook → Dive Mode.

The AI outlook is deterministic demo inference, not a validated operational forecast.
