import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

// 获取单个机场
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const airport = await prisma.airport.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            parkings: true,
          },
        },
      },
    });

    if (!airport) {
      return NextResponse.json(
        { error: '机场不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ airport });
  } catch (error) {
    console.error('Get airport error:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新机场
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await req.json();

    // 验证必填字段
    if (!data.iata || !data.name || !data.city || !data.country) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查机场是否存在
    const existing = await prisma.airport.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '机场不存在' },
        { status: 404 }
      );
    }

    // 如果 IATA 改变了，检查是否与其他机场冲突
    if (data.iata.toUpperCase() !== existing.iata) {
      const conflict = await prisma.airport.findUnique({
        where: { iata: data.iata.toUpperCase() },
      });
      if (conflict) {
        return NextResponse.json(
          { error: `机场 ${data.iata.toUpperCase()} 已存在` },
          { status: 400 }
        );
      }
    }

    const airport = await prisma.airport.update({
      where: { id },
      data: {
        iata: data.iata.toUpperCase(),
        iataCode: data.iata.toLowerCase(),
        name: data.name,
        city: data.city,
        country: data.country || 'USA',
        isPopular: data.isPopular || false,
        isActive: data.isActive !== false,
      },
    });

    return NextResponse.json({
      success: true,
      airport,
    });
  } catch (error) {
    console.error('Update airport error:', error);
    return NextResponse.json(
      { error: '更新机场失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
