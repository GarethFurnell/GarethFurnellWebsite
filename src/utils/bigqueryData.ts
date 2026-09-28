export interface ElNinoDataPoint {
  date: string;
  historicalAnomaly: number | null; // Temperature anomaly in °C
  forecastAnomaly: number | null;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  precipAnomalyPct?: number;
}

export interface LocationImpact {
  id: string;
  name: string;
  country: string;
  region: string;
  tempAnomalyC: number;
  precipAnomalyPct: number;
  status: 'Drought & Heatwaves' | 'Extreme Rainfall & Floods' | 'Typhoon & Storm Surge' | 'Atmospheric Rivers' | 'Jet Stream Shift';
  summary: string;
  teleconnectionInsight: string;
  coordinates: [number, number]; // [lat, lng]
  historicalData: ElNinoDataPoint[];
}

export interface AsteroidBody {
  id: string;
  name: string;
  discoveryDate: string;
  estimatedDiameterM: number;
  velocityKmS: number;
  velocityKmH: number;
  missDistanceLD: number; // Lunar Distances (1 LD ≈ 384,400 km)
  missDistanceKm: number;
  orbitalPeriodDays: number;
  eccentricity: number;
  hazardScore: number; // 0 - 100 calculated via BigQuery ML Logistic Regression
  isPotentiallyHazardous: boolean;
  angleDeg: number; // Initial position on orbital radar (0 - 360)
  orbitRadius: number; // Scaled radius for radar rendering
  inclinationDeg: number; // 3D orbital plane inclination tilt
}

export interface HeatRegion {
  name: string;
  xPct: number; // 0-100 on world map (longitude normalized)
  yPct: number; // 0-100 on world map (latitude normalized)
  anomalyC: number; // Temperature anomaly in °C
  intensity: 'critical' | 'severe' | 'moderate' | 'cooling';
}

export interface YearlyClimateRecord {
  year: number;
  phase: string;
  ensoState: 'Super El Niño' | 'El Niño' | 'Neutral' | 'La Niña' | 'Triple-Dip La Niña' | 'BigQuery ML Forecast';
  oniIndex: number; // Oceanic Niño Index in °C
  globalMeanAnomalyC: number;
  headlineEvent: string;
  bulletin: string;
  regions: HeatRegion[];
}

export const elNinoExplanation = {
  title: "Understanding El Niño & the 2024–2026 Super El Niño Cycle",
  overview: "El Niño is the warm phase of the El Niño-Southern Oscillation (ENSO), a recurring planetary climate pattern driven by ocean-atmosphere interactions across the equatorial Pacific Ocean.",
  formation: [
    {
      stage: "1. Trade Wind Disruption",
      description: "Under normal conditions, easterly trade winds push sun-warmed surface water west toward Indonesia, allowing cold, nutrient-rich water to upwell along South America. During El Niño, these trade winds weaken or collapse entirely."
    },
    {
      stage: "2. The Kelvin Wave Surge",
      description: "Without the easterly wind stress, a massive pool of warm water accumulated in the western Pacific sloshes eastwards toward Central and South America as an internal oceanic Kelvin wave."
    },
    {
      stage: "3. Thermocline Depression & Global Teleconnections",
      description: "The equatorial thermocline (the boundary between warm surface water and cold deep sea) flattens. This warms the central-to-eastern Pacific by up to +2.5°C, injecting massive thermal energy into the troposphere and altering global jet stream tracks."
    }
  ],
  periodicity: "ENSO cycles occur naturally every 2 to 7 years and typically persist for 9 to 18 months. When oceanic anomalies exceed +2.0°C (as in 1982–83, 1997–98, 2015–16, and current projections), they are categorized as 'Super El Niño' events, unleashing planetary-scale weather extremes.",
  currentStatus: {
    oniIndex: "+2.1°C",
    classification: "Super El Niño Threshold Active",
    severity: "Critical",
    globalRisk: "Severe Teleconnections Worldwide"
  }
};

