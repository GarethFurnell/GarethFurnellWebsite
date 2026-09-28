import { NextResponse } from 'next/server';
import { nasaAsteroids, asteroidBigQuerySQL } from '@/utils/bigqueryData';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      asteroids: nasaAsteroids,
      sql: asteroidBigQuerySQL,
      telemetryTimestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('NASA Asteroids API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NASA Near-Earth Objects telemetry' },
      { status: 500 }
    );
  }
}
