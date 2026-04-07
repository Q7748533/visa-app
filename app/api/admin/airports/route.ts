import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

// 获取所有机场列表
export async function GET(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = search
      ? {
          OR: [
            { iata: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { country: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [airports, total] = await Promise.all([
      prisma.airport.findMany({
        where,
        orderBy: [{ continent: 'asc' }, { country: 'asc' }, { city: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          iata: true,
          name: true,
          city: true,
          country: true,
          continent: true,
          isPopular: true,
          updatedAt: true,
        },
      }),
      prisma.airport.count({ where }),
    ]);

    return NextResponse.json({
      airports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get airports error:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 批量删除选中的机场
export async function DELETE(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '请选择要删除的机场' },
        { status: 400 }
      );
    }

    const result = await prisma.airport.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: `已删除 ${result.count} 个机场`,
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