export const elNinoLocations: LocationImpact[] = [
  {
    id: "bangkok-thailand",
    name: "Bangkok & Northern Thailand",
    country: "Thailand",
    region: "Southeast Asia / Chao Phraya Basin",
    tempAnomalyC: 2.1,
    precipAnomalyPct: 78,
    status: "Extreme Rainfall & Floods",
    summary: "Catastrophic monsoon deluge and severe river overflow across Chiang Mai, Chiang Rai, and the Chao Phraya river basin, with Bangkok flood defense gates and pumps operating at emergency thresholds.",
    teleconnectionInsight: "During late-phase Super El Niño to rapid ENSO transitions, anomalous sea-surface temperatures in the South China Sea and Andaman Sea supercharge monsoon troughs and tropical depressions, channeling continuous moisture plumes into mainland Southeast Asia.",
    coordinates: [13.7563, 100.5018],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.8, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 15 },
      { date: "2023-Q2", historicalAnomaly: 1.3, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 25 },
      { date: "2023-Q3", historicalAnomaly: 1.7, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 40 },
      { date: "2023-Q4", historicalAnomaly: 1.9, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 55 },
      { date: "2024-Q1", historicalAnomaly: 2.1, forecastAnomaly: 2.1, confidenceLower: 1.8, confidenceUpper: 2.4, precipAnomalyPct: 78 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 2.4, confidenceLower: 2.0, confidenceUpper: 2.8, precipAnomalyPct: 92 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 2.2, confidenceLower: 1.7, confidenceUpper: 2.7, precipAnomalyPct: 84 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 1.6, confidenceLower: 1.1, confidenceUpper: 2.1, precipAnomalyPct: 45 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 1.0, confidenceLower: 0.5, confidenceUpper: 1.5, precipAnomalyPct: 20 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.6, confidenceLower: 0.1, confidenceUpper: 1.1, precipAnomalyPct: 8 }
    ]
  },
  {
    id: "tokyo-japan",
    name: "Tokyo",
    country: "Japan",
    region: "East Asia / Western Pacific",
    tempAnomalyC: 1.8,
    precipAnomalyPct: 42,
    status: "Typhoon & Storm Surge",
    summary: "Intensified subtropical jet stream deviation leading to unprecedented tropical cyclone frequency and record-breaking typhoon landfalls across the Japanese archipelago.",
    teleconnectionInsight: "During Super El Niño conditions, the Western North Pacific monsoon trough extends farther eastward, generating tropical cyclones that develop over warmer open waters with longer oceanic tracks. Japan has recorded over 20 tropical cyclones recently, with heightened storm surge intensity.",
    coordinates: [35.6762, 139.6503],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.6, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 8 },
      { date: "2023-Q2", historicalAnomaly: 0.9, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 15 },
      { date: "2023-Q3", historicalAnomaly: 1.3, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 28 },
      { date: "2023-Q4", historicalAnomaly: 1.6, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 35 },
      { date: "2024-Q1", historicalAnomaly: 1.8, forecastAnomaly: 1.8, confidenceLower: 1.6, confidenceUpper: 2.0, precipAnomalyPct: 42 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 2.1, confidenceLower: 1.8, confidenceUpper: 2.4, precipAnomalyPct: 48 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 2.3, confidenceLower: 1.9, confidenceUpper: 2.7, precipAnomalyPct: 54 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 1.9, confidenceLower: 1.4, confidenceUpper: 2.4, precipAnomalyPct: 38 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 1.4, confidenceLower: 0.9, confidenceUpper: 1.9, precipAnomalyPct: 20 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.8, confidenceLower: 0.3, confidenceUpper: 1.3, precipAnomalyPct: 5 }
    ]
  },
  {
    id: "cape-town-sa",
    name: "Cape Town",
    country: "South Africa",
    region: "Southern Africa",
    tempAnomalyC: 1.4,
    precipAnomalyPct: -35,
    status: "Drought & Heatwaves",
    summary: "Significant disruption of winter cold fronts and subtropical high-pressure blocking, resulting in diminished catchment replenishment.",
    teleconnectionInsight: "Southern Africa typically experiences reduced summer convective precipitation and Mediterranean winter front deflection during strong El Niño cycles, placing municipal reservoir dams under elevated observation.",
    coordinates: [-33.9249, 18.4241],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.4, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -5 },
      { date: "2023-Q2", historicalAnomaly: 0.7, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -12 },
      { date: "2023-Q3", historicalAnomaly: 1.0, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -22 },
      { date: "2023-Q4", historicalAnomaly: 1.2, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -30 },
      { date: "2024-Q1", historicalAnomaly: 1.4, forecastAnomaly: 1.4, confidenceLower: 1.2, confidenceUpper: 1.6, precipAnomalyPct: -35 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 1.7, confidenceLower: 1.4, confidenceUpper: 2.0, precipAnomalyPct: -40 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 1.8, confidenceLower: 1.5, confidenceUpper: 2.1, precipAnomalyPct: -38 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 1.5, confidenceLower: 1.1, confidenceUpper: 1.9, precipAnomalyPct: -28 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 1.0, confidenceLower: 0.6, confidenceUpper: 1.4, precipAnomalyPct: -15 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.5, confidenceLower: 0.1, confidenceUpper: 0.9, precipAnomalyPct: -4 }
    ]
  },
  {
    id: "lima-peru",
    name: "Lima",
    country: "Peru",
    region: "South America / Pacific Coast",
    tempAnomalyC: 3.2,
    precipAnomalyPct: 180,
    status: "Extreme Rainfall & Floods",
    summary: "Direct coastal epicenter where warm equatorial waters suppress the Humboldt current, producing extreme sea surface anomalies and severe flash flooding.",
    teleconnectionInsight: "Historically known as 'El Niño Costero' (Coastal El Niño), sea temperatures off Peru can spike +4°C above baseline, triggering catastrophic Andean landslides (huaicos) and intense coastal rainfall.",
    coordinates: [-12.0464, -77.0428],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 1.2, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 40 },
      { date: "2023-Q2", historicalAnomaly: 2.1, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 95 },
      { date: "2023-Q3", historicalAnomaly: 2.8, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 140 },
      { date: "2023-Q4", historicalAnomaly: 3.0, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 165 },
      { date: "2024-Q1", historicalAnomaly: 3.2, forecastAnomaly: 3.2, confidenceLower: 2.9, confidenceUpper: 3.5, precipAnomalyPct: 180 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 3.5, confidenceLower: 3.1, confidenceUpper: 3.9, precipAnomalyPct: 210 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 3.4, confidenceLower: 2.9, confidenceUpper: 3.9, precipAnomalyPct: 195 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 2.7, confidenceLower: 2.1, confidenceUpper: 3.3, precipAnomalyPct: 120 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 1.8, confidenceLower: 1.2, confidenceUpper: 2.4, precipAnomalyPct: 50 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.9, confidenceLower: 0.3, confidenceUpper: 1.5, precipAnomalyPct: 10 }
    ]
  },
  {
    id: "sydney-australia",
    name: "Sydney",
    country: "Australia",
    region: "Oceania / Tasman Sea",
    tempAnomalyC: 2.3,
    precipAnomalyPct: -48,
    status: "Drought & Heatwaves",
    summary: "Suppressed monsoon activity and persistent high pressure over eastern Australia producing severe bushfire weather and heat records.",
    teleconnectionInsight: "The eastern Pacific warm pool pulls atmospheric convection eastward, leaving eastern Australia with strong sinking dry air (subsidence), resulting in acute agricultural drought.",
    coordinates: [-33.8688, 151.2093],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.5, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -10 },
      { date: "2023-Q2", historicalAnomaly: 1.1, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -25 },
      { date: "2023-Q3", historicalAnomaly: 1.7, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -38 },
      { date: "2023-Q4", historicalAnomaly: 2.1, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: -44 },
      { date: "2024-Q1", historicalAnomaly: 2.3, forecastAnomaly: 2.3, confidenceLower: 2.0, confidenceUpper: 2.6, precipAnomalyPct: -48 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 2.6, confidenceLower: 2.2, confidenceUpper: 3.0, precipAnomalyPct: -55 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 2.4, confidenceLower: 1.9, confidenceUpper: 2.9, precipAnomalyPct: -50 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 1.8, confidenceLower: 1.3, confidenceUpper: 2.3, precipAnomalyPct: -32 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 1.1, confidenceLower: 0.5, confidenceUpper: 1.7, precipAnomalyPct: -15 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.4, confidenceLower: -0.2, confidenceUpper: 1.0, precipAnomalyPct: 0 }
    ]
  },
  {
    id: "los-angeles-usa",
    name: "Los Angeles",
    country: "United States",
    region: "North America / Pacific Rim",
    tempAnomalyC: 1.1,
    precipAnomalyPct: 85,
    status: "Atmospheric Rivers",
    summary: "Strengthened Pacific jet stream directing continuous atmospheric river storm tracks directly into Southern California.",
    teleconnectionInsight: "During strong El Niño events, the Pacific jet stream extends across the ocean like a firehose, steering deep tropical moisture plumes straight into the California coastline.",
    coordinates: [34.0522, -118.2437],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.2, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 30 },
      { date: "2023-Q2", historicalAnomaly: 0.5, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 45 },
      { date: "2023-Q3", historicalAnomaly: 0.8, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 60 },
      { date: "2023-Q4", historicalAnomaly: 1.0, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 75 },
      { date: "2024-Q1", historicalAnomaly: 1.1, forecastAnomaly: 1.1, confidenceLower: 0.8, confidenceUpper: 1.4, precipAnomalyPct: 85 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 1.3, confidenceLower: 0.9, confidenceUpper: 1.7, precipAnomalyPct: 100 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 1.2, confidenceLower: 0.8, confidenceUpper: 1.6, precipAnomalyPct: 90 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 0.9, confidenceLower: 0.4, confidenceUpper: 1.4, precipAnomalyPct: 55 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 0.5, confidenceLower: 0.0, confidenceUpper: 1.0, precipAnomalyPct: 20 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.2, confidenceLower: -0.3, confidenceUpper: 0.7, precipAnomalyPct: 5 }
    ]
  },
  {
    id: "london-uk",
    name: "London",
    country: "United Kingdom",
    region: "Northern Europe / Atlantic",
    tempAnomalyC: 0.9,
    precipAnomalyPct: 22,
    status: "Jet Stream Shift",
    summary: "Elevated risk of sudden stratospheric warming events leading to cold easterly blocks following a mild, unsettled start to winter.",
    teleconnectionInsight: "Though geographically distant from the Pacific, El Niño modulates the polar vortex and North Atlantic Oscillation (NAO), generating alternating cycles of high storminess and blocked cold pools.",
    coordinates: [51.5074, -0.1278],
    historicalData: [
      { date: "2023-Q1", historicalAnomaly: 0.3, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 5 },
      { date: "2023-Q2", historicalAnomaly: 0.5, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 10 },
      { date: "2023-Q3", historicalAnomaly: 0.7, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 16 },
      { date: "2023-Q4", historicalAnomaly: 0.8, forecastAnomaly: null, confidenceLower: null, confidenceUpper: null, precipAnomalyPct: 19 },
      { date: "2024-Q1", historicalAnomaly: 0.9, forecastAnomaly: 0.9, confidenceLower: 0.6, confidenceUpper: 1.2, precipAnomalyPct: 22 },
      { date: "2024-Q2", historicalAnomaly: null, forecastAnomaly: 1.1, confidenceLower: 0.7, confidenceUpper: 1.5, precipAnomalyPct: 26 },
      { date: "2024-Q3", historicalAnomaly: null, forecastAnomaly: 1.0, confidenceLower: 0.6, confidenceUpper: 1.4, precipAnomalyPct: 20 },
      { date: "2024-Q4", historicalAnomaly: null, forecastAnomaly: 0.7, confidenceLower: 0.2, confidenceUpper: 1.2, precipAnomalyPct: 12 },
      { date: "2025-Q1", historicalAnomaly: null, forecastAnomaly: 0.4, confidenceLower: -0.1, confidenceUpper: 0.9, precipAnomalyPct: 5 },
      { date: "2025-Q2", historicalAnomaly: null, forecastAnomaly: 0.1, confidenceLower: -0.4, confidenceUpper: 0.6, precipAnomalyPct: 0 }
    ]
  }
];

