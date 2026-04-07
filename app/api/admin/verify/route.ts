import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (token?.value === 'authenticated') {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
