'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Car,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface Stats {
  airports: number;
  parkings: number;
  popularAirports: number;
  featuredParkings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    airports: 0,
    parkings: 0,
    popularAirports: 0,
    featuredParkings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [airportsRes, parkingsRes] = await Promise.all([
        fetch('/api/admin/airports?limit=1'),
        fetch('/api/admin/parking?limit=1'),
      ]);

      if (airportsRes.ok && parkingsRes.ok) {
        const airportsData = await airportsRes.json();
        const parkingsData = await parkingsRes.json();

        setStats({
          airports: airportsData.total || 0,
          parkings: parkingsData.total || 0,
          popularAirports: 0,
          featuredParkings: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '机场总数',
      value: stats.airports,
      icon: Building2,
      color: 'bg-blue-500',
      href: '/admin/airports',
    },
    {
      title: '停车场总数',
      value: stats.parkings,
      icon: Car,
      color: 'bg-emerald-500',
      href: '/admin/parking',
    },
  ];

  const quickActions = [
    {
      title: '添加机场',
      description: '录入新的机场信息',
      icon: Plus,
      href: '/admin/airports/new',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: '添加停车场',
      description: '为机场添加停车场',
      icon: Plus,
      href: '/admin/parking/new',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">欢迎回来，这里是数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {loading ? '-' : card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                查看详情
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{action.title}</h3>
                  <p className="text-sm text-slate-500">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 ml-auto" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 最近活动提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">开始使用</h3>
            <p className="text-slate-600 mt-1 text-sm">
              您可以通过左侧菜单管理机场和停车场数据。建议先添加机场，再为每个机场添加停车场。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
