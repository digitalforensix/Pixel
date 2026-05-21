'use client';

import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import type { AnalyzedEmail, DashboardStats, Sentiment, Urgency } from '@/lib/types';
import EmailCard from './EmailCard';
import SentimentChart from './SentimentChart';

type Filter = 'all' | Sentiment | 'high_urgency';
type SortKey = 'priority' | 'date' | 'sentiment';

function computeStats(emails: AnalyzedEmail[]): DashboardStats {
  return {
    total: emails.length,
    positive: emails.filter((e) => e.analysis.sentiment === 'positive').length,
    neutral:  emails.filter((e) => e.analysis.sentiment === 'neutral').length,
    negative: emails.filter((e) => e.analysis.sentiment === 'negative').length,
    highUrgency: emails.filter((e) => e.analysis.urgency === 'high').length,
    avgPriorityScore:
      emails.length > 0
        ? Math.round(emails.reduce((s, e) => s + e.analysis.priorityScore, 0) / emails.length)
        : 0,
  };
}

function applyFilter(emails: AnalyzedEmail[], filter: Filter): AnalyzedEmail[] {
  if (filter === 'all') return emails;
  if (filter === 'high_urgency') return emails.filter((e) => e.analysis.urgency === 'high');
  return emails.filter((e) => e.analysis.sentiment === filter);
}

function applySort(emails: AnalyzedEmail[], sort: SortKey): AnalyzedEmail[] {
  return [...emails].sort((a, b) => {
    if (sort === 'priority') return b.analysis.priorityScore - a.analysis.priorityScore;
    if (sort === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sort === 'sentiment') return b.analysis.sentimentScore - a.analysis.sentimentScore;
    return 0;
  });
}

const STAT_CARDS = (s: DashboardStats) => [
  { label: 'Analysed', value: s.total, sub: 'emails', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { label: 'Positive', value: s.positive, sub: `${s.total > 0 ? Math.round((s.positive / s.total) * 100) : 0}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Negative', value: s.negative, sub: `${s.total > 0 ? Math.round((s.negative / s.total) * 100) : 0}%`, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'High Priority', value: s.highUrgency, sub: 'need action', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Avg Score', value: s.avgPriorityScore, sub: '/ 100', color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

interface Props {
  userName: string;
  userEmail: string;
  userImage?: string;
}

export default function Dashboard({ userName, userEmail, userImage }: Props) {
  const [emails, setEmails] = useState<AnalyzedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('priority');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/emails');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setEmails(data.emails ?? []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const stats = computeStats(emails);
  const priorityEmails = [...emails]
    .sort((a, b) => b.analysis.priorityScore - a.analysis.priorityScore)
    .slice(0, 5);
  const displayed = applySort(applyFilter(emails, filter), sort);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Pixel</span>
          </div>

          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="hidden sm:block text-xs text-slate-500">
                Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              {userImage ? (
                <Image src={userImage} alt={userName} width={28} height={28} className="rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white">
                  {userName?.[0]?.toUpperCase() ?? 'U'}
                </div>
              )}
              <span className="hidden sm:block text-sm text-slate-400 max-w-[160px] truncate">{userEmail}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-20 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl h-48 animate-pulse" />
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl h-48 animate-pulse" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && emails.length > 0 && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STAT_CARDS(stats).map(({ label, value, sub, color, bg }) => (
                <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Chart + Priority queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <SentimentChart stats={stats} />

              {/* Priority queue */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Top Priority
                </h2>
                <div className="space-y-2">
                  {priorityEmails.map((email) => (
                    <EmailCard key={email.id} email={email} compact />
                  ))}
                </div>
              </div>
            </div>

            {/* Full email list */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <h2 className="text-base font-semibold text-white">
                  All Emails
                  <span className="ml-2 text-sm text-slate-500 font-normal">{displayed.length}</span>
                </h2>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter */}
                  <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5 text-xs">
                    {([
                      { key: 'all', label: 'All' },
                      { key: 'positive', label: '😊' },
                      { key: 'neutral', label: '😐' },
                      { key: 'negative', label: '😟' },
                      { key: 'high_urgency', label: '🔥 Urgent' },
                    ] as { key: Filter; label: string }[]).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          filter === key
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-600"
                  >
                    <option value="priority">Sort: Priority</option>
                    <option value="date">Sort: Date</option>
                    <option value="sentiment">Sort: Sentiment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {displayed.length === 0 ? (
                  <div className="text-center text-slate-500 py-12 text-sm">
                    No emails match this filter.
                  </div>
                ) : (
                  displayed.map((email) => (
                    <EmailCard key={email.id} email={email} />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {!loading && !error && emails.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-lg font-medium text-slate-400">No emails found</p>
            <p className="text-sm mt-1">Your inbox might be empty or Gmail returned no results.</p>
          </div>
        )}
      </main>
    </div>
  );
}
