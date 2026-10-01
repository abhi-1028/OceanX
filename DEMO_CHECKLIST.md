# OceanX — Final Judge Demo Checklist

## 60–90 second core demo

- [ ] Login as `Team Apex Coders` / `SIH@2026`.
- [ ] Open Digital Twin.
- [ ] Point out **No variable selected**.
- [ ] Select Indian Ocean or Bay of Bengal.
- [ ] Show automatic globe focus.
- [ ] Rotate manually, then press **RECENTER**.
- [ ] Select Temperature.
- [ ] Explain: **Model field + ocean-only mask + variable legend**.
- [ ] Change depth from surface to 100 m and show the Field Snapshot depth/value update.
- [ ] Turn observations on/off.
- [ ] Click an ARGO/demo observation.
- [ ] Show profile chart.
- [ ] Press **Compare Model vs Observation**.
- [ ] Change the analysis date and show the comparison time/model value update; explain that the observation keeps its recorded timestamp.
- [ ] Point out Model, Observation, Signed Difference, Bias and RMSE.
- [ ] Toggle **NIGHT** lighting from the globe-stage control.
- [ ] Demonstrate **DIVE INTO OCEAN**.
- [ ] Return to surface and show AI Insight + provenance.
- [ ] From Home, open a region and show the detailed geographic locator + focused globe.

## Key explanation to judges

> OceanX is not only a 3D globe. The globe is the scientific interaction surface: a selected geography drives the model field, observation layer, depth/time state and model-versus-observation analysis. The current SIH prototype uses deterministic simulated data, clearly labels provenance, and is structured so NetCDF/xarray-backed scientific datasets can replace the demo service without changing the core interaction model.

## Technical stack

- React + Vite + TypeScript
- Three.js + React Three Fiber + Drei
- Zustand
- Recharts
- FastAPI + Pydantic
- NumPy / Pandas / xarray / netCDF4 architecture
- Pytest

## Important prototype boundary

Do not describe the bundled field as a live operational forecast. Use the terms **simulated**, **demo**, **calculated** and **observation** exactly as labelled in the UI.
