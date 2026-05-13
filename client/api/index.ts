import { get, post } from './client';
import { Attraction, ApiResponse } from '@/types';
import { ATTRACTIONS } from '@/constants/attractions';

// 景点 API - 目前使用本地数据，后续可对接真实后端
export const attractionsApi = {
  // 获取景点列表
  getList: async (params?: {
    category?: string;
    district?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Attraction[]>> => {
    // 目前使用本地数据
    let data = [...ATTRACTIONS];
    
    if (params?.category) {
      data = data.filter((a) => a.category === params.category);
    }
    
    if (params?.district) {
      data = data.filter((a) => a.district === params.district);
    }
    
    return {
      success: true,
      message: 'success',
      data,
    };
  },

  // 获取景点详情
  getById: async (id: string): Promise<ApiResponse<Attraction>> => {
    const attraction = ATTRACTIONS.find((a) => a.id === id);
    
    if (!attraction) {
      return {
        success: false,
        message: '景点不存在',
      };
    }
    
    return {
      success: true,
      message: 'success',
      data: attraction,
    };
  },

  // 搜索景点
  search: async (keyword: string): Promise<ApiResponse<Attraction[]>> => {
    const data = ATTRACTIONS.filter(
      (a) =>
        a.name.includes(keyword) ||
        a.description.includes(keyword) ||
        a.tags.some((t) => t.includes(keyword))
    );
    
    return {
      success: true,
      message: 'success',
      data,
    };
  },

  // 获取热门景点
  getHot: async (limit: number = 5): Promise<ApiResponse<Attraction[]>> => {
    return {
      success: true,
      message: 'success',
      data: ATTRACTIONS.slice(0, limit),
    };
  },

  // 获取分类列表
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const categories = [...new Set(ATTRACTIONS.map((a) => a.category))];
    return {
      success: true,
      message: 'success',
      data: categories,
    };
  },

  // 获取区域列表
  getDistricts: async (): Promise<ApiResponse<string[]>> => {
    const districts = [...new Set(ATTRACTIONS.map((a) => a.district))];
    return {
      success: true,
      message: 'success',
      data: districts,
    };
  },
};

// 打卡 API
export const checkinApi = {
  // 打卡
  create: async (params: {
    attraction_id: string;
    lat: number;
    lng: number;
    user_id?: string;
  }): Promise<ApiResponse<{
    checkin_id: string;
    attraction: { id: string; name: string };
    distance: number;
    points_earned: number;
  }>> => {
    try {
      const response = await post('/api/v1/checkin', {
        ...params,
        user_id: params.user_id || 'anonymous',
      });
      return response as any;
    } catch {
      // 如果后端不可用，返回模拟数据
      const attraction = ATTRACTIONS.find((a) => a.id === params.attraction_id);
      const distance = Math.floor(Math.random() * 200);
      
      return {
        success: true,
        message: distance <= 150 ? '打卡成功' : '距离景点太远',
        data: {
          checkin_id: `demo_${Date.now()}`,
          attraction: {
            id: params.attraction_id,
            name: attraction?.name || '未知景点',
          },
          distance,
          points_earned: distance <= 150 ? 50 : 0,
        },
      };
    }
  },

  // 获取打卡记录
  getRecords: async (params?: {
    user_id?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    attraction_id: string;
    attraction_name: string;
    district: string;
    checkin_time: string;
    distance: number;
    is_valid: boolean;
  }>>> => {
    try {
      const response = await get('/api/v1/checkins', params);
      return response as any;
    } catch {
      // 返回模拟数据
      return {
        success: true,
        message: 'success',
        data: [],
      };
    }
  },
};

// AI 对话 API
export const chatApi = {
  // 发送消息
  send: async (params: {
    message: string;
    user_id?: string;
    type?: string;
  }): Promise<ApiResponse<{
    reply: string;
    suggestions?: string[];
  }>> => {
    try {
      const response = await post('/api/v1/chat', {
        ...params,
        user_id: params.user_id || 'anonymous',
      });
      return response as any;
    } catch {
      // 返回模拟 AI 回复
      const replies = [
        '广州塔是广州的地标性建筑，高600米，因其独特的外形被称为"小蛮腰"。建议傍晚时分去，可以欣赏到绝美的日落和夜景！',
        '陈家祠是岭南建筑艺术的精华，集木雕、石雕、砖雕、陶塑、灰塑、彩绘和铜铁铸于一体，非常值得一看！',
        '沙面岛是广州最浪漫的地方，保留了大量欧式建筑，很适合散步拍照。建议下午三四点去，光线最美！',
        '北京路是广州最古老的商业街，地下还有千年古道遗址。这里美食林立，一定不要错过！',
        '白云山是广州的"市肺"，空气清新，是周末健身的好去处。爬到山顶可以俯瞰整个广州城！',
      ];
      
      const reply = replies[Math.floor(Math.random() * replies.length)];
      
      return {
        success: true,
        message: 'success',
        data: {
          reply,
          suggestions: [
            '推荐更多景点',
            '帮我规划路线',
            '广州美食推荐',
          ],
        },
      };
    }
  },
};
