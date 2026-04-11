'use client';

import { useState, useCallback } from 'react';

// 表单数据类型
export interface ParkingFormData {
  name: string;
  airportIataCode: string;
  type: 'OFFICIAL' | 'OFF_SITE';
  dailyRate: string | number;
  distanceMiles: string | number | null;
  shuttleMins: string | number | null;
  isIndoor: boolean;
  hasValet: boolean;
  is24Hours: boolean;
  rating: string | number | null;
  reviewCount: string | number | null;
  tags: string;
  affiliateUrl: string;
  featured: boolean;
  isActive: boolean;
  // 详情页扩展字段
  address: string;
  shuttleFrequency: string;
  shuttleHours: string;
  arrivalDirections: string;
  thingsToKnow: string | Array<{title?: string; content: string}>;
  // Way.com 特有字段
  description: string;
  shuttleDesc: string;
  cancellationPolicy: string;
  parkingAccess: string;
  operatingDays: string;
  contactPhone: string;
  recommendationPct: string | number | null;
  locationRating: string | number | null;
  staffRating: string | number | null;
  facilityRating: string | number | null;
  safetyRating: string | number | null;
  reviewSummary: string | object | null;
  dataSource: string;
}

// AI 解析结果类型
export interface AIParsedData {
  name?: string;
  address?: string;
  dailyRate?: number;
  distanceMiles?: number;
  shuttleMins?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  shuttleFrequency?: string;
  shuttleHours?: string;
  arrivalDirections?: string;
  thingsToKnow?: Array<{title?: string; content: string}> | string;
  isIndoor?: boolean;
  hasValet?: boolean;
  is24Hours?: boolean;
  description?: string;
  shuttleDesc?: string;
  cancellationPolicy?: string;
  parkingAccess?: string;
  operatingDays?: string;
  contactPhone?: string;
  recommendationPct?: number;
  locationRating?: number;
  staffRating?: number;
  facilityRating?: number;
  safetyRating?: number;
  reviewSummary?: {
    overallSentiment: string;
    pros: string[];
    cons: string[];
    commonThemes: string[];
    representativeQuotes: string[];
    ratingDistribution: Record<string, number>;
  };
}

// 默认表单数据
export const defaultFormData: ParkingFormData = {
  name: '',
  airportIataCode: '',
  type: 'OFF_SITE',
  dailyRate: '',
  distanceMiles: '',
  shuttleMins: '',
  isIndoor: false,
  hasValet: false,
  is24Hours: true,
  rating: '',
  reviewCount: '',
  tags: '',
  affiliateUrl: '',
  featured: false,
  isActive: true,
  // 详情页扩展字段
  address: '',
  shuttleFrequency: '',
  shuttleHours: '',
  arrivalDirections: '',
  thingsToKnow: '',
  // Way.com 特有字段
  description: '',
  shuttleDesc: '',
  cancellationPolicy: '',
  parkingAccess: '',
  operatingDays: '',
  contactPhone: '',
  recommendationPct: '',
  locationRating: '',
  staffRating: '',
  facilityRating: '',
  safetyRating: '',
  reviewSummary: '',
  dataSource: 'way.com',
};

