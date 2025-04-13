import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../Context/chatContext";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const UserChat = () => {
  const { messages, fetchMessages, sendMessage, isLoading } = useChat();
  const [message, setMessage] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("Please sign in to access chat");
      navigate("/sign-in");
      return;
    }

    const fetchAdmin = async () => {
      setIsLoadingAdmin(true);
      setFetchError(null);

      try {
        const response = await axios.get("http://localhost:5001/api/chat/get-support", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (response.data?._id) {
          setAdminId(response.data._id);
          fetchMessages(response.data._id);
        } else {
          throw new Error(response.data?.message || "No support available");
        }
      } catch (error) {
        console.error("Error fetching support:", error);

        let errorMessage = "Failed to connect to support";
        if (error.response) {
          if (error.response.status === 403) {
            errorMessage = "You don't have permission to access chat";
          } else if (error.response.status === 404) {
            errorMessage = "Support team is currently unavailable";
          } else {
            errorMessage = error.response.data?.message || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    fetchAdmin();
  }, [fetchMessages, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !adminId) return;

    setLoading(true);
    try {
      const success = await sendMessage(adminId, message);
      if (success) {
        setMessage("");
        toast.success("Message sent successfully!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12">
      <motion.div
        className="bg-white rounded-lg shadow-md hover:shadow-xl p-4 sm:p-6 md:p-8 w-full max-w-3xl sm:max-w-4xl h-[70vh] flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
            Chat with Support
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            We're here to help! Start a conversation with our support team.
          </p>
        </div>

        {isLoadingAdmin ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-900 w-8 h-8 sm:w-10 sm:h-10" />
          </div>
        ) : fetchError ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-red-500 p-4 sm:p-6">
              <p className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-900 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200">
              {isLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-blue-900 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 sm:mt-10">
                  <MessageSquare className="mx-auto mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                  <p className="text-sm sm:text-lg">Start a conversation with our support team</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    className={`mb-3 sm:mb-4 flex ${
                      msg.sender._id === currentUserId ? "justify-end" : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-[70%] sm:max-w-[60%] p-3 sm:p-4 rounded-lg shadow-sm ${
                        msg.sender._id === currentUserId
                          ? "bg-blue-900 text-white"
                          : "bg-white text-blue-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm sm:text-base">{msg.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading || !adminId || loading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                />
                <button
                  type="submit"
                  disabled={isLoading || !adminId || !message.trim() || loading}
                  className="flex items-center justify-center bg-blue-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-blue-500 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />}
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UserChat;