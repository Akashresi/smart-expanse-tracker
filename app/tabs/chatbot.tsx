// app/tabs/chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot } from 'lucide-react-native';
import { ChatMessage } from '../../types';
import { useThemeColors, SIZING, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const SAMPLE_RESPONSES: { [key: string]: string } = {
  'spending': 'Based on your recent expenses, you spent ₹850.50 this week. Your top category is Food & Dining at ₹455.50.',
  'budget': 'You have a monthly budget of ₹5000 for Food & Dining. So far, you\'ve spent ₹850.50, which is 17% of your budget.',
  'save': 'To boost your savings: 1) Reduce dining out by ₹800/month, 2) Review subscriptions, 3) Set up automatic transfers of ₹2000/month to savings.',
  'travel': 'You spent ₹150.00 on travel last month for cabs.',
  'default': 'I can help you analyze your spending patterns, track budgets, and provide savings recommendations. Try asking about your spending, budgets, or ways to save more!',
};


import { LinearGradient } from 'expo-linear-gradient';

export default function ChatbotScreen() {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const BotAvatar = () => (
    <LinearGradient colors={[COLORS.primary, '#7C3AED']} style={styles.botAvatar} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
      <Bot size={20} color="#ffffff" />
    </LinearGradient>
  );

  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true })
            ])
          )
        ]);
      };
  
      Animated.parallel([
        animateDot(dot1, 0),
        animateDot(dot2, 200),
        animateDot(dot3, 400),
      ]).start();
    }, []);
  
    return (
      <View style={styles.typingContainer}>
        <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      </View>
    );
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: '',
      response: 'Hello! I\'m What-bot, your financial assistant. Ask me about your expenses, budgets, or get personalized savings tips!',
      timestamp: new Date(),
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const getResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) return SAMPLE_RESPONSES.spending;
    if (lowerQuery.includes('budget')) return SAMPLE_RESPONSES.budget;
    if (lowerQuery.includes('save') || lowerQuery.includes('saving')) return SAMPLE_RESPONSES.save;
    if (lowerQuery.includes('travel') || lowerQuery.includes('transport')) return SAMPLE_RESPONSES.travel;
    return SAMPLE_RESPONSES.default;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputText,
      response: '',
      timestamp: new Date(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: '',
        response: getResponse(userMessage.message),
        timestamp: new Date(),
        isUser: false,
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }, 1500); // 1.5s delay to show typing indicator
  };

  const QuickQuestion = ({ question, onPress }: { question: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.quickQuestion} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.quickQuestionText}>{question}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={TYPOGRAPHY.heading}>What-bot</Text>
        <Text style={styles.headerSubtitle}>AI Financial Assistant</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Try asking:</Text>
              <QuickQuestion question="How much did I spend this week?" onPress={() => setInputText("How much did I spend this week?")} />
              <QuickQuestion question="What's my budget status?" onPress={() => setInputText("What's my budget status?")} />
              <QuickQuestion question="How can I save more?" onPress={() => setInputText("How can I save more?")} />
            </View>
          )}

          {messages.map((message) => {
            if (message.isUser) {
              return (
                <View key={message.id} style={styles.userBubbleWrapper}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{message.message}</Text>
                  </View>
                </View>
              );
            } else {
              return (
                <View key={message.id} style={styles.botBubbleWrapper}>
                  <BotAvatar />
                  <View style={styles.botBubble}>
                    <Text style={styles.botText}>{message.response}</Text>
                  </View>
                </View>
              );
            }
          })}
          
          {isTyping && (
             <View style={styles.botBubbleWrapper}>
              <BotAvatar />
              <View style={styles.botBubble}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your finances..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? COLORS.primary : COLORS.grayMedium }]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  headerSubtitle: {
    fontSize: SIZING.caption,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500'
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  quickQuestionsContainer: {
    marginVertical: SPACING.md,
    paddingLeft: 46 // align with bot bubble text
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  quickQuestion: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  quickQuestionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  userBubbleWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
  },
  userText: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 22,
  },
  botBubbleWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    alignItems: 'flex-end'
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...SHADOWS.sm,
  },
  botBubble: {
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  botText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22,
    width: 40,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 120,
    marginRight: 12,
    color: COLORS.textPrimary,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
});