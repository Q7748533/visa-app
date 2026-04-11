'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

interface Airport {
  id: string;
  iata: string;
  iataCode: string | null;
  name: string;
  city: string;
  country: string;
  isPopular: boolean;
  isActive: boolean;
}

export default function EditAirportPage({ params }: { params: Promise<{ id: string }> }) {
  const [airportId, setAirportId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Airport>>({
    iata: '',
    name: '',
    city: '',
    country: 'USA',
    isPopular: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    params.then(p => {
      setAirportId(p.id);
      loadAirport(p.id);
    });
  }, [params]);

  const loadAirport = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/airports/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data.airport);
      } else {
        setMessage('加载机场数据失败');
      }
    } catch (error) {
      console.error('Failed to load airport:', error);
      setMessage('加载机场数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // 验证
    if (!formData.iata || formData.iata.length !== 3) {
      setMessage('IATA 代码必须是 3 个字母');
      setSaving(false);
      return;
    }

    if (!formData.name || !formData.city || !formData.country) {
      setMessage('请填写所有必填字段');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/airports/${airportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          iata: formData.iata?.toUpperCase(),
          iataCode: formData.iata?.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('更新成功！');
        setTimeout(() => {
          router.push('/admin/airports');
        }, 1000);
      } else {
        setMessage(data.error || '更新失败');
      }
    } catch {
      setMessage('请求失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/admin/airports"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回机场列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">编辑机场</h1>
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
          {/* IATA 代码 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              IATA 代码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.iata || ''}
              onChange={(e) => setFormData({ ...formData, iata: e.target.value.toUpperCase() })}
              maxLength={3}
              placeholder="如: JFK"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">3 位字母代码，如 JFK、LAX</p>
          </div>

          {/* 机场名称 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              机场名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如: John F. Kennedy International Airport"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 城市 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              城市 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="如: New York"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 国家 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              国家
            </label>
            <div className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-medium">
              USA
            </div>
          </div>

          {/* 选项 */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">热门机场</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">启用</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
          <Link
            href="/admin/airports"
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
