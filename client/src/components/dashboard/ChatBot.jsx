"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Avatar,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Send,
  SmartToy,
  AutoAwesome,
  Lightbulb,
  TrendingUp,
  Insights,
  Psychology,
  Analytics,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";

const ChatBot = ({ insights = [], section = "overview" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hello! I'm your AI Analytics Assistant. I'll analyze your ${section} data and provide insights.`,
      timestamp: "Just now",
      isInsight: false,
    },
  ]);
  const chatEndRef = useRef(null);

  const sectionTitles = {
    overview: "Dashboard Overview",
    revenue: "Revenue & Orders",
    products: "Products",
    refunds: "Refund Analysis",
    traffic: "Traffic & Analysis",
    conversion: "Conversion Analysis",
  };

  // Typing effect simulation
  useEffect(() => {
    if (!isOpen || !insights.length || isThinking) return;

    const typeInsight = async () => {
      if (currentInsightIndex >= insights.length) return;

      setIsThinking(true);
      const insight = insights[currentInsightIndex];

      // Add thinking message
      const thinkingId = chatHistory.length + 1;
      setChatHistory((prev) => [
        ...prev,
        {
          id: thinkingId,
          sender: "bot",
          text: "Analyzing data and generating insights...",
          timestamp: "Just now",
          isThinking: true,
          isInsight: false,
        },
      ]);

      // Simulate AI thinking delay (1-3 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Remove thinking message
      setChatHistory((prev) => prev.filter((msg) => msg.id !== thinkingId));

      // Add insight with typing effect
      const insightId = chatHistory.length + 2;
      const fullText = `📊 **${insight.title}**\n\n${insight.message}\n\n💡 **Recommendation:** ${insight.recommendation}`;

      // Start typing effect
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsThinking(false);

          // Add completed insight to chat
          setChatHistory((prev) => [
            ...prev.filter((msg) => !msg.isInsight || msg.id !== insightId),
            {
              id: insightId,
              sender: "bot",
              text: fullText,
              timestamp: "Just now",
              type: insight.type,
              isInsight: true,
            },
          ]);

          setCurrentInsightIndex((prev) => prev + 1);
          setDisplayedText("");
        }
      }, 20); // Typing speed

      return () => clearInterval(typingInterval);
    };

    typeInsight();
  }, [isOpen, insights, currentInsightIndex, isThinking]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Reset when section changes
  useEffect(() => {
    setCurrentInsightIndex(0);
    setDisplayedText("");
    setIsThinking(false);
    setChatHistory([
      {
        id: 1,
        sender: "bot",
        text: `Hello! I'm your AI Analytics Assistant. I'll analyze your ${section} data and provide insights.`,
        timestamp: "Just now",
        isInsight: false,
      },
    ]);
  }, [section]);

  const getInsightIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle sx={{ color: "#10B981", fontSize: 16 }} />;
      case "warning":
        return <Warning sx={{ color: "#F59E0B", fontSize: 16 }} />;
      case "alert":
        return <Warning sx={{ color: "#EF4444", fontSize: 16 }} />;
      case "info":
        return <Info sx={{ color: "#3B82F6", fontSize: 16 }} />;
      case "opportunity":
        return <TrendingUp sx={{ color: "#8B5CF6", fontSize: 16 }} />;
      default:
        return <Insights sx={{ color: "#6B7280", fontSize: 16 }} />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case "success":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "alert":
        return "#EF4444";
      case "info":
        return "#3B82F6";
      case "opportunity":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  return (
    <>
      {/* Bot Icon */}
      <Box
        component={motion.div}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            background: "linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)",
            color: "#ffffff",
            width: 56,
            height: 56,
            boxShadow: "0 8px 32px rgba(96, 63, 239, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #4A2FBD 0%, #603FEF 100%)",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          {isOpen ? <Close /> : <SmartToy />}
        </IconButton>
      </Box>

      {/* Chat Area */}
      <AnimatePresence>
        {isOpen && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: { xs: "calc(100vw - 48px)", sm: 450 },
              maxWidth: "calc(100vw - 48px)",
              height: 500,
              maxHeight: "calc(100vh - 124px)",
              zIndex: 9998,
              overflow: "hidden",
            }}
          >
            <Paper
              elevation={24}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "rgba(18, 18, 24, 0.98)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(96, 63, 239, 0.3)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #603FEF20 0%, #7D5FF320 100%)",
                  borderBottom: "1px solid rgba(96, 63, 239, 0.2)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      background:
                        "linear-gradient(135deg, #603FEF 0%, #7D5FF3 100%)",
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#ffffff", fontWeight: 600 }}
                    >
                      AI Insights Assistant
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      Analyzing: {sectionTitles[section]}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                    label={`${insights.length} insights`}
                    size="small"
                    sx={{
                      ml: "auto",
                      background: "rgba(96, 63, 239, 0.2)",
                      color: "#7D5FF3",
                      border: "1px solid rgba(96, 63, 239, 0.3)",
                      "& .MuiChip-icon": { color: "#7D5FF3" },
                    }}
                  />
                </Box>
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  background:
                    "linear-gradient(180deg, rgba(18,18,24,0.9) 0%, rgba(30,30,40,0.9) 100%)",
                }}
              >
                {chatHistory.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        flexDirection:
                          msg.sender === "user" ? "row-reverse" : "row",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            msg.sender === "bot"
                              ? "rgba(96, 63, 239, 0.2)"
                              : "rgba(125, 95, 243, 0.2)",
                          flexShrink: 0,
                        }}
                      >
                        {msg.sender === "bot" ? (
                          <SmartToy sx={{ fontSize: 16 }} />
                        ) : (
                          <Psychology sx={{ fontSize: 16 }} />
                        )}
                      </Avatar>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: "85%",
                          p: msg.isThinking ? 1.5 : 2,
                          borderRadius: 2,
                          background: msg.isThinking
                            ? "rgba(96, 63, 239, 0.1)"
                            : msg.isInsight
                            ? `rgba(${parseInt(
                                getInsightColor(msg.type).slice(1, 3),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(3, 5),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(5, 7),
                                16
                              )}, 0.1)`
                            : "rgba(96, 63, 239, 0.1)",
                          border: "1px solid",
                          borderColor: msg.isThinking
                            ? "rgba(96, 63, 239, 0.2)"
                            : msg.isInsight
                            ? `rgba(${parseInt(
                                getInsightColor(msg.type).slice(1, 3),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(3, 5),
                                16
                              )}, ${parseInt(
                                getInsightColor(msg.type).slice(5, 7),
                                16
                              )}, 0.2)`
                            : "rgba(96, 63, 239, 0.2)",
                          borderLeft: msg.isInsight
                            ? `4px solid ${getInsightColor(msg.type)}`
                            : "1px solid rgba(96, 63, 239, 0.2)",
                        }}
                      >
                        {msg.isThinking ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <CircularProgress size={16} thickness={5} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255, 255, 255, 0.8)",
                                fontStyle: "italic",
                              }}
                            >
                              Analyzing data patterns...
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {msg.isInsight && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                {getInsightIcon(msg.type)}
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: getInsightColor(msg.type),
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  {msg.type.toUpperCase()}
                                </Typography>
                              </Box>
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#ffffff",
                                lineHeight: 1.6,
                                whiteSpace: "pre-line",
                                "& strong": {
                                  color: msg.isInsight
                                    ? getInsightColor(msg.type)
                                    : "#7D5FF3",
                                },
                              }}
                              dangerouslySetInnerHTML={{
                                __html: msg.text.replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>"
                                ),
                              }}
                            />
                          </>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 1,
                            color: "rgba(255, 255, 255, 0.5)",
                            textAlign: "right",
                          }}
                        >
                          {msg.timestamp}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}

                {/* Currently typing insight */}
                {displayedText && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "rgba(96, 63, 239, 0.2)",
                        }}
                      >
                        <SmartToy sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Paper
                        elevation={0}
                        sx={{
                          maxWidth: "85%",
                          p: 2,
                          borderRadius: 2,
                          background: "rgba(96, 63, 239, 0.1)",
                          border: "1px solid rgba(96, 63, 239, 0.2)",
                          borderLeft: "4px solid #7D5FF3",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#ffffff",
                            lineHeight: 1.6,
                            whiteSpace: "pre-line",
                          }}
                        >
                          {displayedText}
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              width: 8,
                              height: 16,
                              ml: 0.5,
                              bgcolor: "#7D5FF3",
                              animation: "blink 1s infinite",
                              "@keyframes blink": {
                                "0%, 100%": { opacity: 1 },
                                "50%": { opacity: 0 },
                              },
                            }}
                          />
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                )}

                {/* Insights Progress */}
                {insights.length > 0 && (
                  <Box sx={{ mt: 2, px: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      Insights Generated: {currentInsightIndex} of{" "}
                      {insights.length}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {insights.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor:
                              index < currentInsightIndex
                                ? getInsightColor(insights[index].type)
                                : "rgba(255, 255, 255, 0.1)",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <div ref={chatEndRef} />
              </Box>

              {/* Status Footer */}
              <Box
                sx={{
                  p: 1.5,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(18, 18, 24, 0.9)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {isThinking ? (
                      <>
                        <CircularProgress size={12} thickness={5} />
                        Generating insights...
                      </>
                    ) : currentInsightIndex < insights.length ? (
                      <>
                        <AutoAwesome sx={{ fontSize: 12 }} />
                        Next insight in progress...
                      </>
                    ) : insights.length > 0 ? (
                      <>
                        <CheckCircle sx={{ fontSize: 12, color: "#10B981" }} />
                        All insights generated
                      </>
                    ) : (
                      <>
                        <Analytics sx={{ fontSize: 12 }} />
                        Analyzing data...
                      </>
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    AI Powered
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
