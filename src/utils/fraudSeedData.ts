import clientPromise from './mongodb';

export const generateMockFraudData = async () => {
  const client = await clientPromise;
  const db = client.db('fraud_mock_db');

  // Clear existing collections
  await db.collection('claims').deleteMany({});
  await db.collection('metrics').deleteMany({});

  const statuses = ['Pending', 'Approved', 'Rejected', 'Flagged for Review'];
  const types = ['Missing Item', 'Spoiled Produce', 'Empty Delivery Box', 'Incorrect Item', 'Expired Product'];
  const claims = [];

  // Pool of 10 users
  const userIds = Array.from({ length: 10 }, (_, i) => `USR-10${i}`);

  // Pools for simulating fraud rings (cross-account links)
  const addresses = ['123 Main St, Cape Town', '45 Loop St, Cape Town', '88 Long St, Cape Town', '12 Kloof St, Cape Town', '99 Beach Rd, Cape Town'];
  const cards = ['hash-card-9923', 'hash-card-1144', 'hash-card-8812', 'hash-card-4433', 'hash-card-0019'];
  const locations = [
    [-33.882, 18.572],
    [-33.891, 18.560],
    [-33.910, 18.421],
    [-33.924, 18.415],
    [-33.931, 18.402]
  ];

  for (let i = 1; i <= 50; i++) {
    const isFlagged = Math.random() > 0.7;
    const status = isFlagged ? 'Flagged for Review' : statuses[Math.floor(Math.random() * 3)];
    
    // Claim Date Filed (sometime in the last 30 days)
    const dateFiledMs = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const dateFiled = new Date(dateFiledMs).toISOString();
    
    // Allow both flagged (more likely) and normal claims to require photo validation
    const requiresPhotoValidation = isFlagged ? Math.random() > 0.3 : Math.random() > 0.6;
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
        location: 'Exif Data Present',
        imageHash: isFlagged && Math.random() > 0.5 ? 'duplicate-hash-8f43' : `unique-hash-${Math.floor(Math.random() * 10000)}`
      };
    }

    const type = types[Math.floor(Math.random() * types.length)];
    let description = '';
    if (type === 'Spoiled Produce') description = 'The avocados were completely rotten when I opened the bag.';
    if (type === 'Missing Item') description = 'I paid for 3 packs of chicken breasts but none were in the bag.';
    if (type === 'Empty Delivery Box') description = 'The driver handed me a sealed box but it was completely empty inside.';
    if (type === 'Incorrect Item') description = 'I ordered oat milk but received full cream dairy milk.';
    if (type === 'Expired Product') description = 'The yogurt delivered expired 4 days ago.';

    claims.push({
      claimId: `CLM-${1000 + i}`,
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      dateFiled,
      type,
      amount: Math.floor(Math.random() * 4900) + 100, // R100 to R5000
      status: status,
      riskScore: isFlagged ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 60) + 10,
      requiresPhotoValidation,
      photoUrl,
      imageMetadata,
      description,
      deliveryAddress: addresses[Math.floor(Math.random() * addresses.length)],
      cardHash: cards[Math.floor(Math.random() * cards.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      totalSpendToDate: Math.floor(Math.random() * 50000) + 2000,
    });
  }

  await db.collection('claims').insertMany(claims);

  // Compute most common type
  const typeCounts = claims.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);

  const metrics = {
    totalClaims: 50,
    flaggedClaims: claims.filter(c => c.status === 'Flagged for Review').length,
    totalValue: claims.reduce((acc, curr) => acc + curr.amount, 0),
    fraudRate: (claims.filter(c => c.status === 'Flagged for Review').length / 50 * 100).toFixed(1) + '%',
    mostCommonType,
    lastUpdated: new Date().toISOString()
  };

  await db.collection('metrics').insertOne(metrics);

  return { success: true, message: 'Mock fraud data generated successfully', metrics };
};
