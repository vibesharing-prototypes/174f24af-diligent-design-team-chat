"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Message {
  from: "user" | "bot" | string;
  text: string;
  time: string;
  read?: boolean;
  card?: { title: string; items: string[] };
  replyTo?: { from: string; text: string };
  file?: { name: string; size: string; type: string };
  slide?: { title: string; bullets: string[]; footer: string };
}

interface ScriptedStep {
  prompt: string;
  userMsg: Message;
  botMsgs: Message[];
  isUpload?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  isGroup?: boolean;
  lastSeen?: string;
  members?: string;
  preview: string;
  previewDate: string;
  messages: Message[];
  steps: ScriptedStep[];
}

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "design",
    name: "Design Leadership",
    avatar: "DL",
    avatarBg: "#ec4899",
    isGroup: true,
    members: "Chris Avore, Tami Evnin, Judit Kószó, Joe Garcia, Marzena Miszczak, Diligent AI, You",
    lastSeen: "online",
    preview: "Diligent AI: ✅ Fork created — design-review fork of Connected Compliance...",
    previewDate: "2:39 PM",
    messages: [
      { from: "Chris Avore", text: "Quick sync — can we do a design consistency check across our product suite before the Q2 roadmap locks? I've had a few reports of inconsistent patterns.", time: "2:15 PM" },
      { from: "bot", text: "I ran an audit across all Diligent apps this morning. One finding that needs design leadership attention:", time: "2:16 PM" },
      { from: "bot", text: "⚠️ *Design system misalignment: Connected Compliance*\n\nConnected Compliance is out of sync with the current design system in several areas:\n\n• Primary navigation uses the old 2-level pattern (we moved to 3-level in Q4)\n• Form controls and inputs don’t use the shared component library\n• Spacing and typography tokens are inconsistent (mix of 8px and 6px grids)\n• Color usage in status indicators doesn’t match accessibility guidelines", time: "2:16 PM", card: { title: "Connected Compliance — Design Gaps", items: ["Navigation: legacy 2-level vs. design system 3-level", "Forms: custom controls instead of shared library", "Spacing/typography: 8px vs 6px grid, token drift", "Status colors: not aligned to a11y contrast requirements"] } },
      { from: "bot", text: "@Marzena — this sits with your team. Can you have your team own bringing Connected Compliance back in line? I can export a full gap list and suggested fixes if that helps.", time: "2:17 PM" },
      { from: "Tami Evnin", text: "Good catch. We should fix this before it spreads — other teams might copy the old patterns if we don’t.", time: "2:22 PM" },
      { from: "Judit Kószó", text: "Agree. I can share the component library links and token docs with Marzena's team.", time: "2:28 PM" },
      { from: "Joe Garcia", text: "Same on the nav spec — happy to walk through the 3-level pattern if needed.", time: "2:30 PM" },
      { from: "Marzena Miszczak", text: "I'll pull in the team and get a plan by Friday. Can you send the full gap list, Diligent AI?", time: "2:34 PM" },
      { from: "bot", text: "✅ I'll generate the gap list and suggested fixes and send them to you by end of day. I'll tag the Connected Compliance epic so it shows up in your design backlog.", time: "2:35 PM" },
      { from: "Chris Avore", text: "@Diligent AI can you create a fork of Connected Compliance with the suggested fixes that we can review?", time: "2:38 PM" },
      { from: "bot", text: "✅ *Fork created*\n\nI've created a design-review fork of Connected Compliance with the suggested fixes applied:\n\n• Navigation updated to 3-level pattern\n• Form controls swapped to shared component library\n• Spacing and typography aligned to 8px grid and current tokens\n• Status indicators updated to meet a11y contrast\n\nLink to the fork is in the Design Leadership channel. You can review and comment there — when you're happy with it, we can merge into the main branch.", time: "2:39 PM" },
    ],
    steps: [],
  },
];

