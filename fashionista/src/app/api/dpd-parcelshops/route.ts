import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://eserviss.dpd.lv/api/v1/lockers?countryCode=EE';
  const token = process.env.DPD_API_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'DPD_API_TOKEN not set' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from DPD API' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    let message = 'Unknown error';

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
