/**
 * AI 停车场数据解析 - 异步任务提交 API
 * POST /api/admin/ai-parse-parking/async
 * 
 * 请求体: { rawData: string }
 * 响应: { taskId: string, status: 'pending' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { rawData } = await request.json();

    if (!rawData || typeof rawData !== 'string') {
      return NextResponse.json(
        { error: '请提供原始数据' },
        { status: 400 }
      );
    }

    // 创建任务记录
    const task = await prisma.aIParsingTask.create({
      data: {
        status: 'pending',
        taskType: 'parking_parse',
        inputData: rawData,
      },
    });

    // 触发后台处理（不等待完成）
    // 使用 fetch 调用处理端点，不等待响应
    fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/admin/ai-parse-parking/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    }).catch(err => console.error('Background processing error:', err));

    return NextResponse.json({
      success: true,
      taskId: task.id,
      status: 'pending',
    });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}
