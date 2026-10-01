import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BrainCircuit,
  ChevronDown,
  Crosshair,
  Eye,
  EyeOff,
  GitCompareArrows,
  Info,
  Layers3,
  LockKeyhole,
  LogOut,
  Moon,
  RotateCcw,
  Search,
  ShipWheel,
  Sun,
  Wind,
} from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';
import { useOceanStore } from '../../store/useOceanStore';
import { GlobeScene } from '../globe/GlobeScene';
import type { Observation } from '../../types';
import mark from '../../assets/oceanx-mark.png';

const depthMarks = [0, 10, 50, 100, 500, 1000];
const timeMarks = [
  '2026-09-24T00:00:00Z',
  '2026-09-25T00:00:00Z',
  '2026-09-26T00:00:00Z',
  '2026-09-27T00:00:00Z',
  '2026-09-28T00:00:00Z',
];
const comparisonVariables = ['temperature', 'salinity', 'chlorophyll'];
const visualVariables = [
  'temperature',
  'salinity',
  'chlorophyll',
  'current_speed',
  'wind_speed',
  'wind_direction',
  'sea_surface_height',
  'pressure',
  'density',
];

export function DigitalTwin() {
  const s = useOceanStore();
  const [search, setSearch] = useState('');
  const [obs, setObs] = useState<Observation[]>([]);
  const [field, setField] = useState<{ latitude: number; longitude: number; value: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [comparisonBusy, setComparisonBusy] = useState(false);
  const [lightingMode, setLightingMode] = useState<'day' | 'night'>('day');
  const [recenterSignal, setRecenterSignal] = useState(0);

  const selected = s.regions.find((r) => r.id === s.regionId);
  const variable = s.variables.find((v) => v.id === s.variableId);
  const fieldAverage = useMemo(() => field.length ? field.reduce((sum, point) => sum + point.value, 0) / field.length : null, [field]);
  const fieldRange = useMemo(() => field.length ? { min: Math.min(...field.map((p) => p.value)), max: Math.max(...field.map((p) => p.value)) } : null, [field]);

  useEffect(() => {
    if (!selected) {
      setObs([]);
      return;
    }
    api.observations(selected.id).then((r) => setObs(r.observations)).catch(() => setObs([]));
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || !variable) {
      setField([]);
      return;
    }

    setBusy(true);
    fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/model/field?region_id=${selected.id}&variable=${variable.id}&depth_m=${s.depth}&time=${encodeURIComponent(s.time)}`,
      { cache: 'no-store' },
    )
      .then((r) => r.json())
      .then((x) => setField(x.points || []))
      .catch(() => setField([]))
      .finally(() => setBusy(false));

    if (!s.user?.guest) {
      api
        .insight(selected.id, variable.id, s.depth, s.time)
        .then((x) => s.set('insight', x))
        .catch(() => {});
    }
  }, [selected?.id, variable?.id, s.depth, s.time, s.user?.guest]);

  useEffect(() => {
    if (!s.selectedObservation || s.user?.guest || !comparisonVariables.includes(s.variableId)) {
      setComparisonBusy(false);
      if (!s.selectedObservation || !comparisonVariables.includes(s.variableId)) s.set('comparison', undefined);
      return;
    }

    let cancelled = false;
    setComparisonBusy(true);
    s.set('comparison', undefined);
    api
      .comparison(s.selectedObservation.platform_id, s.variableId, s.depth, s.time)
      .then((comparison) => {
        if (!cancelled) s.set('comparison', comparison);
      })
      .catch(() => {
        if (!cancelled) s.set('comparison', undefined);
      })
      .finally(() => {
        if (!cancelled) setComparisonBusy(false);
      });

    return () => { cancelled = true; };
  }, [s.selectedObservation?.platform_id, s.variableId, s.depth, s.time, s.user?.guest]);

  useEffect(() => {
    const handleObservation = (event: Event) => {
      const id = (event as CustomEvent).detail as string;
      api.observation(id).then((observation) => {
        s.set('selectedObservation', observation);
      });
    };

    const closeObservation = () => {
      s.set('selectedObservation', undefined);
      s.set('comparison', undefined);
    };

    window.addEventListener('oceanx-observation', handleObservation);
    window.addEventListener('oceanx-observation-close', closeObservation);
    return () => {
      window.removeEventListener('oceanx-observation', handleObservation);
      window.removeEventListener('oceanx-observation-close', closeObservation);
    };
  }, [s]);

  const matches = useMemo(
    () =>
      search
        ? s.regions.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
        : [],
    [search, s.regions],
  );

  const select = (id: string) => {
    s.set('regionId', id);
    setSearch('');
    s.set('dive', false);
    s.set('selectedObservation', undefined);
    s.set('comparison', undefined);
    s.set('insight', undefined);
  };

  const chooseVariable = (id: string) => {
    s.set('variableId', id);
    s.set('selectedObservation', undefined);
    s.set('comparison', undefined);
    s.set('insight', undefined);
  };

  const compareModelObservation = () => {
    if (!selected || !variable || !obs.length || s.user?.guest) return;
    const nearest = obs
      .slice()
      .sort((a, b) => {
        const da = Math.hypot(a.latitude - selected.center[1], a.longitude - selected.center[0]);
        const db = Math.hypot(b.latitude - selected.center[1], b.longitude - selected.center[0]);
        return da - db;
      })[0];

    s.set('selectedObservation', nearest);
  };

  const recenter = () => setRecenterSignal((value) => value + 1);

  const reset = () => {
    s.set('regionId', '');
    s.set('variableId', '');
    s.set('depth', 0);
    s.set('insight', undefined);
    s.set('dive', false);
    s.set('selectedObservation', undefined);
    s.set('comparison', undefined);
    setSearch('');
    setLightingMode('day');
    setRecenterSignal((value) => value + 1);
  };

  return (
    <main className={s.dive ? 'twin dive' : 'twin'}>
      <header className="twin-top">
        <button className="icon-btn" onClick={() => s.set('screen', 'home')} title="Back home">
          <ArrowLeft size={18} />
        </button>
        <div className="brand brand-image twin-brand">
          <img src={mark} alt="" />
          <span>
            OCEAN<span className="brand-x">X</span>
          </span>
        </div>
        <div className="breadcrumb">
          <span>DIGITAL TWIN</span>
          <i>/</i>
          <strong>{selected?.name || 'No region selected'}</strong>
        </div>
        <div className="top-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ocean, sea or region…"
          />
          {matches.length > 0 && (
            <div className="search-menu">
              {matches.map((region) => (
                <button key={region.id} onClick={() => select(region.id)}>
                  <span>{region.type}</span>
                  {region.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="icon-btn" onClick={reset} title="Reset scene">
          <RotateCcw size={17} />
        </button>
        <button className="icon-btn" onClick={() => useOceanStore.getState().signOut()} title="Sign out">
          <LogOut size={17} />
        </button>
      </header>

      <div className="twin-layout">
        <aside className="control-panel glass">
          <div className="panel-title">
            <span className="eyebrow">SCIENTIFIC CONTROLS</span>
            <h2>Ocean state</h2>
          </div>

          <label className="field-label">
            REGION
            <div className="select-wrap">
              <select value={s.regionId} onChange={(event) => select(event.target.value)}>
                <option value="">Select an ocean or region…</option>
                {s.regions.map((region) => (
                  <option value={region.id} key={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </label>

          <div className="control-section">
            <span className="field-label">VARIABLE</span>
            <div className="var-grid">
              {s.variables
                .filter((v) => visualVariables.includes(v.id))
                .map((v) => (
                  <button
                    className={v.id === s.variableId ? 'active' : ''}
                    key={v.id}
                    onClick={() => chooseVariable(v.id)}
                  >
                    <span>{v.name}</span>
                    <small>{v.unit}</small>
                  </button>
                ))}
            </div>

            {selected && variable && (
              <div className="variable-actions">
                <button
                  className="compare-action"
                  disabled={!obs.length || !!s.user?.guest || !comparisonVariables.includes(variable.id)}
                  onClick={compareModelObservation}
                >
                  <Activity size={14} />
                  <span>Compare Model vs Observation</span>
                  <small>
                    {s.user?.guest
                      ? 'SIGN IN REQUIRED'
                      : !comparisonVariables.includes(variable.id)
                        ? 'T / S / CHL ONLY'
                        : obs.length
                          ? 'READY TO COMPARE'
                          : 'LOADING OBSERVATIONS…'}
                  </small>
                </button>
                {s.user?.guest && (
                  <div className="compare-lock-note">
                    <LockKeyhole size={12} /> Advanced comparison is available after sign in.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="control-section">
            <div className="row-label">
              <span className="field-label">DEPTH / WATER COLUMN</span>
              <b>{s.depth} m</b>
            </div>
            <input
              className="range"
              type="range"
              min="0"
              max="1000"
              step="10"
              value={s.depth}
              disabled={!!variable && !variable.depth}
              title={variable && !variable.depth ? 'This is a surface variable; depth does not change this field.' : 'Change water-column depth'}
              onChange={(event) => s.set('depth', Number(event.target.value))}
            />
            <div className="range-labels">
              {depthMarks.map((depth) => (
                <button
                  key={depth}
                  onClick={() => s.set('depth', depth)}
                  className={s.depth === depth ? 'chosen' : ''}
                >
                  {depth}
                </button>
              ))}
            </div>
            <small className="control-hint">{variable && !variable.depth ? 'Surface variable • depth slice held at surface' : 'Depth changes the model field and comparison slice.'}</small>
          </div>

          <div className="control-section">
            <div className="row-label">
              <span className="field-label">TIME</span>
              <b>{new Date(s.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</b>
            </div>
            <div className="timeline">
              {timeMarks.map((time) => (
                <button
                  key={time}
                  onClick={() => s.set('time', time)}
                  className={s.time === time ? 'chosen' : ''}
                >
                  <i />
                  <span>{new Date(time).getDate()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-section layer-list">
            <span className="field-label">OBSERVATIONS</span>
            <button onClick={() => s.set('showObservations', !s.showObservations)}>
              <span>
                <Layers3 size={16} /> ARGO / GLIDER / CTD / BGC
              </span>
              {s.showObservations ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <button
            disabled={!selected}
            className={s.dive ? 'dive-btn active' : 'dive-btn'}
            onClick={() => s.set('dive', !s.dive)}
          >
            <ShipWheel size={17} />
            {s.dive ? 'RETURN TO SURFACE' : 'DIVE INTO OCEAN'}
          </button>
        </aside>

        <section className="globe-stage">
          <div className="stage-hud">
            <div>
              <span className="eyebrow">ACTIVE VARIABLE</span>
              <strong>{variable?.name || 'No variable selected'}</strong>
              <small>
                {variable
                  ? `${variable.unit} • ${s.depth}m • ${new Date(s.time).toLocaleDateString()}`
                  : 'Choose a scientific variable to begin'}
              </small>
            </div>
            {variable && (
              <div className="source-chip">
                <i /> {variable.source === 'model' ? 'MODEL FIELD' : 'CALCULATED'} <span>• DEMO</span>
              </div>
            )}
          </div>

          <div className="globe-wrap">
            <div className="interaction-hint">
              <span>DRAG</span> rotate <i /> <span>SCROLL</span> zoom <i /> <span>CLICK</span> select
            </div>
            <div className="stage-tools">
              <button onClick={recenter} disabled={!selected} title="Recenter selected region">
                <Crosshair size={14} />
                <span>RECENTER</span>
              </button>
              <button
                onClick={() => setLightingMode((mode) => (mode === 'day' ? 'night' : 'day'))}
                title="Toggle day/night lighting"
              >
                {lightingMode === 'day' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{lightingMode === 'day' ? 'NIGHT' : 'DAY'}</span>
              </button>
            </div>

            <GlobeScene
              regions={s.regions}
              selected={s.regionId}
              onSelect={select}
              observations={obs}
              showObs={s.showObservations}
              field={field}
              variable={s.variableId}
              dive={s.dive}
              depth={s.depth}
              lightingMode={lightingMode}
              recenterSignal={recenterSignal}
            />

            {selected && variable && field.length > 0 && (
              <div className="color-legend">
                <span>
                  {variable.min} {variable.unit}
                </span>
                <i />
                <span>
                  {variable.max} {variable.unit}
                </span>
                <b>{variable.name} • OCEAN-MASKED FIELD</b>
              </div>
            )}

            {busy && <div className="field-loading">UPDATING FIELD…</div>}

            {s.dive && selected && (
              <div className="depth-hud">
                <span>SUBSURFACE EXPLORATION</span>
                <b>{s.depth} m</b>
                <small>Water-column context active</small>
              </div>
            )}

            {!selected && !s.dive && (
              <div className="empty-globe-hud">
                <span>GLOBAL EXPLORATION MODE</span>
                <b>Select an ocean or region</b>
                <small>Select a region, then choose a variable to activate the scientific field.</small>
              </div>
            )}
          </div>

          <div className="stage-bottom">
            <div className="mini-stat">
              <span>REGION</span>
              <b>{selected?.name || '—'}</b>
            </div>
            <div className="mini-stat">
              <span>FIELD POINTS</span>
              <b>{field.length}</b>
            </div>
            <div className="mini-stat">
              <span>FIELD MASK</span>
              <b>{variable ? 'OCEAN ONLY' : 'INACTIVE'}</b>
            </div>
            <div className="mini-stat">
              <span>PROVENANCE</span>
              <b>{selected ? 'SIMULATED' : 'GLOBAL'}</b>
            </div>
          </div>

          <div className="team-watermark">OceanX • Team Apex Coders • © 2026 All rights reserved</div>
        </section>

        <aside className="insight-panel glass">
          <div className="panel-title">
            <span className="eyebrow">CONTEXT / ANALYTICS</span>
            <h2>{selected?.name || 'Select a region'}</h2>
          </div>

          {selected ? (
            <>
              <div className="region-facts">
                {selected.facts.map((fact) => (
                  <span key={fact}>{fact}</span>
                ))}
              </div>

              {s.selectedObservation ? (
                <ObservationCard
                  observation={s.selectedObservation}
                  comparison={s.comparison}
                  comparisonBusy={comparisonBusy}
                  variable={s.variableId}
                  guest={!!s.user?.guest}
                />
              ) : (
                <>
                  {variable ? (
                    <div className="info-card">
                      <div className="info-head">
                        <Activity size={16} />
                        <span>FIELD SNAPSHOT</span>
                      </div>
                      <strong>
                        {fieldAverage !== null ? fieldAverage.toFixed(2) : '—'}{' '}
                        <small>{variable.unit}</small>
                      </strong>
                      <div className="field-metrics">
                        <span><small>DEPTH</small><b>{s.depth} m</b></span>
                        <span><small>RANGE</small><b>{fieldRange ? `${fieldRange.min.toFixed(2)}–${fieldRange.max.toFixed(2)}` : '—'}</b></span>
                        <span><small>TIME</small><b>{new Date(s.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</b></span>
                      </div>
                      <p>
                        Mean of the active model-field sample. Changing depth or analysis date regenerates this deterministic demo field.
                      </p>
                    </div>
                  ) : (
                    <div className="info-card variable-empty-card">
                      <div className="info-head">
                        <Activity size={16} />
                        <span>FIELD SNAPSHOT</span>
                      </div>
                      <strong>No variable selected</strong>
                      <p>Choose a scientific variable from the left panel to load the model field.</p>
                    </div>
                  )}

                  <div className="info-card ai-card">
                    <div className="info-head">
                      <BrainCircuit size={16} />
                      <span>AI INSIGHT</span>
                    </div>
                    {s.user?.guest ? (
                      <>
                        <strong>Advanced analysis locked</strong>
                        <p>
                          Sign in to Team Apex Coders access to unlock extended scientific insights and model–observation
                          analysis.
                        </p>
                        <button className="lock-action" onClick={() => s.signOut()}>
                          <LockKeyhole size={14} /> Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        <strong>{s.insight?.title || 'Building insight…'}</strong>
                        <p>
                          {s.insight?.summary ||
                            'Select a region and variable to generate a deterministic, evidence-backed insight.'}
                        </p>
                        {s.insight && (
                          <div className="evidence-row">
                            {s.insight.evidence.map((evidence) => (
                              <span key={evidence.label}>
                                <small>{evidence.label}</small>
                                <b>
                                  {evidence.value} {evidence.unit}
                                </b>
                              </span>
                            ))}
                          </div>
                        )}
                        <small className="limitation">{s.insight?.limitations}</small>
                      </>
                    )}
                  </div>

                  <div className="info-card">
                    <div className="info-head">
                      <Wind size={16} />
                      <span>DATA PROVENANCE</span>
                    </div>
                    <div className="provenance">
                      <span>
                        <i className="dot model" /> Model
                      </span>
                      <span>
                        <i className="dot obs" /> Observation
                      </span>
                      <span>
                        <i className="dot calc" /> Calculated
                      </span>
                      <span>
                        <i className="dot sim" /> Simulated / Demo
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="empty-state-card">
              <div className="mini-globe-wrap">
                <GlobeScene
                  regions={s.regions}
                  selected=""
                  onSelect={select}
                  observations={[]}
                  showObs={false}
                  field={[]}
                  variable=""
                  dive={false}
                  lightingMode={lightingMode}
                  recenterSignal={recenterSignal}
                />
              </div>
              <p>Choose a region from the dropdown, search, or click a highlighted location on the globe.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function ObservationCard({
  observation,
  comparison,
  comparisonBusy,
  variable,
  guest,
}: {
  observation: Observation;
  comparison?: any;
  comparisonBusy: boolean;
  variable: string;
  guest: boolean;
}) {
  const profiles = observation.profiles;
  const key = variable === 'temperature' ? 'temperature_c' : variable === 'salinity' ? 'salinity_psu' : 'chlorophyll_mg_m3';
  const variableLabel =
    variable === 'temperature'
      ? 'Temperature'
      : variable === 'salinity'
        ? 'Salinity'
        : variable === 'chlorophyll'
          ? 'Chlorophyll'
          : variable;

  return (
    <div className="obs-detail">
      <div className="obs-head">
        <div>
          <span className="eyebrow">SELECTED PLATFORM</span>
          <h3>{observation.platform_id}</h3>
        </div>
        <button
          className="icon-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('oceanx-observation-close'))}
          title="Close observation"
        >
          <Info size={16} />
        </button>
      </div>

      <div className="obs-meta">
        <span>
          TYPE <b>{observation.platform_type}</b>
        </span>
        <span>
          LAT <b>{observation.latitude.toFixed(2)}°</b>
        </span>
        <span>
          LON <b>{observation.longitude.toFixed(2)}°</b>
        </span>
        <span>
          QUALITY <b>{observation.quality}</b>
        </span>
      </div>

      <div className="profile-list">
        {profiles.map((profile) => (
          <div key={profile.depth_m}>
            <span>{profile.depth_m}m</span>
            <i
              style={{
                width: `${Math.max(6, Math.min(100, ((profile[key] as number) - 25) * 14))}%`,
              }}
            />
            <b>{(profile[key] as number).toFixed(2)}</b>
          </div>
        ))}
      </div>

      <div className="profile-chart">
        <div className="eyebrow">PROFILE • {variableLabel.toUpperCase()}</div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={profiles}>
            <XAxis dataKey="depth_m" tick={{ fontSize: 8, fill: '#587781' }} />
            <YAxis tick={{ fontSize: 8, fill: '#587781' }} width={34} />
            <Tooltip
              contentStyle={{
                background: '#07151e',
                border: '1px solid rgba(157,210,221,.14)',
                fontSize: 10,
              }}
            />
            <Line type="monotone" dataKey={key} stroke="#55dfff" dot={{ r: 2 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {comparisonBusy && !guest && (
        <div className="comparison-updating"><span className="pulse-dot" /> Recomputing model ↔ observation for the selected depth and analysis date…</div>
      )}

      {comparison && !guest && (
        <div className="compare-box">
          <div className="compare-title">
            <div>
              <span className="eyebrow">MODEL ↔ OBSERVATION • {new Date(comparison.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <strong>
                {variableLabel} at {comparison.depth_m} m
              </strong>
            </div>
            <GitCompareArrows size={18} />
          </div>

          <div className="compare-values">
            <div>
              <small>MODEL</small>
              <b>
                {comparison.model} {comparison.unit}
              </b>
            </div>
            <div>
              <small>OBSERVATION</small>
              <b>
                {comparison.observed} {comparison.unit}
              </b>
            </div>
          </div>

          <div className="comparison-meter">
            <div>
              <span
                style={{
                  width: `${Math.max(
                    4,
                    Math.min(
                      100,
                      (Math.abs(comparison.model) /
                        (Math.abs(comparison.model) + Math.abs(comparison.observed) || 1)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="compare-metrics">
            <div>
              <span>SIGNED DIFFERENCE</span>
              <b>
                {comparison.difference > 0 ? '+' : ''}
                {comparison.difference} {comparison.unit}
              </b>
            </div>
            <div>
              <span>BIAS</span>
              <b>
                {comparison.bias > 0 ? '+' : ''}
                {comparison.bias} {comparison.unit}
              </b>
            </div>
            <div>
              <span>PROFILE RMSE</span>
              <b>
                {comparison.rmse} {comparison.unit}
              </b>
            </div>
          </div>

          <small className="compare-source">
            Analysis time: {new Date(comparison.time).toLocaleString('en-IN')} • Observation timestamp: {new Date(observation.timestamp).toLocaleString('en-IN')}
            <br />Model: {comparison.model_source} • Observation: {comparison.observation_source}
          </small>
        </div>
      )}

      {guest && (
        <div className="locked-inline">
          <LockKeyhole size={14} /> Advanced model–observation comparison is locked for guest access.
        </div>
      )}

      <div className="source-line">
        Source: {observation.source} • timestamp {new Date(observation.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