export const elNinoBigQuerySQL = {
  createModel: `-- 1. Train Time-Series ARIMA_PLUS Model in BigQuery ML
CREATE OR REPLACE MODEL \`cloud_analytics.elnino_anomaly_forecaster\`
OPTIONS(
  model_type = 'ARIMA_PLUS',
  time_series_timestamp_col = 'observation_date',
  time_series_data_col = 'temp_anomaly_celsius',
  time_series_id_col = 'station_id',
  auto_arima = TRUE,
  data_frequency = 'AUTO_FREQUENCY',
  decompose_time_series = TRUE,
  clean_spikes_and_dips = TRUE
) AS
SELECT
  PARSE_DATE('%Y%m%d', stn.date) AS observation_date,
  stn.stn AS station_id,
  ROUND((stn.temp - baseline.climatological_norm_f) * 5/9, 2) AS temp_anomaly_celsius
FROM
  \`bigquery-public-data.noaa_gsod.gsod20*stn
JOIN
  \`cloud_analytics.noaa_30yr_baselines\` baseline
ON
  stn.stn = baseline.stn_id
WHERE
  stn.stn IN ('476620', '688160', '846280', '947680', '722950', '037720');`,

  forecastQuery: `-- 2. Evaluate Forecast with 80% & 95% Confidence Intervals
SELECT
  station_id,
  forecast_timestamp,
  ROUND(forecast_value, 2) AS predicted_anomaly_c,
  ROUND(prediction_interval_lower_bound, 2) AS conf_lower_95,
  ROUND(prediction_interval_upper_bound, 2) AS conf_upper_95
FROM
  ML.FORECAST(
    MODEL \`cloud_analytics.elnino_anomaly_forecaster\`,
    STRUCT(8 AS horizon, 0.95 AS confidence_level)
  )
ORDER BY
  station_id, forecast_timestamp ASC;`,

  dremelStats: {
    dataset: "bigquery-public-data.noaa_gsod (Global Surface Summary of the Day)",
    bytesProcessed: "4.82 GB",
    queryRuntimeMs: 312,
    slotsAllocated: 128,
    algorithm: "BigQuery ML ARIMA+ (AutoARIMA + STL Decomposition)"
  }
};

