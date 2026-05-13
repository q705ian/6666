import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 设备 ID 管理
const DEVICE_ID_KEY = '@yangcheng_device_id';

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    // 如果获取失败，生成临时 ID
    return Crypto.randomUUID();
  }
};

// API 错误类
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 基础请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const deviceId = await getDeviceId();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || '请求失败',
      data
    );
  }

  return data as T;
}

// GET 请求
export async function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return request<T>(url, { method: 'GET' });
}

// POST 请求
export async function post<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// PUT 请求
export async function put<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

// DELETE 请求
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

export { BASE_URL };
