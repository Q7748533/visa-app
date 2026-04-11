'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Car, Sparkles, Loader2 } from 'lucide-react';
import { useParkingForm } from '../hooks/useParkingForm';
import { ParkingFormFields } from '../components/ParkingFormFields';

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
}

export default function NewParkingPage() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  
  const {
    formData,
    loading,
    message,
    aiRawData,
    aiParsing,
    showAiPanel,
    setLoading,
    setMessage,
    setAiRawData,
    setShowAiPanel,
    updateField,
    handleAIParse,
    validateForm,
    prepareSubmitData,
  } = useParkingForm();

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
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');

    try {
      const submitData = prepareSubmitData();
      const res = await fetch('/api/admin/parking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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
              粘贴停车场的原始数据（JSON 格式），AI 将自动解析并填充表单字段。
            </p>
            <textarea
              value={aiRawData}
              onChange={(e) => setAiRawData(e.target.value)}
              placeholder="在此粘贴原始数据..."
              rows={6}
              className="w-full px-4 py-3 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-xs bg-white"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAIParse}
                disabled={aiParsing || !aiRawData.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    解析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    智能填充
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setAiRawData(''); setShowAiPanel(false); }}
                className="text-sm text-violet-600 hover:text-violet-800"
              >
                取消
              </button>
            </div>
          </div>
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
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
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
