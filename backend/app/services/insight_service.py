from datetime import datetime, timedelta, timezone
import math
from .data_service import synthetic_value, region, variables

UNIT = {
    'temperature':'°C','salinity':'PSU','chlorophyll':'mg/m³','current_speed':'m/s',
    'wind_speed':'m/s','wind_direction':'°','sea_surface_height':'m','pressure':'dbar','density':'kg/m³'
}

DESCRIPTIONS = {
    'temperature': ('thermal state', 'air–sea heat exchange and upper-ocean stratification'),
    'salinity': ('salinity structure', 'freshwater input, evaporation and water-mass mixing'),
    'chlorophyll': ('productivity signal', 'light, nutrients, mixing and phytoplankton response'),
    'current_speed': ('current intensity', 'transport, mixing and regional circulation'),
    'wind_speed': ('wind forcing', 'surface stress, wave generation and air–sea exchange'),
    'wind_direction': ('wind direction', 'surface forcing and regional transport'),
    'sea_surface_height': ('sea-level signal', 'pressure gradients and large-scale circulation'),
    'pressure': ('pressure profile', 'water-column depth and hydrostatic structure'),
    'density': ('water-mass density', 'temperature, salinity and stratification'),
}


def _parse_time(value: str) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def _future_value(variable, region_id, depth_m, lat, lon, base_index, hours, phase):
    """Deterministic scenario extrapolation used only for the prototype outlook."""
    current = synthetic_value(variable, region_id, depth_m, base_index, lat, lon)
    previous = synthetic_value(variable, region_id, depth_m, base_index - 1, lat, lon)
    next_step = synthetic_value(variable, region_id, depth_m, base_index + 1, lat, lon)
    local_trend = next_step - previous
    trend_per_day = local_trend / 2.0
    # Add a small deterministic oscillation so the outlook is not a flat persistence line.
    amplitudes = {
        'temperature': 0.20, 'salinity': 0.035, 'chlorophyll': 0.08, 'current_speed': 0.055,
        'wind_speed': 0.55, 'wind_direction': 7.0, 'sea_surface_height': 0.018,
        'pressure': 0.0, 'density': 0.025,
    }
    amp = amplitudes.get(variable, 0.05)
    oscillation = amp * math.sin((hours / 24.0) * math.tau / 2.4 + phase)
    projected = current + trend_per_day * (hours / 24.0) + oscillation
    return projected, trend_per_day


