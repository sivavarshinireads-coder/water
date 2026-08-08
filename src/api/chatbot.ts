import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getMainAdminSummary,
  getAdminSummary,
  getUserSummary,
  getWaterUsage,
  getResidents,} from './auth';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export type ChatRole = 'LANDING' | 'MAIN_ADMIN' | 'COMMUNITY_ADMIN' | 'RESIDENT';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── System Prompts ───────────────────────────────────────────────────────────

const LANDING_SYSTEM_PROMPT = `
You are AquaBot, an intelligent assistant for AquaTrack — a smart water management platform for apartment communities.

You ONLY answer questions related to the AquaTrack platform, its features, navigation, and usage.

Here is what you know about AquaTrack:
- AquaTrack is a next-generation water monitoring and billing platform for apartment communities.
- It has three portals: Residents, Community Admins, and Main Admins.
- Features include: real-time water usage tracking, tiered automated billing, leak & anomaly alerts, bulk purchase tracking, smart analytics, role-based access, and PDF invoice generation.
- Residents can view their daily usage, download invoices, track billing history, and receive leak alerts.
- Community Admins can manage residents & units, record meter readings, finalize billing cycles, and monitor bulk purchases.
- Main Admins can onboard communities, manage community admins, view platform-wide analytics, and configure tariff slabs.
- To get started: click "Get Started Free" to sign up, or "Sign In" to access your dashboard.
- Navigation: Features section shows platform capabilities; How It Works explains the 3-step process; Impact shows platform statistics.
- The platform is accessible via /signup and /login routes.

If the user asks anything NOT related to AquaTrack or this platform, respond ONLY with:
"I can only assist with queries related to this platform."

Be concise, friendly, and professional. Use short paragraphs.
`.trim();

const buildMainAdminPrompt = (data: any) => `
You are AquaBot, an intelligent assistant for the Main Admin dashboard on AquaTrack.

You are speaking with a Main Administrator who has full access to the entire platform.

Here is the LIVE system data available right now:
${JSON.stringify(data, null, 2)}

You can answer questions about:
- Platform-wide statistics (total users, apartments, community admins, water usage)
- Community admin management (who is active, who has how many apartments)
- Recent platform signups and activity
- System water usage trends
- Billing cycles, tariffs, and reports across all communities
- How to manage admins, approve/reject community admins
- Any platform-level configurations

Base your answers on the data provided. If specific data is not available, say so clearly.
Be precise, data-driven, and professional. Format numbers and statistics clearly.
If asked about data that is outside the Main Admin's scope (doesn't exist), say it's not available.
`.trim();

const buildCommunityAdminPrompt = (data: any) => `
You are AquaBot, an intelligent assistant for the Community Admin dashboard on AquaTrack.

You are speaking with a Community Administrator who manages their own community, residents, and apartments.

Here is the LIVE community data available right now:
${JSON.stringify(data, null, 2)}

You can answer questions about:
- Their community's residents and units
- Water usage for their community (monthly trends, bulk purchases)
- Pending bills and invoices for their residents
- Active leak alerts in their community
- Billing cycle status and management
- Meter readings and water monitoring

IMPORTANT: You ONLY have data for this admin's community. Do NOT provide data about other communities or admins.
Base your answers on the data provided. Be clear and helpful.
`.trim();

const buildResidentPrompt = (data: any) => `
You are AquaBot, an intelligent assistant for the Resident dashboard on AquaTrack.

You are speaking with a Resident who can only access their own household data.

Here is the LIVE resident data available right now:
${JSON.stringify(data, null, 2)}

You can answer questions about:
- Their today's water usage
- Their estimated current bill
- Their monthly consumption trends
- Their weekly daily usage breakdown
- Their recent alerts (leaks, anomalies, billing updates)
- Their comparison with apartment average
- Their billing cycle details

IMPORTANT: You ONLY have access to THIS resident's personal data. Do NOT discuss or reveal any other resident's data, bills, or usage.
If asked about other residents or system-wide data, respond: "I can only assist with your personal account data."
Be friendly, empathetic, and clear. Help residents understand their water usage and billing.
`.trim();

// ─── Context Fetcher ──────────────────────────────────────────────────────────

