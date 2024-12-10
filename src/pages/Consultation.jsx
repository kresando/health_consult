import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChatHistory } from '../hooks/useChatHistory';
import { generateResponse } from '../lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Menu, Plus, MessageSquare, LogOut, Info } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Animated background component
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() + 0.5],
            opacity: [0.3, 0.6],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  </div>
);

const popularQuestions = [
  "Apa itu diabetes?",
  "Gejala demam berdarah",
  "Tips hidup sehat",
  "Cara menjaga kesehatan mental",
  "Manfaat olahraga teratur"
];

export default function Consultation() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const { messages, addMessage, clearMessages, setMessages } = useChatHistory(currentSessionId);

  // Load chat sessions when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        navigate('/');
        return;
      }
      await loadChatSessions();
    };

    initializeChat();
  }, [user]);

  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      const chatRef = collection(db, 'chatSessions');
      const q = query(
        chatRef,
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      // Sort sessions by timestamp, newest first
      sessions.sort((a, b) => b.timestamp - a.timestamp);
      
      setChatSessions(sessions);
      
      // Set current session if none is selected
      if (sessions.length > 0 && !currentSessionId) {
        const latestSession = sessions[0];
        setCurrentSessionId(latestSession.id);
        await handleSessionClick(latestSession.id);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const sessionRef = collection(db, 'chatSessions');
      const newSession = {
        userId: user.uid,
        title: 'New Chat',
        timestamp: serverTimestamp(),
        lastMessage: ''
      };
      
      const docRef = await addDoc(sessionRef, newSession);
      const sessionWithId = {
        id: docRef.id,
        ...newSession,
        timestamp: new Date()
      };
      
      setChatSessions(prev => [sessionWithId, ...prev]);
      setCurrentSessionId(docRef.id);
      clearMessages();
      return docRef.id;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    let sessionId = currentSessionId;

    try {
      // If no session exists, create one
      if (!sessionId) {
        sessionId = await createNewSession();
        setCurrentSessionId(sessionId);
      }

      // Add user message to messages immediately for UI feedback
      const tempUserMessage = {
        id: 'temp-' + Date.now(),
        content: userMessage,
        isUser: true,
        sessionId,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Add message to database
      const savedMessage = await addMessage(userMessage, true);
      if (!savedMessage) throw new Error('Failed to add message');

      // Update session title and last message
      const sessionRef = doc(db, 'chatSessions', sessionId);
      const updateData = {
        lastMessage: userMessage,
        timestamp: serverTimestamp()
      };

      // Update title if it's the first message or still "New Chat"
      const currentSession = chatSessions.find(s => s.id === sessionId);
      if (!currentSession?.title || currentSession.title === 'New Chat') {
        updateData.title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
      }

      await updateDoc(sessionRef, updateData);

      // Get AI response
      const response = await generateResponse(userMessage);
      
      // Add AI response to messages immediately for UI feedback
      const tempAiMessage = {
        id: 'temp-ai-' + Date.now(),
        content: response,
        isUser: false,
        sessionId,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tempAiMessage]);

      // Save AI response to database
      await addMessage(response, false);

      // Reload chat sessions to update UI
      await loadChatSessions();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setCurrentSessionId(sessionId);
      clearMessages();
      
      // Load messages for the selected session
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('sessionId', '==', sessionId)
      );
      
      const querySnapshot = await getDocs(q);
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })).sort((a, b) => {
        const timeA = a.timestamp?.getTime() || 0;
        const timeB = b.timestamp?.getTime() || 0;
        return timeA - timeB;
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading session messages:', error);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    await createNewSession();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSendMessage = async (message) => {
    setInput(message);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-card border-r border-border flex flex-col absolute md:relative h-full z-20"
          >
            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Chat Baru
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${
                      currentSessionId === session.id ? 'bg-muted' : ''
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <div className="flex-1 text-left">
                      <p className="text-sm truncate">
                        {session.title || 'New Chat'}
                      </p>
                      {session.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {session.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <img
                  src={user?.photoURL}
                  alt={user?.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen relative">
        <AnimatedBackground />
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 p-2 rounded-lg hover:bg-muted transition-colors z-30"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 mt-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    Selamat datang di Health Consultation
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    Tanyakan apa saja seputar kesehatan kepada AI Assistant kami
                  </p>
                  
                  <div className="w-full space-y-4">
                    <h2 className="text-lg font-semibold text-center">Pertanyaan populer:</h2>
                    <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                      <button
                        onClick={() => handleSendMessage("Apa itu diabetes?")}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        Apa itu diabetes?
                      </button>
                      <button
                        onClick={() => handleSendMessage("Gejala demam berdarah")}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        Gejala demam berdarah
                      </button>
                      <button
                        onClick={() => handleSendMessage("Tips hidup sehat")}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        Tips hidup sehat
                      </button>
                      <button
                        onClick={() => handleSendMessage("Cara menjaga kesehatan mental")}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        Cara menjaga kesehatan mental
                      </button>
                      <button
                        onClick={() => handleSendMessage("Manfaat olahraga teratur")}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm text-primary transition-colors"
                      >
                        Manfaat olahraga teratur
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground text-center pt-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        Konsultasi ini hanya untuk informasi umum, bukan pengganti konsultasi dokter
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {messages.length > 0 && (
                messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 ${
                      message.isUser ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.isUser ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      {message.isUser ? (
                        <User className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`rounded-lg p-4 max-w-[80%] ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </motion.div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="border-t bg-background/50 backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 bg-muted rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </motion.button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
