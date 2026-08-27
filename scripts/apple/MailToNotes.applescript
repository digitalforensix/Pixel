-- Pixel: Mail → Notes
-- Saves the selected email as a linked note in the iCloud "Applemail" folder.
-- Place in ~/Library/Application Scripts/com.apple.mail/ to add to Mail's Script menu.

use AppleScript version "2.4"
use scripting additions

-- ── 1. Read selected email from Mail ──────────────────────────────────────────────

tell application "Mail"
	set selectedMessages to selection
	if (count of selectedMessages) is 0 then
		display notification "Select an email in Mail first." with title "Pixel: Mail → Notes"
		return
	end if

	set msg to item 1 of selectedMessages
	set msgSubject to subject of msg
	set msgSender to sender of msg
	set msgDate to date received of msg
	set msgID to message id of msg -- RFC 2822 Message-ID, e.g. <abc@mail.com>

	try
		set rawBody to content of msg
		-- Trim to a readable excerpt
		if (count of characters of rawBody) > 1000 then
			set rawBody to (text 1 thru 1000 of rawBody) & "…"
		end if
	on error
		set rawBody to "(body unavailable)"
	end try
end tell

-- ── 2. Build message:// deep-link back to the email ─────────────────────────────
-- message IDs include angle brackets: <id@domain> → encode them

set encodedID to do shell script ¬
	"python3 -c \"import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=''))\" " & ¬
	quoted form of msgID
set msgURL to "message://" & encodedID

-- ── 3. Format the date ─────────────────────────────────────────────────────

set formattedDate to msgDate as string

-- ── 4. Build an HTML note body ────────────────────────────────────────────────
-- Notes renders HTML, so the link will be clickable.

-- Escape any HTML special chars in the body excerpt
set safeBody to do shell script ¬
	"python3 -c \"import sys, html; print(html.escape(sys.argv[1]))\" " & ¬
	quoted form of rawBody

set noteName to msgSubject
set noteHTML to "<!DOCTYPE html><html><body>" & ¬
	"<h2>" & msgSubject & "</h2>" & ¬
	"<table style='font-size:14px;line-height:1.6;border-collapse:collapse'>" & ¬
	"<tr><td><b>From</b></td><td style='padding-left:12px'>" & msgSender & "</td></tr>" & ¬
	"<tr><td><b>Date</b></td><td style='padding-left:12px'>" & formattedDate & "</td></tr>" & ¬
	"<tr><td><b>Open in Mail</b></td><td style='padding-left:12px'>" & ¬
	"<a href='" & msgURL & "'>↗ View email</a></td></tr>" & ¬
	"</table>" & ¬
	"<hr/>" & ¬
	"<pre style='white-space:pre-wrap;font-family:system-ui;font-size:13px'>" & safeBody & "</pre>" & ¬
	"<hr/><p style='color:#999;font-size:11px'>Created by Pixel</p>" & ¬
	"</body></html>"

-- ── 5. Create the note in Notes → iCloud → Applemail ─────────────────────────────

tell application "Notes"
	-- Locate the iCloud account
	set iCloudAccount to missing value
	repeat with acct in accounts
		if name of acct is "iCloud" then
			set iCloudAccount to acct
			exit repeat
		end if
	end repeat

	if iCloudAccount is missing value then
		display dialog ¬
			"No iCloud account found in Notes." & return & ¬
			"Please sign in to iCloud in System Settings → Apple ID → iCloud and enable Notes." ¬
			buttons {"OK"} default button "OK" with icon stop
		return
	end if

	-- Find or create the "Applemail" folder
	set appleMailFolder to missing value
	repeat with f in folders of iCloudAccount
		if name of f is "Applemail" then
			set appleMailFolder to f
			exit repeat
		end if
	end repeat

	if appleMailFolder is missing value then
		set appleMailFolder to make new folder at iCloudAccount with properties {name:"Applemail"}
	end if

	-- Create the note
	set newNote to make new note at appleMailFolder with properties ¬
		{name:noteName, body:noteHTML}

	activate
	show newNote
end tell

display notification "Note saved: “" & msgSubject & "”" with title "Pixel: Mail → Notes"
