import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useChatHistory(sessionId) {
  const [messages, setMessages] = useState([]);

  // Load messages when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
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
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [sessionId]);

  const addMessage = async (content, isUser) => {
    if (!sessionId || !content) return null;

    try {
      // Prepare message data
      const messageData = {
        content: content.toString(),
        isUser,
        sessionId,
        timestamp: serverTimestamp()
      };

      // Add to database
      const messagesRef = collection(db, 'messages');
      const docRef = await addDoc(messagesRef, messageData);

      // Create message object with local timestamp for immediate display
      const newMessage = {
        id: docRef.id,
        ...messageData,
        timestamp: new Date()
      };

      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    clearMessages,
    setMessages
  };
}
