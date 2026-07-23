import { NextResponse } from 'next/server';
import { generateMockFraudData } from '@/utils/fraudSeedData';

export async function POST() {
  try {
    const result = await generateMockFraudData();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to seed mock data:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed data' }, { status: 500 });
  }
}
