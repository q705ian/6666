import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import * as Location from 'expo-location';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function CheckinActionScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ 
    id?: string; 
    name?: string;
    lat?: string;
    lng?: string;
  }>();
  const isMounted = useRef(true);
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [checkinResult, setCheckinResult] = useState<{ success: boolean; distance?: number; message: string } | null>(null);

  const attractionId = params.id || '';
  const attractionName = params.name || '景点';
  const attractionLat = parseFloat(params.lat || '0');
  const attractionLng = parseFloat(params.lng || '0');

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + 
              Math.cos(lat1 * Math.PI / 180) * 
              Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const getCurrentLocation = useCallback(async () => {
    if (!isMounted.current) return;
    setChecking(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (isMounted.current) {
          Alert.alert('权限不足', '需要位置权限才能打卡');
          setChecking(false);
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (!isMounted.current) return;
      
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      
      // Calculate distance
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        attractionLat,
        attractionLng
      );
      
      if (isMounted.current) {
        setCheckinResult({
          success: distance <= 200, // Within 200 meters
          distance: Math.round(distance),
          message: distance <= 200 
            ? `太棒了！你距离${attractionName}只有${Math.round(distance)}米，可以打卡啦！` 
            : `你距离${attractionName}还有${Math.round(distance)}米，再靠近一些才能打卡哦~`,
        });
        setChecking(false);
      }
    } catch (error) {
      console.error('Location error:', error);
      if (isMounted.current) {
        setCheckinResult({
          success: false,
          message: '无法获取位置，请检查定位服务是否开启',
        });
        setChecking(false);
      }
    }
  }, [attractionLat, attractionLng, attractionName]);

  useEffect(() => {
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCurrentLocation();
    return () => {
      isMounted.current = false;
    };
  }, [getCurrentLocation]);

  const handleCheckin = async () => {
    if (!checkinResult?.success) {
      Alert.alert('无法打卡', '请靠近景点后再尝试');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current_user',
          attraction_id: attractionId,
          lat: currentLocation?.lat || 0,
          lng: currentLocation?.lng || 0,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          '打卡成功！', 
          `恭喜你成功打卡「${attractionName}」！\n\n获得积分：+50\n解锁成就：初探羊城`,
          [
            { text: '查看成就', onPress: () => router.replace('/(tabs)/badges') },
            { text: '返回', onPress: () => router.back() },
          ]
        );
      } else {
        Alert.alert('打卡失败', data.message || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接后重试');
    }
    setLoading(false);
  };

  const handleNavigate = () => {
    if (attractionLat && attractionLng) {
      const address = encodeURIComponent(attractionName);
      const url = Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${attractionLat},${attractionLng}&q=${address}`
        : `https://maps.google.com/?daddr=${attractionLat},${attractionLng}&q=${address}`;
      Linking.openURL(url);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const images: Record<string, string> = {
    gz_tower: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_9a03a2bc-1e7e-4d3b-8dde-ebbeddf2d0e2.jpeg',
    chen_clan: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_55e2f59b-10fe-4494-9987-d0e356ced586.jpeg',
    shamian: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_956f9421-f5e8-452f-9a9b-c5e98f854b6b.jpeg',
    baiyun_mountain: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_aaec6d65-a46a-4966-8853-2683f903247f.jpeg',
    beijing_road: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_16c736b4-df93-4e77-b765-03337010cc44.jpeg',
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Attraction Card */}
        <View style={styles.attractionCard}>
          <Image 
            source={{ uri: images[attractionId] || 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_9a03a2bc-1e7e-4d3b-8dde-ebbeddf2d0e2.jpeg' }} 
            style={styles.attractionImage} 
          />
          <View style={styles.attractionInfo}>
            <Text style={styles.attractionName}>{attractionName}</Text>
            <Text style={styles.attractionHint}>到达后即可打卡</Text>
          </View>
        </View>

        {/* Location Status */}
        <View style={styles.statusCard}>
          {checking ? (
            <View style={styles.statusLoading}>
              <Ionicons name="locate" size={40} color="#6C63FF" />
              <Text style={styles.statusText}>正在获取位置...</Text>
            </View>
          ) : checkinResult ? (
            <View style={styles.statusResult}>
              <View style={[
                styles.statusIcon, 
                { backgroundColor: checkinResult.success ? '#00B89420' : '#FF6B6B20' }
              ]}>
                <Ionicons 
                  name={checkinResult.success ? 'checkmark-circle' : 'alert-circle'} 
                  size={48} 
                  color={checkinResult.success ? '#00B894' : '#FF6B6B'} 
                />
              </View>
              <Text style={[
                styles.statusMessage, 
                { color: checkinResult.success ? '#00B894' : '#FF6B6B' }
              ]}>
                {checkinResult.message}
              </Text>
              {checkinResult.distance !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="navigate" size={14} color="#6C63FF" />
                  <Text style={styles.distanceText}>相距 {checkinResult.distance} 米</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.statusLoading}>
              <Ionicons name="location" size={40} color="#999" />
              <Text style={styles.statusText}>点击下方按钮获取位置</Text>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>打卡小贴士</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00B894" />
            <Text style={styles.tipText}>到达景点后，打开定位服务</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00B894" />
            <Text style={styles.tipText}>确保与景点距离在200米以内</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#00B894" />
            <Text style={styles.tipText}>每次打卡可获得50积分</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={getCurrentLocation}
          >
            <Ionicons name="refresh" size={20} color="#6C63FF" />
            <Text style={styles.refreshBtnText}>刷新位置</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.checkinBtn,
              { opacity: checkinResult?.success ? 1 : 0.5 }
            ]}
            onPress={handleCheckin}
            disabled={!checkinResult?.success || loading}
          >
            {loading ? (
              <Text style={styles.checkinBtnText}>打卡中...</Text>
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.checkinBtnText}>确认打卡</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  attractionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  attractionImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
  },
  attractionInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  attractionName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  attractionHint: {
    fontSize: 14,
    color: '#999',
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statusLoading: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  statusResult: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#6C63FF15',
    gap: 8,
  },
  refreshBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  checkinBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    gap: 8,
  },
  checkinBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
