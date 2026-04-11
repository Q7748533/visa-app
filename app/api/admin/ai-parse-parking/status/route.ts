/**
 * AI 停车场数据解析 - 任务状态查询 API
 * GET /api/admin/ai-parse-parking/status?taskId=xxx
 * 
 * 查询任务状态和结果
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: '请提供任务ID' },
        { status: 400 }
      );
    }

    const task = await prisma.aIParsingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      taskId: task.id,
      status: task.status,
      result: task.result ? JSON.parse(task.result) : null,
      error: task.error,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    console.error('Query task error:', error);
    return NextResponse.json(
      { error: '查询任务失败' },
      { status: 500 }
    );
  }
}
