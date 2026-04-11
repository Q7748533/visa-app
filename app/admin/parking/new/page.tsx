'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Car } from 'lucide-react';

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
}

export default function NewParkingPage() {
  const [formData, setFormData] = useState({
    name: '',
    airportIataCode: '',
    type: 'OFF_SITE',
    dailyRate: '',
    distanceMiles: '',
    shuttleMins: '',
    isIndoor: false,
    hasValet: false,
    is24Hours: true,
    rating: '',
    reviewCount: '',
    tags: '',
    affiliateUrl: '',
    featured: false,
    isActive: true,
    // 详情页扩展字段
    address: '',
    shuttleFrequency: '',
    shuttleHours: '',
    arrivalDirections: '',
    thingsToKnow: '',
  });
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      const res = await fetch('/api/admin/airports?limit=1000');
      if (res.ok) {
        const data = await res.json();
        setAirports(data.airports);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 验证
    if (!formData.name || !formData.airportIataCode || !formData.dailyRate) {
      setMessage('请填写所有必填字段');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/parking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dailyRate: parseFloat(formData.dailyRate),
          distanceMiles: formData.distanceMiles ? parseFloat(formData.distanceMiles) : null,
          shuttleMins: formData.shuttleMins ? parseInt(formData.shuttleMins) : null,
          rating: formData.rating ? parseFloat(formData.rating) : null,
          reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          address: formData.address || null,
          shuttleFrequency: formData.shuttleFrequency || null,
          shuttleHours: formData.shuttleHours || null,
          arrivalDirections: formData.arrivalDirections || null,
          thingsToKnow: formData.thingsToKnow || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('添加成功！');
        setTimeout(() => {
          router.push('/admin/parking');
        }, 1000);
      } else {
        setMessage(data.error || '添加失败');
      }
    } catch {
      setMessage('请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/admin/parking"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回停车场列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Car className="w-5 h-5 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">添加停车场</h1>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('成功')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 所属机场 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              所属机场 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.airportIataCode}
              onChange={(e) => setFormData({ ...formData, airportIataCode: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">选择机场</option>
              {airports.map((airport) => (
                <option key={airport.id} value={airport.iata.toLowerCase()}>
                  {airport.iata} - {airport.name} ({airport.city})
                </option>
              ))}
            </select>
          </div>

          {/* 停车场名称 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              停车场名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如: The Parking Spot"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="OFF_SITE">场外停车场 (Off-Site)</option>
              <option value="OFFICIAL">官方停车场 (Official)</option>
            </select>
          </div>

          {/* 日租金 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              日租金 (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.dailyRate}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
              placeholder="如: 12.50"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 距离 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">距离航站楼 (英里)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.distanceMiles}
              onChange={(e) => setFormData({ ...formData, distanceMiles: e.target.value })}
              placeholder="如: 2.5"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 班车时间 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">班车时间 (分钟)</label>
            <input
              type="number"
              min="0"
              value={formData.shuttleMins}
              onChange={(e) => setFormData({ ...formData, shuttleMins: e.target.value })}
              placeholder="如: 5"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 评分 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">评分 (0-5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              placeholder="如: 4.5"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 评论数 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">评论数</label>
            <input
              type="number"
              min="0"
              value={formData.reviewCount}
              onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value })}
              placeholder="如: 1200"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 标签 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">标签</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="如: Best Value, Covered, 24/7 (用逗号分隔)"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 联盟链接 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">联盟链接</label>
            <input
              type="url"
              value={formData.affiliateUrl}
              onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 详细地址 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">详细地址</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="如: 123 Airport Blvd, Los Angeles, CA 90045"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 班车频率 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">班车频率</label>
            <input
              type="text"
              value={formData.shuttleFrequency}
              onChange={(e) => setFormData({ ...formData, shuttleFrequency: e.target.value })}
              placeholder="如: Every 20-35 mins"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 班车运营时间 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">班车运营时间</label>
            <input
              type="text"
              value={formData.shuttleHours}
              onChange={(e) => setFormData({ ...formData, shuttleHours: e.target.value })}
              placeholder="如: 4:00 AM - 12:00 AM"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 到达路线指引 (JSON) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              到达路线指引 (JSON格式)
              <span className="text-xs font-normal text-slate-500 ml-2">可选，用于详情页显示路线</span>
            </label>
            <textarea
              value={formData.arrivalDirections}
              onChange={(e) => setFormData({ ...formData, arrivalDirections: e.target.value })}
              placeholder={`示例:
{
  "fromWest": {
    "description": "从西边来的路线描述...",
    "warning": "重要提醒（可选）"
  },
  "fromNorth": {
    "description": "从北边来的路线描述..."
  }
}`}
              rows={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>

          {/* 注意事项 (JSON) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              注意事项列表 (JSON格式)
              <span className="text-xs font-normal text-slate-500 ml-2">可选，用于详情页显示须知</span>
            </label>
            <textarea
              value={formData.thingsToKnow}
              onChange={(e) => setFormData({ ...formData, thingsToKnow: e.target.value })}
              placeholder={`示例:
[
  { "title": "预订要求", "content": "需要提前24小时预订" },
  { "content": "最长停车期限为30天" }
]`}
              rows={6}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>

          {/* 选项 */}
          <div className="md:col-span-2 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isIndoor}
                onChange={(e) => setFormData({ ...formData, isIndoor: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm text-slate-700">室内/有顶棚</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasValet}
                onChange={(e) => setFormData({ ...formData, hasValet: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm text-slate-700">代客泊车</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is24Hours}
                onChange={(e) => setFormData({ ...formData, is24Hours: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm text-slate-700">24小时营业</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm text-slate-700">置顶推荐</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-sm text-slate-700">启用</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? '保存中...' : '保存'}
          </button>
          <Link
            href="/admin/parking"
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
