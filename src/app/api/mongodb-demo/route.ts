import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

// Mock data to seed the database
const seedData = [
  {
    title: "The Cosmos Explained",
    price: 15,
    genre: "Science",
    status: "in-stock",
    tags: ["space", "physics", "bestseller"],
    authors: [
      { role: "writer", awards: 4 },
      { role: "illustrator", awards: 2 }
    ]
  },
  {
    title: "Advanced React Patterns",
    price: 8,
    genre: "Technology",
    status: "in-stock",
    tags: ["programming", "web", "frontend"],
    authors: [
      { role: "writer", awards: 5 }
    ]
  },
  {
    title: "A History of Ancient Rome",
    price: 25,
    genre: "History",
    status: "out-of-stock",
    tags: ["ancient", "empire", "europe"],
    authors: [
      { role: "writer", awards: 6 },
      { role: "editor", awards: 4 }
    ]
  },
  {
    title: "Learning Python",
    price: 12,
    genre: "Technology",
    status: "in-stock",
    tags: ["programming", "backend", "data"],
    authors: [
      { role: "writer", awards: 3 }
    ]
  },
  {
    title: "Introduction to Biology",
    price: 5,
    genre: "Science",
    status: "out-of-stock",
    tags: ["nature", "animals", "plants"],
    authors: [
      { role: "writer", awards: 2 },
      { role: "illustrator", awards: 4 }
    ]
  }
];

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const client = await clientPromise;
    const db = client.db('gfweb');
    const collectionName = 'presentation_books';
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
        queryObject = { price: { $gte: 12 } };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({ price: { $gte: 12 } })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'and':
        queryObject = {
          $and: [
            { genre: "Technology" },
            { status: "in-stock" }
          ]
        };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({
    $and: [
      { genre: "Technology" },
      { status: "in-stock" }
    ]
  })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'elemMatch':
        queryObject = {
          authors: {
            $elemMatch: {
              role: "writer",
              awards: { $gte: 5 }
            }
          }
        };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({
    authors: {
      $elemMatch: {
        role: "writer",
        awards: { $gte: 5 }
      }
    }
  })
  .toArray();`;
        results = await collection.find(queryObject).toArray();
        break;

      case 'sortLimitProj':
        queryObject = { status: "in-stock" };
        queryCode = `const results = await db
  .collection('${collectionName}')
  .find({ status: "in-stock" })
  .project({ title: 1, price: 1, _id: 0 })
  .sort({ price: -1 })
  .limit(2)
  .toArray();`;
        results = await collection
          .find(queryObject)
          .project({ title: 1, price: 1, _id: 0 })
          .sort({ price: -1 })
          .limit(2)
          .toArray();
        break;

      case 'count':
        queryObject = { status: "in-stock" };
        queryCode = `const count = await db
  .collection('${collectionName}')
  .countDocuments({ status: "in-stock" });`;
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
