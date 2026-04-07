import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '退出失败' },
      { status: 500 }
    );
  }
}