def insight(region_id, variable, depth_m, time):
    r = region(region_id)
    if not r:
        raise KeyError('REGION_NOT_FOUND')
    meta = next((v for v in variables() if v['id'] == variable), None)
    if not meta:
        raise KeyError('VARIABLE_NOT_FOUND')

    lat, lon = r['center'][1], r['center'][0]
    # Keep the deterministic demo engine aligned to the five available model dates.
    base_dt = _parse_time(time)
    anchor = datetime(2026, 9, 24, tzinfo=timezone.utc)
    base_index = max(0, min(4, int(round((base_dt - anchor).total_seconds() / 86400))))
    phase = (sum(ord(c) for c in region_id) % 17) / 10
    current = synthetic_value(variable, region_id, depth_m, base_index, lat, lon)
    baseline = synthetic_value(variable, region_id, depth_m, 0, lat, lon)
    diff = current - baseline
    pct = abs(diff) / (abs(baseline) or 1) * 100
    direction = 'above' if diff >= 0 else 'below'
    unit = UNIT.get(variable, '')
    label, drivers = DESCRIPTIONS.get(variable, (variable.replace('_', ' '), 'regional ocean dynamics'))

    points = []
    for hours in (0, 12, 24, 48, 72):
        value, _ = _future_value(variable, region_id, depth_m, lat, lon, base_index, hours, phase)
        if variable == 'wind_direction':
            value %= 360
        if variable == 'chlorophyll':
            value = max(0.01, value)
        points.append({'hours_ahead': hours, 'value': round(value, 3), 'label': 'Now' if hours == 0 else f'+{hours}h'})

    projected_24 = points[2]['value']
    projected_48 = points[3]['value']
    delta24 = projected_24 - points[0]['value']
    delta48 = projected_48 - points[0]['value']
    forecast_pct = abs(delta24) / (abs(points[0]['value']) or 1) * 100
    confidence = round(max(.58, min(.91, .78 - forecast_pct * 0.006)), 2)
    trend_word = 'increase' if delta24 > 0.005 else 'decrease' if delta24 < -0.005 else 'remain broadly stable'

    weather_relevance = variable in {'temperature', 'wind_speed', 'wind_direction', 'sea_surface_height', 'current_speed'}
    if variable == 'wind_speed':
        outlook = f'Prototype outlook: surface wind forcing may {trend_word} over the next 24 hours, with a projected value near {projected_24:.2f} {unit}.'
        watch = ['changes in wind forcing', 'surface wave response', 'air–sea exchange conditions']
    elif variable == 'temperature':
        outlook = f'Prototype outlook: the selected thermal signal may {trend_word} over the next 24 hours, reaching about {projected_24:.2f} {unit} at the selected depth.'
        watch = ['upper-ocean stratification', 'air–sea heat exchange', 'persistence of the thermal anomaly']
    elif variable == 'current_speed':
        outlook = f'Prototype outlook: regional current intensity may {trend_word} over the next 24 hours, with an indicative value near {projected_24:.2f} {unit}.'
        watch = ['transport intensity', 'mixing conditions', 'observation/model agreement']
    elif variable == 'chlorophyll':
        outlook = f'Prototype outlook: the productivity signal may {trend_word} over the next 24 hours, with an indicative concentration near {projected_24:.2f} {unit}.'
        watch = ['surface productivity', 'mixing and nutrient availability', 'future satellite/ARGO-BGC agreement']
    elif variable == 'salinity':
        outlook = f'Prototype outlook: the selected salinity signal may {trend_word} over the next 24 hours, approaching {projected_24:.3f} {unit}.'
        watch = ['freshwater or evaporation forcing', 'water-mass mixing', 'profile observations']
    elif variable == 'wind_direction':
        outlook = f'Prototype outlook: the surface wind direction may evolve toward approximately {projected_24:.0f}° over the next 24 hours.'
        watch = ['directional wind shifts', 'surface transport', 'regional weather forcing']
    elif variable == 'sea_surface_height':
        outlook = f'Prototype outlook: the sea-surface-height signal may {trend_word}, with an indicative value near {projected_24:.3f} {unit}.'
        watch = ['pressure-gradient changes', 'circulation response', 'coastal observations where available']
    else:
        outlook = f'Prototype outlook: the selected {label} may {trend_word} over the next 24 hours.'
        watch = ['depth dependence', 'profile observations', 'model persistence']

    summary = f'{r["name"]} shows a {abs(diff):.2f}{unit} signal {direction} the bundled reference baseline at {depth_m} m.'
    return {
        'type': 'ANOMALY_WITH_OUTLOOK',
        'title': f'{label.title()} + next-window outlook',
        'summary': summary,
        'region': r['name'],
        'variable': variable,
        'depth_m': depth_m,
        'time': time,
        'evidence': [
            {'label': 'Selected value', 'value': round(current, 3), 'unit': unit},
            {'label': 'Demo baseline', 'value': round(baseline, 3), 'unit': unit},
            {'label': 'Absolute change', 'value': round(abs(diff), 3), 'unit': unit},
        ],
        'confidence': round(max(.62, min(.94, .62 + pct / 100)), 2),
        'source': 'calculated from bundled simulated dataset',
        'limitations': 'The outlook is a deterministic prototype scenario based on persistence + local synthetic trend. It is not a validated weather forecast or operational prediction product.',
        'forecast': {
            'horizon_hours': 24,
            'outlook': outlook,
            'projected_value': projected_24,
            'projected_value_48h': projected_48,
            'change_24h': round(delta24, 3),
            'change_48h': round(delta48, 3),
            'change_percent_24h': round(forecast_pct, 2),
            'unit': unit,
            'confidence': confidence,
            'drivers': [drivers],
            'watch_for': watch,
            'weather_relevance': weather_relevance,
            'method': 'Deterministic persistence + local trend + bounded oscillation',
            'series': points,
        }
    }
