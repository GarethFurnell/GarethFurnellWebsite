import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { birdName } = await request.json();
    
    if (!birdName) {
      return NextResponse.json({ error: 'birdName is required' }, { status: 400 });
    }

    let image = null;
    let audio = null;

    // 1. Fetch iNaturalist Image (Vastly superior for biology/bird species)
    try {
      const iNatRes = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(birdName)}`);
      const iNatData = await iNatRes.json();
      
      if (iNatData.results && iNatData.results.length > 0) {
        // Grab the default photo from the best taxon match
        const defaultPhoto = iNatData.results[0].default_photo;
        if (defaultPhoto && defaultPhoto.medium_url) {
          image = defaultPhoto.medium_url;
        }
      }
    } catch (err) {
      console.error('API Route - iNaturalist fetch error:', err);
    }

    return NextResponse.json({
      status: 'success',
      image
    });
  } catch (error: any) {
    console.error('API Route - Bird Media error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