async function fetchContextData(role: ChatRole): Promise<string> {
  try {
    if (role === 'MAIN_ADMIN') {
      const data = await getMainAdminSummary();
      return buildMainAdminPrompt(data);
    }
    if (role === 'COMMUNITY_ADMIN') {
      const data = await getAdminSummary();
      return buildCommunityAdminPrompt(data);
    }
    if (role === 'RESIDENT') {
      const data = await getUserSummary();
      return buildResidentPrompt(data);
    }
    return LANDING_SYSTEM_PROMPT;
  } catch {
    // If data fetch fails, fall back to generic role-appropriate prompt
    if (role === 'MAIN_ADMIN') return buildMainAdminPrompt({});
    if (role === 'COMMUNITY_ADMIN') return buildCommunityAdminPrompt({});
    if (role === 'RESIDENT') return buildResidentPrompt({});
    return LANDING_SYSTEM_PROMPT;
  }
}

// ─── Chat Session Cache ───────────────────────────────────────────────────────
// Cache system prompt per role so we don't re-fetch on every message
const systemPromptCache: Partial<Record<ChatRole, string>> = {};

export async function getSystemPrompt(role: ChatRole): Promise<string> {
  if (!systemPromptCache[role]) {
    systemPromptCache[role] = await fetchContextData(role);
  }
  return systemPromptCache[role]!;
}

export function clearSystemPromptCache(role?: ChatRole) {
  if (role) {
    delete systemPromptCache[role];
  } else {
    Object.keys(systemPromptCache).forEach(k => delete systemPromptCache[k as ChatRole]);
  }
}

// ─── Helper utilities for Community Admin ───────────────────────────────────────
/**
 * Fetch resident list and water‑usage data, merge them and return a formatted string.
 * If a month string is supplied it will be passed to the water‑usage endpoint.
 */
async function fetchResidentUsage(month?: string): Promise<string> {
  const [residents, usage] = await Promise.all([
    getResidents(),
    getWaterUsage(month),
  ]);
  const residentMap = new Map<number, any>();
  residents.forEach((r: any) => residentMap.set(r.id, r));
  if (!Array.isArray(usage) || usage.length === 0) return 'No water usage data available.';
  const lines = usage.map((u: any) => {
    const resident = residentMap.get(u.residentId ?? u.userId ?? u.id);
    const label = resident ? `${resident.code ?? resident.name ?? resident.id}` : u.residentId ?? u.id;
    const liters = u.liters ?? u.usage ?? 'N/A';
    return `- Resident ${label}: ${liters} L`;
  });
  return lines.join('\n');
}

/**
 * Build a detailed pending‑bills list (resident + amount + month).
 */
async function fetchPendingBillsDetails(): Promise<string> {
  const [residents, summary] = await Promise.all([
    getResidents(),
    getAdminSummary(),
  ]);
  const residentMap = new Map<number, any>();
  residents.forEach((r: any) => residentMap.set(r.id, r));
  const pending = summary.pendingBills ?? [];
  if (!Array.isArray(pending) || pending.length === 0) return 'No pending invoices at this time.';
  const lines = pending.map((b: any) => {
    const resident = residentMap.get(b.residentId ?? b.userId ?? b.id);
    const label = resident ? `${resident.code ?? resident.name ?? resident.id}` : b.residentId ?? b.id;
    const amount = (b.amount ?? b.amountDue ?? b.amount) || '0';
    const month = b.month ?? 'N/A';
    return `- Resident ${label}: $${amount} (Month: ${month})`;
  });
  return lines.join('\n');
}


