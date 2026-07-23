import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('fraud_mock_db');
    const metrics = await db.collection('metrics').findOne({});
    
    if (!metrics) {
      return NextResponse.json({ success: false, error: 'No metrics found. Please seed the database.' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
