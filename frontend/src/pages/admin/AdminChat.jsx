import React, { useState, useEffect } from "react";
import { useChat } from "../../Context/chatContext";
import { Send, Users, MessageSquare, Loader2 } from "lucide-react";
import Navbar from "../../components/AdminNav"; // Import the Navbar component

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

  if (error) {
    return (
      <div>
        <Navbar /> {/* Add the Navbar component */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar /> {/* Add the Navbar component */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Chat</h1>
        <div className="flex h-[70vh] gap-4">
          {/* Conversations List */}
          <div className="w-1/3 bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Users size={24} />
              <h2 className="text-xl font-semibold">Users</h2>
            </div>
            
            {isLoading && conversations.length === 0 ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="animate-spin" size={40} />
              </div>
            ) : !Array.isArray(conversations) || conversations.length === 0 ? (
              <p className="text-gray-500">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user._id}
                  onClick={() => fetchMessages(conv.user._id)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conv.user._id ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {conv.user.firstname} {conv.user.lastname}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage?.content || "No messages"}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="w-2/3 bg-white rounded-lg shadow-lg flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin" size={40} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                      <MessageSquare size={40} className="mx-auto mb-2" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`mb-4 flex ${
                          msg.sender._id === currentUserId ? "justify-end" : "justify-start"
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
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading}
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare size={40} className="mx-auto mb-2" />
                  <p>Select a user to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;