/**
 * 按需重新验证 API
 * POST /api/admin/revalidate
 * 
 * 请求体: { path: string }
 * 用于后台操作后立即更新页面缓存
 */

import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: '请提供需要重新验证的路径' },
        { status: 400 }
      );
    }

    // 重新验证指定路径
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      message: `路径 ${path} 已重新验证`,
      revalidated: true,
    });
  } catch (error) {
    console.error('Revalidate error:', error);
    return NextResponse.json(
      { error: '重新验证失败' },
      { status: 500 }
    );
  }
}
