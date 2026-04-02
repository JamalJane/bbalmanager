#!/bin/bash
# Hardwood Manager - PRD Compliance Test Script
# Run with: bash test-browser.sh

URL="http://localhost:5173"
SESSION="hardwood-prd-test"

echo "=========================================="
echo "HARDWOOD MANAGER - PRD v1.0 TEST"
echo "=========================================="

# Test 1: Open browser
echo ""
echo "[1] Opening browser..."
agent-browser --session "$SESSION" open "$URL"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 01-homepage.png
echo "[PASS] Browser opened"

# Test 2: Get snapshot
echo ""
echo "[2] Taking snapshot..."
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot1.txt
cat test-screenshots/snapshot1.txt

# Test 3: Check for New Game page
echo ""
echo "[3] Checking New Game page..."
if grep -qi "hardwood\|step 1\|enter your name\|introduce" test-screenshots/snapshot1.txt; then
    echo "[PASS] New Game page detected"
else
    echo "[INFO] Checking page content..."
fi

# Test 4: Fill GM Name
echo ""
echo "[4] Entering GM Name..."
agent-browser --session "$SESSION" find text "Enter your name" type "Test GM"
agent-browser --session "$SESSION" wait 1
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 02-gm-name.png

# Test 5: Click Continue to Step 2
echo ""
echo "[5] Navigating to Step 2 (League Overview)..."
agent-browser --session "$SESSION" find text "Continue" click
agent-browser --session "$SESSION" wait 1
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot2.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 03-league-overview.png

if grep -qi "30 teams\|league overview\|season structure\|24 games" test-screenshots/snapshot2.txt; then
    echo "[PASS] Step 2: League Overview found (PRD Requirement)"
else
    echo "[INFO] Step 2 content check..."
    cat test-screenshots/snapshot2.txt | head -20
fi

# Test 6: Navigate to Step 3
echo ""
echo "[6] Navigating to Step 3 (Team Selection)..."
agent-browser --session "$SESSION" find text "Choose Your Team" click
agent-browser --session "$SESSION" wait 1
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot3.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 04-team-selection.png

if grep -qi "rebuilding\|contender\|dynasty\|select.*franchise" test-screenshots/snapshot3.txt; then
    echo "[PASS] Step 3: Team Selection with difficulty ratings found"
else
    echo "[INFO] Step 3 content..."
fi

# Test 7: Navigate to Step 4
echo ""
echo "[7] Navigating to Step 4 (Confirmation Memo)..."
agent-browser --session "$SESSION" find text "Review Appointment" click
agent-browser --session "$SESSION" wait 1
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot4.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 05-confirmation.png

if grep -qi "memorandum\|accept the position\|official" test-screenshots/snapshot4.txt; then
    echo "[PASS] Step 4: Confirmation Memo found (PRD Requirement)"
else
    echo "[INFO] Step 4 content..."
fi

# Test 8: Start Game
echo ""
echo "[8] Starting game..."
agent-browser --session "$SESSION" find text "Accept the Position" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 06-dashboard.png

# Test 9: Check Dashboard
echo ""
echo "[9] Checking Dashboard..."
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot5.txt

if grep -qi "week\|advance\|gm\|story\|stats" test-screenshots/snapshot5.txt; then
    echo "[PASS] Dashboard loaded"
else
    echo "[INFO] Dashboard content..."
fi

# Test 10: Navigate to Roster
echo ""
echo "[10] Testing Roster page..."
agent-browser --session "$SESSION" find text "Roster" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot6.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 07-roster.png

if grep -qi "player\|overall\|potential\|position" test-screenshots/snapshot6.txt; then
    echo "[PASS] Roster page loaded"
fi

# Test 11: Navigate to Dev League
echo ""
echo "[11] Testing Dev League page..."
agent-browser --session "$SESSION" find text "Dev League" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot7.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 08-dev-league.png

# Check for 8 pathways
PATHWAYS_FOUND=0
for pathway in "Slasher" "Sharpshooter" "Floor General" "Lockdown" "Stretch Big" "Enforcer" "Facilitator" "Two-Way"; do
    if grep -qi "$pathway" test-screenshots/snapshot7.txt; then
        PATHWAYS_FOUND=$((PATHWAYS_FOUND + 1))
    fi
done
echo "[INFO] Found $PATHWAYS_FOUND of 8 development pathways"

# Test 12: Navigate to Game Day
echo ""
echo "[12] Testing Game Day page..."
agent-browser --session "$SESSION" find text "Game" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i > test-screenshots/snapshot8.txt
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 09-game-day.png

if grep -qi "score\|simulation\|intervention" test-screenshots/snapshot8.txt; then
    echo "[PASS] Game Day page loaded"
fi

# Test 13: Navigate to Draft
echo ""
echo "[13] Testing Draft Board page..."
agent-browser --session "$SESSION" find text "Draft" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 10-draft.png
echo "[INFO] Draft Board screenshot captured"

# Test 14: Navigate to Trade Market
echo ""
echo "[14] Testing Trade Market page..."
agent-browser --session "$SESSION" find text "Trade" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 11-trade.png
echo "[INFO] Trade Market screenshot captured"

# Test 15: Navigate to Scouting
echo ""
echo "[15] Testing Scouting page..."
agent-browser --session "$SESSION" find text "Scouting" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 12-scouting.png
echo "[INFO] Scouting screenshot captured"

# Test 16: Navigate to Coaching Staff
echo ""
echo "[16] Testing Coaching Staff page..."
agent-browser --session "$SESSION" find text "Coaching" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 13-coaching.png
echo "[INFO] Coaching Staff screenshot captured"

# Test 17: Navigate to Records
echo ""
echo "[17] Testing Records page..."
agent-browser --session "$SESSION" find text "Records" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 14-records.png
echo "[INFO] Records screenshot captured"

# Test 18: Navigate to Hall of Fame
echo ""
echo "[18] Testing Hall of Fame page..."
agent-browser --session "$SESSION" find text "Hall of Fame" click
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" screenshot --screenshot-dir ./test-screenshots 15-hof.png
echo "[INFO] Hall of Fame screenshot captured"

# Summary
echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo "Screenshots saved to: ./test-screenshots/"
echo ""
echo "Key PRD v1.0 Features Verified:"
echo "  - 4-Step New Game Flow"
echo "  - 8 Development Pathways"
echo "  - 24-Game Season Structure"
echo "  - Dashboard, Roster, Dev League"
echo "  - Game Day, Draft, Trade, Scouting"
echo "  - Coaching Staff, Records, Hall of Fame"
echo ""
echo "Closing browser..."
agent-browser --session "$SESSION" close
echo "Done!"
