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
          // 权限被拒绝时，显示提示但允许继续操作
          setCheckinResult({
            success: false,
            message: '位置权限未授权，将以模拟位置进行演示',
          });
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
        // 获取位置失败时，允许以模拟位置继续
        setCheckinResult({
          success: true,
          message: `已到达「${attractionName}」，可以打卡啦！（演示模式）`,
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

  const handleNavigate = async () => {
    if (!attractionLat || !attractionLng) return;
    
    const encodedName = encodeURIComponent(attractionName);
    const amapUrl = `amap://route?sourceApplication=羊城印记&dlat=${attractionLat}&dlon=${attractionLng}&dname=${encodedName}&dev=0&t=0`;
    const appleUrl = `http://maps.apple.com/?daddr=${attractionLat},${attractionLng}&q=${encodedName}`;
    const amapWebUrl = `https://uri.amap.com/navigation?to=${attractionLng},${attractionLat},${encodedName}&mode=car&callnative=0`;
    
    try {
      if (Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL(appleUrl);
        if (canOpen) {
          await Linking.openURL(appleUrl);
        } else {
          await Linking.openURL(amapWebUrl);
        }
      } else {
        const canOpen = await Linking.canOpenURL(amapUrl);
        if (canOpen) {
          await Linking.openURL(amapUrl);
        } else {
          await Linking.openURL(amapWebUrl);
        }
      }
    } catch (error) {
      await Linking.openURL(amapWebUrl);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const images: Record<string, string> = {
    gz_tower: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_12618e46-93fa-4233-815c-4283c5c6eb5e.jpeg?sign=1809762590-aab807f870-0-3424e61b81b792b3bb81d91e04dab6e756c4045309f863b7e2e51100d0fb032d',
    chen_clan: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_3a9fe745-95bc-43e9-9cdd-8a6327f9e48c.jpeg?sign=1809762591-b4fc03e60f-0-5707a617615ba3a222786c6dbc362e9c657929faa5824db824d40d0c8e73c055',
    shamian: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_a26ac1c0-5d7b-4d0d-a2ad-57de1ba6192a.jpeg?sign=1809762589-632d886d54-0-8c103b4dc47a9f84caa67cd7cdf13b1f4e1a79574b963844f7ee6ae61041836f',
    baiyun_mountain: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_0eee4af4-29d8-4e4a-9c9b-5912f9b963ab.jpeg?sign=1809762590-87f3dcd8f7-0-6524cf726764e57396f48d35a4598195dfece79f81b08351013341e1f95f3209',
    beijing_road: 'https://coze-coding-project.tos.coze.site/coze_storage_7634004491666227210/image/generate_image_1a0e3da5-6224-427c-9031-15fb1354631f.jpeg?sign=1809762591-2e8a50b791-0-3184026a384d622c5c184e0315db711f2d4e20cb22e9cceaf7a33dae7ad435f1',
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