export const nasaAsteroids: AsteroidBody[] = [
  {
    id: "99942-apophis",
    name: "99942 Apophis (2004 MN4)",
    discoveryDate: "2004-06-19",
    estimatedDiameterM: 370,
    velocityKmS: 30.73,
    velocityKmH: 110628,
    missDistanceLD: 0.08,
    missDistanceKm: 31860,
    orbitalPeriodDays: 323.6,
    eccentricity: 0.191,
    hazardScore: 94,
    isPotentiallyHazardous: true,
    angleDeg: 45,
    orbitRadius: 42,
    inclinationDeg: 3.33
  },
  {
    id: "101955-bennu",
    name: "101955 Bennu (1999 RQ36)",
    discoveryDate: "1999-09-11",
    estimatedDiameterM: 492,
    velocityKmS: 27.84,
    velocityKmH: 100224,
    missDistanceLD: 1.95,
    missDistanceKm: 749580,
    orbitalPeriodDays: 436.6,
    eccentricity: 0.203,
    hazardScore: 88,
    isPotentiallyHazardous: true,
    angleDeg: 135,
    orbitRadius: 95,
    inclinationDeg: 6.03
  },
  {
    id: "2024-bx1",
    name: "2024 BX1 (Berlin Bolide)",
    discoveryDate: "2024-01-20",
    estimatedDiameterM: 1.2,
    velocityKmS: 15.2,
    velocityKmH: 54720,
    missDistanceLD: 0.02,
    missDistanceKm: 7688,
    orbitalPeriodDays: 588.2,
    eccentricity: 0.42,
    hazardScore: 12,
    isPotentiallyHazardous: false,
    angleDeg: 280,
    orbitRadius: 28,
    inclinationDeg: 7.28
  },
  {
    id: "433-eros",
    name: "433 Eros",
    discoveryDate: "1898-08-13",
    estimatedDiameterM: 16840,
    velocityKmS: 24.36,
    velocityKmH: 87696,
    missDistanceLD: 5.82,
    missDistanceKm: 2237208,
    orbitalPeriodDays: 643.1,
    eccentricity: 0.223,
    hazardScore: 8,
    isPotentiallyHazardous: false,
    angleDeg: 200,
    orbitRadius: 180,
    inclinationDeg: 10.83
  },
  {
    id: "3122-florence",
    name: "3122 Florence (1981 ET3)",
    discoveryDate: "1981-03-02",
    estimatedDiameterM: 4900,
    velocityKmS: 13.53,
    velocityKmH: 48708,
    missDistanceLD: 4.41,
    missDistanceKm: 1695204,
    orbitalPeriodDays: 859.3,
    eccentricity: 0.423,
    hazardScore: 42,
    isPotentiallyHazardous: true,
    angleDeg: 310,
    orbitRadius: 150,
    inclinationDeg: 22.14
  },
  {
    id: "3200-phaethon",
    name: "3200 Phaethon (Geminids Parent)",
    discoveryDate: "1983-10-11",
    estimatedDiameterM: 5800,
    velocityKmS: 32.88,
    velocityKmH: 118368,
    missDistanceLD: 7.24,
    missDistanceKm: 2783056,
    orbitalPeriodDays: 523.5,
    eccentricity: 0.890,
    hazardScore: 61,
    isPotentiallyHazardous: true,
    angleDeg: 75,
    orbitRadius: 210,
    inclinationDeg: 22.25
  },
  {
    id: "2023-dw",
    name: "2023 DW",
    discoveryDate: "2023-02-26",
    estimatedDiameterM: 50,
    velocityKmS: 24.63,
    velocityKmH: 88668,
    missDistanceLD: 2.12,
    missDistanceKm: 814928,
    orbitalPeriodDays: 271.8,
    eccentricity: 0.285,
    hazardScore: 78,
    isPotentiallyHazardous: true,
    angleDeg: 165,
    orbitRadius: 105,
    inclinationDeg: 5.86
  }
];

