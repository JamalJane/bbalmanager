@echo off
REM Hardwood Manager - PRD Compliance Test Script
setlocal enabledelayedexpansion

set URL=http://localhost:5173
set SESSION=hardwood-prd-test

echo ==========================================
echo HARDWOOD MANAGER - PRD v1.0 TEST
echo ==========================================

REM Create screenshots directory
if not exist "test-screenshots" mkdir test-screenshots

echo.
echo [1] Opening browser...
agent-browser --session %SESSION% open %URL%
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 01-homepage.png
echo [PASS] Browser opened

echo.
echo [2] Taking snapshot...
agent-browser --session %SESSION% snapshot -i

echo.
echo [3] Checking for New Game page...
agent-browser --session %SESSION% wait 2

echo.
echo [4] Entering GM Name...
agent-browser --session %SESSION% find text "Enter" fill "Test GM"
agent-browser --session %SESSION% wait 1
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 02-gm-name.png

echo.
echo [5] Clicking Continue to Step 2 (League Overview)...
agent-browser --session %SESSION% find text "Continue" click
agent-browser --session %SESSION% wait 1
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 03-league-overview.png

echo.
echo [6] Navigating to Step 3 (Team Selection)...
agent-browser --session %SESSION% find text "Choose" click
agent-browser %SESSION% wait 1
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 04-team-selection.png

echo.
echo [7] Navigating to Step 4 (Confirmation Memo)...
agent-browser --session %SESSION% find text "Review" click
agent-browser --session %SESSION% wait 1
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 05-confirmation.png

echo.
echo [8] Starting game - clicking Accept...
agent-browser --session %SESSION% find text "Accept" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 06-dashboard.png

echo.
echo [9] Testing Dashboard...
agent-browser --session %SESSION% snapshot -i

echo.
echo [10] Testing Roster page...
agent-browser --session %SESSION% find text "Roster" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 07-roster.png

echo.
echo [11] Testing Dev League page...
agent-browser --session %SESSION% find text "Dev" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 08-dev-league.png

echo.
echo [12] Testing Game Day page...
agent-browser --session %SESSION% find text "Game" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 09-game-day.png

echo.
echo [13] Testing Draft Board...
agent-browser --session %SESSION% find text "Draft" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 10-draft.png

echo.
echo [14] Testing Trade Market...
agent-browser --session %SESSION% find text "Trade" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 11-trade.png

echo.
echo [15] Testing Scouting...
agent-browser --session %SESSION% find text "Scouting" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 12-scouting.png

echo.
echo [16] Testing Coaching Staff...
agent-browser --session %SESSION% find text "Coaching" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 13-coaching.png

echo.
echo [17] Testing Records...
agent-browser --session %SESSION% find text "Records" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 14-records.png

echo.
echo [18] Testing Hall of Fame...
agent-browser --session %SESSION% find text "Hall" click
agent-browser --session %SESSION% wait --load networkidle
agent-browser --session %SESSION% screenshot --screenshot-dir ./test-screenshots 15-hof.png

echo.
echo ==========================================
echo TEST COMPLETE
echo ==========================================
echo Screenshots saved to: test-screenshots\

echo.
echo Closing browser...
agent-browser --session %SESSION% close

pause
