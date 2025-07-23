import { NextResponse } from 'next/server';

interface OmnivaLocation {
  NAME: string;
  A0_NAME: string; // riik
  A2_NAME: string; // linn
  A5_NAME: string; // aadress
  TYPE: number;    // tüüp (0 = pakiautomaat)
  ZIP: string;
}

export async function GET() {
  try {
    const res = await fetch('https://www.omniva.ee/locations.json');
    const text = await res.text();
    try {
      const data: OmnivaLocation[] = JSON.parse(text);

      const filtered = data
  .filter((loc) => ['EE', 'EST'].includes(loc.A0_NAME) && Number(loc.TYPE) === 0)
  .map((loc) => ({
    id: loc.ZIP,
    name: loc.NAME,
    address: loc.A5_NAME,
    city: loc.A2_NAME,
  }));


      return NextResponse.json(filtered);
    } catch (jsonErr) {
      console.error('JSON parse error:', jsonErr);
      console.error('Tagastatud tekst:', text.slice(0, 300)); // Esimesed 300 märki
      return NextResponse.json({ error: 'JSON parse error' }, { status: 500 });
    }
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
