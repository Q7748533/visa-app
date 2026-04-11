'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Car, Sparkles, Loader2 } from 'lucide-react';
import { useParkingForm, ParkingFormData } from '../../hooks/useParkingForm';
import { ParkingFormFields } from '../../components/ParkingFormFields';

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
  address: string | null;
  shuttleFrequency: string | null;
  shuttleHours: string | null;
  arrivalDirections: string | null;
  thingsToKnow: string | null;
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
  reviewSummary: string | null;
  dataSource: string;
}

export default function EditParkingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [parkingId, setParkingId] = useState<string>('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setPageLoading] = useState(true);

  const {
    formData,
    loading: formLoading,
    message,
    aiRawData,
    aiParsing,
    showAiPanel,
    setLoading,
    setMessage,
    setAiRawData,
    setShowAiPanel,
    updateField,
    updateFields,
    handleAIParse,
    validateForm,
    prepareSubmitData,
  } = useParkingForm();

  useEffect(() => {
    params.then(p => {
      setParkingId(p.id);
      loadData(p.id);
    });
  }, [params]);

  const loadData = async (id: string) => {
    setPageLoading(true);
    try {
      const [parkingRes, airportsRes] = await Promise.all([
        fetch(`/api/admin/parking/${id}`),
        fetch('/api/admin/airports?limit=1000'),
      ]);

      if (parkingRes.ok && airportsRes.ok) {
        const parkingData = await parkingRes.json();
        const airportsData = await airportsRes.json();
        
        const parking: ParkingLot = parkingData.parking;
        
        // 转换为表单格式
        const initialData: Partial<ParkingFormData> = {
          name: parking.name || '',
          airportIataCode: parking.airportIataCode || '',
          type: parking.type || 'OFF_SITE',
          dailyRate: parking.dailyRate ? String(parking.dailyRate) : '',
          distanceMiles: parking.distanceMiles !== null ? String(parking.distanceMiles) : '',
          shuttleMins: parking.shuttleMins !== null ? String(parking.shuttleMins) : '',
          isIndoor: parking.isIndoor || false,
          hasValet: parking.hasValet || false,
          is24Hours: parking.is24Hours !== false,
          rating: parking.rating !== null ? String(parking.rating) : '',
          reviewCount: parking.reviewCount !== null ? String(parking.reviewCount) : '',
          tags: parking.tags || '',
          affiliateUrl: parking.affiliateUrl || '',
          featured: parking.featured || false,
          isActive: parking.isActive !== false,
          address: parking.address || '',
          shuttleFrequency: parking.shuttleFrequency || '',
          shuttleHours: parking.shuttleHours || '',
          arrivalDirections: parking.arrivalDirections || '',
          thingsToKnow: parking.thingsToKnow || '',
          description: parking.description || '',
          shuttleDesc: parking.shuttleDesc || '',
          cancellationPolicy: parking.cancellationPolicy || '',
          parkingAccess: parking.parkingAccess || '',
          operatingDays: parking.operatingDays || '',
          contactPhone: parking.contactPhone || '',
          recommendationPct: parking.recommendationPct !== null ? String(parking.recommendationPct) : '',
          locationRating: parking.locationRating !== null ? String(parking.locationRating) : '',
          staffRating: parking.staffRating !== null ? String(parking.staffRating) : '',
          facilityRating: parking.facilityRating !== null ? String(parking.facilityRating) : '',
          safetyRating: parking.safetyRating !== null ? String(parking.safetyRating) : '',
          reviewSummary: parking.reviewSummary || '',
          dataSource: parking.dataSource || 'way.com',
        };

        updateFields(initialData);
        setAirports(airportsData.airports);
      } else {
        setMessage('加载数据失败');
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('加载数据失败');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');

    try {
      const submitData = prepareSubmitData();
      const res = await fetch(`/api/admin/parking/${parkingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('更新成功！');
      } else {
        setMessage(data.error || '更新失败');
      }
    } catch {
      setMessage('请求失败，请重试');
    } finally {
      setLoading(false);
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
        <ParkingFormFields
          formData={formData}
          airports={airports}
          onChange={updateField}
        />

        {/* 提交按钮 */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={formLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
          <Link
            href="/admin/parking"
            className="text-slate-500 hover:text-slate-700 font-medium"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
