import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const sortOrder = searchParams.get('sort') || 'desc';

    const client = await clientPromise;
    const db = client.db('fraud_mock_db');
    
    let query = {};
    if (statusFilter && statusFilter !== 'All') {
      query = { status: statusFilter };
    }

    const sortOption = sortOrder === 'asc' ? { riskScore: 1 } : { riskScore: -1 };
    
    const claims = await db.collection('claims')
      .find(query)
      .sort(sortOption as any)
      .toArray();
    
    return NextResponse.json({ success: true, claims });
  } catch (error) {
    console.error('Failed to fetch claims:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
  }
}
