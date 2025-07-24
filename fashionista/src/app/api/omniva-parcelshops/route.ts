import { NextResponse } from 'next/server';

interface OmnivaLocation {
  NAME: string;
  A0_NAME: string; // riik
  A2_NAME: string; // linn
  A5_NAME: string; // aadress
  TYPE: number;    // tüüp (0 = pakiautomaat)
  ZIP: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');  // võta ?id= väärtus

    const res = await fetch('https://www.omniva.ee/locations.json');
    const text = await res.text();
    try {
      const data: OmnivaLocation[] = JSON.parse(text);

      // Filtreerime ainult Eesti ja tüübi 0 (pakiautomaadid)
      let filtered = data.filter(
        (loc) => ['EE', 'EST'].includes(loc.A0_NAME) && Number(loc.TYPE) === 0
      );

      // Kui id on määratud, filtreerime veel id (ZIP) järgi
      if (id) {
        filtered = filtered.filter((loc) => loc.ZIP === id);
      }

      // Vormindame vastuse
      const result = filtered.map((loc) => ({
        id: loc.ZIP,
        name: loc.NAME,
        address: loc.A5_NAME,
        city: loc.A2_NAME,
      }));

      return NextResponse.json(result);
    } catch (jsonErr) {
      console.error('JSON parse error:', jsonErr);
      console.error('Tagastatud tekst:', text.slice(0, 300));
      return NextResponse.json({ error: 'JSON parse error' }, { status: 500 });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
