import { Attraction, QuickQuestion, Route } from '@/types';

// 景点数据 - 统一数据源
export const ATTRACTIONS: Attraction[] = [
  {
    id: 'gz_tower',
    name: '广州塔',
    category: '现代',
    district: '海珠区',
    address: '广州市海珠区阅江西路222号',
    lat: 23.1065,
    lng: 113.3245,
    open_time: '09:30-22:30',
    ticket: '150元起',
    description: '中国第一高塔，昵称"小蛮腰"，高600米，是广州地标建筑',
    story: '广州塔于2009年建成，是世界第三高塔。其独特的设计灵感来源于女性的腰部曲线，塔身扭转形成"纤纤细腰"的视觉效果。夜晚灯光秀更是广州名片。',
    tags: ['地标', '夜景', '观光', '摄影'],
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_12618e46-93fa-4233-815c-4283c5c6eb5e.jpeg?sign=1809762590-aab807f870-0-3424e61b81b792b3bb81d91e04dab6e756c4045309f863b7e2e51100d0fb032d',
    checkin_radius: 150,
  },
  {
    id: 'chen_clan',
    name: '陈家祠',
    category: '岭南',
    district: '荔湾区',
    address: '广州市荔湾区中山七路恩龙里34号',
    lat: 23.1258,
    lng: 113.2436,
    open_time: '09:00-17:30',
    ticket: '10元',
    description: '广东现存规模最大、保存最完整的传统岭南祠堂式建筑',
    story: '陈家祠建于清光绪年间，集岭南建筑"七绝"工艺于一身：木雕、石雕、砖雕、陶塑、灰塑、彩绘、铜铁铸。被誉为"岭南建筑艺术明珠"。',
    tags: ['古建筑', '博物馆', '摄影', '文化'],
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_3a9fe745-95bc-43e9-9cdd-8a6327f9e48c.jpeg?sign=1809762591-b4fc03e60f-0-5707a617615ba3a222786c6dbc362e9c657929faa5824db824d40d0c8e73c055',
    checkin_radius: 100,
  },
  {
    id: 'shamian',
    name: '沙面岛',
    category: '历史',
    district: '荔湾区',
    address: '广州市荔湾区沙面北街',
    lat: 23.1097,
    lng: 113.2389,
    open_time: '全天开放',
    ticket: '免费',
    description: '广州最具异国情调的欧洲建筑群，曾是英法租界',
    story: '沙面岛面积约0.3平方公里，有150多座欧洲风格建筑，包括新巴洛克式、哥特式、券廊式等。岛上绿树成荫，是广州最浪漫的街区之一。',
    tags: ['欧式建筑', '摄影', '漫步', '历史'],
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_a26ac1c0-5d7b-4d0d-a2ad-57de1ba6192a.jpeg?sign=1809762589-632d886d54-0-8c103b4dc47a9f84caa67cd7cdf13b1f4e1a79574b963844f7ee6ae61041836f',
    checkin_radius: 100,
  },
  {
    id: 'baiyun_mountain',
    name: '白云山',
    category: '自然',
    district: '白云区',
    address: '广州市白云区广园中路801号',
    lat: 23.1824,
    lng: 113.2988,
    open_time: '06:00-22:00',
    ticket: '5元（进山费）',
    description: '南粤名山之一，自古有"羊城第一秀"之称',
    story: '白云山是广州市的"市肺"，由30多座山峰组成。主峰摩星岭海拔382米，可俯瞰广州全景。山中有能仁寺、鸣春谷等古迹。',
    tags: ['登山', '自然风光', '休闲', '吸氧'],
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_0eee4af4-29d8-4e4a-9c9b-5912f9b963ab.jpeg?sign=1809762590-87f3dcd8f7-0-6524cf726764e57396f48d35a4598195dfece79f81b08351013341e1f95f3209',
    checkin_radius: 200,
  },
  {
    id: 'beijing_road',
    name: '北京路步行街',
    category: '美食',
    district: '越秀区',
    address: '广州市越秀区北京路',
    lat: 23.1249,
    lng: 113.2644,
    open_time: '全天开放',
    ticket: '免费',
    description: '广州最繁华的商业步行街，千年古道遗址所在地',
    story: '北京路是广州城建之始所在地，地下埋藏着唐、宋、元、明、清五朝路面遗址。现在是广州最热闹的商圈，集购物、美食、娱乐于一体。',
    tags: ['购物', '美食', '历史遗址', '夜市'],
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_1a0e3da5-6224-427c-9031-15fb1354631f.jpeg?sign=1809762591-2e8a50b791-0-3184026a384d622c5c184e0315db711f2d4e20cb22e9cceaf7a33dae7ad435f1',
    checkin_radius: 150,
  },
];

