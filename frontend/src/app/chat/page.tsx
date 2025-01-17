"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { apiRequest } from "../api";
import { useRouter } from "next/navigation";
import { Send, Bot, PlusCircle, LogOut } from "lucide-react";

interface Message {
  id: string;
  message: string;
  user: string;
  timestamp: string;
}

interface Session {
  id: string;
  name: string;
}

interface User {
  id: string;
  jwt: string;
  username: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadSession = async (session: Session, userData: User = user!) => {
    if (!userData) return;

    try {
      const response = await apiRequest(
        `/api/chats?filters[session][id][$eq]=${session.id}&populate=*`,
        { headers: { Authorization: `Bearer ${userData.jwt}` } }
      );

      const messagesFromAPI: Message[] = response.data.map((msg: { id: string; message: string; user: { username: string }; timestamp: string }) => ({
        id: msg.id,
        message: msg.message,
        user: msg.user?.username || "Bot",
        timestamp: new Date(msg.timestamp).toISOString(),
      }));

      setMessages(messagesFromAPI);
      setCurrentSession(session);
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  };

  const handleUnauthorized = (error: unknown) => {
    if (isApiError(error) && error.response?.status === 401) {
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  function isApiError(error: unknown): error is { response?: { status: number } } {
    return (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status: number } }).response?.status === "number"
    );
  }

  const fetchSessions = useCallback(async (userData: User) => {
    try {
      const response = await apiRequest(`/api/sessions?filters[user][id][$eq]=${userData.id}`, {
        headers: { Authorization: `Bearer ${userData.jwt}` },
      });

      if (response?.data?.length) {
        const sessionsFromAPI: Session[] = response.data.map((session: { id: string; name: string }) => ({
          id: session.id,
          name: session.name,
        }));
        setSessions(sessionsFromAPI);
        loadSession(sessionsFromAPI[0], userData);
      } else {
        await createInitialSession(userData);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      handleUnauthorized(error);
    }
  }, [handleUnauthorized, loadSession]);

  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (!parsedUser.jwt) throw new Error("Invalid user data");

        if (!user) {
        setUser(parsedUser);
      }
        await fetchSessions(parsedUser);
      } catch (error) {
        console.error("Error initializing user:", error);
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    initializeUser();
  }, [router, user]);

  const createInitialSession = async (userData: User) => {
    try {
      const response = await apiRequest("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.jwt}`,
        },
        body: JSON.stringify({ data: { name: "Session 1", user: userData.id } }),
      });

      const newSession: Session = {
        id: response.data.id,
        name: response.data.name,
      };
      setSessions([newSession]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error("Error creating initial session:", error);
    }
  };

  const createNewSession = async () => {
    if (!user || !user.jwt) {
      console.error("No valid user data found, redirecting to login");
      router.push("/login");
      return;
    }

    try {
      const response = await apiRequest("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({
          data: { name: `Session ${sessions.length + 1}`, user: user.id },
        }),
      });

      const newSession: Session = {
        id: response.data.id,
        name: response.data.name,
      };

      setSessions((prev) => [...prev, newSession]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentSession || !message.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: message.trim(),
      user: user!.username,
      timestamp: new Date().toISOString(),
    };

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      message: message.trim(),
      user: "Bot",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setMessage("");

    try {
      await apiRequest("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user!.jwt}`,
        },
        body: JSON.stringify({
          data: {
            message: userMessage.message,
            user: user!.id,
            session: currentSession.id,
            timestamp: userMessage.timestamp,
          },
        }),
      });

      await apiRequest("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user!.jwt}`,
        },
        body: JSON.stringify({
          data: {
            message: botMessage.message,
            user: null,
            session: currentSession.id,
            timestamp: botMessage.timestamp,
          },
        }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4">
      <div className="w-full max-w-3xl bg-neutral-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/20">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Chat Assistant</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-sm text-gray-400">Online</p>
              </div>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="flex">
          <div className="w-1/4 border-r border-gray-800">
            <div className="p-4">
              <button
                className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none"
                onClick={createNewSession}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                New Session
              </button>
            </div>
            <div className="overflow-y-auto h-[400px]">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 cursor-pointer ${
                    currentSession?.id === session.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-800 text-gray-300"
                  }`}
                  onClick={() => loadSession(session)}
                >
                  {session.name}
                </div>
              ))}
            </div>
          </div>

          <div className="w-3/4 h-[500px] overflow-y-auto px-6 py-8 bg-neutral-900/50 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.user === user!.username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] group transition-all duration-200 ${
                    msg.user === user!.username
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none"
                      : "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-none border border-gray-700"
                  }`}
                >
                  <div className="p-4">
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <span
                      className={`text-xs mt-2 block opacity-70 group-hover:opacity-100 transition-opacity ${
                        msg.user === user!.username
                          ? "text-indigo-200"
                          : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <p className="text-xs mt-1 text-gray-400">
                      From: {msg.user}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="relative">
            <input
              type="text"
              className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-xl pr-16 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                text-gray-300"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-indigo-600 p-2 rounded-full 
                hover:bg-indigo-700 focus:outline-none"
              onClick={sendMessage}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
