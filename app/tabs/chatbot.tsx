// app/tabs/chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
import { ChatMessage } from '../../types'; // Correct path

const SAMPLE_RESPONSES: { [key: string]: string } = {
  'spending': 'Based on your recent expenses, you spent $85.50 this week. Your top category is Food & Dining at $45.50.',
  'budget': 'You have a monthly budget of $500 for Food & Dining. So far, you\'ve spent $85.50, which is 17% of your budget.',
  'save': 'To boost your savings: 1) Reduce dining out by $80/month, 2) Review subscriptions, 3) Set up automatic transfers of $200/month to savings.',
  'travel': 'You spent $15.00 on travel last month for Uber rides.',
  'default': 'I can help you analyze your spending patterns, track budgets, and provide savings recommendations. Try asking about your spending, budgets, or ways to save more!',
};


export default function ChatbotScreen() {
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
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('spend') || lowerQuery.includes('spent')) {
      return SAMPLE_RESPONSES.spending;
    } else if (lowerQuery.includes('budget')) {
      return SAMPLE_RESPONSES.budget;
    } else if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
      return SAMPLE_RESPONSES.save;
    } else if (lowerQuery.includes('travel') || lowerQuery.includes('transport')) {
      return SAMPLE_RESPONSES.travel;
    } else if (lowerQuery.includes('inflation') || lowerQuery.includes('market') || lowerQuery.includes('economy')) {
      return 'Current inflation rate is 3.2% (as of last update). The stock market is showing moderate growth. Consider diversifying your investments for better returns.';
    } else if (lowerQuery.includes('currency') || lowerQuery.includes('exchange')) {
      return 'Current USD exchange rates: EUR 0.92, GBP 0.79, JPY 149.50. Currency fluctuations suggest holding USD for the next quarter.';
    }

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

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: '',
        response: getResponse(inputText),
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputText('');
  };

  const QuickQuestion = ({ question, onPress }: { question: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.quickQuestion} onPress={onPress}>
      <Text style={styles.quickQuestionText}>{question}</Text>
    </TouchableOpacity>
  );

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bot size={28} color="#3b82f6" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>What-bot</Text>
            <Text style={styles.headerSubtitle}>Your AI Financial Assistant</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={styles.quickQuestionsTitle}>Try asking:</Text>
              <QuickQuestion
                question="How much did I spend this week?"
                onPress={() => handleQuickQuestion("How much did I spend this week?")}
              />
              <QuickQuestion
                question="What's my budget status?"
                onPress={() => handleQuickQuestion("What's my budget status?")}
              />
              <QuickQuestion
                question="How can I save more?"
                onPress={() => handleQuickQuestion("How can I save more?")}
              />
              <QuickQuestion
                question="What are the current market trends?"
                onPress={() => handleQuickQuestion("What are the current market trends?")}
              />
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
              ]}
            >
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <User size={20} color="#fff" />
                ) : (
                  <Bot size={20} color="#3b82f6" />
                )}
                <Text style={[
                  styles.messageSender,
                  message.isUser ? styles.userSender : styles.botSender,
                ]}>
                  {message.isUser ? 'You' : 'What-bot'}
                </Text>
              </View>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.botText,
              ]}>
                {message.isUser ? message.message : message.response}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your finances..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  quickQuestionsContainer: {
    marginBottom: 20,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  quickQuestion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  userSender: {
    color: '#fff',
  },
  botSender: {
    color: '#3b82f6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});