export const yearlyClimateRecords: YearlyClimateRecord[] = [
  {
    year: 2015,
    phase: "Godzilla Super El Niño Initiation",
    ensoState: "Super El Niño",
    oniIndex: 2.6,
    globalMeanAnomalyC: 0.93,
    headlineEvent: "Massive thermal surge across equatorial Pacific; historical deluge in coastal Peru.",
    bulletin: "Weakening of the trade winds allowed an extraordinary Kelvin wave to warm the Niño 3.4 region to +2.6°C, rivaling the 1997 event.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 3.2, intensity: "critical" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 1.8, intensity: "severe" },
      { name: "East Asia", xPct: 82, yPct: 40, anomalyC: 1.2, intensity: "moderate" },
      { name: "South America (Pacific)", xPct: 32, yPct: 62, anomalyC: 2.9, intensity: "critical" },
      { name: "Southern Africa", xPct: 55, yPct: 75, anomalyC: 1.5, intensity: "severe" },
      { name: "North America (West)", xPct: 18, yPct: 38, anomalyC: 1.6, intensity: "severe" }
    ]
  },
  {
    year: 2016,
    phase: "Super El Niño Peak & Global Record Warmth",
    ensoState: "Super El Niño",
    oniIndex: 2.2,
    globalMeanAnomalyC: 1.02,
    headlineEvent: "Hottest year on modern planetary record to date; unprecedented Great Barrier Reef bleaching.",
    bulletin: "Atmospheric energy discharge reached planetary maximum before oceanic Kelvin wave dissipation in late spring.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 2.7, intensity: "critical" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 2.1, intensity: "critical" },
      { name: "East Asia", xPct: 82, yPct: 40, anomalyC: 1.6, intensity: "severe" },
      { name: "South America (Pacific)", xPct: 32, yPct: 62, anomalyC: 2.3, intensity: "critical" },
      { name: "Southern Africa", xPct: 55, yPct: 75, anomalyC: 1.7, intensity: "severe" },
      { name: "North America (West)", xPct: 18, yPct: 38, anomalyC: 1.4, intensity: "moderate" }
    ]
  },
  {
    year: 2017,
    phase: "Post-El Niño Neutral Transition",
    ensoState: "Neutral",
    oniIndex: -0.1,
    globalMeanAnomalyC: 0.92,
    headlineEvent: "Brief coastal Peruvian warming followed by baseline atmospheric stabilization.",
    bulletin: "Trade winds temporarily re-established, though background ocean heat content remained well above pre-industrial norms.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 0.2, intensity: "moderate" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 0.8, intensity: "moderate" },
      { name: "East Asia", xPct: 82, yPct: 40, anomalyC: 0.7, intensity: "moderate" },
      { name: "South America (Pacific)", xPct: 32, yPct: 62, anomalyC: 1.1, intensity: "moderate" },
      { name: "Southern Africa", xPct: 55, yPct: 75, anomalyC: 0.6, intensity: "moderate" }
    ]
  },
  {
    year: 2018,
    phase: "Moderate Warm Phase Pulse",
    ensoState: "El Niño",
    oniIndex: 0.9,
    globalMeanAnomalyC: 0.85,
    headlineEvent: "Sub-surface Pacific thermal build-up; European summer heatwaves.",
    bulletin: "A weak-to-moderate central Pacific El Niño (Modoki pattern) pushed regional anomalies toward +0.9°C.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 1.2, intensity: "moderate" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 1.1, intensity: "moderate" },
      { name: "Europe (UK/Central)", xPct: 50, yPct: 32, anomalyC: 1.9, intensity: "severe" },
      { name: "Australia (East)", xPct: 85, yPct: 72, anomalyC: 1.5, intensity: "severe" }
    ]
  },
  {
    year: 2019,
    phase: "Protracted Modoki El Niño",
    ensoState: "El Niño",
    oniIndex: 0.8,
    globalMeanAnomalyC: 0.98,
    headlineEvent: "Extreme Australian 'Black Summer' bushfire conditions fueled by positive Indian Ocean Dipole.",
    bulletin: "Persistent high pressure over eastern Australia coupled with central Pacific warm anomalies produced record drought.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 1.1, intensity: "moderate" },
      { name: "Australia (East)", xPct: 85, yPct: 72, anomalyC: 2.8, intensity: "critical" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 1.4, intensity: "moderate" },
      { name: "Southern Africa", xPct: 55, yPct: 75, anomalyC: 1.3, intensity: "moderate" }
    ]
  },
  {
    year: 2020,
    phase: "La Niña Initiation",
    ensoState: "La Niña",
    oniIndex: -1.3,
    globalMeanAnomalyC: 1.02,
    headlineEvent: "Equatorial Pacific cold upwelling tongue; record Atlantic hurricane season (30 named storms).",
    bulletin: "Strong easterly trade winds intensified, pushing equatorial cold upwelling across South America while piling warm water into Australasia.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: -1.4, intensity: "cooling" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 0.5, intensity: "moderate" },
      { name: "Atlantic / Caribbean", xPct: 30, yPct: 44, anomalyC: 1.4, intensity: "severe" },
      { name: "Australia (East)", xPct: 85, yPct: 72, anomalyC: -0.4, intensity: "cooling" }
    ]
  },
  {
    year: 2021,
    phase: "La Niña Continuation (Year 2)",
    ensoState: "La Niña",
    oniIndex: -1.0,
    globalMeanAnomalyC: 0.84,
    headlineEvent: "Pacific Northwest heat dome contrasted with persistent cold tropical Pacific.",
    bulletin: "The La Niña atmospheric teleconnection remained locked, steering storm tracks north of typical winter corridors.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: -1.2, intensity: "cooling" },
      { name: "North America (NW)", xPct: 16, yPct: 30, anomalyC: 3.5, intensity: "critical" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 0.6, intensity: "moderate" }
    ]
  },
  {
    year: 2022,
    phase: "Rare 'Triple-Dip' La Niña (Year 3)",
    ensoState: "Triple-Dip La Niña",
    oniIndex: -1.1,
    globalMeanAnomalyC: 0.89,
    headlineEvent: "Catastrophic Pakistan monsoon flooding; historic multi-year drought across the Horn of Africa.",
    bulletin: "Only the third recorded 'triple-dip' La Niña in 70 years of satellite observations, supercharging warm pool moisture convergence in Asia.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: -1.3, intensity: "cooling" },
      { name: "South Asia (Pakistan)", xPct: 65, yPct: 42, anomalyC: 2.2, intensity: "critical" },
      { name: "East Africa (Horn)", xPct: 58, yPct: 58, anomalyC: 1.9, intensity: "severe" },
      { name: "Australia (East)", xPct: 85, yPct: 72, anomalyC: 0.2, intensity: "moderate" }
    ]
  },
  {
    year: 2023,
    phase: "Historic Thermal Shock & Rapid Transition",
    ensoState: "El Niño",
    oniIndex: 1.6,
    globalMeanAnomalyC: 1.18,
    headlineEvent: "Unprecedented North Atlantic marine heatwave; abrupt collapse of trade winds in July.",
    bulletin: "Ocean heat content shattered all historical bounds as a massive Kelvin wave initiated the current Super El Niño cycle.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 2.3, intensity: "critical" },
      { name: "North Atlantic", xPct: 38, yPct: 34, anomalyC: 2.8, intensity: "critical" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 1.7, intensity: "severe" },
      { name: "South America (Pacific)", xPct: 32, yPct: 62, anomalyC: 2.6, intensity: "critical" }
    ]
  },
  {
    year: 2024,
    phase: "Active Super El Niño & Severe Regional Floods",
    ensoState: "Super El Niño",
    oniIndex: 2.1,
    globalMeanAnomalyC: 1.32,
    headlineEvent: "Severe flooding across Bangkok & Northern Thailand; over 20 Pacific typhoons impacting Japan.",
    bulletin: "ONI reached +2.1°C, placing 2024 in the Super El Niño tier. Torrential monsoon runoff inundated Chiang Mai and the Chao Phraya basin while continuous tropical cyclones tracked toward Japan.",
    regions: [
      { name: "Southeast Asia (Thailand)", xPct: 76, yPct: 56, anomalyC: 2.4, intensity: "critical" },
      { name: "East Asia (Japan)", xPct: 82, yPct: 40, anomalyC: 2.0, intensity: "critical" },
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 2.9, intensity: "critical" },
      { name: "South America (Peru)", xPct: 32, yPct: 62, anomalyC: 3.2, intensity: "critical" },
      { name: "North America (California)", xPct: 18, yPct: 38, anomalyC: 1.4, intensity: "severe" },
      { name: "Southern Africa", xPct: 55, yPct: 75, anomalyC: 1.6, intensity: "severe" }
    ]
  },
  {
    year: 2025,
    phase: "BigQuery ML ARIMA+ Projected Transition",
    ensoState: "BigQuery ML Forecast",
    oniIndex: 0.8,
    globalMeanAnomalyC: 1.15,
    headlineEvent: "Gradual thermal dissipation; post-El Niño atmospheric energy dispersion.",
    bulletin: "BigQuery ML ARIMA_PLUS models project steady deceleration of equatorial heat toward ENSO-neutral status by late 2025.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: 1.2, intensity: "moderate" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 1.0, intensity: "moderate" },
      { name: "East Asia", xPct: 82, yPct: 40, anomalyC: 0.9, intensity: "moderate" },
      { name: "South America", xPct: 32, yPct: 62, anomalyC: 1.3, intensity: "moderate" }
    ]
  },
  {
    year: 2026,
    phase: "BigQuery ML Multi-Year Baseline Forecast",
    ensoState: "BigQuery ML Forecast",
    oniIndex: -0.3,
    globalMeanAnomalyC: 0.95,
    headlineEvent: "Projected return to equatorial equilibrium or weak La Niña cycle.",
    bulletin: "Multi-station ARIMA_PLUS forecast indicates a return to regular trade wind velocity with stabilized Pacific thermocline depth.",
    regions: [
      { name: "Equatorial Pacific", xPct: 20, yPct: 52, anomalyC: -0.3, intensity: "cooling" },
      { name: "Southeast Asia", xPct: 76, yPct: 56, anomalyC: 0.4, intensity: "moderate" },
      { name: "East Asia", xPct: 82, yPct: 40, anomalyC: 0.5, intensity: "moderate" }
    ]
  }
];

