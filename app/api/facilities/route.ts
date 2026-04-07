/**
 * 设施 CRUD API
 * 
 * GET /api/facilities?airport=SIN&service=SLEEPING
 * POST /api/facilities (创建)
 * PUT /api/facilities?id=xxx (更新)
 * DELETE /api/facilities?id=xxx (删除)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 服务类型列表（用于验证）
const VALID_SERVICES = ['SLEEPING', 'SHOWERS', 'STORAGE', 'TRANSPORT', 'LOUNGE', 'FOOD', 'SPA', 'WIFI'];
const VALID_AREA_TYPES = ['AIRSIDE', 'LANDSIDE', 'BOTH', 'PRIVATE'];

// GET - 查询设施列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const airportIata = searchParams.get('airport');
    const service = searchParams.get('service');
    const terminal = searchParams.get('terminal');
    const id = searchParams.get('id');

    // 如果提供了 ID，返回单个设施
    if (id) {
      const facility = await prisma.facility.findUnique({
        where: { id },
        include: { airport: true },
      });

      if (!facility) {
        return NextResponse.json(
          { success: false, error: 'Facility not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: facility });
    }

    // 构建查询条件
    const where: any = {};
    
    if (airportIata) {
      where.airportIata = airportIata.toUpperCase();
    }
    
    if (terminal) {
      where.terminal = terminal;
    }
    
    if (service) {
      // 使用 contains 查询 JSON 字符串
      where.services = { contains: service };
    }

    const facilities = await prisma.facility.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        airport: {
          select: {
            iata: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: facilities,
      count: facilities.length 
    });

  } catch (error) {
    console.error('Get facilities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

// POST - 创建新设施
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    const requiredFields = ['airportIata', 'name', 'terminal', 'services'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 检查机场是否存在，不存在则自动创建
    const airportIata = body.airportIata.toUpperCase();
    let airport = await prisma.airport.findUnique({
      where: { iata: airportIata },
    });

    if (!airport) {
      // 自动创建机场记录
      airport = await prisma.airport.create({
        data: {
          iata: airportIata,
          name: body.airportName || `${airportIata} Airport`,
          city: body.airportCity || airportIata,
          country: body.airportCountry || 'Unknown',
          continent: body.airportContinent || 'Unknown',
          slug: `${airportIata.toLowerCase()}-airport`,
        },
      });
      console.log(`✈️ Auto-created airport: ${airportIata}`);
    }

    // 验证服务类型
    const services = Array.isArray(body.services) ? body.services : [body.services];
    const invalidServices = services.filter((s: string) => !VALID_SERVICES.includes(s));
    if (invalidServices.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid services: ${invalidServices.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证区域类型
    if (body.areaType && !VALID_AREA_TYPES.includes(body.areaType)) {
      return NextResponse.json(
        { success: false, error: `Invalid areaType: ${body.areaType}` },
        { status: 400 }
      );
    }

    // 构建创建数据
    const createData: any = {
      airportIata: body.airportIata.toUpperCase(),
      name: body.name,
      nameEn: body.nameEn,
      terminal: body.terminal,
      location: body.location,
      locationEn: body.locationEn,
      phone: body.phone,
      email: body.email,
      website: body.website,
      hours: body.hours,
      is24Hours: body.is24Hours ?? false,
      services: JSON.stringify(services),
      serviceDetails: body.serviceDetails ? JSON.stringify(body.serviceDetails) : null,
      areaType: body.areaType || 'AIRSIDE',
      immigrationRequired: body.immigrationRequired ?? false,
      features: body.features ? JSON.stringify(body.features) : null,
      capacity: body.capacity,
      notices: body.notices ? JSON.stringify(body.notices) : null,
      dataSource: body.dataSource || 'manual',
      rawContent: body.rawContent,
    };

    const facility = await prisma.facility.create({
      data: createData,
      include: { airport: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: facility,
      message: 'Facility created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Create facility error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}

// PUT - 更新设施
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing facility ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 检查设施是否存在
    const existing = await prisma.facility.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Facility not found' },
        { status: 404 }
      );
    }

    // 验证服务类型（如果提供了）
    if (body.services) {
      const services = Array.isArray(body.services) ? body.services : [body.services];
      const invalidServices = services.filter((s: string) => !VALID_SERVICES.includes(s));
      if (invalidServices.length > 0) {
        return NextResponse.json(
          { success: false, error: `Invalid services: ${invalidServices.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 构建更新数据
    const updateData: any = {};
    
    const stringFields = ['name', 'nameEn', 'terminal', 'location', 'locationEn', 'phone', 'email', 'website', 'hours', 'areaType', 'capacity', 'dataSource', 'rawContent'];
    const booleanFields = ['is24Hours', 'immigrationRequired'];
    const jsonFields = ['features', 'notices'];

    stringFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    booleanFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    jsonFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = typeof body[field] === 'string' ? body[field] : JSON.stringify(body[field]);
      }
    });

    if (body.services !== undefined) {
      const services = Array.isArray(body.services) ? body.services : [body.services];
      updateData.services = JSON.stringify(services);
    }

    if (body.serviceDetails !== undefined) {
      updateData.serviceDetails = typeof body.serviceDetails === 'string' 
        ? body.serviceDetails 
        : JSON.stringify(body.serviceDetails);
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: updateData,
      include: { airport: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: facility,
      message: 'Facility updated successfully' 
    });

  } catch (error) {
    console.error('Update facility error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update facility' },
      { status: 500 }
    );
  }
}

// DELETE - 删除设施
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing facility ID' },
        { status: 400 }
      );
    }

    // 检查设施是否存在
    const existing = await prisma.facility.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Facility not found' },
        { status: 404 }
      );
    }

    await prisma.facility.delete({ where: { id } });

    return NextResponse.json({ 
      success: true, 
      message: 'Facility deleted successfully' 
    });

  } catch (error) {
    console.error('Delete facility error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}
