@echo off
REM ============================================================
REM Hardwood Manager - Browser Test Commands
REM Run these commands to test the application
REM ============================================================

echo ============================================================
echo HARDWOOD MANAGER - Browser Test Script
echo ============================================================

REM Start the dev server first (in a separate terminal):
echo.
echo STEP 1: Start the dev server in a separate terminal:
echo   cd C:\Users\bashe\TryingOut
echo   npm run dev
echo.

echo STEP 2: Run browser tests using agent-browser
echo Note: You need to have agent-browser installed
echo.

REM Test 1: Open browser and take initial screenshot
echo.
echo TEST 1: Opening browser to Hardwood Manager...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test open http://localhost:5173"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\01-homepage.png"

REM Test 2: Verify New Game page loaded
echo.
echo TEST 2: Verifying New Game page loads...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "HARDWOOD\|Step\|Enter\|Continue"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] New Game page loaded successfully
) else (
    echo [FAIL] New Game page not found
)

REM Test 3: Enter GM Name
echo.
echo TEST 3: Entering GM Name...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i"
REM Find input field and fill
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test fill @e1 TestGM"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\02-gm-name.png"

REM Test 4: Navigate through New Game flow
echo.
echo TEST 4: Testing 4-step New Game flow...
REM Click Continue to Step 2
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click button:has-text('Continue')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait 1"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\03-step2-league.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "League\|30 Teams\|Season"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Step 2 (League Overview) found
)

REM Click to go to Step 3
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click button:has-text('Choose Your Team')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait 1"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\04-step3-teams.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Select.*Franchise\|rebuilding\|contender\|dynasty\|A\|B\|C\|D"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Step 3 (Team Selection with ratings) found
)

REM Select first team and go to Step 4
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click 'button:nth-child(1)'"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click button:has-text('Review Appointment')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait 1"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\05-step4-confirm.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Memorandum\|Confirm\|Accept"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Step 4 (Confirmation memo) found
)

REM Test 5: Create game and test Dashboard
echo.
echo TEST 5: Starting game and testing Dashboard...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click button:has-text('Accept')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\06-dashboard.png"

REM Verify Dashboard elements
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Week\|Advance\|Story\|Stats\|GM:"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Dashboard loaded with expected elements
)

REM Test 6: Navigate to Roster
echo.
echo TEST 6: Testing Roster page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Roster')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\07-roster.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Player\|Overall\|Potential\|Position"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Roster page loaded with player data
)

REM Test 7: Navigate to Dev League
echo.
echo TEST 7: Testing Dev League page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Dev League')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\08-dev-league.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Slasher\|Sharpshooter\|Floor General\|Lockdown\|Stretch\|Enforcer\|Facilitator\|Two-Way"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Development pathways found
) else (
    echo [INFO] Could not verify all 8 pathways
)

REM Test 8: Navigate to Game Day
echo.
echo TEST 8: Testing Game Day page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Game')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\09-game-day.png"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test snapshot -i" | findstr /i "Score\|Sim\|Play\|Intervention"
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Game Day page loaded
)

REM Test 9: Navigate to Draft
echo.
echo TEST 9: Testing Draft Board page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Draft')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\10-draft.png"

REM Test 10: Navigate to Trade Market
echo.
echo TEST 10: Testing Trade Market page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Trade')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\11-trade.png"

REM Test 11: Navigate to Scouting
echo.
echo TEST 11: Testing Scouting page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Scouting')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\12-scouting.png"

REM Test 12: Navigate to Coaching Staff
echo.
echo TEST 12: Testing Coaching Staff page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Coaching')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\13-coaching.png"

REM Test 13: Navigate to Records
echo.
echo TEST 13: Testing Records page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Records')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\14-records.png"

REM Test 14: Navigate to Hall of Fame
echo.
echo TEST 14: Testing Hall of Fame page...
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test click a:has-text('Hall of Fame')"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test wait --load networkidle"
powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test screenshot C:\Users\bashe\TryingOut\test-screenshots\15-hof.png"

REM Final cleanup
echo.
echo ============================================================
echo TESTS COMPLETED
echo ============================================================
echo.
echo Screenshots saved to: C:\Users\bashe\TryingOut\test-screenshots
echo.
echo To close browser, run:
echo   powershell -ExecutionPolicy Bypass -Command "agent-browser --session-name hardwood-test close"

pause
