import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useCSSVariable } from 'uniwind';
import { QUICK_QUESTIONS } from '@/constants/attractions';
import { chatApi } from '@/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是羊城印记的智能导游。请问有什么可以帮到你的？你可以问我关于广州景点、美食、行程规划等问题。',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [accent, textPrimary, textSecondary, surface, background] = useCSSVariable([
    '--color-accent',
    '--color-foreground',
    '--color-muted',
    '--color-surface',
    '--color-background',
  ]) as string[];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatApi.send({
        message: inputText.trim(),
        user_id: 'demo_user',
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.reply || '抱歉，我现在有点忙，请稍后再试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackResponse = getFallbackResponse(inputText.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('广州塔') || q.includes('小蛮腰')) {
      return '广州塔是中国第一高塔，昵称"小蛮腰"，高600米。开放时间为09:30-22:30，门票150元起。推荐傍晚时分前往，可以欣赏到绝美的日落和夜景！';
    }
    if (q.includes('陈家祠')) {
      return '陈家祠是广东现存规模最大、保存最完整的传统岭南祠堂式建筑。门票10元，开放时间09:00-17:30。建议游览时长1-2小时。';
    }
    if (q.includes('美食') || q.includes('好吃的')) {
      return '广州美食推荐：\n1. 上下九步行街 - 老字号美食街\n2. 北京路 - 传统与现代美食结合\n3. 沙面 - 西式餐饮与咖啡\n4. 粤菜推荐：点都德、陶陶居、广州酒家';
    }
    if (q.includes('天气')) {
      return '根据天气预报，今天广州多云转晴，气温22-28度，适合出游！建议随身携带雨具和防晒用品。';
    }
    if (q.includes('行程') || q.includes('路线') || q.includes('规划')) {
      return '推荐经典一日游路线：\n09:00 广州塔\n11:00 陈家祠\n13:00 沙面岛午餐\n15:00 越秀公园\n18:00 北京路晚餐\n20:00 珠江夜游';
    }
    return '感谢你的提问！作为广州智能导游，我可以帮你：\n1. 介绍景点信息和历史\n2. 规划游览路线\n3. 推荐美食餐厅\n4. 提供交通指引\n\n请告诉我你想了解什么？';
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Screen>
      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userRow : styles.assistantRow,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={[styles.assistantAvatar, { backgroundColor: `${accent}20` }]}>
                <Ionicons name="location" size={16} color={accent as string} />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? [styles.userBubble, { backgroundColor: accent }]
                  : [styles.assistantBubble, { backgroundColor: surface }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.role === 'user' ? '#FFFFFF' : textPrimary },
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  { color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : textSecondary },
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            {message.role === 'user' && (
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageRow, styles.assistantRow]}>
            <View style={[styles.assistantAvatar, { backgroundColor: `${accent}20` }]}>
              <Ionicons name="location" size={16} color={accent as string} />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: surface }]}>
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, { backgroundColor: textSecondary }]} />
                <View style={[styles.loadingDot, { backgroundColor: textSecondary }]} />
                <View style={[styles.loadingDot, { backgroundColor: textSecondary }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Questions */}
      {messages.length <= 2 && !isLoading && (
        <View style={styles.quickQuestions}>
          <Text style={[styles.quickTitle, { color: textSecondary }]}>快捷问题</Text>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickList}>
              {QUICK_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  style={[styles.quickItem, { backgroundColor: surface }]}
                  onPress={() => handleQuickQuestion(q.query)}
                >
                  <Text style={[styles.quickText, { color: textPrimary }]}>{q.text}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: surface, borderTopColor: 'rgba(0,0,0,0.06)' }]}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="image" size={22} color={textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { backgroundColor: background, color: textPrimary }]}
          placeholder="输入你的问题..."
          placeholderTextColor={textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: accent }]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  quickQuestions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickTitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  quickList: {
    gap: 8,
  },
  quickItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