const SENDER_COLORS = ["#e9a5ff", "#53bdeb", "#ffb74d", "#80cbc4", "#f48fb1", "#ce93d8", "#81d4fa"];
function senderColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SENDER_COLORS[Math.abs(h) % SENDER_COLORS.length];
}

/* ================================================================== */
/*  SVG helpers                                                        */
/* ================================================================== */

function Checkmarks({ read }: { read?: boolean }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" className="inline-block ml-1 -mb-px">
      <path d="M11.071.653a.457.457 0 00-.304-.102.493.493 0 00-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 00-.659.003.468.468 0 00.003.653l2.356 2.456a.455.455 0 00.327.14h.04a.461.461 0 00.334-.178l6.489-8.004a.462.462 0 00-.004-.687z" fill={read ? "#53bdeb" : "#667781"} />
      <path d="M14.757.653a.457.457 0 00-.304-.102.493.493 0 00-.381.178l-6.19 7.636-1.2-1.25-.313.39 1.178 1.229a.455.455 0 00.327.14h.04a.461.461 0 00.334-.178l6.489-8.004a.462.462 0 00.018-.04.462.462 0 00-.004-.687l.006.688z" fill={read ? "#53bdeb" : "#667781"} />
    </svg>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function WhatsAppPage() {
  const [activeChat, setActiveChat] = useState("design");
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({ design: 0 });
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = conversations.find((c) => c.id === activeChat)!;
  const currentStep = chat.steps[stepIndex[activeChat] ?? 0];
  const hasMoreSteps = (stepIndex[activeChat] ?? 0) < chat.steps.length;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeChat, scrollToBottom]);

  const handleSend = () => {
    if (!currentStep || sending) return;
    setSending(true);

    setConversations((prev) =>
      prev.map((c) => c.id !== activeChat ? c : { ...c, messages: [...c.messages, currentStep.userMsg] })
    );

    setTimeout(() => scrollToBottom(), 50);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => c.id !== activeChat ? c : {
          ...c,
          messages: [...c.messages, currentStep.userMsg, ...currentStep.botMsgs],
          preview: currentStep.botMsgs[currentStep.botMsgs.length - 1].text.slice(0, 50) + "...",
        })
      );
      setStepIndex((prev) => ({ ...prev, [activeChat]: (prev[activeChat] ?? 0) + 1 }));
      setSending(false);
      setTimeout(() => scrollToBottom(), 50);
    }, 1200);
  };

  return (
    <div className="h-screen bg-white flex items-center justify-center p-6">
      {/* macOS Window */}
      <div className="w-full max-w-[1280px] h-[calc(100vh-48px)] rounded-xl overflow-hidden flex flex-col" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.12)" }}>

        {/* Title Bar */}
        <div className="h-[28px] bg-[#1f2c34] flex items-center px-3 shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-[#8696a0] font-normal pointer-events-none select-none">WhatsApp</span>
        </div>

        {/* App */}
        <div className="flex-1 flex min-h-0">
          {/* Icon rail */}
          <div className="w-[68px] bg-[#111b21] flex flex-col items-center py-3 gap-1 shrink-0 border-r border-[#2a3942]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a884] to-[#00806a] flex items-center justify-center text-[11px] font-bold text-white mb-3">RC</div>
            {[
              { d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z", active: true },
              { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" },
              { d: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2" },
              { d: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" },
              { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
            ].map((icon, i) => (
              <button key={i} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${icon.active ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={icon.active ? "#00a884" : "#8696a0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={icon.d} /></svg>
              </button>
            ))}
            <div className="flex-1" />
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#202c33] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
            </button>
          </div>

          {/* Chat list */}
          <div className="w-[340px] bg-[#111b21] border-r border-[#2a3942] flex flex-col shrink-0 min-h-0">
            <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
              <h1 className="text-[22px] font-bold text-[#e9edef]">Chats</h1>
              <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#202c33] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="1.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              </button>
            </div>
            <div className="px-3 pb-2 shrink-0">
              <div className="flex items-center gap-3 bg-[#202c33] rounded-lg px-3 py-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input type="text" placeholder="Search" className="flex-1 bg-transparent text-[13px] text-[#d1d7db] placeholder-[#8696a0] outline-none" readOnly />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {conversations.map((conv) => {
                const isActive = conv.id === activeChat;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChat(conv.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isActive ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}`}
                  >
                    <div className="w-[49px] h-[49px] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: conv.avatarBg }}>{conv.avatar}</div>
                    <div className="flex-1 min-w-0 border-b border-[#222d34] py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] text-[#e9edef]">{conv.name}</span>
                        <span className="text-[11px] text-[#8696a0]">{conv.previewDate}</span>
                      </div>
                      <p className="text-[13px] text-[#8696a0] truncate mt-0.5 pr-2">{conv.preview.replace(/\*/g, "")}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#0b141a]">
            {/* Header */}
            <div className="h-[52px] bg-[#202c33] flex items-center justify-between px-4 shrink-0 border-b border-[#2a3942]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: chat.avatarBg }}>{chat.avatar}</div>
                <div>
                  <span className="text-[15px] text-[#e9edef]">{chat.name}</span>
                  <p className="text-[12px] text-[#8696a0]">{chat.isGroup ? chat.members : chat.lastSeen}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#aebac1]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-[10%] py-3 min-h-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
              <div className="max-w-[740px] mx-auto space-y-[3px]">
                <div className="flex justify-center mb-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#182229] px-2.5 py-1 text-[11px] text-[#8696a0] leading-snug">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    Messages and calls are end-to-end encrypted.
                  </span>
                </div>

                {chat.messages.map((msg, i) => {
                  const isUser = msg.from === "user" || msg.from === "Tami Evnin";
                  const isBot = msg.from === "bot";
                  const senderName = !isUser && !isBot ? msg.from : null;
                  const showSender = chat.isGroup && (senderName || isBot);
                  const prevMsg = i > 0 ? chat.messages[i - 1] : null;
                  const sameSenderAsPrev = prevMsg && prevMsg.from === msg.from;

                  return (
                    <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} ${!sameSenderAsPrev && i > 0 ? "mt-2" : ""}`}>
                      {chat.isGroup && !isUser && !sameSenderAsPrev && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 mr-1.5 mt-auto mb-0.5" style={{ background: isBot ? "#00a884" : senderColor(senderName ?? "") }}>
                          {isBot ? "AI" : (senderName ?? "").split(" ").map(n => n[0]).join("")}
                        </div>
                      )}
                      {chat.isGroup && !isUser && sameSenderAsPrev && <div className="w-7 shrink-0 mr-1.5" />}

                      <div className={`relative max-w-[60%] rounded-lg px-2 pt-1 pb-0.5 ${isUser ? "bg-[#005c4b]" : "bg-[#202c33]"}`} style={{ minWidth: "70px" }}>
                        {showSender && !sameSenderAsPrev && (
                          <p className="text-[12px] font-medium mb-0.5" style={{ color: isBot ? "#00a884" : senderColor(senderName ?? "") }}>
                            {isBot ? "Diligent AI" : senderName}
                          </p>
                        )}
                        {msg.replyTo && (
                          <div className="rounded bg-[#0b141a] border-l-[3px] border-[#00a884] px-2 py-1 mb-1">
                            <p className="text-[11px] font-medium text-[#00a884]">{msg.replyTo.from}</p>
                            <p className="text-[11px] text-[#8696a0] truncate">{msg.replyTo.text}</p>
                          </div>
                        )}

                        {/* File attachment */}
                        {msg.file && (
                          <div className="rounded-md bg-[#0b141a] border border-[#2a3942] p-2.5 mb-1.5 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#ff6b6b] flex items-center justify-center shrink-0">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-[#e9edef] font-medium truncate">{msg.file.name}</p>
                              <p className="text-[10px] text-[#8696a0]">{msg.file.type} · {msg.file.size}</p>
                            </div>
                          </div>
                        )}

                        {/* Slide preview */}
                        {msg.slide && (
                          <div className="rounded-md bg-[#0b141a] border border-[#2a3942] overflow-hidden mb-1.5">
                            <div className="bg-[#1a2730] px-3 py-2 border-b border-[#2a3942]">
                              <p className="text-[11px] font-bold text-[#e9edef]">{msg.slide.title}</p>
                            </div>
                            <div className="px-3 py-2 space-y-1">
                              {msg.slide.bullets.map((b, bi) => (
                                <div key={bi} className="flex items-start gap-1.5">
                                  <span className="text-[#8696a0] text-[9px] mt-px shrink-0">•</span>
                                  <p className="text-[10px] text-[#aebac1] leading-relaxed">
                                    {b.split(/(\*[^*]+\*)/).map((part, pi) =>
                                      part.startsWith("*") && part.endsWith("*") ? (
                                        <strong key={pi} className="font-semibold text-[#e9edef]">{part.slice(1, -1)}</strong>
                                      ) : (<span key={pi}>{part}</span>)
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="px-3 py-1.5 border-t border-[#2a3942]">
                              <p className="text-[9px] text-[#667781]">{msg.slide.footer}</p>
                            </div>
                          </div>
                        )}

                        {/* Text */}
                        <p className="text-[13.5px] text-[#e9edef] leading-[19px] whitespace-pre-wrap">
                          {msg.text.split(/(\*[^*]+\*)/).map((part, pi) =>
                            part.startsWith("*") && part.endsWith("*") ? (
                              <strong key={pi} className="font-semibold">{part.slice(1, -1)}</strong>
                            ) : (<span key={pi}>{part}</span>)
                          )}
                        </p>

                        {msg.card && (
                          <div className="mt-1.5 rounded-md bg-[#0b141a] border border-[#2a3942] p-2.5">
                            <p className="text-[11px] font-semibold text-[#00a884] mb-1.5">{msg.card.title}</p>
                            <div className="space-y-1">
                              {msg.card.items.map((item, ii) => (
                                <div key={ii} className="flex items-start gap-1.5">
                                  <span className="text-[#00a884] text-[10px] mt-px shrink-0">•</span>
                                  <p className="text-[11px] text-[#aebac1] leading-relaxed">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-0.5 -mb-0.5 mt-0.5">
                          <span className="text-[10px] text-[#ffffff80]">{msg.time}</span>
                          {isUser && <Checkmarks read={msg.read} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="min-h-[52px] bg-[#202c33] flex items-center gap-2 px-3 py-2 shrink-0">
              {/* Attach button — highlighted for upload steps */}
              <button
                onClick={currentStep?.isUpload ? handleSend : undefined}
                className={`p-1.5 transition-colors ${currentStep?.isUpload && !sending ? "text-[#00a884] animate-pulse" : "text-[#8696a0] hover:text-[#aebac1]"}`}
                title={currentStep?.isUpload ? "Click to upload document" : "Attach"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
              </button>
              <div className="flex-1 flex items-center rounded-lg bg-[#2a3942] px-3 py-2 min-w-0">
                {hasMoreSteps && !currentStep?.isUpload ? (
                  <span className="text-[14px] text-[#d1d7db] truncate">{currentStep?.prompt}</span>
                ) : currentStep?.isUpload ? (
                  <span className="text-[14px] text-[#8696a0] italic">Click 📎 to upload document...</span>
                ) : (
                  <span className="text-[14px] text-[#8696a0]">Type a message</span>
                )}
              </div>
              <button className="text-[#8696a0] hover:text-[#aebac1] transition-colors p-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" /></svg>
              </button>
              <button
                onClick={!currentStep?.isUpload ? handleSend : undefined}
                disabled={!hasMoreSteps || sending || currentStep?.isUpload}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  hasMoreSteps && !sending && !currentStep?.isUpload
                    ? "bg-[#00a884] hover:bg-[#06cf9c] text-white cursor-pointer"
                    : "bg-[#2a3942] text-[#8696a0] cursor-default"
                }`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
