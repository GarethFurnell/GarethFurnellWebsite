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

  for (let i = 1; i <= 50; i++) {
    const isFlagged = Math.random() > 0.7;
    const status = isFlagged ? 'Flagged for Review' : statuses[Math.floor(Math.random() * 3)];
    
    claims.push({
      claimId: `CLM-${1000 + i}`,
      dateFiled: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.floor(Math.random() * 50000) + 500,
      status: status,
      riskScore: isFlagged ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 10,
      requiresPhotoValidation: isFlagged && Math.random() > 0.5,
      photoUrl: (isFlagged && Math.random() > 0.5) ? '/images/placeholder-damage.jpg' : null,
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
