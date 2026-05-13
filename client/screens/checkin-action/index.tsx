import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Linking, Platform, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { ATTRACTIONS_MAP } from '@/constants/attractions';

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
  const viewShotRef = useRef<any>(null);

  const attractionId = params.id || 'gz_tower';
  const attractionData = ATTRACTIONS_MAP[attractionId] || {
    id: attractionId,
    name: params.name || '景点',
    district: '广州',
    address: '',
    open_time: '',
    description: '',
    image: '',
    tags: ['打卡'],
  };
  const attractionLat = parseFloat(params.lat || String(attractionData.lat || '23.1065'));
  const attractionLng = parseFloat(params.lng || String(attractionData.lng || '113.3245'));

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
            message: '位置权限未授权，将以演示模式进行打卡',
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
            ? `太棒了！你距离${attractionData.name}只有${Math.round(distance)}米，可以打卡啦！` 
            : `你距离${attractionData.name}还有${Math.round(distance)}米，再靠近一些才能打卡哦~`,
        });
        setChecking(false);
      }
    } catch (error) {
      console.error('Location error:', error);
      if (isMounted.current) {
        setCheckinResult({
          success: true,
          message: `已到达「${attractionData.name}」，可以打卡啦！（演示模式）`,
        });
        setChecking(false);
      }
    }
  }, [attractionLat, attractionLng, attractionData.name]);

  // 初始化获取位置
  useEffect(() => {
    isMounted.current = true;
    // 使用 IIFE 来避免直接调用 setState
    (async () => {
      await getCurrentLocation();
    })();
    return () => {
      isMounted.current = false;
    };
  }, [getCurrentLocation]);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      // 模拟打卡请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowShareModal(true);
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接后重试');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    try {
      // 等待Modal完全渲染
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 截取海报图片
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      
      // 检查是否支持分享
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: '分享打卡海报',
        });
      } else {
        await Clipboard.setStringAsync(uri);
        Alert.alert('保存成功', '海报已保存，请到相册查看并分享！');
      }
    } catch (error) {
      console.error('Share error:', error);
      const shareText = `我在【${attractionData.name}】打卡成功！

位置：${attractionData.address || attractionData.district}
日期：${new Date().toLocaleDateString('zh-CN')}
获得：+50积分

#羊城印记 #广州打卡 #探索广州`;
      try {
        await Clipboard.setStringAsync(shareText);
        Alert.alert('已复制', '打卡信息已复制到剪贴板，可以粘贴分享啦！');
      } catch {
        Alert.alert('分享失败', '请稍后重试');
      }
    }
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
    Alert.alert(
      demoMode ? '演示打卡成功！' : '打卡成功！', 
      `恭喜你${demoMode ? '演示' : ''}打卡「${attractionData.name}」！\n\n获得积分：+50\n解锁成就：初探羊城\n\n${demoMode ? '（演示模式：实际未在景点）' : ''}`,
      [
        { text: '查看成就', onPress: () => router.replace('/(tabs)/badges') },
        { text: '返回', onPress: () => router.back() },
      ]
    );
  };

  const handleNavigate = async () => {
    if (!attractionLat || !attractionLng) return;
    
    const encodedName = encodeURIComponent(attractionData.name);
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
      console.error('Navigation error:', error);
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

  return (
    <Screen safeAreaEdges={['left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Attraction Card */}
        <View style={styles.attractionCard}>
          <Image 
            source={{ uri: attractionData.image }} 
            style={styles.attractionImage} 
          />
          <View style={styles.attractionInfo}>
            <Text style={styles.attractionName}>{attractionData.name}</Text>
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
                    source={{ uri: attractionData.image }} 
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 160,
    justifyContent: 'center',
  },
  statusLoading: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
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
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#6C63FF15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 10,
    gap: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 40,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
  },
  refreshBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C63FF',
  },
  checkinBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkinBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  posterCard: {
    width: 320,
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  posterLogo: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  posterLogoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6C63FF',
  },
  posterSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  posterImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  checkinBadge: {
    position: 'absolute',
    top: 200,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B894',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  checkinBadgeText: {
    color: '#FFF',
    fontSize: 12,
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
  },
  posterDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  posterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  posterTag: {
    backgroundColor: '#6C63FF15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  posterTagText: {
    fontSize: 12,
    color: '#6C63FF',
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
    marginBottom: 16,
  },
  posterStatItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  posterStatValue: {
    fontSize: 20,
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
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
  },
  shareActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
  },
  shareBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 25,
  },
  closeBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
