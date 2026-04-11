'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Car, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
}

interface ParkingLot {
  id: string;
  name: string;
  airportIataCode: string;
  type: 'OFFICIAL' | 'OFF_SITE';
  dailyRate: number;
  distanceMiles: number | null;
  shuttleMins: number | null;
  isIndoor: boolean;
  hasValet: boolean;
  is24Hours: boolean;
  rating: number | null;
  reviewCount: number | null;
  tags: string | null;
  affiliateUrl: string | null;
  featured: boolean;
  isActive: boolean;
  // 详情页扩展字段
  address: string | null;
  shuttleFrequency: string | null;
  shuttleHours: string | null;
  arrivalDirections: string | null;
  thingsToKnow: Array<{title?: string; content: string}> | null;
  // Way.com 特有字段
  description: string | null;
  shuttleDesc: string | null;
  cancellationPolicy: string | null;
  parkingAccess: string | null;
  operatingDays: string | null;
  contactPhone: string | null;
  recommendationPct: number | null;
  locationRating: number | null;
  staffRating: number | null;
  facilityRating: number | null;
  safetyRating: number | null;
  dataSource: string;
}

export default function EditParkingPage({ params }: { params: Promise<{ id: string }> }) {
  const [parkingId, setParkingId] = useState<string>('');
  const [formData, setFormData] = useState<Partial<ParkingLot>>({
    name: '',
    airportIataCode: '',
    type: 'OFF_SITE',
    dailyRate: 0,
    distanceMiles: null,
    shuttleMins: null,
    isIndoor: false,
    hasValet: false,
    is24Hours: true,
    rating: null,
    reviewCount: null,
    tags: '',
    affiliateUrl: '',
    featured: false,
    isActive: true,
    // 详情页扩展字段
    address: '',
    shuttleFrequency: '',
    shuttleHours: '',
    arrivalDirections: '',
    thingsToKnow: [],
    // Way.com 特有字段
    description: '',
    shuttleDesc: '',
    cancellationPolicy: '',
    parkingAccess: '',
    operatingDays: '',
    contactPhone: '',
    recommendationPct: null,
    locationRating: null,
    staffRating: null,
    facilityRating: null,
    safetyRating: null,
    dataSource: 'way.com',
  });
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // AI 智能填充相关状态
  const [aiRawData, setAiRawData] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    params.then(p => {
      setParkingId(p.id);
      loadData(p.id);
    });
  }, [params]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [parkingRes, airportsRes] = await Promise.all([
        fetch(`/api/admin/parking/${id}`),
        fetch('/api/admin/airports?limit=1000'),
      ]);

      if (parkingRes.ok && airportsRes.ok) {
        const parkingData = await parkingRes.json();
        const airportsData = await airportsRes.json();
        
        // 解析 thingsToKnow JSON 字符串为数组
        let thingsToKnowArray: Array<{title?: string; content: string}> = [];
        if (parkingData.parking.thingsToKnow) {
          try {
            const parsed = JSON.parse(parkingData.parking.thingsToKnow);
            if (Array.isArray(parsed)) {
              thingsToKnowArray = parsed;
            }
          } catch (e) {
            console.error('Failed to parse thingsToKnow:', e);
          }
        }
        
        setFormData({
          ...parkingData.parking,
          tags: parkingData.parking.tags ? JSON.parse(parkingData.parking.tags).join(', ') : '',
          thingsToKnow: thingsToKnowArray,
        });
        setAirports(airportsData.airports);
      } else {
        setMessage('加载数据失败');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // AI 智能填充处理函数
  const handleAIParse = async () => {
    if (!aiRawData.trim()) {
      setMessage('请先粘贴原始数据');
      return;
    }

    setAiParsing(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/ai-parse-parking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData: aiRawData }),
      });

      const data = await res.json();

      if (res.ok && data.data) {
        const parsed = data.data;
        
        // 更新表单数据
        setFormData(prev => {
          // 处理 thingsToKnow - 确保是数组格式
          let thingsToKnowArray: Array<{title?: string; content: string}> = prev.thingsToKnow || [];
          if (parsed.thingsToKnow) {
            if (Array.isArray(parsed.thingsToKnow)) {
              // AI 返回的是数组，直接使用
              thingsToKnowArray = parsed.thingsToKnow;
            } else if (typeof parsed.thingsToKnow === 'string') {
              // 是字符串，尝试解析为数组
              try {
                const parsedArray = JSON.parse(parsed.thingsToKnow);
                if (Array.isArray(parsedArray)) {
                  thingsToKnowArray = parsedArray;
                }
              } catch {
                // 不是有效 JSON 数组，忽略
              }
            }
          }
          
          return {
            ...prev,
            name: parsed.name || prev.name,
            address: parsed.address || prev.address,
            dailyRate: parsed.dailyRate !== undefined ? parsed.dailyRate : prev.dailyRate,
            distanceMiles: parsed.distanceMiles !== undefined ? parsed.distanceMiles : prev.distanceMiles,
            shuttleMins: parsed.shuttleMins !== undefined ? parsed.shuttleMins : prev.shuttleMins,
            rating: parsed.rating !== undefined ? parsed.rating : prev.rating,
            reviewCount: parsed.reviewCount !== undefined ? parsed.reviewCount : prev.reviewCount,
            tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags.join(', ') : prev.tags,
            shuttleFrequency: parsed.shuttleFrequency || prev.shuttleFrequency,
            shuttleHours: parsed.shuttleHours || prev.shuttleHours,
            arrivalDirections: parsed.arrivalDirections || prev.arrivalDirections,
            thingsToKnow: thingsToKnowArray,
            isIndoor: parsed.isIndoor !== undefined ? parsed.isIndoor : prev.isIndoor,
            hasValet: parsed.hasValet !== undefined ? parsed.hasValet : prev.hasValet,
            is24Hours: parsed.is24Hours !== undefined ? parsed.is24Hours : prev.is24Hours,
          };
        });

        setMessage('AI 解析成功！已自动填充表单');
        setShowAiPanel(false);
        setAiRawData('');
      } else {
        setMessage(data.error || 'AI 解析失败');
      }
    } catch (error) {
      console.error('AI parse error:', error);
      setMessage('AI 解析请求失败');
    } finally {
      setAiParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // 验证
    if (!formData.name || !formData.airportIataCode || !formData.dailyRate) {
      setMessage('请填写所有必填字段');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/parking/${parkingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dailyRate: parseFloat(formData.dailyRate.toString()),
          distanceMiles: formData.distanceMiles ? parseFloat(formData.distanceMiles.toString()) : null,
          shuttleMins: formData.shuttleMins ? parseInt(formData.shuttleMins.toString()) : null,
          rating: formData.rating ? parseFloat(formData.rating.toString()) : null,
          reviewCount: formData.reviewCount ? parseInt(formData.reviewCount.toString()) : null,
          tags: formData.tags ? (formData.tags as string).split(',').map(t => t.trim()) : [],
          address: formData.address || null,
          shuttleFrequency: formData.shuttleFrequency || null,
          shuttleHours: formData.shuttleHours || null,
          arrivalDirections: formData.arrivalDirections || null,
          thingsToKnow: formData.thingsToKnow && formData.thingsToKnow.length > 0
            ? JSON.stringify(formData.thingsToKnow)
            : null,
          // Way.com 特有字段
          description: formData.description || null,
          shuttleDesc: formData.shuttleDesc || null,
          cancellationPolicy: formData.cancellationPolicy || null,
          parkingAccess: formData.parkingAccess || null,
          operatingDays: formData.operatingDays || null,
          contactPhone: formData.contactPhone || null,
          recommendationPct: formData.recommendationPct ? parseInt(formData.recommendationPct.toString()) : null,
          locationRating: formData.locationRating ? parseFloat(formData.locationRating.toString()) : null,
          staffRating: formData.staffRating ? parseFloat(formData.staffRating.toString()) : null,
          facilityRating: formData.facilityRating ? parseFloat(formData.facilityRating.toString()) : null,
          safetyRating: formData.safetyRating ? parseFloat(formData.safetyRating.toString()) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('更新成功！');
        // 保存后留在当前页面，不跳转
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">加载中...</div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-black text-slate-900">编辑停车场</h1>
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

      {/* AI 智能填充面板 */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-bold text-violet-900">AI 智能填充</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium"
          >
            {showAiPanel ? '收起' : '展开'}
          </button>
        </div>
        
        {showAiPanel && (
          <div className="space-y-4">
            <p className="text-sm text-violet-700">
              粘贴停车场的原始数据（如 SpotHero 的 JSON 数据或其他文本），AI 会自动提取并填充表单字段。
            </p>
            <textarea
              value={aiRawData}
              onChange={(e) => setAiRawData(e.target.value)}
              placeholder="在此粘贴原始数据..."
              rows={6}
              className="w-full px-4 py-3 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAIParse}
                disabled={aiParsing || !aiRawData.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {aiParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI 解析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    开始 AI 解析
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiRawData('');
                  setShowAiPanel(false);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                取消
              </button>
            </div>
          </div>
        )}
        
        {!showAiPanel && (
          <p className="text-sm text-violet-600">
            点击"展开"使用 AI 自动填充功能
          </p>
        )}
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 所属机场 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              所属机场 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.airportIataCode || ''}
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
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="如: The Parking Spot"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">类型</label>
            <select
              value={formData.type || 'OFF_SITE'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'OFFICIAL' | 'OFF_SITE' })}
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
              value={formData.dailyRate || ''}
              onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value ? parseFloat(e.target.value) : 0 })}
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
              value={formData.distanceMiles || ''}
              onChange={(e) => setFormData({ ...formData, distanceMiles: e.target.value ? parseFloat(e.target.value) : null })}
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
              value={formData.shuttleMins || ''}
              onChange={(e) => setFormData({ ...formData, shuttleMins: e.target.value ? parseInt(e.target.value) : null })}
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
              value={formData.rating || ''}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : null })}
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
              value={formData.reviewCount || ''}
              onChange={(e) => setFormData({ ...formData, reviewCount: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="如: 1200"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 标签 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">标签</label>
            <input
              type="text"
              value={formData.tags || ''}
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
              value={formData.affiliateUrl || ''}
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
              value={formData.address || ''}
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
              value={formData.shuttleFrequency || ''}
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
              value={formData.shuttleHours || ''}
              onChange={(e) => setFormData({ ...formData, shuttleHours: e.target.value })}
              placeholder="如: 4:00 AM - 12:00 AM"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 到达路线指引 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              到达路线指引
              <span className="text-xs font-normal text-slate-500 ml-2">可选，用于详情页显示路线</span>
            </label>
            <textarea
              value={formData.arrivalDirections || ''}
              onChange={(e) => setFormData({ ...formData, arrivalDirections: e.target.value })}
              placeholder="输入到达停车场的路线指引..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 注意事项列表 */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                注意事项列表
                <span className="text-xs font-normal text-slate-500 ml-2">可选，用于详情页显示须知</span>
              </label>
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  thingsToKnow: [...(formData.thingsToKnow || []), { title: '', content: '' }] 
                })}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                添加条目
              </button>
            </div>
            
            <div className="space-y-3">
              {(formData.thingsToKnow || []).map((item, index) => (
                <div key={index} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...(formData.thingsToKnow || [])];
                        newItems[index] = { ...item, title: e.target.value };
                        setFormData({ ...formData, thingsToKnow: newItems });
                      }}
                      placeholder="标题（可选）"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <textarea
                      value={item.content}
                      onChange={(e) => {
                        const newItems = [...(formData.thingsToKnow || [])];
                        newItems[index] = { ...item, content: e.target.value };
                        setFormData({ ...formData, thingsToKnow: newItems });
                      }}
                      placeholder="内容"
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = (formData.thingsToKnow || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, thingsToKnow: newItems });
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(formData.thingsToKnow || []).length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg">
                  暂无注意事项，点击"添加条目"添加
                </div>
              )}
            </div>
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

          {/* Way.com 特有字段 - 分隔标题 */}
          <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Way.com</span>
              扩展字段
            </h3>
          </div>

          {/* 详细描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              详细描述
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="停车场详细描述..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 班车详细描述 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              班车详细描述
            </label>
            <input
              type="text"
              value={formData.shuttleDesc || ''}
              onChange={(e) => setFormData({ ...formData, shuttleDesc: e.target.value })}
              placeholder="如：Free shuttle service to and from the airport terminals, running every 15 minutes daily"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 取消政策 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              取消政策
            </label>
            <textarea
              value={formData.cancellationPolicy || ''}
              onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
              placeholder="如：Flexible. You can cancel the parking reservation up to the minute before the check-in time..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 到达指引 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              到达指引 (Parking Access)
            </label>
            <textarea
              value={formData.parkingAccess || ''}
              onChange={(e) => setFormData({ ...formData, parkingAccess: e.target.value })}
              placeholder="到达停车场的详细指引..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 运营时间 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              运营时间
            </label>
            <input
              type="text"
              value={formData.operatingDays || ''}
              onChange={(e) => setFormData({ ...formData, operatingDays: e.target.value })}
              placeholder="如：Open 24/7"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 联系电话 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              联系电话
            </label>
            <input
              type="text"
              value={formData.contactPhone || ''}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="如：+1 7184806663"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 推荐率 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              推荐率 (%)
            </label>
            <input
              type="number"
              value={formData.recommendationPct || ''}
              onChange={(e) => setFormData({ ...formData, recommendationPct: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="如：98"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 数据来源 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              数据来源
            </label>
            <select
              value={formData.dataSource || 'way.com'}
              onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="way.com">Way.com</option>
              <option value="spothero">SpotHero</option>
              <option value="manual">手动录入</option>
            </select>
          </div>

          {/* 细分评分 */}
          <div className="md:col-span-2 mt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3">细分评分 (Way.com)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">位置评分</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.locationRating || ''}
                  onChange={(e) => setFormData({ ...formData, locationRating: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0-5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">服务评分</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.staffRating || ''}
                  onChange={(e) => setFormData({ ...formData, staffRating: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0-5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">设施评分</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.facilityRating || ''}
                  onChange={(e) => setFormData({ ...formData, facilityRating: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0-5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">安全评分</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.safetyRating || ''}
                  onChange={(e) => setFormData({ ...formData, safetyRating: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="0-5"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
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