const CANDIDATE_MODELS = ['gemini-3.6-flash-2', 'gemini-flash-latest', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash'];

async function generateLocalRoleResponse(role: ChatRole, userMessage: string): Promise<string> {
  const query = userMessage.toLowerCase().trim();
  // Early detection of clearly unrelated tech topics
  const irrelevantKeywords = ['java', 'python', 'javascript', 'c++', 'go', 'rust', 'sql'];
  if (irrelevantKeywords.some(k => query.includes(k))) {
    return "I’m here to help with anything related to this website.\nIf you have questions about other topics, I won’t be able to answer.\nFeel free to ask about the platform!";
  }

  if (role === 'LANDING') {
    if (query.includes('what is') || query.includes('feature') || query.includes('about') || query.includes('aquatrack')) {
      return `**AquaTrack** is a smart water management & billing platform for apartment communities.\n\nKey capabilities:\n- **Real-time usage tracking**: Monitor daily consumption per apartment.\n- **Leak & anomaly alerts**: Instant notifications for unusual water flow.\n- **Automated billing**: Tiered tariffs & instant PDF invoice generation.\n- **Role-based portals**: Dedicated dashboards for Residents, Community Admins, and Main Admins.`;
    }
    if (query.includes('how') || query.includes('work') || query.includes('step')) {
      return `AquaTrack operates in 3 simple steps:\n1. **Admin Setup**: Main Admin creates communities & assigns Community Admins.\n2. **Resident Enrolment**: Community Admins register residents & units.\n3. **Automated Tracking & Billing**: Live water monitoring, instant leak alerts, and automated monthly invoicing.`;
    }
    if (query.includes('start') || query.includes('sign') || query.includes('login') || query.includes('register') || query.includes('account')) {
      return `Getting started is simple! Click **Get Started Free** at the top right of the page to sign up as a new user, or click **Sign In** to log in to your dashboard.`;
    }
    if (query.includes('resident') || query.includes('admin') || query.includes('portal') || query.includes('role')) {
      return `AquaTrack provides 3 role-based portals:\n- **Residents**: Track personal usage, estimated bills, and receive leak alerts.\n- **Community Admins**: Manage community residents, record meter readings, and monitor bulk water purchases.\n- **Main Admins**: Oversee platform-wide communities, manage admins, and set global tariff slabs.`;
    }
    // Strict requirement: return exact string for unrelated queries on Landing Page
    return "I’m here to help with anything related to this website.\nIf you have questions about other topics, I won’t be able to answer.\nFeel free to ask about the platform!";
  }

  if (role === 'MAIN_ADMIN') {
    try {
      const data = await getMainAdminSummary();
      if (query.includes('user') || query.includes('how many') || query.includes('total')) {
        return `Platform overview statistics:\n- **Total Users**: ${data.totalUsers || 0} registered accounts\n- **Total Apartments**: ${data.totalApartments || 0} connected complexes\n- **Community Admins**: ${data.totalCommunityAdmins || 0} active administrators\n- **System Water Usage**: ${data.totalSystemWaterUsage || 0} kL monitored across all communities.`;
      }
      if (query.includes('water') || query.includes('usage') || query.includes('trend')) {
        return `Total system water usage monitored across all apartment complexes is **${data.totalSystemWaterUsage || 0} kL**. System-wide telemetry is active.`;
      }
      if (query.includes('admin')) {
        return `There are currently **${data.totalCommunityAdmins || 0} active Community Administrators** managing apartment portfolios across the platform.`;
      }
      if (query.includes('signup') || query.includes('recent')) {
        const recent = data.recentSignups?.slice(0, 3).map((s: any) => `- **${s.name}** (${s.role.replace('_', ' ')}) - ${s.time}`).join('\n') || 'No recent signups.';
        return `Latest platform signups:\n${recent}`;
      }
      return `As Main Admin, you have full access to platform telemetry:\n- Total Users: **${data.totalUsers || 0}**\n- Connected Apartments: **${data.totalApartments || 0}**\n- Total Water Monitored: **${data.totalSystemWaterUsage || 0} kL**\n- Active Community Admins: **${data.totalCommunityAdmins || 0}**`;
    } catch {
      return "Main Admin telemetry is online. You have full access to all platform communities, admin permissions, and system water metrics.";
    }
  }

  if (role === 'COMMUNITY_ADMIN') {
    if (query.includes('other community') || query.includes('main admin') || query.includes('all communities')) {
      return "I can only assist with data for your managed community.";
    }
    if (query.includes('total water usage') || query.includes('all residents')) {
      try {
        // Detect month request in query
        let monthParam: string | undefined;
        if (query.includes('current month') || query.includes('this month') || query.includes('today')) {
          monthParam = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }
        const usageLines = await fetchResidentUsage(monthParam);
        return `Water usage for all residents:\n${usageLines}`;
      } catch {
        return 'Unable to fetch water usage data at this time.';
      }
    }
    try {
      const data = await getAdminSummary();
      if (query.includes('resident') || query.includes('how many') || query.includes('user')) {
        return `Your community currently has **${data.totalUsers || 0}** active residents onboarded for billing cycle **${data.currentCycle || 'Active'}**.`;
      }
      if (query.includes('bill') || query.includes('pending') || query.includes('invoice')) {
        try {
          const billLines = await fetchPendingBillsDetails();
          return `Pending invoices:\n${billLines}`;
        } catch {
          return 'Unable to fetch pending bills at this time.';
        }
      }
      if (query.includes('leak') || query.includes('alert')) {
        const count = data.leakAlerts?.length || 0;
        return count > 0 ? `There are **${count}** active leak alerts reported in your community requiring inspection.` : "No active leak alerts reported in your community currently.";
      }
      if (query.includes('water') || query.includes('usage') || query.includes('purchase')) {
        return `Total community water consumed: **${data.totalWaterUsed || 0} kL** for billing cycle **${data.currentCycle || 'Active'}**. Bulk water purchase tracking is enabled.`;
      }
      return `Community Admin Dashboard Summary:\n- Active Residents: **${data.totalUsers || 0}**\n- Current Cycle: **${data.currentCycle || 'Active'}**\n- Total Water Used: **${data.totalWaterUsed || 0} kL**\n- Pending Invoices: **${data.pendingBills?.length || 0}**`;
    } catch {
      return "Community Command Center is online. You can manage resident accounts, monitor community water distribution, and process billing cycles.";
    }
  }

  if (role === 'RESIDENT') {
    if (query.includes('other resident') || query.includes('other apartment') || query.includes('neighbor') || query.includes('all residents')) {
      return "I can only assist with your personal account data.";
    }
    try {
      const data = await getUserSummary();
      if (query.includes('today') || query.includes('usage') || query.includes('water')) {
        return `Your household water usage today is **${data.todayUsage || '0 L'}** for billing cycle **${data.billingCycle || 'Active'}**.`;
      }
      if (query.includes('bill') || query.includes('cost') || query.includes('amount') || query.includes('estimate')) {
        return `Your estimated current bill for cycle **${data.billingCycle || 'Active'}** is **${data.currentBill || '$0'}**.`;
      }
      if (query.includes('alert') || query.includes('notification')) {
        const alerts = data.recentAlerts?.slice(0, 2).map((a: any) => `- ${a.message} (${a.time})`).join('\n') || 'No active alerts.';
        return `Recent household alerts:\n${alerts}`;
      }
      return `Resident Dashboard Summary:\n- Today's Usage: **${data.todayUsage || '0 L'}**\n- Estimated Bill: **${data.currentBill || '$0'}**\n- Active Billing Cycle: **${data.billingCycle || 'Active'}**`;
    } catch {
      return "Your resident telemetry is active. You can track your daily water consumption, view estimated bills, and receive instant leak alerts.";
    }
  }

  // Generic fallback: return a concise summary based on role data
  if (role === 'MAIN_ADMIN') {
    try {
      const data = await getMainAdminSummary();
      return `Platform overview:\n- Total Users: ${data.totalUsers || 0}\n- Total Apartments: ${data.totalApartments || 0}\n- Community Admins: ${data.totalCommunityAdmins || 0}\n- System Water Usage: ${data.totalSystemWaterUsage || 0} kL`;
    } catch {
      return "Unable to retrieve platform overview at this time.";
    }
  }
  if (role === 'COMMUNITY_ADMIN') {
    try {
      const data = await getAdminSummary();
      return `Community overview:\n- Active Residents: ${data.totalUsers || 0}\n- Current Cycle: ${data.currentCycle || 'N/A'}\n- Total Water Used: ${data.totalWaterUsed || 0} kL\n- Pending Bills: ${data.pendingBills?.length || 0}`;
    } catch {
      return "Unable to retrieve community overview at this time.";
    }
  }
  if (role === 'RESIDENT') {
    try {
      const data = await getUserSummary();
      return `Your summary:\n- Today's Usage: ${data.todayUsage || '0 L'}\n- Estimated Bill: ${data.currentBill || '$0'}\n- Billing Cycle: ${data.billingCycle || 'Active'}`;
    } catch {
      return "Unable to retrieve your usage data at this time.";
    }
  }
  // Default fallback for any other case
  return "I’m here to help with anything related to this website.\nIf you have questions about other topics, I won’t be able to answer.\nFeel free to ask about the platform!";
}

export async function sendChatMessage(
  role: ChatRole,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  // First attempt local role-based response which fetches data from backend
  const localResponse = await generateLocalRoleResponse(role, userMessage);
  // If the response is not the generic fallback, return it immediately
  if (!localResponse.startsWith("I’m here to help")) {
    return localResponse;
  }

  try {
    // Ensure we always fetch fresh context data for each request
    clearSystemPromptCache(role);
    const systemPrompt = await getSystemPrompt(role);

    const geminiHistory = history.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({
          history: geminiHistory,
        });

        const result = await chat.sendMessage(userMessage);
        const text = result.response.text();
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (err) {
        console.warn(`Gemini API candidate model ${modelName} unavailable/rate-limited:`, err);
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed, activating local role intelligence fallback:', err);
  }

  // If Gemini fails, fall back to local response (which will be the generic fallback)
  return localResponse;
}