// 按 ID 索引的景点数据
export const ATTRACTIONS_MAP: Record<string, Attraction> = ATTRACTIONS.reduce(
  (acc, attraction) => {
    acc[attraction.id] = attraction;
    return acc;
  },
  {} as Record<string, Attraction>
);

// AI 对话快捷问题
export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: '1', text: '景点推荐', query: '推荐一些广州必去的景点' },
  { id: '2', text: '美食攻略', query: '广州有哪些必吃的美食？' },
  { id: '3', text: '路线规划', query: '帮我规划一条广州一日游路线' },
  { id: '4', text: '历史文化', query: '讲讲广州的历史文化' },
  { id: '5', text: '粤语学习', query: '教我几句实用的粤语' },
];

// 精选路线
export const ROUTES: Route[] = [
  {
    id: '1',
    name: '老广州怀旧一日游',
    description: '穿梭于西关大屋与骑楼街巷，感受老广州的市井风情',
    spots: ['陈家祠', '沙面岛', '永庆坊', '上下九步行街'],
    duration: '6-8小时',
    image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400',
  },
  {
    id: '2',
    name: '岭南文化深度游',
    description: '探索岭南建筑精华，品味千年商都的文化底蕴',
    spots: ['陈家祠', '南越王宫博物馆', '北京路步行街', '越秀公园'],
    duration: '5-6小时',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400',
  },
  {
    id: '3',
    name: '现代广州地标之旅',
    description: '打卡广州塔、海心沙、花城广场，感受都市魅力',
    spots: ['广州塔', '海心沙', '花城广场', '广东省博物馆'],
    duration: '4-5小时',
    image: 'https://images.unsplash.com/photo-1547190994-4e494a1b4e44?w=400',
  },
];

// 成就徽章定义
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'newbie',
    name: '打卡新手',
    description: '完成首次打卡',
    icon: 'seedling',
    requirement: { type: 'checkin_count', target: 1 },
    reward: { points: 10, exp: 10 },
  },
  {
    id: 'explorer',
    name: '城市探索者',
    description: '探索3个不同区域',
    icon: 'map',
    requirement: { type: 'district_count', target: 3 },
    reward: { points: 50, exp: 50 },
  },
  {
    id: 'photographer',
    name: '摄影达人',
    description: '打卡5个景点并拍照',
    icon: 'camera',
    requirement: { type: 'photo_count', target: 5 },
    reward: { points: 30, exp: 30 },
  },
  {
    id: 'foodie',
    name: '美食探索家',
    description: '打卡3个美食类景点',
    icon: 'restaurant',
    requirement: { type: 'category_count', target: 3, category: '美食' },
    reward: { points: 40, exp: 40 },
  },
  {
    id: 'historian',
    name: '历史爱好者',
    description: '打卡3个历史文化景点',
    icon: 'book',
    requirement: { type: 'category_count', target: 3, category: '历史' },
    reward: { points: 40, exp: 40 },
  },
  {
    id: 'nature_lover',
    name: '自然漫步者',
    description: '打卡2个自然景点',
    icon: 'leaf',
    requirement: { type: 'category_count', target: 2, category: '自然' },
    reward: { points: 30, exp: 30 },
  },
];

// 获取景点数据
export const getAttractionById = (id: string): Attraction | undefined => {
  return ATTRACTIONS_MAP[id];
};

// 获取景点分类
export const getAttractionsByCategory = (category: string): Attraction[] => {
  return ATTRACTIONS.filter((a) => a.category === category);
};

// 获取景点区域
export const getAttractionsByDistrict = (district: string): Attraction[] => {
  return ATTRACTIONS.filter((a) => a.district === district);
};

// 打卡积分
export const CHECKIN_POINTS = 50;
