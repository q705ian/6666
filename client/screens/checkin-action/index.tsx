import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Linking, Platform, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import ViewShot, { captureRef } from 'react-native-view-shot';

const EXPO_PUBLIC_BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

// 景点信息数据
const ATTRACTIONS_DATA: Record<string, {
  id: string;
  image: string;
  address: string;
  open_time: string;
  name: string;
  district: string;
  description: string;
  tags: string[];
}> = {
  gz_tower: { id: 'gz_tower', name: '广州塔', image: '', address: '广州市海珠区阅江西路222号', open_time: '09:30-22:30', district: '海珠区', description: '中国第一高塔，昵称"小蛮腰"，珠江夜景璀璨夺目', tags: ['地标', '夜景', '观光'] },
  chen_clan: { id: 'chen_clan', name: '陈家祠', image: '', address: '广州市荔湾区中山七路恩龙里34号', open_time: '09:00-17:30', district: '荔湾区', description: '岭南建筑艺术明珠，七绝工艺精妙绝伦', tags: ['岭南', '建筑', '文化'] },
  shamian: { id: 'shamian', name: '沙面岛', image: '', address: '广州市荔湾区沙面北街', open_time: '全天', district: '荔湾区', description: '广州最具异国情调的欧洲建筑群', tags: ['欧式', '历史', '漫步'] },
  baiyun_mountain: { id: 'baiyun_mountain', name: '白云山', image: '', address: '广州市白云区广园中路801号', open_time: '06:00-22:00', district: '白云区', description: '南粤名山之首，羊城第一秀', tags: ['自然', '登山', '休闲'] },
  beijing_road: { id: 'beijing_road', name: '北京路步行街', image: '', address: '广州市越秀区北京路', open_time: '全天', district: '越秀区', description: '千年商都核心，美食购物天堂', tags: ['美食', '购物', '夜市'] },
};

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
  const [demoMode, setDemoMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const viewShotRef = useRef<any>(null);

  const attractionId = params.id || '';
  const attractionName = params.name || ATTRACTIONS_DATA[attractionId]?.name || '景点';
  const defaultAttraction = { id: 'custom', name: attractionName, district: '广州', address: '', open_time: '', description: '', image: '', tags: ['打卡'] };
  const attractionData = ATTRACTIONS_DATA[attractionId] || defaultAttraction;
        const address = attractionData.address || ATTRACTIONS_DATA[attractionId]?.open_time?.replace(/\d{2}:\d{2}-\d{2}:\d{2}/, '') || '广州市';
  const attractionLat = parseFloat(params.lat || '0');
  const attractionLng = parseFloat(params.lng || '0');

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
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
          setDemoMode(true);
          setCheckinResult({
            success: true,
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
      
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        attractionLat,
        attractionLng
      );
      
      if (isMounted.current) {
        setCheckinResult({
          success: distance <= 200,
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
        // 显示精美的打卡成功弹窗
        setShowShareModal(true);
      } else {
        Alert.alert('打卡失败', data.message || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接后重试');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      const shareText = `我在「${attractionName}」打卡成功！\n地址: ${address}\n日期: ${new Date().toLocaleDateString('zh-CN')}\n获得积分: +50\n\n#羊城印记 #${attractionName.replace(/ /g, '')} #广州旅游`;
      
      try {
        await Clipboard.setStringAsync(shareText);
        Alert.alert(
          '分享成功',
          '打卡信息已复制到剪贴板，可以去粘贴分享啦！',
          [{ text: '好的', style: 'default' }]
        );
        return;
      } catch (clipboardError) {
        console.log('Clipboard error:', clipboardError);
      }
      
      Alert.alert('提示', '请截图分享您的打卡成果');
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('分享失败', '请稍后重试');
    }
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
    Alert.alert(
      demoMode ? '演示打卡成功！' : '打卡成功！', 
      `恭喜你${demoMode ? '演示' : ''}打卡「${attractionName}」！\n\n获得积分：+50\n解锁成就：初探羊城\n\n${demoMode ? '（演示模式：实际未在景点）' : ''}`,
      [
        { text: '查看成就', onPress: () => router.replace('/(tabs)/badges') },
        { text: '返回打卡', onPress: () => router.back() },
      ]
    );
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

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
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
              { backgroundColor: demoMode ? '#FF9500' : '#6C63FF' }
            ]}
            onPress={handleCheckin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.checkinBtnText}>打卡中...</Text>
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.checkinBtnText}>
                  {demoMode ? '演示打卡' : '确认打卡'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Share Success Modal */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* 海报卡片 */}
              <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
                <View style={styles.posterCard}>
                  {/* 顶部装饰条 */}
                  <View style={styles.posterHeader}>
                    <View style={styles.posterLogo}>
                      <Text style={styles.posterLogoText}>羊城印记</Text>
                    </View>
                    <Text style={styles.posterSubtitle}>城市探索 · 发现广州之美</Text>
                  </View>

                  {/* 景点图片 */}
                  <Image 
                    source={{ uri: images[attractionId] || images.gz_tower }} 
                    style={styles.posterImage}
                    resizeMode="cover"
                  />

                  {/* 打卡成功标识 */}
                  <View style={styles.checkinBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#00B894" />
                    <Text style={styles.checkinBadgeText}>打卡成功</Text>
                  </View>

                  {/* 景点信息 */}
                  <View style={styles.posterInfo}>
                    <Text style={styles.posterTitle}>{attractionData.name}</Text>
                    <View style={styles.posterMeta}>
                      <View style={styles.posterMetaItem}>
                        <Ionicons name="location" size={14} color="#6C63FF" />
                        <Text style={styles.posterMetaText}>{attractionData.district}</Text>
                      </View>
                      <View style={styles.posterMetaItem}>
                        <Ionicons name="calendar" size={14} color="#6C63FF" />
                        <Text style={styles.posterMetaText}>{getCurrentDate()}</Text>
                      </View>
                    </View>
                    <Text style={styles.posterDesc} numberOfLines={2}>{attractionData.description}</Text>
                    
                    {/* 标签 */}
                    <View style={styles.posterTags}>
                      {attractionData.tags.map((tag, index) => (
                        <View key={index} style={styles.posterTag}>
                          <Text style={styles.posterTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* 底部装饰 */}
                  <View style={styles.posterFooter}>
                    <View style={styles.posterDivider} />
                    <View style={styles.posterStats}>
                      <View style={styles.posterStatItem}>
                        <Text style={styles.posterStatValue}>+50</Text>
                        <Text style={styles.posterStatLabel}>积分</Text>
                      </View>
                      <View style={styles.posterStatDivider} />
                      <View style={styles.posterStatItem}>
                        <Text style={styles.posterStatValue}>1</Text>
                        <Text style={styles.posterStatLabel}>打卡</Text>
                      </View>
                      <View style={styles.posterStatDivider} />
                      <View style={styles.posterStatItem}>
                        <Text style={styles.posterStatValue}>初探</Text>
                        <Text style={styles.posterStatLabel}>成就</Text>
                      </View>
                    </View>
                    <Text style={styles.posterBrand}>羊城印记 · 记录你的广州故事</Text>
                  </View>
                </View>
              </ViewShot>

              {/* 操作按钮 */}
              <View style={styles.shareActions}>
                <TouchableOpacity 
                  style={styles.shareBtn}
                  onPress={handleShare}
                >
                  <Ionicons name="share-social" size={22} color="#FFF" />
                  <Text style={styles.shareBtnText}>分享海报</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeBtnText}>完成</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
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
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  posterCard: {
    width: 300,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  posterHeader: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posterLogo: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  posterLogoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  posterSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  posterImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E0E0E0',
  },
  checkinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B894',
    paddingVertical: 8,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkinBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  posterInfo: {
    padding: 20,
  },
  posterTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  posterMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  posterMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  posterMetaText: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '500',
  },
  posterDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  posterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  posterTag: {
    backgroundColor: '#6C63FF15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  posterTagText: {
    fontSize: 11,
    color: '#6C63FF',
    fontWeight: '600',
  },
  posterFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  posterDivider: {
    height: 1,
    backgroundColor: '#EEE',
    marginBottom: 16,
  },
  posterStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 20,
  },
  posterStatItem: {
    alignItems: 'center',
  },
  posterStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6C63FF',
  },
  posterStatLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  posterStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEE',
  },
  posterBrand: {
    fontSize: 11,
    color: '#CCC',
    textAlign: 'center',
  },
  shareActions: {
    width: 300,
    marginTop: 24,
    gap: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
