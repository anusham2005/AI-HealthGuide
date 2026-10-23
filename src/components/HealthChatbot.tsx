import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Copy,
  Info,
  PhoneCall,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { STARTER_CHAT_QUESTIONS } from "../data/healthReferenceData";
import { AppSection, ChatMessage, EmergencyCheckInfo } from "../types/health";

interface HealthChatbotProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  activeEmergencyBanner: EmergencyCheckInfo | null;
  setActiveEmergencyBanner: React.Dispatch<
    React.SetStateAction<EmergencyCheckInfo | null>
  >;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigate: (section: AppSection) => void;
}

function renderFormattedMessage(text: string): React.ReactNode {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const formatInline = (line: string): React.ReactNode[] => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      blocks.push(
        <ul
          key={`${keyPrefix}-list`}
          className="list-disc pl-5 space-y-1.5 text-slate-800"
        >
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList(`gap-${index}`);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const numberedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

    if (bulletMatch) {
      currentList.push(bulletMatch[1]);
    } else if (numberedMatch) {
      currentList.push(numberedMatch[1]);
    } else {
      flushList(`line-${index}`);
      blocks.push(
        <p key={`p-${index}`} className="leading-relaxed text-slate-800">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList("final");
  return <div className="space-y-3">{blocks}</div>;
}

export const HealthChatbot: React.FC<HealthChatbotProps> = ({
  messages,
  setMessages,
  activeEmergencyBanner,
  setActiveEmergencyBanner,
  initialPrompt,
  onClearInitialPrompt,
  onNavigate,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInputValue(initialPrompt);
      onClearInitialPrompt?.();
      inputRef.current?.focus();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading, apiError]);

  const sendQuestion = async (rawQuestion: string, isRetry = false) => {
    const trimmed = rawQuestion.trim();
    setValidationError(null);
    setApiError(null);
    setConfirmClear(false);

    if (!trimmed) {
      setValidationError("Please enter a general health question before sending.");
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length > 1500) {
      setValidationError("Please shorten your question to 1,500 characters or fewer.");
      inputRef.current?.focus();
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let updatedMessages = messages;
    if (!isRetry) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: nowTime,
      };
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputValue("");
    }

    setIsLoading(true);
    setLastFailedPrompt(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        emergency?: EmergencyCheckInfo;
        privacyNoticeTriggered?: boolean;
      };

      if (data.emergency?.isEmergency) {
        setActiveEmergencyBanner(data.emergency);
      }

      if (!response.ok || !data.reply) {
        setLastFailedPrompt(trimmed);
        setApiError(
          data.error ||
            "The AI health education service is currently unavailable. Please try again shortly or consult a healthcare professional."
        );
        return;
      }

      const botMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        emergency: data.emergency,
        privacyNoticeTriggered: data.privacyNoticeTriggered,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setLastFailedPrompt(trimmed);
      setApiError(
        "Unable to reach the AI health education server. Check your internet connection and try again, or view Emergency Warning Signs if you need urgent guidance."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    void sendQuestion(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        void sendQuestion(inputValue);
      }
    }
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      // Ignore clipboard permission denial silently
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setApiError(null);
    setValidationError(null);
    setLastFailedPrompt(null);
    setActiveEmergencyBanner(null);
    setConfirmClear(false);
    inputRef.current?.focus();
  };

  return (
    <section
      aria-labelledby="chatbot-heading"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6"
    >
      {/* Header & Safety Scope */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-blue-800">
            General Health Education · Plain-English Q&amp;A
          </p>
          <h1
            id="chatbot-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
          >
            AI Health Information Chatbot
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Ask general health education questions in everyday words. This assistant cannot diagnose conditions, prescribe medicines, or replace your doctor.
          </p>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Clear Chat</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="min-h-[38px] px-3 py-1.5 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[38px] px-3 py-1.5 rounded-md bg-white text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <ShieldCheck
          className="w-4 h-4 text-blue-700 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="leading-relaxed">
          <strong className="font-semibold text-slate-900">Privacy Tip:</strong>{" "}
          Please do not enter personal identifiers such as your full name, home address, phone number, email, or medical record number.
        </p>
      </div>

      {/* Persistent Emergency Alert if Red Flags Detected */}
      {activeEmergencyBanner?.isEmergency && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-red-300 bg-red-50 p-5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-6 h-6 text-red-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-display text-base font-bold text-red-900">
                Emergency Warning Signs Detected — Seek Immediate Medical Care
              </p>
              <p className="text-sm text-slate-800 leading-relaxed">
                Your message mentioned potential emergency warning signs (
                {activeEmergencyBanner.matchedWarnings.join("; ")}). Do not wait for online chat replies—call local emergency services right away or go to the nearest emergency room.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 tabular-nums">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>Call 911 Now</span>
            </a>
            {activeEmergencyBanner.isCrisisLineRelevant && (
              <a
                href="tel:988"
                className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-800 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>Call or Text 988 Crisis Lifeline</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => onNavigate(AppSection.EMERGENCY)}
              className="min-h-[42px] px-3.5 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-800 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Full Emergency Guide
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Container */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col min-h-[460px]">
        <div
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[560px]"
        >
          {/* Empty State */}
          {messages.length === 0 && !isLoading && !apiError && (
            <div className="py-8 sm:py-12 px-2 max-w-2xl mx-auto space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                  What health topic would you like explained in simple English?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Select one of the starter education topics below or type your own question. If a topic is broad, AI HealthGuide may ask a quick clarifying question to give more relevant information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {STARTER_CHAT_QUESTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => void sendQuestion(item.prompt)}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/70 hover:border-blue-300 transition-colors text-left space-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    <p className="font-display text-sm font-semibold text-slate-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Thread */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                } space-y-1.5`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 px-1 tabular-nums">
                  <span className="font-medium text-slate-700">
                    {isUser
                      ? "You"
                      : "AI HealthGuide · General Health Information"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-sm sm:text-base ${
                    isUser
                      ? "bg-blue-700 text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-800"
                  }`}
                >
                  {isUser ? (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {msg.privacyNoticeTriggered && (
                        <div className="pb-2.5 border-b border-slate-200 flex items-center gap-2 text-xs text-amber-800">
                          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>
                            Personal contact or ID patterns were automatically redacted to protect your privacy.
                          </span>
                        </div>
                      )}

                      {renderFormattedMessage(msg.content)}

                      <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                          Educational information · Not a medical diagnosis or prescription
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 min-h-[32px] px-2 py-1 rounded hover:bg-slate-200/70 text-slate-700 font-medium transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-700" aria-hidden="true" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading State */}
          {isLoading && (
            <div
              role="status"
              aria-label="Generating educational health response"
              className="flex flex-col items-start space-y-1.5"
            >
              <span className="text-xs font-medium text-slate-600 px-1">
                AI HealthGuide · Reviewing general health education...
              </span>
              <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2.5">
                <div className="h-3.5 bg-slate-200 rounded w-4/5 animate-pulse" />
                <div className="h-3.5 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-3.5 bg-slate-200 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          )}

          {/* Error State */}
          {apiError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/70 p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="w-5 h-5 text-red-700 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Unable to Load AI Health Response
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {apiError}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pl-8">
                {lastFailedPrompt && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => void sendQuestion(lastFailedPrompt, true)}
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Retry Request</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate(AppSection.EMERGENCY)}
                  className="min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
                >
                  View Offline Emergency Signs
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="border-t border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-2.5"
        >
          <label htmlFor="health-chat-input" className="block text-xs font-semibold text-slate-700">
            Ask a general health question (Press Enter to send, Shift + Enter for a new line)
          </label>

          {validationError && (
            <p
              id="health-chat-error"
              role="alert"
              className="text-xs font-semibold text-red-700 flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{validationError}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <textarea
              ref={inputRef}
              id="health-chat-input"
              rows={2}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "health-chat-error" : "health-chat-counter"}
              placeholder="Example: What general questions should I ask my doctor about recurring headaches?"
              className="flex-1 min-h-[52px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20 resize-y"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-semibold text-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{isLoading ? "Sending..." : "Send Question"}</span>
            </button>
          </div>

          <div
            id="health-chat-counter"
            className="flex items-center justify-between text-xs text-slate-500 tabular-nums"
          >
            <span>General education only · Never share private IDs</span>
            <span className={inputValue.length > 1500 ? "text-red-700 font-semibold" : ""}>
              {inputValue.length} / 1,500
            </span>
          </div>
        </form>
      </div>
    </section>
  );
};
