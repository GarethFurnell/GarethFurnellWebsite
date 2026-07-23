import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('fraud_mock_db');
    
    const claimsForValidation = await db.collection('claims')
      .find({ requiresPhotoValidation: true })
      .toArray();
    
    return NextResponse.json({ success: true, claims: claimsForValidation });
  } catch (error) {
    console.error('Failed to fetch photo validation claims:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch photo validation claims' }, { status: 500 });
  }
}
