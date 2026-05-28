import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

// Mock data to seed the database
const seedData = [
  {
    name: "Portfolio AI Assistant",
    stars: 15,
    category: "AI & Automation",
    status: "completed",
    tags: ["React", "Next.js", "Gemini"],
    team: [
      { role: "developer", experience: 4 },
      { role: "designer", experience: 2 }
    ]
  },
  {
    name: "Granular Ambient Synth",
    stars: 8,
    category: "Creative Engineering",
    status: "completed",
    tags: ["Web Audio API", "TypeScript", "Ableton"],
    team: [
      { role: "developer", experience: 5 }
    ]
  },
  {
    name: "HNSW Graph Visualiser",
    stars: 25,
    category: "Vector Databases",
    status: "in-progress",
    tags: ["Three.js", "WebGL", "Rust", "HNSW"],
    team: [
      { role: "developer", experience: 6 },
      { role: "scientist", experience: 4 }
    ]
  },
  {
    name: "GCP Serverless Pipe",
    stars: 12,
    category: "Cloud Systems",
    status: "completed",
    tags: ["Cloud Run", "Terraform", "Docker"],
    team: [
      { role: "engineer", experience: 3 }
    ]
  },
  {
    name: "MongoDB Dashboard",
    stars: 5,
    category: "Database Systems",
    status: "in-progress",
    tags: ["MongoDB", "Express", "Next.js"],
    team: [
      { role: "developer", experience: 2 },
      { role: "designer", experience: 4 }
    ]
  }
];

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const client = await clientPromise;
    const db = client.db('gfweb');
    const collectionName = 'presentation_projects';
    const collection = db.collection(collectionName);

    let queryCode = '';
    let queryObject = {};
    let results: any = null;

    switch (action) {
      case 'seed':
        // Delete all items and insert fresh mock data
        await collection.deleteMany({});
        results = await collection.insertMany(seedData);
        queryCode = `// 1. Delete existing documents
await db.collection('${collectionName}').deleteMany({});

// 2. Insert mock data
await db.collection('${collectionName}').insertMany(${JSON.stringify(seedData, null, 2)});`;
        return NextResponse.json({
          status: 'success',
          queryCode,
          results: {
            acknowledged: results.acknowledged,
            insertedCount: results.insertedCount
          },
          message: 'Database seeded successfully!'
        });

      case 'gte':
        queryObject = { stars: { $gte: 12 } };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({ stars: { $gte: 12 } })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'and':
        queryObject = {
          $and: [
            { category: "AI & Automation" },
            { status: "completed" }
          ]
        };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({
    $and: [
      { category: "AI & Automation" },
      { status: "completed" }
    ]
  })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'elemMatch':
        queryObject = {
          team: {
            $elemMatch: {
              role: "developer",
              experience: { $gte: 5 }
            }
          }
        };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({
    team: {
      $elemMatch: {
        role: "developer",
        experience: { $gte: 5 }
      }
    }
  })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'sortLimitProj':
        queryObject = { status: "completed" };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({ status: "completed" })
  .project({ name: 1, stars: 1, _id: 0 })
  .sort({ stars: -1 })
  .limit(2)
  .toArray();`;
        results = await collection
          .find(queryObject)
          .project({ name: 1, stars: 1, _id: 0 })
          .sort({ stars: -1 })
          .limit(2)
          .toArray();
        break;

      case 'count':
        queryObject = { status: "completed" };
        queryCode = `const count = await db
  .collection('${collectionName}')
  .countDocuments({ status: "completed" });`;
        const count = await collection.countDocuments(queryObject);
        results = { count };
        break;

      case 'check':
        // Auxiliary check to see if database has records
        const docCount = await collection.countDocuments({});
        return NextResponse.json({
          status: 'success',
          count: docCount,
          isEmpty: docCount === 0
        });

      default:
        return NextResponse.json(
          { status: 'error', error: 'Invalid action specified' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      status: 'success',
      queryObject,
      queryCode,
      results
    });

  } catch (error: any) {
    console.error('MongoDB Demo API Error:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Database connection error' },
      { status: 500 }
    );
  }
}
