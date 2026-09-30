import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';

// 1. Definition of the 107-point 3D Bird in Flight Anatomical Constellation
export interface AnatomicalPoint {
  name: string;
  part: 'beak' | 'head' | 'spine' | 'chest' | 'left_wing' | 'right_wing' | 'tail' | 'talons';
  x: number;
  y: number;
  z: number;
  color: string;
}

export function getBirdAnatomyPoints(): AnatomicalPoint[] {
  const pts: AnatomicalPoint[] = [];
  const add = (name: string, part: AnatomicalPoint['part'], x: number, y: number, z: number, color: string) => {
    pts.push({ name, part, x, y, z, color });
  };

  // Beak & Head (Amber / Gold)
  add('Beak Tip Apex', 'beak', 0, 2, 86, '#FFEA00');
  add('Upper Beak Ridge', 'beak', 0, 3, 76, '#FFEA00');
  add('Lower Beak Mandible', 'beak', 0, 0, 75, '#FFEA00');
  add('Left Beak Margin', 'beak', 4, 1, 72, '#FFEA00');
  add('Right Beak Margin', 'beak', -4, 1, 72, '#FFEA00');
  add('Nares / Beak Base', 'beak', 0, 4, 66, '#FFEA00');
  add('Forehead Slope', 'head', 0, 7, 58, '#FFD700');
  add('Crown Apex Crest', 'head', 0, 10, 48, '#FFD700');
  add('Left Eye Orbit', 'head', 6, 7, 54, '#00ED64');
  add('Right Eye Orbit', 'head', -6, 7, 54, '#00ED64');
  add('Nape / Occiput', 'head', 0, 8, 38, '#FFD700');
  add('Throat / Gular', 'head', 0, -3, 56, '#FFB800');
  add('Chin Base', 'head', 0, -4, 46, '#FFB800');

  // Neck & Spine (Emerald)
  add('Cervical Spine 1', 'spine', 0, 6, 32, '#00ED64');
  add('Cervical Spine 2', 'spine', 0, 5, 22, '#00ED64');
  add('Interscapular Spine', 'spine', 0, 4, 12, '#00ED64');
  add('Dorsal Spine Mid', 'spine', 0, 3, 0, '#00ED64');
  add('Lumbar Spine', 'spine', 0, 1, -14, '#00ED64');
  add('Sacral Spine', 'spine', 0, 0, -28, '#00ED64');
  add('Uropygium / Rump Base', 'spine', 0, -2, -42, '#00ED64');

  // Chest & Keel (Mint Green)
  add('Upper Keel Crest', 'chest', 0, -8, 26, '#10B981');
  add('Sternum Apex (Deep Keel)', 'chest', 0, -14, 14, '#10B981');
  add('Mid Ventral Sternum', 'chest', 0, -14, 0, '#10B981');
  add('Lower Abdomen', 'chest', 0, -9, -14, '#10B981');
  add('Left Coracoid Flank', 'chest', 8, -6, 16, '#10B981');
  add('Right Coracoid Flank', 'chest', -8, -6, 16, '#10B981');

  // Left Wing (Electric Cyan)
  const leftWing = [
    { name: 'Shoulder Joint', x: 10, y: 3, z: 16 },
    { name: 'Humerus Mid', x: 22, y: 5, z: 14 },
    { name: 'Humerus Distal', x: 34, y: 7, z: 11 },
    { name: 'Elbow Joint', x: 46, y: 10, z: 8 },
    { name: 'Radius Proximal', x: 58, y: 14, z: 5 },
    { name: 'Radius Mid', x: 72, y: 18, z: 1 },
    { name: 'Radius Distal', x: 86, y: 22, z: -4 },
    { name: 'Wrist Joint', x: 100, y: 25, z: -10 },
    { name: 'Hand / Manus', x: 114, y: 27, z: -16 },
    { name: 'Wingtip Apex P10', x: 130, y: 29, z: -22 },
    { name: 'Primary Feather P9', x: 122, y: 27, z: -29 },
    { name: 'Primary Feather P8', x: 113, y: 24, z: -34 },
    { name: 'Primary Feather P7', x: 103, y: 21, z: -38 },
    { name: 'Primary Feather P6', x: 92, y: 18, z: -40 },
    { name: 'Primary Feather P5', x: 81, y: 15, z: -39 },
    { name: 'Primary Feather P4', x: 70, y: 13, z: -37 },
    { name: 'Primary Feather P3', x: 60, y: 11, z: -34 },
    { name: 'Secondary Feather S1', x: 50, y: 9, z: -31 },
    { name: 'Secondary Feather S2', x: 40, y: 7, z: -27 },
    { name: 'Secondary Feather S3', x: 30, y: 5, z: -22 },
    { name: 'Secondary Feather S4', x: 20, y: 4, z: -17 },
    { name: 'Inner Covert', x: 22, y: 7, z: 2 },
    { name: 'Mid Covert 1', x: 36, y: 10, z: -2 },
    { name: 'Mid Covert 2', x: 50, y: 13, z: -6 },
    { name: 'Outer Covert 1', x: 66, y: 17, z: -11 },
    { name: 'Outer Covert 2', x: 82, y: 20, z: -16 },
    { name: 'Greater Covert', x: 98, y: 23, z: -22 },
    { name: 'Wingtip Vortex Flute', x: 134, y: 31, z: -25 }
  ];

  leftWing.forEach(p => add('Left ' + p.name, 'left_wing', p.x, p.y, p.z, '#00E5FF'));
  leftWing.forEach(p => add('Right ' + p.name, 'right_wing', -p.x, p.y, p.z, '#00E5FF'));

  // Tail (Vivid Magenta)
  const tail = [
    { name: 'Central Deck R1 Base', x: 0, y: -3, z: -50 },
    { name: 'Central Deck R1 Mid', x: 0, y: -4, z: -64 },
    { name: 'Central Deck R1 Tip', x: 0, y: -5, z: -78 },
    { name: 'Left Tail R2 Base', x: 6, y: -3, z: -50 },
    { name: 'Left Tail R2 Mid', x: 10, y: -4, z: -63 },
    { name: 'Left Tail R2 Tip', x: 15, y: -5, z: -76 },
    { name: 'Left Tail R3 Base', x: 14, y: -3, z: -48 },
    { name: 'Left Tail R3 Mid', x: 22, y: -4, z: -60 },
    { name: 'Left Tail R3 Tip', x: 30, y: -5, z: -71 },
    { name: 'Left Tail R4 Outer Base', x: 22, y: -2, z: -46 },
    { name: 'Left Tail R4 Outer Mid', x: 34, y: -3, z: -56 },
    { name: 'Left Tail R4 Outer Tip', x: 44, y: -4, z: -64 },
    { name: 'Right Tail R2 Base', x: -6, y: -3, z: -50 },
    { name: 'Right Tail R2 Mid', x: -10, y: -4, z: -63 },
    { name: 'Right Tail R2 Tip', x: -15, y: -5, z: -76 },
    { name: 'Right Tail R3 Base', x: -14, y: -3, z: -48 },
    { name: 'Right Tail R3 Mid', x: -22, y: -4, z: -60 },
    { name: 'Right Tail R3 Tip', x: -30, y: -5, z: -71 },
    { name: 'Right Tail R4 Outer Base', x: -22, y: -2, z: -46 },
    { name: 'Right Tail R4 Outer Mid', x: -34, y: -3, z: -56 },
    { name: 'Right Tail R4 Outer Tip', x: -44, y: -4, z: -64 }
  ];
  tail.forEach(p => add(p.name, 'tail', p.x, p.y, p.z, '#FF007F'));

  // Talons (Warm Orange)
  add('Left Talon Thigh', 'talons', 6, -9, -20, '#FF6B00');
  add('Left Claws Grip', 'talons', 8, -12, -30, '#FF6B00');
  add('Right Talon Thigh', 'talons', -6, -9, -20, '#FF6B00');
  add('Right Claws Grip', 'talons', -8, -12, -30, '#FF6B00');

  return pts;
}

