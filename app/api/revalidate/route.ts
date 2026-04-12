import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * 按需刷新缓存 API
 * 用于后台修改数据后主动刷新相关页面
 * 
 * 调用方式:
 * POST /api/revalidate
 * Body: { type: 'parking' | 'airport' | 'airports', slug?: string, iata?: string }
 * Header: Authorization: Bearer <token>
 */

// 简单的 token 验证（生产环境应该使用更安全的方案）
const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || 'your-secret-token';

export async function POST(request: NextRequest) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, slug, iata } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    const revalidated: string[] = [];

    switch (type) {
      case 'parking': {
        // 刷新停车场详情页 - 需要同时提供 slug 和 iata
        if (slug && iata) {
          const iataLower = iata.toLowerCase();
          revalidatePath(`/airports/${iataLower}/parking/${slug}`);
          revalidated.push(`/airports/${iataLower}/parking/${slug}`);
        }
        break;
      }

      case 'airport': {
        // 刷新机场详情页
        if (iata) {
          const iataLower = iata.toLowerCase();
          revalidatePath(`/airports/${iataLower}/parking`);
          revalidated.push(`/airports/${iataLower}/parking`);
          
          // 同时刷新机场列表页（因为列表页显示该机场的最低价格）
          revalidatePath('/airports');
          revalidated.push('/airports');
        }
        break;
      }

      case 'airports': {
        // 刷新所有机场列表页
        revalidatePath('/airports');
        revalidated.push('/airports');
        break;
      }

      case 'all': {
        // 刷新所有页面
        revalidatePath('/', 'layout');
        revalidated.push('All pages');
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: parking, airport, airports, or all' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      revalidated,
      now: Date.now(),
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

/**
 * 便捷的刷新函数，供后台 API 调用
 */
export async function revalidateParking(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const token = process.env.REVALIDATE_TOKEN || 'your-secret-token';
    
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type: 'parking', slug }),
    });

    if (!res.ok) {
      console.error('Failed to revalidate parking:', await res.text());
    }
    
    return res.ok;
  } catch (error) {
    console.error('Revalidate parking error:', error);
    return false;
  }
}

export async function revalidateAirport(iata: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const token = process.env.REVALIDATE_TOKEN || 'your-secret-token';
    
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type: 'airport', iata }),
    });

    if (!res.ok) {
      console.error('Failed to revalidate airport:', await res.text());
    }
    
    return res.ok;
  } catch (error) {
    console.error('Revalidate airport error:', error);
    return false;
  }
}

export async function revalidateAirports() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const token = process.env.REVALIDATE_TOKEN || 'your-secret-token';
    
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type: 'airports' }),
    });

    if (!res.ok) {
      console.error('Failed to revalidate airports:', await res.text());
    }
    
    return res.ok;
  } catch (error) {
    console.error('Revalidate airports error:', error);
    return false;
  }
}
