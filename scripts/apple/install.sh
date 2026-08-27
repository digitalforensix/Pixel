#!/usr/bin/env bash
# Pixel – install MailToNotes into Mail's Script menu.
#
# After running this, open Mail and look for the scrolled-paper icon (⊕) in
# the menu bar (Window → Script Editor, or the Script Menu if enabled).
# You can also assign a keyboard shortcut via System Settings → Keyboard →
# Keyboard Shortcuts → App Shortcuts → Mail.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/MailToNotes.applescript"
DEST_DIR="$HOME/Library/Application Scripts/com.apple.mail"
COMPILED="$DEST_DIR/MailToNotes.scpt"

echo "Pixel: Mail → Notes installer"
echo "──────────────────────────────"

# Ensure the Mail scripts directory exists
mkdir -p "$DEST_DIR"

# Compile the AppleScript to a .scpt binary
echo "Compiling AppleScript..."
osacompile -o "$COMPILED" "$SOURCE"

echo "Installed to: $COMPILED"
echo ""
echo "Done! Next steps:"
echo "  1. Quit Mail if it is open, then relaunch it."
echo "  2. In Mail, go to Window menu → Script Editor (or look for ⊕ in the"
echo "     toolbar) — 'MailToNotes' will appear there."
echo "  3. Optional – add a keyboard shortcut:"
echo "     System Settings → Keyboard → Keyboard Shortcuts → App Shortcuts"
echo "     → click + → Application: Mail.app → Menu Title: MailToNotes"
echo "     → assign your shortcut (e.g. ⌘⇧N)."
