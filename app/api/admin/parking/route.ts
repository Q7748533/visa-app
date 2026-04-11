import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

// 获取所有停车场列表
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
    const airportFilter = searchParams.get('airport') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // SQLite 不支持 mode: 'insensitive'，使用大小写不敏感的搜索
    const searchLower = search.toLowerCase();
    const airportFilterLower = airportFilter.toLowerCase();
    
    // 构建查询条件
    const where: any = {};
    
    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: searchLower } },
        { airport: { iata: { contains: searchLower } } },
        { airport: { name: { contains: searchLower } } },
        { airport: { city: { contains: searchLower } } },
      ];
    }
    
    // 机场筛选条件
    if (airportFilter) {
      where.airportIataCode = airportFilterLower;
    }

    const [parkings, total] = await Promise.all([
      prisma.parkingLot.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { dailyRate: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          airport: {
            select: {
              iata: true,
              name: true,
              city: true,
            },
          },
        },
      }),
      prisma.parkingLot.count({ where }),
    ]);

    return NextResponse.json({
      parkings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get parkings error:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 创建新停车场
export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const data = await req.json();

    // 验证必填字段
    if (!data.name || !data.airportIataCode || !data.dailyRate) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查机场是否存在
    const airport = await prisma.airport.findUnique({
      where: { iataCode: data.airportIataCode.toLowerCase() },
    });

    if (!airport) {
      return NextResponse.json(
        { error: `机场 ${data.airportIataCode} 不存在` },
        { status: 400 }
      );
    }

    const parking = await prisma.parkingLot.create({
      data: {
        name: data.name,
        slug: data.slug || `${data.airportIataCode.toLowerCase()}-${data.name.toLowerCase().replace(/\s+/g, '-')}`.substring(0, 50),
        airportIataCode: data.airportIataCode.toLowerCase(),
        type: data.type || 'OFF_SITE',
        dailyRate: parseFloat(data.dailyRate),
        distanceMiles: data.distanceMiles ? parseFloat(data.distanceMiles) : null,
        shuttleMins: data.shuttleMins ? parseInt(data.shuttleMins) : null,
        isIndoor: data.isIndoor || false,
        hasValet: data.hasValet || false,
        is24Hours: data.is24Hours !== false,
        rating: data.rating ? parseFloat(data.rating) : null,
        reviewCount: data.reviewCount ? parseInt(data.reviewCount) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        featured: data.featured || false,
        isActive: data.isActive !== false,
        affiliateUrl: data.affiliateUrl || null,
        // 详情页扩展字段
        address: data.address || null,
        shuttleFrequency: data.shuttleFrequency || null,
        shuttleHours: data.shuttleHours || null,
        arrivalDirections: data.arrivalDirections || null,
        thingsToKnow: data.thingsToKnow || null,
        // Way.com 特有字段
        description: data.description || null,
        shuttleDesc: data.shuttleDesc || null,
        cancellationPolicy: data.cancellationPolicy || null,
        parkingAccess: data.parkingAccess || null,
        operatingDays: data.operatingDays || null,
        contactPhone: data.contactPhone || null,
        recommendationPct: data.recommendationPct ? parseInt(data.recommendationPct) : null,
        locationRating: data.locationRating ? parseFloat(data.locationRating) : null,
        staffRating: data.staffRating ? parseFloat(data.staffRating) : null,
        facilityRating: data.facilityRating ? parseFloat(data.facilityRating) : null,
        safetyRating: data.safetyRating ? parseFloat(data.safetyRating) : null,
        dataSource: data.dataSource || 'way.com',
      },
    });

    return NextResponse.json({
      success: true,
      parking,
    });
  } catch (error) {
    console.error('Create parking error:', error);
    return NextResponse.json(
      { error: '创建停车场失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 批量删除选中的停车场
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
        { error: '请选择要删除的停车场' },
        { status: 400 }
      );
    }

    const result = await prisma.parkingLot.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      message: `已删除 ${result.count} 个停车场`,
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    return NextResponse.json(
      { error: '批量删除失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
