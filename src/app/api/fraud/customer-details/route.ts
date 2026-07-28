import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('fraud_mock_db');
    
    // First, find all claims explicitly by this user
    const userClaims = await db.collection('claims').find({ userId }).toArray();
    
    if (userClaims.length === 0) {
      return NextResponse.json({ success: true, relatedClaims: [] });
    }

    // Extract all unique card hashes and delivery addresses used by this user
    const userCards = Array.from(new Set(userClaims.map(c => c.cardHash).filter(Boolean)));
    const userAddresses = Array.from(new Set(userClaims.map(c => c.deliveryAddress).filter(Boolean)));

    // Now find any claims across the ENTIRE system that match this user, OR their cards, OR their addresses
    const relatedClaims = await db.collection('claims').find({
      $or: [
        { userId },
        { cardHash: { $in: userCards } },
        { deliveryAddress: { $in: userAddresses } }
      ]
    }).sort({ dateFiled: -1 }).toArray();

    return NextResponse.json({ success: true, relatedClaims });
  } catch (error) {
    console.error('Failed to fetch customer details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer details' }, { status: 500 });
  }
}