export function useParkingForm(initialData: Partial<ParkingFormData> = {}) {
  const [formData, setFormData] = useState<ParkingFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // AI 解析相关状态
  const [aiRawData, setAiRawData] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // 更新表单字段
  const updateField = useCallback(<K extends keyof ParkingFormData>(
    field: K,
    value: ParkingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 更新多个字段
  const updateFields = useCallback((fields: Partial<ParkingFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({ ...defaultFormData, ...initialData });
    setMessage('');
  }, [initialData]);

  // AI 解析处理
  const handleAIParse = useCallback(async () => {
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
        const parsed: AIParsedData = data.data;
        
        // 处理 thingsToKnow - 确保是字符串格式
        let thingsToKnowString = formData.thingsToKnow;
        if (parsed.thingsToKnow) {
          if (Array.isArray(parsed.thingsToKnow)) {
            thingsToKnowString = JSON.stringify(parsed.thingsToKnow, null, 2);
          } else if (typeof parsed.thingsToKnow === 'string') {
            thingsToKnowString = parsed.thingsToKnow;
          }
        }

        // 处理 reviewSummary
        let reviewSummaryValue = formData.reviewSummary;
        if (parsed.reviewSummary) {
          reviewSummaryValue = JSON.stringify(parsed.reviewSummary, null, 2);
        }
        
        // 更新表单数据
        setFormData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          address: parsed.address || prev.address,
          dailyRate: parsed.dailyRate !== undefined ? String(parsed.dailyRate) : prev.dailyRate,
          distanceMiles: parsed.distanceMiles !== undefined ? String(parsed.distanceMiles) : prev.distanceMiles,
          shuttleMins: parsed.shuttleMins !== undefined ? String(parsed.shuttleMins) : prev.shuttleMins,
          rating: parsed.rating !== undefined ? String(parsed.rating) : prev.rating,
          reviewCount: parsed.reviewCount !== undefined ? String(parsed.reviewCount) : prev.reviewCount,
          tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags.join(', ') : prev.tags,
          shuttleFrequency: parsed.shuttleFrequency || prev.shuttleFrequency,
          shuttleHours: parsed.shuttleHours || prev.shuttleHours,
          arrivalDirections: parsed.arrivalDirections || prev.arrivalDirections,
          thingsToKnow: thingsToKnowString,
          isIndoor: parsed.isIndoor !== undefined ? parsed.isIndoor : prev.isIndoor,
          hasValet: parsed.hasValet !== undefined ? parsed.hasValet : prev.hasValet,
          is24Hours: parsed.is24Hours !== undefined ? parsed.is24Hours : prev.is24Hours,
          // Way.com 特有字段
          description: parsed.description || prev.description,
          shuttleDesc: parsed.shuttleDesc || prev.shuttleDesc,
          cancellationPolicy: parsed.cancellationPolicy || prev.cancellationPolicy,
          parkingAccess: parsed.parkingAccess || prev.parkingAccess,
          operatingDays: parsed.operatingDays || prev.operatingDays,
          contactPhone: parsed.contactPhone || prev.contactPhone,
          recommendationPct: parsed.recommendationPct !== undefined ? String(parsed.recommendationPct) : prev.recommendationPct,
          locationRating: parsed.locationRating !== undefined ? String(parsed.locationRating) : prev.locationRating,
          staffRating: parsed.staffRating !== undefined ? String(parsed.staffRating) : prev.staffRating,
          facilityRating: parsed.facilityRating !== undefined ? String(parsed.facilityRating) : prev.facilityRating,
          safetyRating: parsed.safetyRating !== undefined ? String(parsed.safetyRating) : prev.safetyRating,
          reviewSummary: reviewSummaryValue,
        }));

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
  }, [aiRawData, formData.thingsToKnow, formData.reviewSummary]);

  // 验证表单
  const validateForm = useCallback((): boolean => {
    if (!formData.name || !formData.airportIataCode || !formData.dailyRate) {
      setMessage('请填写所有必填字段');
      return false;
    }
    return true;
  }, [formData]);

  // 准备提交数据
  const prepareSubmitData = useCallback(() => {
    return {
      ...formData,
      dailyRate: parseFloat(formData.dailyRate as string),
      distanceMiles: formData.distanceMiles ? parseFloat(formData.distanceMiles as string) : null,
      shuttleMins: formData.shuttleMins ? parseInt(formData.shuttleMins as string) : null,
      rating: formData.rating ? parseFloat(formData.rating as string) : null,
      reviewCount: formData.reviewCount ? parseInt(formData.reviewCount as string) : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      recommendationPct: formData.recommendationPct ? parseInt(formData.recommendationPct as string) : null,
      locationRating: formData.locationRating ? parseFloat(formData.locationRating as string) : null,
      staffRating: formData.staffRating ? parseFloat(formData.staffRating as string) : null,
      facilityRating: formData.facilityRating ? parseFloat(formData.facilityRating as string) : null,
      safetyRating: formData.safetyRating ? parseFloat(formData.safetyRating as string) : null,
      reviewSummary: formData.reviewSummary || null,
    };
  }, [formData]);

  return {
    // 状态
    formData,
    loading,
    message,
    aiRawData,
    aiParsing,
    showAiPanel,
    
    // 设置器
    setLoading,
    setMessage,
    setAiRawData,
    setShowAiPanel,
    
    // 操作方法
    updateField,
    updateFields,
    resetForm,
    handleAIParse,
    validateForm,
    prepareSubmitData,
  };
}
