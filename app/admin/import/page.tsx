'use client';

/**
 * AI 辅助设施导入页面（增强版）
 * 功能：
 * 1. 粘贴原始文本
 * 2. AI 自动识别并提取多个设施
 * 3. 逐个审查和修正
 * 4. 批量保存到数据库
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExtractedFacility {
  name: string;
  nameEn?: string;
  terminal: string;
  location?: string;
  locationEn?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  is24Hours: boolean;
  services: string[];
  serviceDetails: Record<string, any>;
  areaType: 'AIRSIDE' | 'LANDSIDE' | 'BOTH' | 'PRIVATE';
  immigrationRequired: boolean;
  features?: string[];
  capacity?: string;
  notices?: string[];
}

interface ExtractionResult {
  count: number;
  facilities: ExtractedFacility[];
  facilityNames: string[];
}

const SERVICE_OPTIONS = [
  { value: 'SLEEPING', label: '睡眠/酒店', color: 'bg-purple-100 text-purple-700' },
  { value: 'SHOWERS', label: '淋浴', color: 'bg-blue-100 text-blue-700' },
  { value: 'STORAGE', label: '行李存储', color: 'bg-amber-100 text-amber-700' },
  { value: 'TRANSPORT', label: '交通', color: 'bg-green-100 text-green-700' },
  { value: 'LOUNGE', label: '休息室', color: 'bg-rose-100 text-rose-700' },
  { value: 'FOOD', label: '餐饮', color: 'bg-orange-100 text-orange-700' },
  { value: 'SPA', label: 'SPA/按摩', color: 'bg-pink-100 text-pink-700' },
  { value: 'WIFI', label: '无线网络', color: 'bg-cyan-100 text-cyan-700' },
];

const AREA_OPTIONS = [
  { value: 'AIRSIDE', label: '禁区/中转区', desc: '无需入境' },
  { value: 'LANDSIDE', label: '公共区域', desc: '需入境' },
  { value: 'BOTH', label: '两者皆有', desc: '两边都有' },
  { value: 'PRIVATE', label: '私人区域', desc: 'CIP/贵宾' },
];

export default function ImportPage() {
  const router = useRouter();
  const [airportIata, setAirportIata] = useState('');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [currentFacilityIndex, setCurrentFacilityIndex] = useState(0);
  const [editedFacilities, setEditedFacilities] = useState<ExtractedFacility[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // AI 批量提取
  const handleExtract = async () => {
    if (!airportIata.trim()) {
      setError('请输入机场 IATA 代码');
      return;
    }
    if (!rawText.trim()) {
      setError('请输入设施描述文本');
      return;
    }

    setIsExtracting(true);
    setError('');
    setSaveSuccess(false);
    setExtractionResult(null);
    setEditedFacilities([]);
    setCurrentFacilityIndex(0);

    try {
      const response = await fetch('/api/ai/extract-facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, airportIata }),
      });

      const result = await response.json();

      if (result.success) {
        setExtractionResult(result.data);
        setEditedFacilities(result.data.facilities);
      } else {
        setError(result.error || '提取失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsExtracting(false);
    }
  };

  // 更新当前设施
  const updateCurrentFacility = (field: keyof ExtractedFacility, value: any) => {
    const newFacilities = [...editedFacilities];
    newFacilities[currentFacilityIndex] = {
      ...newFacilities[currentFacilityIndex],
      [field]: value,
    };
    setEditedFacilities(newFacilities);
  };

  // 切换服务类型
  const toggleService = (service: string) => {
    const facility = editedFacilities[currentFacilityIndex];
    if (!facility) return;
    
    const services = facility.services.includes(service)
      ? facility.services.filter(s => s !== service)
      : [...facility.services, service];
    updateCurrentFacility('services', services);
  };

  // 保存单个设施
  const handleSaveCurrent = async () => {
    const facility = editedFacilities[currentFacilityIndex];
    if (!facility) return;

    setIsSaving(true);
    setSaveProgress({ current: currentFacilityIndex + 1, total: editedFacilities.length });
    setError('');

    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportIata: airportIata.toUpperCase(),
          airportName: `${airportIata} Airport`,
          airportCity: airportIata,
          airportCountry: 'Unknown',
          airportContinent: 'Unknown',
          ...facility,
          dataSource: 'ai_extracted',
          rawContent: rawText,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 移动到下一个设施
        if (currentFacilityIndex < editedFacilities.length - 1) {
          setCurrentFacilityIndex(currentFacilityIndex + 1);
        } else {
          // 全部保存完成
          setSaveSuccess(true);
          setTimeout(() => {
            setSaveSuccess(false);
            setExtractionResult(null);
            setEditedFacilities([]);
            setCurrentFacilityIndex(0);
            setRawText('');
          }, 3000);
        }
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setIsSaving(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  // 跳过当前设施
  const handleSkip = () => {
    if (currentFacilityIndex < editedFacilities.length - 1) {
      setCurrentFacilityIndex(currentFacilityIndex + 1);
    } else {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setExtractionResult(null);
        setEditedFacilities([]);
        setCurrentFacilityIndex(0);
      }, 2000);
    }
  };

  // 返回上一个设施
  const handlePrevious = () => {
    if (currentFacilityIndex > 0) {
      setCurrentFacilityIndex(currentFacilityIndex - 1);
    }
  };

  const currentFacility = editedFacilities[currentFacilityIndex];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-slate-500 hover:text-slate-700"
              >
                ← 返回
              </button>
              <h1 className="text-xl font-bold text-slate-900">AI 辅助导入设施</h1>
            </div>
            {extractionResult && (
              <div className="text-sm text-slate-500">
                设施 {currentFacilityIndex + 1} / {extractionResult.count}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">1. 输入原始数据</h2>
              
              {/* 机场代码 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  机场 IATA 代码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={airportIata}
                  onChange={(e) => setAirportIata(e.target.value.toUpperCase())}
                  placeholder="例如: SIN, HND, LHR"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  maxLength={3}
                  disabled={!!extractionResult}
                />
              </div>

              {/* 原始文本 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  设施描述文本 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="粘贴机场设施描述文本，可以包含多个设施...

例如：
THE PERFECT WAY TO REST

Aerotel Airport Transit Hotel
Terminal 1
Location: Level 3, Departure Transit Hall
Operating Hours: 08:00 - 20:00
Tel: +65 6342 0259

Ambassador Transit Hotel
Terminal 2
..."
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  disabled={!!extractionResult}
                />
              </div>

              {/* 提取按钮 */}
              {!extractionResult && (
                <button
                  onClick={handleExtract}
                  disabled={isExtracting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      AI 分析中...
                    </>
                  ) : (
                    <>
                      🤖 AI 自动提取
                    </>
                  )}
                </button>
              )}

              {/* 重新提取按钮 */}
              {extractionResult && (
                <button
                  onClick={() => {
                    setExtractionResult(null);
                    setEditedFacilities([]);
                    setCurrentFacilityIndex(0);
                  }}
                  className="w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  🔄 重新提取
                </button>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* 识别到的设施列表 */}
            {extractionResult && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                  识别到的设施 ({extractionResult.count}个)
                </h3>
                <div className="space-y-2">
                  {extractionResult.facilityNames.map((name, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentFacilityIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentFacilityIndex
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{name}</span>
                        {index < currentFacilityIndex && (
                          <span className="text-emerald-600 text-xs">✓ 已保存</span>
                        )}
                        {index === currentFacilityIndex && (
                          <span className="text-blue-600 text-xs">编辑中</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 使用说明 */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">💡 使用提示</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 粘贴从官网复制的设施描述文本（可包含多个设施）</li>
                <li>• AI 会自动识别所有设施并逐个提取</li>
                <li>• 提取后请人工核对每个设施的信息</li>
                <li>• 支持中英文混合文本</li>
                <li>• 注意检查：区域类型、营业时间、是否需要入境</li>
              </ul>
            </div>
          </div>

          {/* 右侧：编辑区域 */}
          <div className="space-y-6">
            {currentFacility ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">2. 审查并修正</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevious}
                      disabled={currentFacilityIndex === 0}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 disabled:text-slate-300"
                    >
                      ← 上一个
                    </button>
                    <span className="text-sm text-slate-400">
                      {currentFacilityIndex + 1} / {editedFacilities.length}
                    </span>
                    <button
                      onClick={handleSkip}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800"
                    >
                      跳过 →
                    </button>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">基本信息</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">设施名称</label>
                      <input
                        type="text"
                        value={currentFacility.name}
                        onChange={(e) => updateCurrentFacility('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">英文名称</label>
                      <input
                        type="text"
                        value={currentFacility.nameEn || ''}
                        onChange={(e) => updateCurrentFacility('nameEn', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="可选"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">航站楼</label>
                      <input
                        type="text"
                        value={currentFacility.terminal}
                        onChange={(e) => updateCurrentFacility('terminal', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">区域类型</label>
                      <select
                        value={currentFacility.areaType}
                        onChange={(e) => updateCurrentFacility('areaType', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {AREA_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} - {opt.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">位置描述</label>
                    <input
                      type="text"
                      value={currentFacility.location || ''}
                      onChange={(e) => updateCurrentFacility('location', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：3楼离境转机大厅"
                    />
                  </div>
                </div>

                {/* 服务类型 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">服务类型</h3>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map(service => (
                      <button
                        key={service.value}
                        onClick={() => toggleService(service.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          currentFacility.services.includes(service.value)
                            ? service.color
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {currentFacility.services.includes(service.value) ? '✓ ' : '+ '}
                        {service.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 营业信息 */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">营业信息</h3>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentFacility.is24Hours}
                        onChange={(e) => updateCurrentFacility('is24Hours', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">24小时营业</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentFacility.immigrationRequired}
                        onChange={(e) => updateCurrentFacility('immigrationRequired', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">需要入境</span>
                    </label>
                  </div>

                  {!currentFacility.is24Hours && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">营业时间</label>
                      <input
                        type="text"
                        value={currentFacility.hours || ''}
                        onChange={(e) => updateCurrentFacility('hours', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：06:00 - 23:00"
                      />
                    </div>
                  )}
                </div>

                {/* 价格信息 */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">价格信息</h3>
                  
                  {currentFacility.services.includes('SLEEPING') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        住宿价格
                      </label>
                      <input
                        type="text"
                        value={currentFacility.serviceDetails?.sleeping?.price || ''}
                        onChange={(e) => {
                          const newDetails = { ...currentFacility.serviceDetails };
                          if (!newDetails.sleeping) newDetails.sleeping = {};
                          newDetails.sleeping.price = e.target.value;
                          updateCurrentFacility('serviceDetails', newDetails);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：$80-200/night, S$120 for 6 hours"
                      />
                    </div>
                  )}
                  
                  {currentFacility.services.includes('SHOWERS') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        淋浴价格
                      </label>
                      <input
                        type="text"
                        value={currentFacility.serviceDetails?.showers?.price || ''}
                        onChange={(e) => {
                          const newDetails = { ...currentFacility.serviceDetails };
                          if (!newDetails.showers) newDetails.showers = {};
                          newDetails.showers.price = e.target.value;
                          updateCurrentFacility('serviceDetails', newDetails);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：Free, $15, Included with room"
                      />
                    </div>
                  )}
                  
                  {currentFacility.services.includes('STORAGE') && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        存储价格
                      </label>
                      <input
                        type="text"
                        value={currentFacility.serviceDetails?.storage?.price || ''}
                        onChange={(e) => {
                          const newDetails = { ...currentFacility.serviceDetails };
                          if (!newDetails.storage) newDetails.storage = {};
                          newDetails.storage.price = e.target.value;
                          updateCurrentFacility('serviceDetails', newDetails);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="例如：$5-15/day"
                      />
                    </div>
                  )}
                </div>

                {/* 联系信息 */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">联系信息</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">电话</label>
                      <input
                        type="text"
                        value={currentFacility.phone || ''}
                        onChange={(e) => updateCurrentFacility('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
                      <input
                        type="email"
                        value={currentFacility.email || ''}
                        onChange={(e) => updateCurrentFacility('email', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">网站</label>
                    <input
                      type="url"
                      value={currentFacility.website || ''}
                      onChange={(e) => updateCurrentFacility('website', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 保存按钮 */}
                <button
                  onClick={handleSaveCurrent}
                  disabled={isSaving}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      保存中 ({saveProgress.current}/{saveProgress.total})...
                    </>
                  ) : (
                    <>
                      💾 保存并继续
                    </>
                  )}
                </button>

                {saveSuccess && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                    ✅ 全部保存成功！
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">等待数据提取</h3>
                <p className="text-slate-500">
                  在左侧输入机场代码和设施描述，<br />
                  点击 "AI 自动提取" 开始处理
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
