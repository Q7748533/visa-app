'use client';

import { ParkingFormData } from '../hooks/useParkingForm';

interface Airport {
  id: string;
  iata: string;
  name: string;
  city: string;
}

interface ParkingFormFieldsProps {
  formData: ParkingFormData;
  airports: Airport[];
  onChange: <K extends keyof ParkingFormData>(field: K, value: ParkingFormData[K]) => void;
}

export function ParkingFormFields({ formData, airports, onChange }: ParkingFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 所属机场 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          所属机场 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.airportIataCode}
          onChange={(e) => onChange('airportIataCode', e.target.value)}
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
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="如: The Parking Spot"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 类型 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">类型</label>
        <select
          value={formData.type}
          onChange={(e) => onChange('type', e.target.value as 'OFFICIAL' | 'OFF_SITE')}
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
          onChange={(e) => onChange('dailyRate', e.target.value)}
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
          onChange={(e) => onChange('distanceMiles', e.target.value)}
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
          onChange={(e) => onChange('shuttleMins', e.target.value)}
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
          onChange={(e) => onChange('rating', e.target.value)}
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
          onChange={(e) => onChange('reviewCount', e.target.value)}
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
          onChange={(e) => onChange('tags', e.target.value)}
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
          onChange={(e) => onChange('affiliateUrl', e.target.value)}
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
          onChange={(e) => onChange('address', e.target.value)}
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
          onChange={(e) => onChange('shuttleFrequency', e.target.value)}
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
          onChange={(e) => onChange('shuttleHours', e.target.value)}
          placeholder="如: 4:00 AM - 12:00 AM"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 到达路线指引 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          到达路线指引
        </label>
        <textarea
          value={formData.arrivalDirections}
          onChange={(e) => onChange('arrivalDirections', e.target.value)}
          placeholder="详细描述如何从机场到达停车场..."
          rows={4}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
        />
      </div>

      {/* Things to Know */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          注意事项 (JSON格式)
        </label>
        <textarea
          value={typeof formData.thingsToKnow === 'string' ? formData.thingsToKnow : JSON.stringify(formData.thingsToKnow, null, 2)}
          onChange={(e) => onChange('thingsToKnow', e.target.value)}
          placeholder={`示例:
[
  {"title": "营业时间", "content": "24小时营业"},
  {"content": "需要提前预约"}
]`}
          rows={6}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
        />
      </div>

      {/* Way.com 特有字段 */}
      <div className="md:col-span-2">
        <h3 className="text-lg font-bold text-slate-900 mb-4 pt-4 border-t border-slate-200">
          Way.com 扩展字段
        </h3>
      </div>

      {/* 描述 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="停车场详细描述..."
          rows={3}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 班车描述 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">班车服务描述</label>
        <textarea
          value={formData.shuttleDesc}
          onChange={(e) => onChange('shuttleDesc', e.target.value)}
          placeholder="班车服务详细描述..."
          rows={3}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 取消政策 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">取消政策</label>
        <input
          type="text"
          value={formData.cancellationPolicy}
          onChange={(e) => onChange('cancellationPolicy', e.target.value)}
          placeholder="如: Free cancellation"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 停车方式 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">停车方式</label>
        <input
          type="text"
          value={formData.parkingAccess}
          onChange={(e) => onChange('parkingAccess', e.target.value)}
          placeholder="如: Self Park, Valet"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 运营天数 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">运营天数</label>
        <input
          type="text"
          value={formData.operatingDays}
          onChange={(e) => onChange('operatingDays', e.target.value)}
          placeholder="如: 7 days a week"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 联系电话 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">联系电话</label>
        <input
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => onChange('contactPhone', e.target.value)}
          placeholder="如: (555) 123-4567"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 推荐百分比 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">推荐百分比 (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.recommendationPct || ''}
          onChange={(e) => onChange('recommendationPct', e.target.value)}
          placeholder="如: 95"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 位置评分 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">位置评分</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.locationRating || ''}
          onChange={(e) => onChange('locationRating', e.target.value)}
          placeholder="如: 4.5"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 员工评分 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">员工评分</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.staffRating || ''}
          onChange={(e) => onChange('staffRating', e.target.value)}
          placeholder="如: 4.5"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 设施评分 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">设施评分</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.facilityRating || ''}
          onChange={(e) => onChange('facilityRating', e.target.value)}
          placeholder="如: 4.5"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 安全评分 */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">安全评分</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={formData.safetyRating || ''}
          onChange={(e) => onChange('safetyRating', e.target.value)}
          placeholder="如: 4.5"
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 评论摘要 */}
      <div className="md:col-span-2">
        <label className="block text-sm font-bold text-slate-700 mb-2">评论摘要 (JSON格式)</label>
        <textarea
          value={typeof formData.reviewSummary === 'string' ? formData.reviewSummary : JSON.stringify(formData.reviewSummary, null, 2)}
          onChange={(e) => onChange('reviewSummary', e.target.value)}
          placeholder={`示例:
{
  "overallSentiment": "positive",
  "pros": ["Fast shuttle", "Clean facility"],
  "cons": ["Limited spaces"],
  "commonThemes": ["shuttle service", "staff friendliness"],
  "representativeQuotes": ["Shuttle was quick and easy"],
  "ratingDistribution": {"5": 60, "4": 25, "3": 10, "2": 3, "1": 2}
}`}
          rows={8}
          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
        />
      </div>

      {/* 复选框选项 */}
      <div className="md:col-span-2">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isIndoor}
              onChange={(e) => onChange('isIndoor', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">室内停车</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasValet}
              onChange={(e) => onChange('hasValet', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">代客泊车</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is24Hours}
              onChange={(e) => onChange('is24Hours', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">24小时营业</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => onChange('featured', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">推荐展示</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => onChange('isActive', e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">启用</span>
          </label>
        </div>
      </div>
    </div>
  );
}
