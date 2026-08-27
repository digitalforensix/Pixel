// Pixel – Unread Mail Widget
// Requires Übersicht: https://tracesof.net/uebersicht/
// Drop this folder into ~/Library/Application Support/Übersicht/widgets/

// Count unread messages across every INBOX in all accounts
export const command = `osascript <<'EOF'
tell application "Mail"
  set total to 0
  repeat with mb in mailboxes
    if name of mb is "INBOX" then
      set total to total + (unread count of mb)
    end if
  end repeat
  return total
end tell
EOF`

// Refresh every 30 seconds
export const refreshFrequency = 30000

// Position: top-right corner of the screen
export const className = `
  top: 24px;
  right: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
`

export const render = ({ output, error }) => {
  const count = parseInt(output?.trim() ?? "0", 10) || 0
  const hasUnread = count > 0
  const label = count === 1 ? "unread email" : "unread emails"

  const handleClick = () => run("open -a Mail")

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        background: "rgba(10, 15, 30, 0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${hasUnread ? "rgba(139, 92, 246, 0.45)" : "rgba(51, 65, 85, 0.55)"}`,
        borderRadius: "18px",
        padding: "14px 20px 14px 16px",
        boxShadow: hasUnread
          ? "0 0 24px rgba(109, 40, 217, 0.25), 0 4px 16px rgba(0,0,0,0.4)"
          : "0 4px 16px rgba(0,0,0,0.3)",
        minWidth: "160px",
        transition: "all 0.3s ease",
      }}
    >
      {/* Icon with badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: hasUnread
              ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
              : "rgba(30, 41, 59, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hasUnread ? "0 2px 8px rgba(109, 40, 217, 0.4)" : "none",
          }}
        >
          {/* Envelope icon */}
          <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="0.75" width="20.5" height="15.5" rx="2.25"
              stroke={hasUnread ? "rgba(255,255,255,0.95)" : "rgba(148,163,184,0.7)"} strokeWidth="1.5"/>
            <path d="M1 2L11 10L21 2"
              stroke={hasUnread ? "rgba(255,255,255,0.95)" : "rgba(148,163,184,0.7)"} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Unread badge */}
        {hasUnread && (
          <div
            style={{
              position: "absolute",
              top: "-7px",
              right: "-7px",
              minWidth: "20px",
              height: "20px",
              borderRadius: "10px",
              background: "#f43f5e",
              border: "2.5px solid rgba(10, 15, 30, 0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "700",
              color: "white",
              padding: "0 4px",
              lineHeight: "1",
              letterSpacing: "-0.3px",
            }}
          >
            {count > 99 ? "99+" : count}
          </div>
        )}
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: hasUnread ? "#f1f5f9" : "#475569",
            lineHeight: "1",
            letterSpacing: "-1px",
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: hasUnread ? "#94a3b8" : "#334155",
            marginTop: "3px",
            letterSpacing: "0.2px",
          }}
        >
          {error ? "Mail unavailable" : label}
        </div>
      </div>

      {/* Subtle arrow hint */}
      <div style={{ marginLeft: "auto", color: hasUnread ? "rgba(139,92,246,0.6)" : "rgba(51,65,85,0.5)", fontSize: "14px" }}>
        ›
      </div>
    </div>
  )
}
