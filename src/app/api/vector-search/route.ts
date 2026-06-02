import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

// Helper function to generate embeddings via Voyage API directly
const generateEmbeddings = async (texts: string[]) => {
  let apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is not set in environment variables');
  }
  
  // Clean up any accidental quotes or whitespace from the .env file
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  const chunkSize = 100; // Voyage API restricts batch size, so we chunk the requests
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    
    // We are using the MongoDB Atlas AI proxy as requested by the user
    const response = await fetch('https://ai.mongodb.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: chunk,
        model: 'voyage-4' 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Voyage API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    allEmbeddings.push(...data.data);
  }

  return allEmbeddings; // Array of objects containing { embedding: [...] }
};

export async function POST(request: Request) {
  try {
    const { action, query } = await request.json();
    const client = await clientPromise;
    const db = client.db('gfweb');
    const collection = db.collection('bird_sounds');

    switch (action) {
      case 'seed': {
        const xcApiKey = process.env.XENO_CANTO_API_KEY;
        if (!xcApiKey) {
          throw new Error('XENO_CANTO_API_KEY is not set in environment variables. Please create an account on Xeno-canto to get an API key.');
        }

        // 1. Fetch bird sounds from Xeno-canto API v3
        // Fetch up to 5 pages to get a massive pool of high-quality bird recordings
        let allRawRecordings: any[] = [];
        for (let page = 1; page <= 5; page++) {
          const response = await fetch(`https://xeno-canto.org/api/3/recordings?query=grp:birds+q:A&page=${page}&key=${xcApiKey}`);
          const data = await response.json();
          if (data.error) throw new Error(`Xeno-canto API Error: ${data.message || data.error}`);
          if (data.recordings) allRawRecordings = allRawRecordings.concat(data.recordings);
        }

        // Filter for bird species (allow up to 15 recordings per species to build beautiful clusters)
        const uniqueRecordings = [];
        const speciesCount = new Map();
        
        for (const rec of allRawRecordings) {
          const speciesName = `${rec.gen} ${rec.sp}`;
          const currentCount = speciesCount.get(speciesName) || 0;
          
          // Filter to strictly ensure it's a bird, remove weird anomalies like foxes, and cap at 15 per species
          if (currentCount < 15 && rec.grp === 'birds' && rec.gen !== 'Vulpes') {
            speciesCount.set(speciesName, currentCount + 1);
            uniqueRecordings.push(rec);
          }
        }
        
        const recordings = uniqueRecordings.slice(0, 1000); // Grab up to 1000 birds for the graph

        if (recordings.length === 0) {
          throw new Error('No recordings found from Xeno-canto. The API might have returned an empty result for this query.');
        }

        // 2. Prepare texts for embedding
        const textsToEmbed = recordings.map((rec: any) => 
          `Bird: ${rec.en} (${rec.gen} ${rec.sp}). Family: ${rec.family}. Type of sound: ${rec.type}. Location: ${rec.cnt}, ${rec.loc}. Remarks: ${rec.rmk}`
        );

        // 3. Generate Embeddings using Voyage AI
        const embeddings = await generateEmbeddings(textsToEmbed);

        // 4. Construct MongoDB documents
        const documents = recordings.map((rec: any, i: number) => {
          let coordinates = null;
          // In API v3, 'lng' was renamed to 'lon'
          if (rec.lat && rec.lon) {
            const lat = parseFloat(rec.lat);
            const lng = parseFloat(rec.lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = {
                type: "Point",
                coordinates: [lng, lat]
              };
            }
          }

          return {
            id: rec.id,
            name: rec.en,
            scientific_name: `${rec.gen} ${rec.sp}`,
            genus: rec.gen,
            sound_type: rec.type,
            country: rec.cnt,
            location: coordinates,
            remarks: rec.rmk,
            file_url: rec.file,
            embedding: embeddings && embeddings[i] ? embeddings[i].embedding : []
          };
        });

        // 5. Save to MongoDB
        await collection.deleteMany({});
        const insertResult = await collection.insertMany(documents);

        return NextResponse.json({
          status: 'success',
          message: `Successfully embedded and inserted ${insertResult.insertedCount} bird sound records.`,
          count: insertResult.insertedCount
        });
      }

      case 'search': {
        if (!query) throw new Error('Search query is required');

        // 1. Generate embedding for the search query
        const embeddings = await generateEmbeddings([query]);
        const queryVector = embeddings?.[0]?.embedding;
        
        if (!queryVector) throw new Error('Failed to generate query embedding');

        // 2. Perform MongoDB Atlas Vector Search
        // Note: The index "vector_index" must be created in Atlas UI beforehand
        const pipeline = [
          {
            "$vectorSearch": {
              "index": "vector_index",
              "path": "embedding",
              "queryVector": queryVector,
              "numCandidates": 100,
              "limit": 10
            }
          },
          {
            "$project": {
              "embedding": 0, // exclude the heavy vector from results
              "score": { "$meta": "vectorSearchScore" }
            }
          }
        ];

        const results = await collection.aggregate(pipeline).toArray();

        return NextResponse.json({
          status: 'success',
          results
        });
      }

      case 'graph_data': {
        // Fetch a sample of documents to build the 3D graph
        const docs = await collection.find({}).limit(1000).project({ name: 1, genus: 1, country: 1, location: 1, embedding: 1 }).toArray();
        
        const brightPalette = [
          '#00ED64', '#FF3366', '#00E5FF', '#FFEA00', 
          '#B400FF', '#FF007F', '#00FF9D', '#FF6B00', '#3366FF'
        ];

        const nodes = docs.map((doc, i) => {
          const genusStr = doc.genus || 'Unknown';
          // Hash the family string to consistently select a highly visible neon color
          const colorHash = Math.abs(genusStr.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0));
          
          return {
            id: doc._id.toString(),
            name: doc.name,
            genus: genusStr,
            country: doc.country,
            location: doc.location,
            val: 1,
            color: brightPalette[colorHash % brightPalette.length],
            embedding: doc.embedding
          };
        });

        // Calculate similarities to create edges
        const links = [];
        
        // Simple dot product function for cosine similarity (assuming normalized vectors)
        const dotProduct = (a: number[], b: number[]) => a.reduce((sum, val, i) => sum + val * b[i], 0);

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].embedding && nodes[j].embedding) {
              const similarity = dotProduct(nodes[i].embedding, nodes[j].embedding);
              // Only link highly similar nodes
              if (similarity > 0.65) {
                links.push({
                  source: nodes[i].id,
                  target: nodes[j].id,
                  value: similarity,
                  color: 'rgba(0, 237, 100, 0.2)'
                });
              }
            }
          }
        }

        // Remove embeddings from nodes before sending to client
        nodes.forEach(n => delete n.embedding);

        return NextResponse.json({
          status: 'success',
          nodes,
          links
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error('Vector Search API Error:', error);
    return NextResponse.json(
      { status: 'error', error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
