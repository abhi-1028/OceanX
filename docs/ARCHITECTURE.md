# OceanX Architecture

Browser UI is separated from scientific services. React/R3F manages interaction and visualization state; FastAPI exposes normalized contracts; scientific functions remain in backend services so demo datasets can later be replaced by public NetCDF/API sources without rewriting the UI.

## Provenance model
Every scientific output is labelled as model, observation, calculated, simulated/demo, or AI-derived. This distinction is part of the product contract rather than decorative UI.
