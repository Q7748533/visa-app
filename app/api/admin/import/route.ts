import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// 验证管理员身份
async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');
  return token?.value === 'authenticated';
}

export async function POST(req: Request) {
  try {
    // 验证身份
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { airports } = await req.json();

    if (!Array.isArray(airports) || airports.length === 0) {
      return NextResponse.json(
        { error: '无效的数据格式，需要提供机场数组' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // 批量导入机场数据
    for (const airport of airports) {
      try {
        const {
          iata,
          name,
          city,
          country,
          continent,
          isPopular,
          searchVolume,
          luggageData,
          showerData,
          sleepData,
          transitData,
        } = airport;

        // 验证必填字段
        if (!iata || !name || !city || !country) {
          results.failed++;
          results.errors.push(`${iata || '未知'}: 缺少必填字段`);
          continue;
        }

        // 生成 slug
        const slug = `${iata.toLowerCase()}-airport`;

        await prisma.airport.upsert({
          where: { iata: iata.toUpperCase() },
          update: {
            name,
            city,
            country,
            continent: continent || null,
            slug,
            isPopular: isPopular || false,
            searchVolume: searchVolume || 0,
            luggageData: luggageData ? JSON.stringify(luggageData) : null,
            showerData: showerData ? JSON.stringify(showerData) : null,
            sleepData: sleepData ? JSON.stringify(sleepData) : null,
            transitData: transitData ? JSON.stringify(transitData) : null,
          },
          create: {
            iata: iata.toUpperCase(),
            name,
            city,
            country,
            continent: continent || null,
            slug,
            isPopular: isPopular || false,
            searchVolume: searchVolume || 0,
            luggageData: luggageData ? JSON.stringify(luggageData) : null,
            showerData: showerData ? JSON.stringify(showerData) : null,
            sleepData: sleepData ? JSON.stringify(sleepData) : null,
            transitData: transitData ? JSON.stringify(transitData) : null,
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${airport.iata || '未知'}: ${error instanceof Error ? error.message : '导入失败'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `导入完成: ${results.success} 成功, ${results.failed} 失败`,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: '导入失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