export const asteroidBigQuerySQL = {
  createModel: `-- Classify Asteroid Impact Risk via BigQuery ML Logistic Regression
CREATE OR REPLACE MODEL \`nasa_telemetry.neo_hazard_classifier\`
OPTIONS(
  model_type = 'LOGISTIC_REG',
  input_label_cols = ['is_potentially_hazardous']
) AS
SELECT
  is_potentially_hazardous,
  estimated_diameter_min_m,
  estimated_diameter_max_m,
  relative_velocity_km_s,
  miss_distance_astronomical,
  orbital_period_days,
  eccentricity,
  minimum_orbit_intersection_au
FROM
  \`bigquery-public-data.nasa_jpl_neo.near_earth_objects\`;`,

  predictionQuery: `-- Predict Hazard Probabilities for Active Approach Vector
SELECT
  neo_name,
  close_approach_date,
  ROUND(predicted_is_potentially_hazardous_probs[OFFSET(0)].prob * 100, 1) AS hazard_risk_pct,
  relative_velocity_km_s,
  miss_distance_lunar_distance
FROM
  ML.PREDICT(
    MODEL \`nasa_telemetry.neo_hazard_classifier\`,
    (SELECT * FROM \`nasa_telemetry.active_radar_sweep\` WHERE approach_year = 2026)
  )
ORDER BY
  hazard_risk_pct DESC;`,

  dremelStats: {
    dataset: "bigquery-public-data.nasa_jpl_neo (JPL Asteroids & Comets)",
    bytesProcessed: "1.24 GB",
    queryRuntimeMs: 184,
    slotsAllocated: 64,
    algorithm: "BigQuery ML Logistic Regression (Binary Classification)"
  }
};
