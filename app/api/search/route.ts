import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    let cleanQuery = query.toLowerCase();
    let targetService = 'showers'; // 默认服务

    // 1. 意图剥离 (Intent Extraction)
    const intents = [
      { key: 'luggage-storage', words: ['storage', 'luggage', 'baggage', 'locker'] },
      { key: 'showers', words: ['shower', 'bath', 'wash', 'freshen'] },
      { key: 'sleeping', words: ['sleep', 'pod', 'nap', 'hotel', 'rest'] },
      { key: 'transport', words: ['transport', 'bus', 'train', 'taxi', 'transfer'] } // 加了 transfer
    ];

    for (const intent of intents) {
      if (intent.words.some(w => cleanQuery.includes(w))) {
        targetService = intent.key;
        const regex = new RegExp(`\\b(${intent.words.join('|')}|in|at|for|to)\\b`, 'gi'); // 多加了 for, to 等介词
        cleanQuery = cleanQuery.replace(regex, '').trim();
        break;
      }
    }

    if (cleanQuery.length === 0) {
      return NextResponse.json({ count: 0, results: [], targetService });
    }

    // 2. 暴力分词 (Tokenization)
    const terms = cleanQuery.split(/\s+/).filter(t => t.length > 0);
    const upperTerms = terms.map(t => t.toUpperCase()); // 提前把所有的词转大写，给智能排序备用

    // 3. 多条件交集查询 (AND over OR)
    const airports = await prisma.airport.findMany({
      where: {
        AND: terms.map(term => ({
          OR: [
            { iata: { contains: term } },
            { name: { contains: term } },
            { city: { contains: term } },
            { country: { contains: term } },
          ]
        }))
      },
      take: 20,
      select: {
        iata: true,
        name: true,
        city: true,
        country: true,
        showerData: true,
        luggageData: true,
        sleepData: true,
        transitData: true, // 修复 1：加上了漏掉的交通数据查询
      },
    });

    // 4. 全局智能排序 (Global IATA Match)
    const sortedResults = airports.sort((a, b) => {
      // 修复 2：无论 IATA 代码出现在第几个词，只要精确匹配上，直接给最高权重
      const aIsExactIata = upperTerms.includes(a.iata) ? 1 : 0;
      const bIsExactIata = upperTerms.includes(b.iata) ? 1 : 0;
      
      if (aIsExactIata !== bIsExactIata) {
        return bIsExactIata - aIsExactIata; // 1 优先于 0
      }
      
      // 如果都没有命中 IATA，就按名字长度排序（短名字通常是主机场）
      return a.name.length - b.name.length;
    }).slice(0, 10);

    const results = sortedResults.map((airport) => ({
      code: airport.iata,
      name: airport.name,
      location: `${airport.city}, ${airport.country}`,
      slug: airport.iata.toLowerCase(),
      services: {
        showers: !!airport.showerData,
        storage: !!airport.luggageData,
        sleeping: !!airport.sleepData,
        transport: !!airport.transitData // 修复 1：给前端下发 transport 状态
      }
    }));

    return NextResponse.json({
      count: results.length,
      targetService,
      results
    });
  } catch (error) {
    console.error("Critical Search Error:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 500 });
  }
}
