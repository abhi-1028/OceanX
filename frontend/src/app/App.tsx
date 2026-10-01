import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useOceanStore } from '../store/useOceanStore';
import { LoadingScreen } from '../features/auth/LoadingScreen';
import { Login } from '../features/auth/Login';
import { Home } from '../features/home/Home';
import { DigitalTwin } from '../features/digital-twin/DigitalTwin';
import { OceanInfo } from '../features/explore/OceanInfo';
import { RegionInfo } from '../features/explore/RegionInfo';
import { VariableInfo } from '../features/explore/VariableInfo';
import { ObservationExplorer } from '../features/explore/ObservationExplorer';
import { InsightsPage } from '../features/explore/InsightsPage';
import { AnalyticsPage } from '../features/explore/AnalyticsPage';

export function App() {
  const [loading, setLoading] = useState(true);
  const { screen, set } = useOceanStore();

  useEffect(() => {
    // Warm the Earth assets during the cinematic startup screen so the first
    // Digital Twin frame is already textured instead of briefly showing an empty sphere.
    const earthAssets = [
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
    ];
    earthAssets.forEach((src) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = src;
    });

    Promise.all([api.regions(), api.variables()])
      .then(([r, v]) => {
        set('regions', r.regions);
        set('variables', v.variables);
      })
      .catch(() => {})
      .finally(() => setTimeout(() => setLoading(false), 1800));
  }, [set]);

  if (loading) return <LoadingScreen />;
  if (screen === 'login') return <Login />;
  if (screen === 'home') return <Home />;
  if (screen === 'twin') return <DigitalTwin />;
  if (screen === 'ocean-info') return <OceanInfo />;
  if (screen === 'region-info') return <RegionInfo />;
  if (screen === 'variable-info') return <VariableInfo />;
  if (screen === 'observations') return <ObservationExplorer />;
  if (screen === 'insights') return <InsightsPage />;
  return <AnalyticsPage />;
}