// 2. High-Dimensional Spatial Fourier Harmonic Positional Generator (1024-dim)
export function createSpatialHarmonic(x: number, y: number, z: number, dim = 1024): number[] {
  const nx = x * 0.014;
  const ny = y * 0.016;
  const nz = z * 0.014;

  const vec = new Float64Array(dim);
  const numFrequencies = dim / 2;

  for (let i = 0; i < numFrequencies; i++) {
    const seed = i * 1337 + 42;
    const u1 = Math.abs(Math.sin(seed * 0.123));
    const u2 = Math.abs(Math.cos(seed * 0.456));
    const radius = Math.sqrt(-2 * Math.log(u1 + 1e-7));
    const theta = 2 * Math.PI * u2;
    const fx = radius * Math.cos(theta);
    const fy = radius * Math.sin(theta);
    const fz = (Math.sin(seed * 0.789) * 2 - 1) * 1.4;

    const phase = fx * nx + fy * ny + fz * nz;
    vec[i * 2] = Math.cos(phase);
    vec[i * 2 + 1] = Math.sin(phase);
  }

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return Array.from(vec).map(v => v / norm);
}

function normalizeVector(v: number[]): number[] {
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  const n = Math.sqrt(s) || 1;
  return v.map(x => x / n);
}

// Helper function to generate embeddings via Voyage API
const generateEmbeddings = async (texts: string[]) => {
  let apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('VOYAGE_API_KEY is not set in environment variables');
  }

  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const chunkSize = 100;
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

  return allEmbeddings;
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

        const anatomyPoints = getBirdAnatomyPoints();
        const targetCount = anatomyPoints.length;

        // 1. Fetch bird sounds from Xeno-canto API v3 across multiple pages to get 107 unique species
        let allRawRecordings: any[] = [];
        for (let page = 1; page <= 3; page++) {
          const response = await fetch(`https://xeno-canto.org/api/3/recordings?query=grp:birds+q:A&per_page=500&page=${page}&key=${xcApiKey}`);
          const data = await response.json();
          if (data.recordings) allRawRecordings = allRawRecordings.concat(data.recordings);
          if (allRawRecordings.length >= 1000) break;
        }

        const validRecordings = allRawRecordings.filter(r => r.grp === 'birds' && r.gen !== 'Vulpes' && r.cnt);
        const seenSpecies = new Set();
        const uniqueRecordings: any[] = [];

        for (const rec of validRecordings) {
          const speciesName = `${rec.gen} ${rec.sp}`;
          if (!seenSpecies.has(speciesName)) {
            seenSpecies.add(speciesName);
            uniqueRecordings.push(rec);
            if (uniqueRecordings.length >= targetCount) break;
          }
        }

        if (uniqueRecordings.length === 0) {
          throw new Error('No recordings found from Xeno-canto.');
        }

        // If unique species are slightly fewer than target points, pad with remaining valid recordings
        let selectedRecordings = [...uniqueRecordings];
        if (selectedRecordings.length < targetCount) {
          for (const rec of validRecordings) {
            if (!selectedRecordings.includes(rec)) {
              selectedRecordings.push(rec);
              if (selectedRecordings.length >= targetCount) break;
            }
          }
        }
        selectedRecordings = selectedRecordings.slice(0, targetCount);

        // 2. Prepare texts with anatomical vector descriptors for Voyage AI
        const textsToEmbed = selectedRecordings.map((rec: any, i: number) => {
          const pt = anatomyPoints[i];
          return `[Anatomical Component: ${pt.name} | Flight Sector: ${pt.part} | Spatial Vector: (${pt.x}, ${pt.y}, ${pt.z})] Bird: ${rec.en} (${rec.gen} ${rec.sp}). Sound: ${rec.type}. Location: ${rec.cnt}, ${rec.loc || ''}.`;
        });

        // 3. Generate Semantic Embeddings using Voyage AI
        const embeddings = await generateEmbeddings(textsToEmbed);

        // 4. Construct MongoDB documents with blended Dual-Harmonic Vectors (Spatial + Semantic)
        const documents = selectedRecordings.map((rec: any, i: number) => {
          const pt = anatomyPoints[i];
          const semVec = embeddings && embeddings[i] ? embeddings[i].embedding : [];
          const spatVec = createSpatialHarmonic(pt.x, pt.y, pt.z, 1024);

          // Blend 80% Spatial Harmonic + 20% Semantic Voyage-4
          const blended = new Float64Array(1024);
          for (let k = 0; k < 1024; k++) {
            const sVal = semVec[k] || 0;
            blended[k] = 0.80 * spatVec[k] + 0.20 * sVal;
          }
          const finalEmbedding = normalizeVector(Array.from(blended));

          let coordinates = null;
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
            embedding: finalEmbedding,
            bird_coord_3d: [pt.x, pt.y, pt.z],
            anatomical_part: pt.part,
            anatomical_label: pt.name,
            anatomical_color: pt.color
          };
        });

        // 5. Replace documents in MongoDB Atlas
        await collection.deleteMany({});
        const insertResult = await collection.insertMany(documents);

        return NextResponse.json({
          status: 'success',
          message: `Successfully embedded and seeded ${insertResult.insertedCount} bird sound vector nodes into the 3D Flight Constellation.`,
          count: insertResult.insertedCount
        });
      }

      case 'search': {
        if (!query) throw new Error('Search query is required');

        // 1. Generate semantic query embedding
        const embeddings = await generateEmbeddings([query]);
        const queryVector = embeddings?.[0]?.embedding;

        if (!queryVector) throw new Error('Failed to generate query embedding');

        // 2. Perform MongoDB Atlas Vector Search
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
              "embedding": 0,
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
        // Fetch the 3D bird constellation nodes
        const docs = await collection.find({}).limit(500).toArray();

        const dotProduct = (a: number[], b: number[]) => {
          let sum = 0;
          for (let k = 0; k < a.length; k++) {
            sum += a[k] * b[k];
          }
          return sum;
        };

        const nodes = docs.map((doc) => {
          const coord = doc.bird_coord_3d || [0, 0, 0];
          return {
            id: doc._id.toString(),
            name: doc.name,
            scientific_name: doc.scientific_name,
            genus: doc.genus || 'Unknown',
            country: doc.country,
            location: doc.location,
            file_url: doc.file_url,
            val: doc.anatomical_part === 'beak' ? 3.5 : doc.anatomical_part === 'head' ? 2.5 : 2,
            color: doc.anatomical_color || '#00ED64',
            anatomical_part: doc.anatomical_part || 'body',
            anatomical_label: doc.anatomical_label || doc.name,
            // 3D Spatial positions
            x: coord[0],
            y: coord[1],
            z: coord[2],
            fx: coord[0],
            fy: coord[1],
            fz: coord[2],
            embedding: doc.embedding
          };
        });

        // Compute clean mutual K-nearest neighbor links in 1024-dim embedding space
        const edgeSet = new Set<string>();
        const links: any[] = [];

        for (let i = 0; i < nodes.length; i++) {
          const sims: { j: number; sim: number }[] = [];
          for (let j = 0; j < nodes.length; j++) {
            if (i !== j && nodes[i].embedding && nodes[j].embedding) {
              sims.push({ j, sim: dotProduct(nodes[i].embedding, nodes[j].embedding) });
            }
          }
          sims.sort((a, b) => b.sim - a.sim);

          // Top 4 nearest neighbors in high-dimensional vector space
          for (let k = 0; k < Math.min(4, sims.length); k++) {
            if (sims[k].sim > 0.60) {
              const j = sims[k].j;
              const key = i < j ? `${i}-${j}` : `${j}-${i}`;
              if (!edgeSet.has(key)) {
                edgeSet.add(key);
                // Sector-themed wireframe link colors
                let linkColor = 'rgba(0, 237, 100, 0.35)'; // Spine/chest default
                if (nodes[i].anatomical_part === 'left_wing' || nodes[j].anatomical_part === 'left_wing' ||
                    nodes[i].anatomical_part === 'right_wing' || nodes[j].anatomical_part === 'right_wing') {
                  linkColor = 'rgba(0, 229, 255, 0.35)'; // Cyan for wings
                } else if (nodes[i].anatomical_part === 'tail' || nodes[j].anatomical_part === 'tail') {
                  linkColor = 'rgba(255, 0, 127, 0.35)'; // Magenta for tail
                } else if (nodes[i].anatomical_part === 'beak' || nodes[j].anatomical_part === 'beak' ||
                           nodes[i].anatomical_part === 'head' || nodes[j].anatomical_part === 'head') {
                  linkColor = 'rgba(255, 234, 0, 0.4)'; // Gold for head/beak
                }

                links.push({
                  source: nodes[i].id,
                  target: nodes[j].id,
                  value: sims[k].sim,
                  color: linkColor
                });
              }
            }
          }
        }

        // Clean up heavy embedding vectors before returning to client
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
