import clientPromise from './mongodb';

export const generateMockFraudData = async () => {
  const client = await clientPromise;
  const db = client.db('fraud_mock_db');

  // Clear existing collections
  await db.collection('claims').deleteMany({});
  await db.collection('metrics').deleteMany({});

  const statuses = ['Pending', 'Approved', 'Rejected', 'Flagged for Review'];
  const types = ['Auto Damage', 'Property', 'Medical', 'Theft'];
  const claims = [];

  // Pool of 10 users
  const userIds = Array.from({ length: 10 }, (_, i) => `USR-10${i}`);

  for (let i = 1; i <= 50; i++) {
    const isFlagged = Math.random() > 0.7;
    const status = isFlagged ? 'Flagged for Review' : statuses[Math.floor(Math.random() * 3)];
    
    // Claim Date Filed (sometime in the last 30 days)
    const dateFiledMs = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const dateFiled = new Date(dateFiledMs).toISOString();
    
    const requiresPhotoValidation = isFlagged && Math.random() > 0.3;
    const photoUrl = requiresPhotoValidation ? '/images/placeholder-damage.jpg' : null;

    let imageMetadata = null;
    if (photoUrl) {
      // If flagged, the photo might be very old (e.g. up to 2 years before claim filed)
      // If not flagged, the photo should be near the date filed (e.g. up to 2 days before)
      const timeOffset = isFlagged 
        ? Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000) // up to 2 years older
        : Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000);  // up to 2 days older

      imageMetadata = {
        dateTaken: new Date(dateFiledMs - timeOffset).toISOString(),
        deviceModel: Math.random() > 0.5 ? 'iPhone 13 Pro' : 'Samsung Galaxy S22',
        location: 'Exif Data Present'
      };
    }

    claims.push({
      claimId: `CLM-${1000 + i}`,
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      dateFiled,
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 50000) + 500,
      status: status,
      riskScore: isFlagged ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 10,
      requiresPhotoValidation,
      photoUrl,
      imageMetadata,
      description: 'Standard claim filing. Further details attached in documentation.',
    });
  }

  await db.collection('claims').insertMany(claims);

  const metrics = {
    totalClaims: 50,
    flaggedClaims: claims.filter(c => c.status === 'Flagged for Review').length,
    totalValue: claims.reduce((acc, curr) => acc + curr.amount, 0),
    fraudRate: (claims.filter(c => c.status === 'Flagged for Review').length / 50 * 100).toFixed(1) + '%',
    lastUpdated: new Date().toISOString()
  };

  await db.collection('metrics').insertOne(metrics);

  return { success: true, message: 'Mock fraud data generated successfully', metrics };
};
