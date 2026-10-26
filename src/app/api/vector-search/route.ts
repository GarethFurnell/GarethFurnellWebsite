import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

// Helper function to generate pure semantic embeddings via Voyage API directly
const generateEmbeddings = async (texts: string[]) => {
  let apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is not set in environment variables');
  }

  // Clean up any accidental quotes or whitespace from the .env file
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  const chunkSize = 100; // Voyage API restricts batch size, so we chunk requests
  const allEmbeddings: any[] = [];

  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);

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
          throw new Error('XENO_CANTO_API_KEY is not set in environment variables.');
        }

        // 1. Fetch high-quality bird recordings from Xeno-canto API v3 across pages
        let allRawRecordings: any[] = [];
        for (let page = 1; page <= 3; page++) {
          const response = await fetch(
            `https://xeno-canto.org/api/3/recordings?query=grp:birds+q:A&per_page=500&page=${page}&key=${xcApiKey}`
          );
          const data = await response.json();
          if (data.recordings) allRawRecordings = allRawRecordings.concat(data.recordings);
          if (allRawRecordings.length >= 1000) break;
        }

        // Filter for bird species: strict uniqueness (1 unique bird per species, and 1 bird per country)
        const uniqueRecordings: any[] = [];
        const seenSpecies = new Set<string>();
        const seenCountries = new Set<string>();

        for (const rec of allRawRecordings) {
          const speciesName = `${rec.gen} ${rec.sp}`;

          if (rec.grp === 'birds' && rec.gen !== 'Vulpes' && rec.cnt) {
            if (!seenCountries.has(rec.cnt) && !seenSpecies.has(speciesName)) {
              seenCountries.add(rec.cnt);
              seenSpecies.add(speciesName);
              uniqueRecordings.push(rec);
            }
          }
        }

        // Store up to 120 diverse bird species
        const recordings = uniqueRecordings.slice(0, 120);

        if (recordings.length === 0) {
          throw new Error('No recordings found from Xeno-canto.');
        }

        // 2. Prepare natural semantic texts for embedding
        const textsToEmbed = recordings.map((rec: any) =>
          `Bird: ${rec.en} (${rec.gen} ${rec.sp}). Family: ${rec.family || ''}. Type of sound: ${rec.type || 'call'}. Location: ${rec.cnt}, ${rec.loc || ''}. Remarks: ${rec.rmk || 'Acoustic field recording.'}`
        );

        // 3. Generate pure semantic embeddings using Voyage AI
        const embeddings = await generateEmbeddings(textsToEmbed);

        // 4. Construct MongoDB documents (pure semantic vector representations)
        const documents = recordings.map((rec: any, i: number) => {
          let coordinates = null;
          if (rec.lat && rec.lon) {
            const lat = parseFloat(rec.lat);
            const lng = parseFloat(rec.lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = {
                type: 'Point',
                coordinates: [lng, lat]
              };
            }
          }

          return {
            id: rec.id,
            name: rec.en,
            scientific_name: `${rec.gen} ${rec.sp}`,
            genus: rec.gen,
            family: rec.family,
            sound_type: rec.type,
            country: rec.cnt,
            location: coordinates,
            remarks: rec.rmk,
            file_url: rec.file,
            embedding: embeddings && embeddings[i] ? embeddings[i].embedding : []
          };
        });

        // 5. Replace documents in MongoDB Atlas
        await collection.deleteMany({});
        const insertResult = await collection.insertMany(documents);

        return NextResponse.json({
          status: 'success',
          message: `Successfully embedded and inserted ${insertResult.insertedCount} bird sound vector records based purely on acoustic and semantic properties.`,
          count: insertResult.insertedCount
        });
      }

      case 'search': {
        if (!query) throw new Error('Search query is required');

        // 1. Generate semantic embedding for the search query
        const embeddings = await generateEmbeddings([query]);
        const queryVector = embeddings?.[0]?.embedding;

        if (!queryVector) throw new Error('Failed to generate query embedding');

        // 2. Perform MongoDB Atlas Vector Search
        const pipeline = [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryVector,
              numCandidates: 100,
              limit: 10
            }
          },
          {
            $project: {
              embedding: 0,
              score: { $meta: 'vectorSearchScore' }
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
        // Fetch documents to build the 3D semantic vector similarity space
        const docs = await collection
          .find({})
          .limit(500)
          .project({
            name: 1,
            scientific_name: 1,
            genus: 1,
            family: 1,
            sound_type: 1,
            country: 1,
            location: 1,
            embedding: 1,
            file_url: 1
          })
          .toArray();

        const brightPalette = [
          '#00ED64', '#00E5FF', '#FF3366', '#FFEA00',
          '#B400FF', '#FF007F', '#00FF9D', '#FF6B00', '#3366FF'
        ];

        const nodes = docs.map((doc) => {
          const genusStr = doc.genus || doc.family || 'Unknown';
          // Hash the genus string to consistently select a distinct vibrant color
          const colorHash = Math.abs(
            genusStr.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
          );

          return {
            id: doc._id.toString(),
            name: doc.name,
            scientific_name: doc.scientific_name,
            genus: genusStr,
            family: doc.family,
            sound_type: doc.sound_type,
            country: doc.country,
            location: doc.location,
            file_url: doc.file_url,
            val: 2,
            color: brightPalette[colorHash % brightPalette.length],
            embedding: doc.embedding
          };
        });

        // Calculate semantic vector similarities (dot product of normalized Voyage AI vectors)
        const dotProduct = (a: number[], b: number[]) => {
          let sum = 0;
          for (let k = 0; k < a.length; k++) {
            sum += a[k] * b[k];
          }
          return sum;
        };

        const edgeSet = new Set<string>();
        const links: any[] = [];

        // Connect each bird to its closest neighbors in 1024-dimensional semantic space
        for (let i = 0; i < nodes.length; i++) {
          const sims: { j: number; sim: number }[] = [];
          for (let j = 0; j < nodes.length; j++) {
            if (i !== j && nodes[i].embedding && nodes[j].embedding) {
              const similarity = dotProduct(nodes[i].embedding, nodes[j].embedding);
              sims.push({ j, sim: similarity });
            }
          }
          sims.sort((a, b) => b.sim - a.sim);

          // Connect to top 4 most similar birds with similarity > 0.65
          for (let k = 0; k < Math.min(4, sims.length); k++) {
            if (sims[k].sim > 0.65) {
              const j = sims[k].j;
              const key = i < j ? `${i}-${j}` : `${j}-${i}`;
              if (!edgeSet.has(key)) {
                edgeSet.add(key);
                links.push({
                  source: nodes[i].id,
                  target: nodes[j].id,
                  value: sims[k].sim,
                  color: 'rgba(0, 237, 100, 0.28)'
                });
              }
            }
          }
        }

        // Strip heavy embeddings before sending nodes to client
        nodes.forEach((n: any) => delete n.embedding);

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
