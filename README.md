# OceanX — SIH26067

OceanX is a browser-native interactive ocean digital twin prototype for SIH26067. It combines an interactive 3D Earth, deterministic demo model fields, in-situ observation profiles, regional scientific context, depth/time controls, underwater exploration, explainable prototype analytics and model-vs-observation comparison.

## Run locally

For the full Windows setup and judge demonstration sequence, see [`START_HERE.md`](START_HERE.md).

### Backend

```powershell
cd D:\OceanX\backend
.\.venv\Scripts\Activate.ps1
python -m pytest -q
uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`

Health check: `http://127.0.0.1:8000/api/v1/health`

### Frontend

Open a second terminal:

```powershell
cd D:\OceanX\frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173/`

Keep the backend terminal running while the frontend is open.

## Demo login

- User ID: `Team Apex Coders`
- Password: `SIH@2026`
- Or choose **CONTINUE AS GUEST** for Exploration Access.

Guest mode keeps the exploration flow available while locking advanced model–observation analysis and extended AI analytics.

## Main navigation

- Home
- Digital Twin
- Ocean Information
- Region Information
- Variable Information
- Observations
- AI Insights
- Analytics

The Digital Twin starts with **no scientific variable selected**. Select a region from the search/dropdown or click a highlighted region marker on the globe. The globe then focuses the selected geography.

## Immersive background + AI outlook

- Home and information/AI pages now sit over an asset-free procedural underwater 3D environment with deep-water fog, light shafts, seafloor relief, kelp, bubbles and drifting particles. Pointer movement subtly shifts the scene for a living depth effect.
- The **AI Insights** page now explains the current signal, confidence, evidence chain, drivers, validation targets and a 24–72 hour deterministic prototype outlook with a trajectory chart. Weather-related variables are surfaced as weather-relevant context, while the page clearly states that the outlook is not a validated operational forecast.

## Final Digital Twin capabilities

- Realistic 3D Earth presentation with atmospheric edge, clouds, normal/specular lighting and runtime public planet textures with local fallback.
- Region auto-focus + manual **RECENTER**.
- **DAY / NIGHT** presentation lighting.
- Ocean-only scientific heatmap masking.
- Variable-specific legends and units.
- Temperature, salinity, chlorophyll, current, wind, SSH, pressure and density controls.
- Depth/time controls.
- Observation markers and profile charts.
- Model ↔ observation comparison for T/S/chlorophyll with difference, bias and RMSE.
- Underwater dive mode.
- Deterministic explainable prototype insights.
- Provenance labels and guest access lock states.
- Responsive desktop/mobile layout.

## Data and provenance

The bundled demo data is deterministic and explicitly labelled as Model, Observation, Calculated, Simulated or Demo where appropriate. The prototype does not claim live operational forecasting or live vessel tracking. The backend keeps a service boundary for future NetCDF/xarray ingestion.

## Earth texture note

The globe prefers the public Three.js planet texture assets at runtime. If the remote assets cannot be loaded, the bundled local Earth map is used as a deterministic fallback. This means the prototype remains runnable offline, while the highest-fidelity Earth presentation is available when the runtime texture assets are reachable. Three.js TextureLoader documentation: https://threejs.org/docs/pages/TextureLoader.html

## Windows dependency + startup commands

### Backend

```powershell
cd D:\OceanX\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -m pytest -q
uvicorn app.main:app --reload
```

### Frontend

Open a second PowerShell window:

```powershell
cd D:\OceanX\frontend
npm install
npm run dev
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process Bypass` in that terminal and activate the environment again.

## Package hygiene

Do not commit `node_modules`, `.venv`, build output, caches or secrets. The final ZIP excludes these directories.

## Final interaction behavior

OceanX's Digital Twin is designed so that scientific controls have visible, explainable effects:

- **Depth** changes the deterministic model slice for depth-dependent variables such as temperature, salinity, chlorophyll, current speed, pressure and density.
- **Date** changes the deterministic model field and the model side of model-vs-observation comparison. The observation retains its own recorded timestamp, which is shown separately so users do not confuse a historical observation with a time-shifted measurement.
- **Surface variables** such as wind speed/direction and sea-surface height are explicitly marked as surface variables; changing water-column depth does not artificially alter them.
- **Recenter** aims the selected region at the actual globe camera direction.
- **Earth loading** starts with a deep-ocean fallback material instead of an unloaded white texture and upgrades to the high-resolution Earth asset when available.
- **Regional information** provides geographic center, extent, physical setting, circulation, seasonality, observing systems, scientific significance, marine-life context and human-activity context.

The prototype remains deterministic/offline-friendly and clearly labels simulated/demo provenance.
