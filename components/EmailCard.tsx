'use client';

import type { AnalyzedEmail, ActionType, Sentiment, Urgency } from '@/lib/types';

const sentimentConfig: Record<Sentiment, { bg: string; text: string; border: string; label: string }> = {
  positive: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-l-emerald-500', label: '😊 Positive' },
  neutral:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-l-amber-500',   label: '😐 Neutral' },
  negative: { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-l-rose-500',    label: '😟 Negative' },
};

const urgencyConfig: Record<Urgency, { bg: string; text: string; dot: string; label: string }> = {
  high:   { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400', label: 'High' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400', label: 'Medium' },
  low:    { bg: 'bg-slate-700/50',  text: 'text-slate-400',  dot: 'bg-slate-500',  label: 'Low' },
};

const actionConfig: Record<ActionType, { icon: string; color: string }> = {
  reply_urgent: { icon: '🚨', color: 'text-rose-400' },
  reply:        { icon: '💬', color: 'text-blue-400' },
  follow_up:    { icon: '🔔', color: 'text-amber-400' },
  archive:      { icon: '📁', color: 'text-slate-400' },
  review:       { icon: '👀', color: 'text-violet-400' },
  schedule:     { icon: '📅', color: 'text-teal-400' },
  delegate:     { icon: '👥', color: 'text-indigo-400' },
  no_action:    { icon: '✓',  color: 'text-emerald-400' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    const diffD = diffH / 24;

    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    if (diffD < 7) return `${Math.floor(diffD)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const AVATAR_COLORS = [
  'bg-violet-600', 'bg-blue-600', 'bg-teal-600',
  'bg-indigo-600', 'bg-fuchsia-600', 'bg-cyan-600',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface Props {
  email: AnalyzedEmail;
  compact?: boolean;
}

export default function EmailCard({ email, compact = false }: Props) {
  const { analysis } = email;
  const sentiment = sentimentConfig[analysis.sentiment];
  const urgency = urgencyConfig[analysis.urgency];
  const action = actionConfig[analysis.actionType];

  return (
    <div
      className={`bg-slate-900 border border-slate-800 border-l-4 ${sentiment.border} rounded-xl p-4 hover:border-slate-700 transition-colors duration-150`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${avatarColor(email.from || email.fromEmail)}`}
        >
          {getInitials(email.from || email.fromEmail || '?')}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: sender + date */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white truncate">
              {email.from || email.fromEmail}
            </span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              {formatRelativeDate(email.date)}
            </span>
          </div>

          {/* Row 2: subject */}
          <p className="text-sm text-slate-300 font-medium truncate mb-2">
            {email.subject}
            {email.messageCount > 1 && (
              <span className="ml-1.5 text-xs text-slate-500">({email.messageCount})</span>
            )}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sentiment.bg} ${sentiment.text}`}>
              {sentiment.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${urgency.bg} ${urgency.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label} urgency
            </span>
            {analysis.priorityScore >= 70 && (
              <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400">
                P{Math.round(analysis.priorityScore)}
              </span>
            )}
          </div>

          {/* AI Summary */}
          <p className="text-xs text-slate-400 mb-2 leading-relaxed">
            {analysis.summary}
          </p>

          {!compact && (
            <>
              {/* Topics */}
              {analysis.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {analysis.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested action */}
              <div className={`flex items-center gap-1.5 text-xs font-medium ${action.color}`}>
                <span>{action.icon}</span>
                <span>{analysis.suggestedAction}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
