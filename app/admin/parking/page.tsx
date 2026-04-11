'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Car,
  Filter,
} from 'lucide-react';

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
}

interface ParkingLot {
  id: string;
  name: string;
  slug: string;
  type: 'OFFICIAL' | 'OFF_SITE';
  dailyRate: number;
  distanceMiles: number | null;
  shuttleMins: number | null;
  isIndoor: boolean;
  hasValet: boolean;
  is24Hours: boolean;
  rating: number | null;
  reviewCount: number | null;
  featured: boolean;
  isActive: boolean;
  airport: {
    iata: string;
    name: string;
    city: string;
  };
}

export default function ParkingListPage() {
  const [parkings, setParkings] = useState<ParkingLot[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const limit = 20;

  useEffect(() => {
    loadAirports();
    loadParkings();
  }, []);

  useEffect(() => {
    loadParkings();
  }, [page, search, selectedAirport]);

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

  const loadParkings = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/parking?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (selectedAirport) {
        url += `&airport=${encodeURIComponent(selectedAirport)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setParkings(data.parkings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load parkings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除停车场 "${name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/parking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });

      if (res.ok) {
        setMessage('删除成功');
        loadParkings();
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
      setMessage('请先选择要删除的停车场');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个停车场吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/parking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setMessage(`成功删除 ${selectedIds.size} 个停车场`);
        setSelectedIds(new Set());
        loadParkings();
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
    if (selectedIds.size === parkings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parkings.map((p) => p.id)));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">停车场管理</h1>
          <p className="text-slate-500 mt-1">共 {total} 个停车场</p>
        </div>
        <Link
          href="/admin/parking/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加停车场
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

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* 搜索框 */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索停车场名称..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 机场筛选 */}
          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedAirport}
              onChange={(e) => {
                setSelectedAirport(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
            >
              <option value="">所有机场</option>
              {airports.map((airport) => (
                <option key={airport.id} value={airport.iata.toLowerCase()}>
                  {airport.iata} - {airport.city}
                </option>
              ))}
            </select>
            <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-270 pointer-events-none" />
          </div>
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

      {/* 停车场列表 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">加载中...</div>
        ) : parkings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">暂无停车场数据</h3>
            <p className="text-slate-500 mb-4">点击上方按钮添加第一个停车场</p>
            <Link
              href="/admin/parking/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              添加停车场
            </Link>
          </div>
        ) : (
          <>
            {/* 表头 */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-600">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedIds.size === parkings.length && parkings.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </div>
              <div className="col-span-3">停车场</div>
              <div className="col-span-2">机场</div>
              <div className="col-span-1">类型</div>
              <div className="col-span-1 text-right">价格/天</div>
              <div className="col-span-1 text-center">评分</div>
              <div className="col-span-1 text-center">推荐</div>
              <div className="col-span-1 text-center">状态</div>
              <div className="col-span-1 text-right">操作</div>
            </div>

            {/* 列表内容 */}
            <div className="divide-y divide-slate-100">
              {parkings.map((parking) => (
                <div
                  key={parking.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-12 lg:col-span-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(parking.id)}
                      onChange={() => toggleSelect(parking.id)}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="lg:hidden text-sm text-slate-500">选择</span>
                  </div>

                  <div className="col-span-12 lg:col-span-3">
                    <div className="font-bold text-slate-900">{parking.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      {parking.isIndoor && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">室内</span>
                      )}
                      {parking.hasValet && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">代客</span>
                      )}
                      {parking.is24Hours && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">24h</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-6 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded">
                        {parking.airport.iata}
                      </span>
                      <span className="text-sm text-slate-600 truncate">
                        {parking.airport.city}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-6 lg:col-span-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        parking.type === 'OFFICIAL'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {parking.type === 'OFFICIAL' ? '官方' : '第三方'}
                    </span>
                  </div>

                  <div className="col-span-4 lg:col-span-1 text-right">
                    <span className="font-bold text-emerald-600">
                      {formatPrice(parking.dailyRate)}
                    </span>
                  </div>

                  <div className="col-span-4 lg:col-span-1 text-center">
                    {parking.rating ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-slate-700">{parking.rating}</span>
                        <span className="text-xs text-slate-400">({parking.reviewCount || 0})</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1 text-center">
                    {parking.featured ? (
                      <span className="inline-flex px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                        推荐
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1 text-center">
                    {parking.isActive ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-400 mx-auto" />
                    )}
                  </div>

                  <div className="col-span-12 lg:col-span-1 flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/parking/${parking.id}/edit`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(parking.id, parking.name)}
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
