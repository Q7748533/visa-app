import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface ReviewSummary {
  overallSentiment?: string;
  pros?: string[];
  cons?: string[];
  commonThemes?: string[];
  representativeQuotes?: string[];
  ratingDistribution?: Record<string, number>;
}

interface ParkingRatingsProps {
  locationRating: number | null;
  staffRating: number | null;
  facilityRating: number | null;
  safetyRating: number | null;
  recommendationPct: number | null;
  reviewSummary?: string | null;
}

function parseReviewSummary(summary: string | null | undefined): ReviewSummary | null {
  if (!summary) return null;
  try {
    return JSON.parse(summary) as ReviewSummary;
  } catch {
    return null;
  }
}

export function ParkingRatings({
  locationRating,
  staffRating,
  facilityRating,
  safetyRating,
  recommendationPct,
  reviewSummary,
}: ParkingRatingsProps) {
  const hasAnyRating = locationRating || staffRating || facilityRating || safetyRating;
  const parsedSummary = parseReviewSummary(reviewSummary);
  const hasSummary = parsedSummary && (
    parsedSummary.pros?.length || 
    parsedSummary.cons?.length || 
    parsedSummary.commonThemes?.length
  );
  
  if (!hasAnyRating && !hasSummary) return null;

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-5 md:p-6 lg:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <span className="p-1.5 md:p-2 bg-amber-50 text-amber-600 rounded-lg">
          <Star className="w-4 h-4 md:w-5 md:h-5" />
        </span>
        Detailed Ratings
      </h2>
      
      {/* 评分卡片 */}
      {hasAnyRating && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {locationRating && (
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-slate-800">{locationRating}</span>
              </div>
            </div>
          )}
          {staffRating && (
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-slate-800">{staffRating}</span>
              </div>
            </div>
          )}
          {facilityRating && (
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Facility</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-slate-800">{facilityRating}</span>
              </div>
            </div>
          )}
          {safetyRating && (
            <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Safety</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-slate-800">{safetyRating}</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 推荐百分比 */}
      {recommendationPct && (
        <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
          <p className="text-sm text-emerald-800">
            <span className="font-black text-emerald-600">{recommendationPct}%</span> of guests recommend this facility
          </p>
        </div>
      )}
      
      {/* Review Summary */}
      {hasSummary && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Review Insights
          </h3>
          
          {/* Pros */}
          {parsedSummary?.pros && parsedSummary.pros.length > 0 && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                What guests love
              </p>
              <ul className="space-y-1">
                {parsedSummary.pros.map((pro, idx) => (
                  <li key={idx} className="text-sm text-emerald-800 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Cons */}
          {parsedSummary?.cons && parsedSummary.cons.length > 0 && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                Areas for improvement
              </p>
              <ul className="space-y-1">
                {parsedSummary.cons.map((con, idx) => (
                  <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Common Themes */}
          {parsedSummary?.commonThemes && parsedSummary.commonThemes.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-slate-700 mb-2">Common mentions</p>
              <div className="flex flex-wrap gap-2">
                {parsedSummary.commonThemes.map((theme, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Representative Quotes */}
          {parsedSummary?.representativeQuotes && parsedSummary.representativeQuotes.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-700 mb-2">Guest quotes</p>
              <blockquote className="text-sm text-blue-800 italic">
                "{parsedSummary.representativeQuotes[0]}"
              </blockquote>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
