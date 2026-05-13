import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { z } from "zod";

const app = express();
const port = process.env.PORT || 9091;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  user_id: z.string().optional(),
});

const checkinSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  attraction_id: z.string().min(1, "Attraction ID is required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ============================================
// ATTRACTIONS DATA (统一数据源)
// ============================================

const ATTRACTIONS = [
  {
    id: 'gz_tower',
    name: '广州塔',
    district: '海珠区',
    category: '现代',
    lat: 23.1065,
    lng: 113.3245,
    open_time: '09:30-22:30',
    ticket: '150元起',
    description: '中国第一高塔，昵称"小蛮腰"，高600米',
    tags: ['地标', '夜景', '观光'],
    checkin_radius: 150,
    story: '广州塔于2009年建成，是世界第三高塔。独特的设计灵感来源于女性的腰部曲线。',
  },
  {
    id: 'chen_clan',
    name: '陈家祠',
    district: '荔湾区',
    category: '岭南',
    lat: 23.1258,
    lng: 113.2436,
    open_time: '09:00-17:30',
    ticket: '10元',
    description: '广东现存规模最大、保存最完整的传统岭南祠堂式建筑',
    tags: ['古建筑', '博物馆', '文化'],
    checkin_radius: 100,
    story: '陈家祠建于清光绪年间，集岭南建筑"七绝"工艺于一身。',
  },
  {
    id: 'shamian',
    name: '沙面岛',
    district: '荔湾区',
    category: '历史',
    lat: 23.1097,
    lng: 113.2389,
    open_time: '全天开放',
    ticket: '免费',
    description: '广州最具异国情调的欧洲建筑群，曾是英法租界',
    tags: ['欧式建筑', '摄影', '历史'],
    checkin_radius: 100,
    story: '沙面岛有150多座欧洲风格建筑，是广州最浪漫的街区之一。',
  },
  {
    id: 'baiyun_mountain',
    name: '白云山',
    district: '白云区',
    category: '自然',
    lat: 23.1824,
    lng: 113.2988,
    open_time: '06:00-22:00',
    ticket: '5元',
    description: '南粤名山之一，自古有"羊城第一秀"之称',
    tags: ['登山', '自然', '休闲'],
    checkin_radius: 200,
    story: '白云山是广州市的"市肺"，由30多座山峰组成，主峰摩星岭海拔382米。',
  },
  {
    id: 'beijing_road',
    name: '北京路步行街',
    district: '越秀区',
    category: '美食',
    lat: 23.1249,
    lng: 113.2644,
    open_time: '全天开放',
    ticket: '免费',
    description: '广州最繁华的商业步行街，千年古道遗址所在地',
    tags: ['购物', '美食', '历史'],
    checkin_radius: 150,
    story: '北京路是广州城建之始所在地，地下埋藏着唐、宋、元、明、清五朝路面遗址。',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// 计算两点距离（Haversine公式）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 生成预设回复
function generateFallbackResponse(message: string): string {
  const q = message.toLowerCase();

  if (q.includes('广州塔') || q.includes('小蛮腰')) {
    return `广州塔是中国第一高塔，昵称"小蛮腰"，高600米。

📍 地址：广州市海珠区阅江西路222号
⏰ 开放时间：09:30-22:30
🎫 门票：150元起（不同套餐）

🏆 推荐玩法：
• 傍晚时分登塔，欣赏日落与夜景
• 488米观景平台俯瞰全城
• 塔顶摩天轮浪漫体验

💡 小贴士：建议提前网上购票，避免排队！`;
  }

  if (q.includes('陈家祠')) {
    return `陈家祠是广东现存规模最大、保存最完整的传统岭南祠堂式建筑，被誉为"岭南建筑艺术明珠"。

📍 地址：广州市荔湾区中山七路恩龙里34号
⏰ 开放时间：09:00-17:30
🎫 门票：10元

🏛️ 必看亮点：
• 木雕、石雕、砖雕艺术
• 陶塑、灰塑、彩绘装饰
• 铜铁铸精美工艺

💡 建议游览时长：1-2小时`;
  }

  if (q.includes('美食') || q.includes('好吃的') || q.includes('吃')) {
    return `广州美食推荐来啦！

🍜 必吃榜单：
1. 点都德 - 早茶点心必去
2. 陶陶居 - 百年老字号
3. 皇上皇 - 腊味煲仔饭
4. 银记肠粉 - 布拉肠粉经典

📍 美食街区：
• 上下九步行街 - 老字号集中地
• 北京路 - 传统与现代美食结合
• 沙面 - 西式餐饮与咖啡

🥤 特色饮品：
• 凉茶、龟苓膏
• 椰子汁、竹升面

请问你想去哪个区域觅食呢？`;
  }

  if (q.includes('天气')) {
    return `根据最新天气预报，今天广州天气：

🌤️ 天气：多云转晴
🌡️ 气温：22-28°C
💧 湿度：65%

✅ 适合出游！

💡 出行建议：
• 随身携带雨具（以防阵雨）
• 做好防晒措施
• 穿着轻便舒适的衣服

🎯 推荐活动：户外打卡、逛街、美食探店`;
  }

  if (q.includes('行程') || q.includes('路线') || q.includes('规划') || q.includes('一天') || q.includes('半日')) {
    return `🗺️ 为你推荐以下经典路线：

【经典一日游】
09:00 广州塔 - 登塔观光
11:00 陈家祠 - 岭南建筑艺术
13:00 沙面岛 - 午餐+漫步
15:00 越秀公园 - 城市绿肺
18:00 北京路 - 美食晚餐
20:00 珠江夜游 - 欣赏夜景

【半日精选】
如果只有半天，推荐：
• 广州塔 + 附近美食
• 或 陈家祠 + 沙面 + 北京路

【夜景专线】
• 珠江夜游
• 广州塔观景
• 太古仓酒吧街

请告诉我你的时间和兴趣，我帮你定制专属路线！`;
  }

  if (q.includes('沙面')) {
    return `沙面岛是广州最具异国情调的欧洲建筑群！

📍 地址：广州市荔湾区沙面北街
⏰ 开放时间：全天开放
🎫 门票：免费

🏛️ 建筑风格：
• 新巴洛克式
• 哥特式
• 券廊式

📸 拍照打卡点：
• 沙面教堂
• 欧洲风情街
• 百年古树

🍽️ 周边美食：
• 火车头餐厅
• 星巴克臻选

💡 小贴士：建议下午三四点前往，光线最美！`;
  }

  if (q.includes('白云山')) {
    return `白云山是南粤名山，有"羊城第一秀"之称！

📍 地址：广州市白云区广园中路801号
⏰ 开放时间：06:00-22:00
🎫 门票：5元（进山费）

🏔️ 推荐路线：
• 轻松版：南门进，索道上山
• 挑战版：西门进，徒步登山

🌳 必看景点：
• 摩星岭（主峰，海拔382米）
• 能仁寺
• 鸣春谷

💡 小贴士：
• 建议早晨出发，避暑又健身
• 带足饮用水
• 山顶风景超美，值得一去！`;
  }

  return `感谢你的提问！我是羊城印记的智能导游 🌟

我可以帮你：

🗺️ 【景点介绍】
• 广州塔、陈家祠、沙面等热门景点
• 历史背景、建筑特色、打卡攻略

🍜 【美食推荐】
• 老字号餐厅、街头小吃
• 各区美食地图

📅 【行程规划】
• 根据你的时间和兴趣
• 定制专属路线

📍 【打卡指引】
• 景点位置、交通方式
• 开放时间、门票信息

请告诉我你想了解什么？`;
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Chat endpoint (羊城印记智能导游)
app.post('/api/v1/chat', async (req: Request, res: Response) => {
  try {
    // Validate request
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      });
    }

    const { message, user_id } = parseResult.data;

    // Check for Coze API credentials
    const cozeToken = process.env.COZE_API_TOKEN;
    const cozeBotId = process.env.COZE_BOT_ID;

    if (cozeToken && cozeBotId) {
      try {
        const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cozeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: cozeBotId,
            user: user_id || 'anonymous',
            query: message,
            stream: false,
          }),
        });

        const data = await response.json() as { messages?: Array<{ role: string; type?: string; content?: string }> };

        if (data.messages && data.messages.length > 0) {
          const reply = data.messages.find((m) => m.role === 'assistant' && m.type === 'answer');
          return res.json({
            reply: reply?.content || '抱歉，我没有收到有效的回复。',
            success: true,
          });
        }
      } catch (apiError) {
        console.error('Coze API error:', apiError);
        // Fall through to fallback response
      }
    }

    // Fallback response
    const reply = generateFallbackResponse(message);
    res.json({
      reply,
      success: true,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SSE Streaming Chat endpoint
app.post('/api/v1/chat/stream', async (req: Request, res: Response) => {
  try {
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      });
    }

    const { message, user_id } = parseResult.data;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Check for Coze API credentials
    const cozeToken = process.env.COZE_API_TOKEN;
    const cozeBotId = process.env.COZE_BOT_ID;

    if (cozeToken && cozeBotId) {
      try {
        const response = await fetch('https://api.coze.cn/open_api/v2/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cozeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: cozeBotId,
            user: user_id || 'anonymous',
            query: message,
            stream: true,
          }),
        });

        // Handle streaming response from Coze
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            res.write(`data: ${chunk}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (apiError) {
        console.error('Coze API stream error:', apiError);
        // Fall through to fallback response
      }
    }

    // Fallback: Stream response character by character
    const reply = generateFallbackResponse(message);
    for (const char of reply) {
      res.write(`data: ${JSON.stringify({ content: char })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 景点信息查询
app.get('/api/v1/attractions', (_req: Request, res: Response) => {
  res.json({ attractions: ATTRACTIONS, total: ATTRACTIONS.length });
});

// 获取单个景点
app.get('/api/v1/attractions/:id', (req: Request, res: Response) => {
  const attraction = ATTRACTIONS.find(a => a.id === req.params.id);
  if (!attraction) {
    return res.status(404).json({ error: 'Attraction not found' });
  }
  res.json({ attraction });
});

// 打卡验证
app.post('/api/v1/checkin', (req: Request, res: Response) => {
  try {
    const parseResult = checkinSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      });
    }

    const { user_id, attraction_id, lat, lng } = parseResult.data;

    const attraction = ATTRACTIONS.find(a => a.id === attraction_id);
    if (!attraction) {
      return res.status(404).json({ error: 'Attraction not found' });
    }

    const distance = calculateDistance(lat, lng, attraction.lat, attraction.lng);
    const isValid = distance <= attraction.checkin_radius;

    res.json({
      is_valid: isValid,
      distance: Math.round(distance),
      message: isValid
        ? '打卡成功！'
        : `距离景点还有${Math.round(distance)}米，请靠近后再试`,
      points: isValid ? 10 : 0,
    });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 用户打卡记录
app.get('/api/v1/checkins/:user_id', (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // 预设数据（后续可接入数据库）
    const checkins = [
      {
        id: '1',
        user_id,
        attraction_id: 'gz_tower',
        attraction_name: '广州塔',
        checkin_time: new Date(Date.now() - 86400000).toISOString(),
        points: 10,
      },
      {
        id: '2',
        user_id,
        attraction_id: 'chen_clan',
        attraction_name: '陈家祠',
        checkin_time: new Date(Date.now() - 172800000).toISOString(),
        points: 10,
      },
    ];

    res.json({ checkins });
  } catch (error) {
    console.error('Get checkins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 用户成就
app.get('/api/v1/achievements/:user_id', (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const achievements = [
      { id: '1', name: '初来乍到', description: '完成第一次打卡', is_unlocked: true },
      { id: '2', name: '羊城探索者', description: '打卡5个不同景点', is_unlocked: false, progress: 60 },
    ];

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(port, () => {
  console.log(`🐑 羊城印记 API Server running on port ${port}`);
  console.log(`   Health: http://localhost:${port}/api/v1/health`);
});
