import { NextResponse } from 'next/server';
import { elNinoExplanation, elNinoLocations, elNinoBigQuerySQL } from '@/utils/bigqueryData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location');

    if (locationId) {
      const location = elNinoLocations.find(l => l.id.toLowerCase() === locationId.toLowerCase());
      if (location) {
        return NextResponse.json({
          success: true,
          location,
          explanation: elNinoExplanation,
          sql: elNinoBigQuerySQL
        });
      }
    }

    return NextResponse.json({
      success: true,
      explanation: elNinoExplanation,
      locations: elNinoLocations,
      sql: elNinoBigQuerySQL
    });
  } catch (error) {
    console.error('El Niño API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch El Niño climate telemetry' },
      { status: 500 }
    );
  }
}
