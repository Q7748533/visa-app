'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

export default function NewAirportPage() {
  const [formData, setFormData] = useState({
    iata: '',
    name: '',
    city: '',
    country: 'USA',
    isPopular: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 验证
    if (!formData.iata || formData.iata.length !== 3) {
      setMessage('IATA 代码必须是 3 个字母');
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.city || !formData.country) {
      setMessage('请填写所有必填字段');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/airports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          iata: formData.iata.toUpperCase(),
          iataCode: formData.iata.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('添加成功！');
        setTimeout(() => {
          router.push('/admin/airports');
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
        <h1 className="text-2xl font-black text-slate-900">添加机场</h1>
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
              value={formData.iata}
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
              value={formData.name}
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
              value={formData.city}
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
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? '保存中...' : '保存'}
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
