import { google } from 'googleapis';
import type { EmailInput } from './types';

function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

function parseFromHeader(from: string): { name: string; email: string } {
  const match = from.match(/^(?:"?([^"<]*?)"?\s*)?<?([^\s<>@]+@[^\s<>@]+)>?$/);
  return {
    name: match?.[1]?.trim() || match?.[2] || from,
    email: match?.[2] || '',
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}

export async function fetchThreadsWithDetails(
  accessToken: string,
  maxResults = 25
): Promise<EmailInput[]> {
  const gmail = getGmailClient(accessToken);

  const listRes = await gmail.users.threads.list({
    userId: 'me',
    maxResults,
    q: 'in:inbox -category:promotions -category:social newer_than:30d',
  });

  const threads = listRes.data.threads ?? [];
  if (threads.length === 0) return [];

  const detailResults = await Promise.allSettled(
    threads.map((t) =>
      gmail.users.threads.get({
        userId: 'me',
        id: t.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      })
    )
  );

  return detailResults
    .map((result, i) => {
      if (result.status === 'rejected') return null;

      const thread = result.value.data;
      const firstMsg = thread.messages?.[0];
      const headers = firstMsg?.payload?.headers ?? [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? '';

      const fromHeader = getHeader('From');
      const { name, email } = parseFromHeader(fromHeader);

      return {
        id: thread.id ?? threads[i].id ?? '',
        threadId: thread.id ?? threads[i].id ?? '',
        subject: getHeader('Subject') || '(no subject)',
        from: name,
        fromEmail: email,
        date: formatDate(getHeader('Date')),
        snippet: firstMsg?.snippet ?? '',
        messageCount: thread.messages?.length ?? 1,
      } satisfies EmailInput;
    })
    .filter((e): e is EmailInput => e !== null);
}
