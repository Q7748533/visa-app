'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Airport {
  id: string;
  iata: string;
  iataCode: string | null;
  name: string;
  city: string;
  country: string;
  isPopular: boolean;
  isActive: boolean;
  _count?: {
    parkings: number;
  };
}

export default function AirportsListPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const router = useRouter();
  const limit = 20;

  useEffect(() => {
    loadAirports();
  }, [page, search]);

  const loadAirports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/airports?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setAirports(data.airports);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load airports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除机场 "${name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/airports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });

      if (res.ok) {
        setMessage('删除成功');
        loadAirports();
      } else {
        const data = await res.json();
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('删除请求失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      setMessage('请先选择要删除的机场');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个机场吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/airports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setMessage(`成功删除 ${selectedIds.size} 个机场`);
        setSelectedIds(new Set());
        loadAirports();
      } else {
        const data = await res.json();
        setMessage(data.error || '批量删除失败');
      }
    } catch {
      setMessage('批量删除请求失败');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === airports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(airports.map((a) => a.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">机场管理</h1>
          <p className="text-slate-500 mt-1">共 {total} 个机场</p>
        </div>
        <Link
          href="/admin/airports/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加机场
        </Link>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('成功')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* 搜索和批量操作 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索 IATA、机场名、城市..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={handleBatchDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除选中 ({selectedIds.size})
          </button>
        )}
      </div>

      {/* 机场列表 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">加载中...</div>
        ) : airports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">暂无机场数据</h3>
            <p className="text-slate-500 mb-4">点击上方按钮添加第一个机场</p>
            <Link
              href="/admin/airports/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              添加机场
            </Link>
          </div>
        ) : (
          <>
            {/* 表头 */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-600">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedIds.size === airports.length && airports.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-1">IATA</div>
              <div className="col-span-4">机场名称</div>
              <div className="col-span-2">城市</div>
              <div className="col-span-1">国家</div>
              <div className="col-span-1 text-center">停车场</div>
              <div className="col-span-1 text-center">状态</div>
              <div className="col-span-1 text-right">操作</div>
            </div>

            {/* 列表内容 */}
            <div className="divide-y divide-slate-100">
              {airports.map((airport) => (
                <div
                  key={airport.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-12 md:col-span-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(airport.id)}
                      onChange={() => toggleSelect(airport.id)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="md:hidden text-sm text-slate-500">选择</span>
                  </div>

                  <div className="col-span-6 md:col-span-1">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 text-slate-700 font-black text-sm rounded">
                      {airport.iata}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <div className="font-bold text-slate-900">{airport.name}</div>
                    {airport.isPopular && (
                      <span className="inline-block mt-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        热门
                      </span>
                    )}
                  </div>

                  <div className="col-span-6 md:col-span-2 flex items-center text-slate-600">
                    <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                    {airport.city}
                  </div>

                  <div className="col-span-6 md:col-span-1 flex items-center text-slate-600">
                    <Globe className="w-4 h-4 mr-1 text-slate-400" />
                    {airport.country}
                  </div>

                  <div className="col-span-4 md:col-span-1 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 font-bold rounded-full text-sm">
                      {airport._count?.parkings || 0}
                    </span>
                  </div>

                  <div className="col-span-4 md:col-span-1 text-center">
                    {airport.isActive ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400 mx-auto" />
                    )}
                  </div>

                  <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/airports/${airport.id}/edit`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(airport.id, airport.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  第 {page} 页，共 {totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
