import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { revalidateAirport, revalidateParking } from '@/app/api/revalidate/route';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

// 获取单个停车场
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

    const parking = await prisma.parkingLot.findUnique({
      where: { id },
      include: {
        airport: {
          select: {
            iata: true,
            name: true,
            city: true,
          },
        },
      },
    });

    if (!parking) {
      return NextResponse.json(
        { error: '停车场不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ parking });
  } catch (error) {
    console.error('Get parking error:', error);
    return NextResponse.json(
      { error: '获取数据失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 更新停车场
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
    if (!data.name || !data.airportIataCode || !data.dailyRate) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查停车场是否存在
    const existing = await prisma.parkingLot.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: '停车场不存在' },
        { status: 404 }
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

    const parking = await prisma.parkingLot.update({
      where: { id },
      data: {
        name: data.name,
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

    // 刷新缓存 - 异步执行，不阻塞响应
    Promise.all([
      revalidateParking(parking.slug),
      revalidateAirport(data.airportIataCode),
    ]).catch(console.error);

    return NextResponse.json({
      success: true,
      parking,
    });
  } catch (error) {
    console.error('Update parking error:', error);
    return NextResponse.json(
      { error: '更新停车场失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// 删除停车场
export async function DELETE(
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

    // 获取停车场信息（用于重新验证）
    const parking = await prisma.parkingLot.findUnique({
      where: { id },
      include: { airport: { select: { iataCode: true } } },
    });

    if (!parking) {
      return NextResponse.json(
        { error: '停车场不存在' },
        { status: 404 }
      );
    }

    // 软删除：设置 isActive 为 false
    await prisma.parkingLot.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    // 刷新缓存 - 异步执行，不阻塞响应
    if (parking.airport.iataCode) {
      revalidateAirport(parking.airport.iataCode).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: '停车场已删除',
    });
  } catch (error) {
    console.error('Delete parking error:', error);
    return NextResponse.json(
      { error: '删除停车场失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
