import Anthropic from '@anthropic-ai/sdk';
import type { AnalyzedEmail, EmailAnalysis, EmailInput } from './types';

const client = new Anthropic();

function extractJson(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch ? fenceMatch[1] : text;
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrMatch) throw new Error('No JSON array found in response');
  return JSON.parse(arrMatch[0]);
}

export async function analyzeEmails(emails: EmailInput[]): Promise<AnalyzedEmail[]> {
  if (emails.length === 0) return [];

  const emailList = emails
    .map(
      (e, i) =>
        `[${i}] Subject: ${e.subject}\nFrom: ${e.from} <${e.fromEmail}>\nDate: ${e.date}\nMessages in thread: ${e.messageCount}\nSnippet: ${e.snippet}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are an email intelligence assistant. Analyze the ${emails.length} email threads below and return a JSON array with one object per thread (same order).

Each object must have:
- "sentiment": "positive" | "neutral" | "negative"
- "urgency": "high" | "medium" | "low"
- "summary": string — one sentence, ≤90 chars, describing what this email is about and what's needed
- "suggestedAction": string — specific, actionable recommendation, ≤75 chars
- "actionType": one of "reply_urgent" | "reply" | "follow_up" | "archive" | "review" | "schedule" | "delegate" | "no_action"
- "topics": string[] — up to 3 short topic tags (e.g. ["finance", "Q3", "invoice"])
- "sentimentScore": number from -1.0 (very negative) to 1.0 (very positive)
- "priorityScore": number 0–100 (100 = must act immediately)

Priority scoring guidance:
- High urgency + negative sentiment + action required → 80–100
- Moderate urgency or needs response → 40–79
- Informational / newsletters / no action → 0–39

Return ONLY a valid JSON array. No markdown fences, no explanation.

Emails:
${emailList}`;

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '[]';
  const analyses = extractJson(text) as EmailAnalysis[];

  return emails.map((email, i) => ({
    ...email,
    analysis: analyses[i] ?? {
      sentiment: 'neutral',
      urgency: 'low',
      summary: email.snippet.slice(0, 90),
      suggestedAction: 'Review email',
      actionType: 'review',
      topics: [],
      sentimentScore: 0,
      priorityScore: 20,
    },
  }));
}
