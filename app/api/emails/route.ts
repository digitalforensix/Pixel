import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { fetchThreadsWithDetails } from '@/lib/gmail';
import { analyzeEmails } from '@/lib/claude';

export const maxDuration = 60;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const emailInputs = await fetchThreadsWithDetails(session.accessToken, 25);
    const analyzedEmails = await analyzeEmails(emailInputs);

    analyzedEmails.sort(
      (a, b) => b.analysis.priorityScore - a.analysis.priorityScore
    );

    return NextResponse.json({ emails: analyzedEmails });
  } catch (err) {
    console.error('Email analysis error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
