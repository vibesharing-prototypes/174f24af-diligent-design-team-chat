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
    id: "compliance",
    name: "Diligent Compliance",
    avatar: "D",
    avatarBg: "#00a884",
    lastSeen: "online",
    preview: "✅ Publication scheduled for April 1, 2026...",
    previewDate: "1:48 PM",
    messages: [
      { from: "bot", text: "🔔 3 compliance deadlines approaching in the next 30 days. Here's a summary:", time: "1:42 PM" },
      { from: "bot", text: "1. Global Code of Conduct review — due Mar 31 (21 days)\n2. EU Whistleblower Directive reporting — due Apr 24 (45 days)\n3. APAC Training certification — due May 15 (65 days)", time: "1:42 PM" },
      { from: "bot", text: "Highest priority: *Global Code of Conduct*. It hasn't been reviewed in 14 months and 3 regulatory changes affect it directly.\n\nI've already:\n✅ Compared all 12 sections against current regulations\n✅ Drafted updated language for 3 sections\n✅ Assigned Elena Vasquez as owner\n✅ Sent re-certification requests to regional leads", time: "1:43 PM" },
      { from: "user", text: "Show me what changed", time: "1:45 PM", read: true },
      { from: "bot", text: "Here are the 3 sections that need updates:", time: "1:45 PM", card: { title: "Draft Policy Changes", items: ["§4.2 Anti-Bribery — Updated to reference UK Bribery Act 2025 guidance", "§7.1 Whistleblower Protections — Added EU Directive reporting channel requirements", "§9.3 Training Requirements — Added Singapore MOM workplace harassment standards"] } },
      { from: "user", text: "When should we publish?", time: "1:47 PM", read: true },
      { from: "bot", text: "I'd recommend *April 1*. That gives 90 days before the June 30 audit window for all 12,400 employees to complete attestation. Waiting past mid-April risks audit findings.\n\nWant me to schedule it?", time: "1:47 PM" },
      { from: "user", text: "Yes, schedule for April 1", time: "1:48 PM", read: true },
      { from: "bot", text: "✅ *Publication scheduled for April 1, 2026*\n\nAttestation requests will go to 12,400 employees with a June 30 deadline. Elena Vasquez and regional leads will be notified 48 hours before publication.\n\nAnything else?", time: "1:48 PM" },
    ],
    steps: [
      {
        prompt: "Let me know if we have at least 25% attestation in South Korea by next week — sometimes they take a bit longer to attest",
        userMsg: { from: "user", text: "Let me know if we have at least 25% attestation in South Korea by next week — sometimes they take a bit longer to attest", time: "1:50 PM", read: true },
        botMsgs: [
          { from: "bot", text: "✅ *Monitoring set for South Korea attestation*\n\nI'll check South Korea's attestation rate daily and notify you by *March 18* if it hasn't crossed 25%. Current rate is 11% (typical lag for this region — they usually ramp in week 2).\n\nAnything else?", time: "1:50 PM" },
        ],
      },
    ],
  },
  {
    id: "risk",
    name: "Diligent Risk",
    avatar: "D",
    avatarBg: "#f59e0b",
    lastSeen: "online",
    preview: "✅ Briefing sent to Board Risk Committee...",
    previewDate: "9:22 AM",
    messages: [
      { from: "bot", text: "⚠️ *Geopolitical signal detected*\n\nTaiwan Strait escalation — military exercises announced near key shipping lanes. This could affect semiconductor supply chains across multiple industries.", time: "9:12 AM" },
      { from: "bot", text: "Here's what I found for Acme:\n\n• *47%* of your semiconductor suppliers operate in the affected region\n• Estimated revenue exposure: *$1.8B*\n• 3 business units directly affected: Hardware, Cloud Infrastructure, Consumer Devices\n• 2 existing controls flagged as insufficient", time: "9:13 AM" },
      { from: "bot", text: "Recommended actions:\n1. 🔴 Review supplier diversification strategy with David Chen (VP Supply Chain)\n2. 🟡 Brief the Board Risk Committee before Feb 28 meeting\n3. 🟡 Begin disclosure assessment — this may trigger 10-K risk factor update", time: "9:14 AM" },
      { from: "user", text: "Who's the risk owner?", time: "9:20 AM", read: true },
      { from: "bot", text: "Diana Reyes, Chief Risk Officer. She's been notified and the AI Risk Manager has already begun her intake interview. I'll share findings once it's complete.\n\nWould you like to add anyone else?", time: "9:20 AM" },
      { from: "user", text: "Share the full analysis with the board risk committee", time: "9:22 AM", read: true },
      { from: "bot", text: "✅ *Briefing sent to Board Risk Committee*\n\n5 members notified: James Liu (Chair), Sarah Mitchell, Robert Kang, Lisa Park, Thomas Andersen.\n\nMeeting invite created for Friday 2:00 PM. Pre-read materials attached including exposure map and recommended mitigations.\n\nI'll update you when members confirm.", time: "9:22 AM" },
    ],
    steps: [
      {
        prompt: "Show me the latest ERM slide",
        userMsg: { from: "user", text: "Show me the latest ERM slide", time: "9:25 AM", read: true },
        botMsgs: [
          {
            from: "bot", text: "Here's the current ERM summary slide from Q4:", time: "9:25 AM",
            slide: {
              title: "Enterprise Risk Management — Q4 2025 Summary",
              bullets: [
                "12 strategic risks tracked across 4 categories",
                "3 risks elevated since last quarter (Geopolitical, Cyber, Regulatory)",
                "Supply chain concentration remains highest-rated risk (Impact: Critical)",
                "2 controls pending remediation (target: Q1 2026)",
                "Board Risk Committee last reviewed: Jan 15, 2026",
              ],
              footer: "Source: Diligent Risk · Last updated Jan 15, 2026",
            },
          },
          { from: "bot", text: "Want me to update anything on this slide?", time: "9:25 AM" },
        ],
      },
      {
        prompt: "Add in findings from the Risk Simulator Gravity Map",
        userMsg: { from: "user", text: "Add in findings from the Risk Simulator Gravity Map", time: "9:27 AM", read: true },
        botMsgs: [
          {
            from: "bot", text: "✅ *Slide updated with Gravity Map findings*\n\nAdded to the ERM summary:", time: "9:27 AM",
            slide: {
              title: "Enterprise Risk Management — Updated with Gravity Map",
              bullets: [
                "12 strategic risks tracked → *14 risks* (2 new from Gravity Map cascade analysis)",
                "Taiwan Strait escalation cascades to 6 secondary risks across supply chain, revenue, and regulatory",
                "Estimated total exposure including cascading effects: *$2.4B* (up from $1.8B direct)",
                "Gravity Map shows 3 business units with overlapping vulnerabilities",
                "New: Disclosure risk elevated — 10-K risk factor language may need revision",
                "Board Risk Committee last reviewed: Jan 15, 2026",
              ],
              footer: "Source: Diligent Risk + AI Risk Simulator Gravity Map · Updated today",
            },
          },
          { from: "bot", text: "The cascade analysis adds meaningful context. Anything else?", time: "9:27 AM" },
        ],
      },
      {
        prompt: "Now add to Board book draft",
        userMsg: { from: "user", text: "Now add to Board book draft", time: "9:29 AM", read: true },
        botMsgs: [
          { from: "bot", text: "✅ *Added to Board book draft*\n\nThe updated ERM slide (with Gravity Map findings) has been inserted into the *Feb 28 Board Meeting* book:\n\n📄 *Section 4: Risk Management Update*\n• Slide 4.1 — ERM Summary (updated)\n• Slide 4.2 — Taiwan Strait Impact Analysis (new)\n• Slide 4.3 — Gravity Map Cascade View (new)\n\nSarah Mitchell (Board Secretary) has been notified of the update. The book is still in draft — she'll need to approve before it goes to members.\n\nAnything else?", time: "9:29 AM" },
        ],
      },
    ],
  },
  {
    id: "team",
    name: "Compliance Leadership",
    avatar: "CL",
    avatarBg: "#6366f1",
    isGroup: true,
    members: "Elena Vasquez, Marcus Webb, Katrin Müller, Priya Sharma, You",
    preview: "Diligent AI: 📋 Summary of this thread...",
    previewDate: "11:46 AM",
    messages: [
      { from: "Elena Vasquez", text: "Has anyone seen the updated UK Bribery Act guidance? We need to check if our Code of Conduct covers the new requirements.", time: "11:30 AM" },
      { from: "bot", text: "Hi Elena — I flagged this on Nov 15 when the UK Ministry of Justice published the update. It affects Section 4.2 of your Code of Conduct.\n\nI've already drafted updated language that references the new guidance. Want me to share it here?", time: "11:31 AM" },
      { from: "Marcus Webb", text: "Yes please, I need to review it for the NA region", time: "11:33 AM" },
      { from: "bot", text: "Here's the draft for §4.2 Anti-Bribery:", time: "11:33 AM", card: { title: "§4.2 Anti-Bribery — Draft Update", items: ["Added: Explicit reference to UK Bribery Act 2010 as amended by 2025 guidance", "Updated: Adequate procedures defense now requires documented risk assessment for all third-party engagements", "Added: Mandatory escalation to Legal for gifts/hospitality over £500 (reduced from £1,000)"] } },
      { from: "Elena Vasquez", text: "This looks solid. Ronald, can we get this into the current review cycle?", time: "11:40 AM" },
      { from: "user", text: "Absolutely. I've already approved the April 1 publish date for the full Code of Conduct update. This will be included.", time: "11:42 AM", read: true },
      { from: "Katrin Müller", text: "Perfect. EMEA re-certification is on my end — I'll confirm by end of week.", time: "11:45 AM" },
      { from: "bot", text: "📋 Summary of this thread:\n• UK Bribery Act guidance flagged and draft language prepared\n• Ronald approved April 1 publish\n• Katrin to confirm EMEA re-cert by Friday\n\nI'll track the open item and remind Katrin on Thursday if needed.", time: "11:46 AM" },
      { from: "Katrin Müller", text: "One thing — I have the signed EMEA re-certification letter from our Frankfurt office. Where should I upload it?", time: "11:50 AM" },
      { from: "bot", text: "You can share it right here, Katrin. I'll attach it to the Code of Conduct review task and notify Elena. Just drop the file in this chat.", time: "11:50 AM" },
    ],
    steps: [
      {
        prompt: "Here's the EMEA re-certification letter",
        isUpload: true,
        userMsg: {
          from: "user", text: "Here's the signed EMEA letter from Katrin", time: "11:52 AM", read: true,
          file: { name: "EMEA_Recertification_Letter_2026.pdf", size: "2.4 MB", type: "PDF" },
        },
        botMsgs: [
          { from: "bot", text: "✅ *Document received and filed*\n\n📄 *EMEA_Recertification_Letter_2026.pdf*\n• Attached to: Global Code of Conduct Review task\n• Tagged: EMEA re-certification, Katrin Müller, Frankfurt office\n• Elena Vasquez has been notified\n\nEMEA re-certification status updated from \"Pending\" to *Confirmed*. That's 2 of 3 regions confirmed — still waiting on Priya Sharma (APAC).", time: "11:52 AM" },
          { from: "Katrin Müller", text: "Perfect, thanks for uploading that Ronald 👍", time: "11:53 AM" },
          { from: "Elena Vasquez", text: "Great — that just leaves APAC. Priya, any update?", time: "11:54 AM" },
          { from: "Priya Sharma", text: "Working on it! The Singapore team is reviewing the new MOM requirements. Should have signoff by Thursday.", time: "11:55 AM" },
          { from: "bot", text: "📋 *Updated status*:\n✅ NA — Confirmed (Marcus Webb)\n✅ EMEA — Confirmed (Katrin Müller)\n⏳ APAC — Expected Thursday (Priya Sharma)\n\nI'll send a reminder to Priya on Wednesday evening if we haven't received confirmation.", time: "11:56 AM" },
        ],
      },
    ],
  },
  {
    id: "training",
    name: "Diligent Training",
    avatar: "D",
    avatarBg: "#8b5cf6",
    lastSeen: "online",
    preview: "Pacific US: 41% → 47% → 52%...",
    previewDate: "8:18 AM",
    messages: [
      { from: "bot", text: "📊 *Weekly Training Compliance Update*\n\nGlobal completion: 78% (+3% from last week)\nManager completion: 64% (⚠️ below 70% threshold)", time: "8:00 AM" },
      { from: "bot", text: "Regions of concern:\n\n🔴 *Pacific US* — 52% completion, 38% manager completion\n🔴 *Southern Europe* — 58% completion\n🟡 *Southeast Asia* — 65% completion\n\nAll other regions are tracking above 75%.", time: "8:00 AM" },
      { from: "bot", text: "Actions I've taken:\n✅ Sent reminders to 149 managers who haven't completed training\n✅ Flagged Pacific US to regional lead Marcus Webb\n✅ Escalated Southern Europe to Katrin Müller\n\nWould you like to see the reminder email text or adjust the deadline?", time: "8:01 AM" },
      { from: "user", text: "Show me the reminder email", time: "8:15 AM", read: true },
      { from: "bot", text: "*Subject: Action Required — Complete Mandatory Training by Mar 31*\n\n\"Hi [Manager Name],\n\nYour mandatory Workplace Respect training is due by March 31. Your team's completion depends on your participation — 12 of your direct reports are also pending.\n\nThis takes approximately 25 minutes. Start here: [link]\n\nIf you have questions, contact your regional compliance lead.\n\nBest,\nAcme Compliance Team\"", time: "8:15 AM" },
      { from: "user", text: "Looks good. What's the trend for Pacific US specifically?", time: "8:18 AM", read: true },
      { from: "bot", text: "Pacific US has been the slowest region for 3 consecutive weeks:\n\n• Week 1: 41% → Week 2: 47% → Week 3: 52%\n• 23 managers haven't started\n• Main gap: Engineering and Product teams in SF and Seattle offices\n\nMarcus Webb is scheduling mandatory in-person sessions for next week. Want me to add you to the update thread?", time: "8:18 AM" },
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
  const [activeChat, setActiveChat] = useState("compliance");
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [stepIndex, setStepIndex] = useState<Record<string, number>>({ compliance: 0, risk: 0, team: 0, training: 0 });
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
                  const isUser = msg.from === "user";
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
