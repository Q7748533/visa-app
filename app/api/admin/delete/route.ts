import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

// 删除指定机场
export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const iata = searchParams.get('iata');

    if (!iata) {
      return NextResponse.json(
        { error: '请提供机场IATA代码' },
        { status: 400 }
      );
    }

    await prisma.airport.delete({
      where: { iata: iata.toUpperCase() },
    });

    return NextResponse.json({
      success: true,
      message: `机场 ${iata.toUpperCase()} 已删除`,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: '删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 清空所有机场数据
export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { confirm } = await req.json();

    if (confirm !== 'DELETE_ALL') {
      return NextResponse.json(
        { error: '确认码错误，请输入 DELETE_ALL 确认删除所有数据' },
        { status: 400 }
      );
    }

    const { count } = await prisma.airport.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `已清空所有数据，共删除 ${count} 条记录`,
    });
  } catch (error) {
    console.error('Clear all error:', error);
    return NextResponse.json(
      { error: '清空失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
