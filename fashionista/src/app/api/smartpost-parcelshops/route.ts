import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

interface SmartpostPlace {
  place_id?: string;
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  country_code?: string;
  country?: string;
  active?: string | boolean | number;
}

export async function GET() {
  try {
    const res = await fetch('https://my.smartpost.ee/api/ext/v1/places?country=EE');

    if (!res.ok) {
      console.error('Smartpost fetch failed with status:', res.status);
      return NextResponse.json({ error: 'Smartpost fetch failed' }, { status: 500 });
    }

    const textData = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
    });

    const jsonData = parser.parse(textData);

    let places: SmartpostPlace[] = [];

    if (jsonData.places) {
      if (Array.isArray(jsonData.places.item)) {
        places = jsonData.places.item;
      } else if (jsonData.places.item) {
        places = [jsonData.places.item];
      }
    }

    const filtered = places
      .filter((p) => p.country === 'EE' || p.country_code === 'EE')

      .map((p) => ({
        id: p.place_id || p.id || '',
        name: p.name || '',
        address: p.address || '',
        city: p.city || '',
      }));

    return NextResponse.json(filtered, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Smartpost fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
