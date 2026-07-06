'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

export default function WeatherTimeSeries() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cape Town, South Africa
  const lat = -33.9249;
  const lon = 18.4241;

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&timezone=auto`);
        const json = await res.json();
        
        if (json.hourly) {
          const { time, temperature_2m, precipitation } = json.hourly;
          
          // Map to recharts format (taking only the next 72 hours to keep the chart readable)
          const formattedData = time.slice(0, 72).map((t: string, index: number) => {
            const date = new Date(t);
            return {
              time: date.toLocaleTimeString([], { hour: '2-digit', weekday: 'short' }),
              fullDate: date.toLocaleString(),
              temperature: temperature_2m[index],
              precipitation: precipitation[index]
            };
          });
          
          setData(formattedData);
        }
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="w-full bg-[#023430]/40 border border-[#00684A] rounded-xl overflow-hidden mt-8 mb-12">
      <div className="p-6 border-b border-[#00684A]">
        <h3 className="text-xl font-bold text-[#00ED64]">Global Weather Time Series</h3>
        <p className="text-sm text-zinc-400 mt-1">
          A live integration demonstrating time-series data pipelines. 
          Fetching hourly temperature and precipitation data from Open-Meteo and rendering it alongside an interactive WebGL Earth model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-auto lg:h-[450px]">
        {/* Left Column: Recharts Time Series */}
        <div className="p-6 flex flex-col h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-[#00684A]">
          <h4 className="text-sm font-bold text-white mb-4">72-Hour Forecast (Cape Town, South Africa)</h4>
          {loading ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="h-8 w-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ED64" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ED64" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrecip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00684A" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888" 
                    fontSize={10} 
                    tickMargin={10}
                    minTickGap={30}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#888" 
                    fontSize={10} 
                    tickFormatter={(val) => `${val}°C`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#888" 
                    fontSize={10} 
                    tickFormatter={(val) => `${val}mm`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#001E2B', borderColor: '#00684A', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#00ED64', marginBottom: '4px', fontWeight: 'bold' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperature (°C)" 
                    stroke="#00ED64" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="precipitation" 
                    name="Precipitation (mm)" 
                    stroke="#00E5FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrecip)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Column: Earth Nullschool Iframe */}
        <div className="relative h-[400px] lg:h-full bg-black/50">
          <iframe 
            src={`https://earth.nullschool.net/#current/wind/surface/level/overlay=precip_3hr/orthographic=20.00,-45.00,600`}
            title="Interactive Earth Map"
            className="w-full h-full border-0 absolute inset-0"
            allow="fullscreen"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
