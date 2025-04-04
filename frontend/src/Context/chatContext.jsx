import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Define getAxiosConfig first since other functions depend on it
  const getAxiosConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    withCredentials: true,
  }), []);

  // Define fetchUnreadCount before fetchMessages since fetchMessages depends on it
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/chat/unread-count", getAxiosConfig());
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [getAxiosConfig]);

  // Define other fetch functions
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/chat/conversations", getAxiosConfig());
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [getAxiosConfig]);

  const fetchMessages = useCallback(async (otherUserId) => {
    if (!otherUserId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/chat/messages/${otherUserId}`, getAxiosConfig());
      setMessages(response.data);
      setSelectedConversation(otherUserId);
      fetchUnreadCount();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [getAxiosConfig, fetchUnreadCount]);

  const sendMessage = useCallback(async (recipientId, content) => {
    if (!recipientId || !content.trim()) return false;
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5001/api/chat/send",
        { recipientId, content },
        getAxiosConfig()
      );
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAxiosConfig]);

  // Socket.IO setup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://localhost:5001", {
      auth: { token },
    });
    setSocket(newSocket);

    const userId = localStorage.getItem("userId");
    newSocket.emit("join", userId);

    newSocket.on("newMessage", (message) => {
      setMessages((prev) => {
        if (!prev.some((msg) => msg._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
      fetchConversations();
      fetchUnreadCount();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchConversations, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [fetchConversations, fetchUnreadCount]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        unreadCount,
        selectedConversation,
        isLoading,
        fetchConversations,
        fetchMessages,
        sendMessage,
        setSelectedConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);