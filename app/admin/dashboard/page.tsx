'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  continent: string | null;
  isPopular: boolean;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jsonData, setJsonData] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // 删除功能状态
  const [deleteIata, setDeleteIata] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [clearConfirm, setClearConfirm] = useState('');
  const [clearing, setClearing] = useState(false);

  // 机场列表状态
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [batchDeleting, setBatchDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // 认证通过后加载机场列表
  useEffect(() => {
    if (isAuthenticated) {
      loadAirports();
    }
  }, [isAuthenticated, currentPage, searchQuery]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载机场列表
  const loadAirports = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`/api/admin/airports?page=${currentPage}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setAirports(data.airports);
        setTotalPages(data.totalPages);
        setTotalCount(data.total);
        // 清除已选择但不在当前页面的ID
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          data.airports.forEach((a: Airport) => {
            if (!newSet.has(a.id)) {
              newSet.delete(a.id);
            }
          });
          return newSet;
        });
      }
    } catch {
      setMessage('加载数据失败');
    } finally {
      setListLoading(false);
    }
  };

  // 选择/取消选择
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === airports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(airports.map(a => a.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      setMessage('请先选择要删除的机场');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个机场吗？此操作不可恢复。`)) {
      return;
    }

    setBatchDeleting(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/airports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setSelectedIds(new Set());
        loadAirports();
      } else {
        setMessage(data.error || '批量删除失败');
      }
    } catch {
      setMessage('批量删除请求失败，请重试');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setMessage('请输入 JSON 数据');
      return;
    }

    setImporting(true);
    setMessage('');
    setResult(null);

    try {
      let data;
      try {
        data = JSON.parse(jsonData);
      } catch {
        setMessage('JSON 格式错误，请检查输入');
        setImporting(false);
        return;
      }

      // 支持两种格式：直接数组或 { airports: [...] }
      const airports = Array.isArray(data) ? data : data.airports;

      if (!Array.isArray(airports)) {
        setMessage('数据格式错误：需要提供机场数组');
        setImporting(false);
        return;
      }

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airports }),
      });

      const resultData = await res.json();

      if (res.ok) {
        setMessage(resultData.message);
        setResult(resultData.results);
        setJsonData('');
      } else {
        setMessage(resultData.error || '导入失败');
      }
    } catch {
      setMessage('导入请求失败，请重试');
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  // 删除指定机场
  const handleDelete = async () => {
    if (!deleteIata.trim()) {
      setMessage('请输入要删除的机场IATA代码');
      return;
    }

    if (!confirm(`确定要删除机场 ${deleteIata.toUpperCase()} 吗？此操作不可恢复。`)) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/delete?iata=${deleteIata.toUpperCase()}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setDeleteIata('');
      } else {
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('删除请求失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  // 清空所有数据
  const handleClearAll = async () => {
    if (clearConfirm !== 'DELETE_ALL') {
      setMessage('请输入 DELETE_ALL 确认清空所有数据');
      return;
    }

    if (!confirm('警告：此操作将删除所有机场数据，不可恢复！确定要继续吗？')) {
      return;
    }

    setClearing(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE_ALL' }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setClearConfirm('');
      } else {
        setMessage(data.error || '清空失败');
      }
    } catch {
      setMessage('清空请求失败，请重试');
    } finally {
      setClearing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900">管理员后台</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* AI 导入入口 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI 辅助导入设施</h2>
                <p className="text-purple-100 text-sm">粘贴文本 → AI 提取 → 人工审查 → 保存入库</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/import')}
              className="px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              开始导入
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* JSON Import Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              批量导入机场数据 (JSON)
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* JSON Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                JSON 数据
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder={`支持格式：
[
  {
    "iata": "HND",
    "name": "Tokyo Haneda Airport",
    "city": "Tokyo",
    "country": "Japan",
    "continent": "Asia",
    "isPopular": true,
    "searchVolume": 1000,
    "luggageData": { "location": "Terminal 1", "price": "$10/day" },
    "showerData": { "location": "Terminal 2", "isFree": false },
    "sleepData": { "pods": "Yes", "quietZones": "Terminal 3" },
    "transitData": { "train": "Keikyu Line", "bus": "Airport Bus" }
  }
]`}
                className="w-full h-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                支持直接数组格式或 {'{'} airports: [...] {'}'} 格式
              </p>
            </div>

            {/* Import Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    导入中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    开始导入
                  </>
                )}
              </button>

              <button
                onClick={() => setJsonData('')}
                className="px-4 py-3 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                清空
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl ${
                message.includes('成功') || message.includes('完成')
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  message.includes('成功') || message.includes('完成')
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">导入结果</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-2xl font-black text-green-600">{result.success}</p>
                    <p className="text-xs text-slate-500">成功</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-2xl font-black text-red-600">{result.failed}</p>
                    <p className="text-xs text-slate-500">失败</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-slate-700 mb-2">错误详情：</p>
                    <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index} className="font-mono">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Airport List Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                机场数据列表
                <span className="text-sm font-normal text-slate-500">({totalCount} 条)</span>
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="搜索 IATA/名称/城市/国家"
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => loadAirports()}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                  title="刷新"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* 批量操作栏 */}
            {selectedIds.size > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                <span className="text-sm text-red-700 font-medium">
                  已选择 {selectedIds.size} 个机场
                </span>
                <button
                  onClick={handleBatchDelete}
                  disabled={batchDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {batchDeleting ? '删除中...' : '批量删除'}
                </button>
              </div>
            )}

            {/* 数据表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={airports.length > 0 && selectedIds.size === airports.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">IATA</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">名称</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">城市</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">国家</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">大洲</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase">热门</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        <svg className="animate-spin h-6 w-6 mx-auto text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="mt-2 text-sm">加载中...</p>
                      </td>
                    </tr>
                  ) : airports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        <p className="text-sm">暂无数据</p>
                      </td>
                    </tr>
                  ) : (
                    airports.map((airport) => (
                      <tr key={airport.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(airport.id)}
                            onChange={() => toggleSelect(airport.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                            {airport.iata}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">{airport.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{airport.city}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{airport.country}</td>
                        <td className="py-3 px-4 text-sm text-slate-500">{airport.continent || '-'}</td>
                        <td className="py-3 px-4">
                          {airport.isPopular && (
                            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                              ★ 热门
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  第 {currentPage} / {totalPages} 页
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Section */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除数据
            </h2>
          </div>

          <div className="p-6 space-y-8">
            {/* 删除指定机场 */}
            <div className="border-b border-slate-100 pb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">删除指定机场</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={deleteIata}
                  onChange={(e) => setDeleteIata(e.target.value.toUpperCase())}
                  placeholder="输入 IATA 代码 (如 HND)"
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent uppercase"
                  maxLength={3}
                />
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      删除中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      删除
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 清空所有数据 */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 text-red-600">⚠️ 清空所有数据</h3>
              <p className="text-sm text-slate-500 mb-4">
                此操作将删除所有机场数据，不可恢复。请输入 DELETE_ALL 确认。
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={clearConfirm}
                  onChange={(e) => setClearConfirm(e.target.value)}
                  placeholder="输入 DELETE_ALL 确认"
                  className="flex-1 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-slate-900 placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="px-6 py-3 bg-red-700 text-white font-bold rounded-xl hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {clearing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      清空中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      清空所有
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-sm font-bold text-blue-900 mb-3">数据格式说明</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>iata</strong>: 机场三字代码 (必填，如 HND)</li>
            <li>• <strong>name</strong>: 机场名称 (必填)</li>
            <li>• <strong>city</strong>: 城市 (必填)</li>
            <li>• <strong>country</strong>: 国家 (必填)</li>
            <li>• <strong>continent</strong>: 大洲 (可选: Asia, Europe, North America, South America, Africa, Oceania)</li>
            <li>• <strong>isPopular</strong>: 是否热门 (可选: true/false)</li>
            <li>• <strong>searchVolume</strong>: 搜索量 (可选: 数字)</li>
            <li>• <strong>luggageData/showerData/sleepData/transitData</strong>: 服务数据 (可选: JSON 对象)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
