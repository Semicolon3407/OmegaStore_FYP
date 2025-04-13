import React, { useState, useEffect } from "react";
import { useChat } from "../../Context/chatContext";
import { Send, Users, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../components/AdminNav"; // Consistent with AdminDashboard

const AdminChat = () => {
  const {
    conversations = [],
    messages = [],
    fetchMessages,
    sendMessage,
    selectedConversation,
    fetchConversations,
    isLoading,
  } = useChat();

  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchConversations();
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError("Failed to load conversations");
      }
    };

    loadData();
  }, [fetchConversations]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    try {
      const success = await sendMessage(selectedConversation, message);
      if (success) {
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    }
  };

  const currentUserId = localStorage.getItem("userId");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1  p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Admin Chat</h1>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-[calc(100vh-120px)]">
            {/* Conversations List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/3 bg-white rounded-lg shadow-md p-4 md:p-6 overflow-y-auto border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={24} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              </div>

              {isLoading && conversations.length === 0 ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
              ) : !Array.isArray(conversations) || conversations.length === 0 ? (
                <p className="text-gray-500 text-center">No conversations yet</p>
              ) : (
                conversations.map((conv, index) => (
                  <motion.div
                    key={conv.user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => fetchMessages(conv.user._id)}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.user._id
                        ? "bg-orange-500/10 text-orange-500"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        {conv.user.firstname} {conv.user.lastname}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage?.content || "No messages"}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Chat Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 bg-white rounded-lg shadow-md flex flex-col border border-gray-200"
            >
              {selectedConversation ? (
                <>
                  <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {isLoading && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-10">
                        <MessageSquare size={40} className="mx-auto mb-2 text-blue-600" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {messages.map((msg) => (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`mb-4 flex ${
                              msg.sender._id === currentUserId
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.sender._id === currentUserId
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <span className="text-xs opacity-75 mt-1 block">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-gray-800"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !message.trim()}
                        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare size={40} className="mx-auto mb-2 text-blue-600" />
                    <p>Select a user to start chatting</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;