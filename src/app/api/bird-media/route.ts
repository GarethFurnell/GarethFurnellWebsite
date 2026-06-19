import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { birdName } = await request.json();
    
    if (!birdName) {
      return NextResponse.json({ error: 'birdName is required' }, { status: 400 });
    }

    let image = null;
    let audio = null;

    // 1. Fetch Wikipedia Image via Search Generator (more robust than exact title match)
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(birdName)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=600&origin=*`);
      const wikiData = await wikiRes.json();
      
      const pages = wikiData.query?.pages;
      if (pages) {
        // Grab the first page returned by search
        const pageId = Object.keys(pages)[0];
        if (pageId && pageId !== '-1' && pages[pageId].thumbnail) {
          image = pages[pageId].thumbnail.source;
        }
      }
    } catch (err) {
      console.error('API Route - Wiki fetch error:', err);
    }

    // 2. Fetch Xeno-canto Audio
    try {
      const xcRes = await fetch(`https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(birdName)}`);
      const xcData = await xcRes.json();
      if (xcData.recordings && xcData.recordings.length > 0) {
        // The API returns "//xeno-canto.org/..." sometimes without https
        const fileUrl = xcData.recordings[0].file;
        if (fileUrl.startsWith('//')) {
          audio = `https:${fileUrl}`;
        } else if (!fileUrl.startsWith('http')) {
          audio = `https://${fileUrl}`;
        } else {
          audio = fileUrl;
        }
      }
    } catch (err) {
      console.error('API Route - Xeno-canto fetch error:', err);
    }

    return NextResponse.json({
      status: 'success',
      image,
      audio
    });
  } catch (error: any) {
    console.error('API Route - Bird Media error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
