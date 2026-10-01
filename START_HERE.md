# OceanX — SIH26067 Final Prototype

OceanX is the final SIH26067 browser-based ocean digital-twin prototype for Team Apex Coders. The package preserves the complete OceanX flow and finalizes the Digital Twin as the main scientific demonstration surface.

## Final immersive experience

- New procedural **underwater 3D background** on Home and information/AI pages: deep-water fog, volumetric-style light rays, seafloor relief, kelp, drifting particles and bubbles. It responds subtly to pointer movement and click energy without blocking UI controls. The background is asset-free and remains functional offline. Three.js supports scene fog and water/lighting techniques that inform this visual approach.
- Expanded **AI Insights** page with evidence, confidence, drivers, validation targets and a clearly labelled 24–72 hour prototype outlook. The outlook can describe possible changes in ocean state or weather-related forcing, includes a scenario trajectory chart, and is explicitly not an operational forecast.

## Final Digital Twin feature set

- Real 3D interactive Earth scene with high-resolution geometry, atmosphere, clouds, normal/specular lighting and a realistic Earth texture when the runtime Three.js planet assets are reachable.
- Bundled local Earth-map fallback so the scene renders immediately without a white-sphere flash; the cinematic startup screen also pre-warms the high-resolution Earth assets.
- Smooth geographic focus when an ocean/region is selected, using a geographic-vector quaternion so the chosen location is centered correctly.
- **RECENTER** control for the selected region after manual globe rotation.
- **DAY / NIGHT** lighting toggle positioned in a dedicated stage toolbar for clean presentation.
- Differential cloud rotation above the Earth surface.
- No default scientific variable when Digital Twin opens.
- Ocean-only scientific field masking so model overlays remain concentrated around ocean/model areas instead of painting the entire globe.
- Variable-specific numeric legend using each variable's configured min/max/unit.
- Scientific variables: temperature, salinity, chlorophyll, currents, wind speed/direction, sea-surface height, pressure and density.
- Depth and time controls with date-aware model-field updates; comparison values refresh when depth or date changes.
- ARGO / GLIDER / CTD / BGC observation layer architecture, with bundled demo observation profiles.
- Clickable observation platforms with profile charts and metadata.
- Connected **Model ↔ Observation** comparison view for temperature, salinity and chlorophyll with model value, observation value, signed difference, bias and profile RMSE.
- Deterministic explainable AI insight cards for signed-in access.
- Guest Exploration Access with advanced comparison/analysis locked.
- Underwater dive mode with depth HUD and water-column particle environment.
- Responsive laptop/tablet/mobile layout.
- Region information pages with richer physical, ecological, circulation, observing, scientific-significance and geographic-extent context plus a highlighted 3D globe location.
- Provenance labels for Model, Observation, Calculated and Simulated/Demo data.

## Scientific/demo data boundary

The current SIH prototype uses deterministic bundled demo data. The model field is explicitly labelled **simulated/demo** and is not presented as a live operational ocean forecast. The backend is structured so NetCDF/xarray-backed data can replace the deterministic service later without changing the frontend workflow.

## Backend

Use Python 3.12 on Windows. The dependency file pins FastAPI, Uvicorn, Pydantic, NumPy, pandas, xarray, NetCDF4, pytest, httpx and multipart support.

```powershell
cd D:\OceanX\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -m pytest -q
uvicorn app.main:app --reload
```

Backend health: `http://127.0.0.1:8000/api/v1/health`

## Frontend

The frontend dependency file includes React, React DOM, Vite, TypeScript, Three.js, React Three Fiber, Drei, Zustand, Recharts and Lucide. Open a second terminal:

```powershell
cd D:\OceanX\frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo login

- User ID: `Team Apex Coders`
- Password: `SIH@2026`
- Or choose **CONTINUE AS GUEST** for Exploration Access.

## Recommended judge demonstration order

1. Login with the demo account.
2. Open **Digital Twin**.
3. Point out that no variable is selected initially.
4. Select **Indian Ocean**, **Bay of Bengal**, **Arabian Sea**, **Pacific**, **Atlantic**, **Southern** or **Arctic** from the region control/search.
5. Show the automatic geographic focus, then use **RECENTER** after rotating the globe manually.
6. Select Temperature and show the ocean-masked scientific field + variable-specific legend.
7. Change depth and time to demonstrate the field updating.
8. Toggle observations and select an ARGO/demo platform to open its profile.
9. Use **Compare Model vs Observation** and show model, observation, difference, bias and RMSE together.
10. Toggle **NIGHT** lighting and briefly demonstrate **DIVE INTO OCEAN**.
11. Return to surface and show the AI insight/provenance panel.
12. Optionally repeat the exploration as Guest to demonstrate the intentional advanced-analysis lock.

## Validation status

- Backend test suite: 5 tests passing in the packaging environment.
- Frontend source syntax was checked with the TypeScript compiler; full dependency-backed Vite build should be run on the Windows machine after `npm install`.
- The sandbox environment used to package this project does not contain the frontend `node_modules` and cannot download npm packages, so it is not used to claim a production Vite build here.

## AI outlook boundary

The AI Insights page now includes a short-term **prototype scenario outlook**. It is deterministic and explainable: selected field → baseline comparison → local trend → bounded scenario trajectory. It can surface weather-relevant signals for variables such as wind, temperature, currents and sea-surface height, but it must not be presented to judges as a validated weather forecast. The UI keeps this limitation visible.

## Texture note

The realistic Earth presentation prefers the public Three.js planet texture assets at runtime. Three.js documents `TextureLoader` as the standard texture-loading path and `MeshPhongMaterial` as a material supporting map, normal and specular textures. If those remote assets are unavailable, OceanX falls back to the bundled Earth map so the globe remains functional. Three.js TextureLoader documentation: https://threejs.org/docs/pages/TextureLoader.html

## Package hygiene

Do not commit or distribute `node_modules`, `.venv`, `__pycache__`, `.pytest_cache`, `dist`, build caches or secrets. The final ZIP intentionally excludes them.


## Final Digital Twin interaction fixes
- The globe never starts as a white sphere: it begins with a deep-ocean fallback material while high-resolution Earth assets decode, then upgrades to the photorealistic Earth texture.
- The right-side locator globe uses the same Earth renderer and no longer shows an empty white sphere.
- RECENTER now aims the selected geographic center at the actual camera direction rather than a fixed world axis.
- Day/Night controls sit inside the globe stage without overlapping the scientific header.
- Depth changes regenerate depth-dependent model fields and model–observation comparisons. Surface-only variables explicitly show that depth is not applicable.
- Changing the analysis date regenerates the deterministic model field and comparison. The comparison panel shows the selected analysis time separately from the fixed observation timestamp.
- Region information now includes a geographic locator, representative center, geographic extent, physical setting, circulation, seasonality, observing systems, scientific significance, marine life and human-activity context.
- Region pages use the same interactive Earth renderer with the selected region centered and a locator crosshair.
