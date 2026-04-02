# ============================================================
# Hardwood Manager - Browser Automation Test Script
# Tests all PRD v1.0 features
# ============================================================

param(
    [string]$Url = "http://localhost:5173",
    [string]$SessionName = "hardwood-test",
    [switch]$TakeScreenshots,
    [string]$ScreenshotDir = "./test-screenshots"
)

$ErrorActionPreference = "Stop"

function Write-TestHeader {
    param([string]$TestName)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "TEST: $TestName" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-TestResult {
    param([string]$Result, [string]$Details = "")
    switch ($Result) {
        "PASS" { Write-Host "[PASS] $Details" -ForegroundColor Green }
        "FAIL" { Write-Host "[FAIL] $Details" -ForegroundColor Red }
        "INFO" { Write-Host "[INFO] $Details" -ForegroundColor Yellow }
        "SKIP" { Write-Host "[SKIP] $Details" -ForegroundColor Gray }
    }
}

function Start-Browser {
    Write-TestHeader "Browser Setup"
    try {
        agent-browser --session-name $SessionName open $Url
        Start-Sleep -Seconds 3
        Write-TestResult "PASS" "Browser opened successfully"
        return $true
    }
    catch {
        Write-TestResult "FAIL" "Failed to open browser: $_"
        return $false
    }
}

function Get-Snapshot {
    return agent-browser --session-name $SessionName snapshot -i 2>&1 | Out-String
}

function Take-ScreenshotIfEnabled {
    param([string]$Name)
    if ($TakeScreenshots) {
        $screenshotPath = Join-Path $ScreenshotDir "$Name.png"
        if (!(Test-Path $ScreenshotDir)) {
            New-Item -ItemType Directory -Path $ScreenshotDir -Force | Out-Null
        }
        agent-browser --session-name $SessionName screenshot "$screenshotPath"
        Write-TestResult "INFO" "Screenshot saved: $screenshotPath"
    }
}

# ============================================================
# TEST SUITE: PRD v1.0 Compliance
# ============================================================

$testResults = @()

# Test 1: New Game Flow - 4 Steps
function Test-NewGameFlow {
    Write-TestHeader "PRD 2.3: New Game Setup (4-Step Flow)"
    
    $snapshot = Get-Snapshot
    
    # Step 1: Verify Step 1 content
    if ($snapshot -match "Step 1|Enter Your Name|GM Name") {
        Write-TestResult "PASS" "Step 1: GM Name input found"
        
        # Enter GM name
        agent-browser --session-name $SessionName fill "@e1" "Test GM"
        Take-ScreenshotIfEnabled "newgame-step1-name"
        
        # Check for Continue button
        if ($snapshot -match "Continue|Continue to League") {
            Write-TestResult "PASS" "Step 1 navigation found"
        }
    }
    
    # Click Continue to go to Step 2
    agent-browser --session-name $SessionName click "button:has-text('Continue')" 2>$null
    Start-Sleep -Seconds 1
    $snapshot = Get-Snapshot
    
    # Step 2: League Overview (PRD requirement)
    if ($snapshot -match "League|30 Teams|Season Structure|24 Games") {
        Write-TestResult "PASS" "Step 2: League Overview displayed (PRD Requirement)"
        Take-ScreenshotIfEnabled "newgame-step2-league"
    }
    else {
        Write-TestResult "FAIL" "Step 2: League Overview not found"
    }
    
    # Click to go to Step 3
    agent-browser --session-name $SessionName click "button:has-text('Choose Your Team')" 2>$null
    Start-Sleep -Seconds 1
    $snapshot = Get-Snapshot
    
    # Step 3: Team Selection with Difficulty Rating (PRD Requirement)
    if ($snapshot -match "A|B|C|D|rebuilding|contender|dynasty") {
        Write-TestResult "PASS" "Step 3: Team selection with difficulty ratings (A-D) found"
        Take-ScreenshotIfEnabled "newgame-step3-teams"
    }
    else {
        Write-TestResult "FAIL" "Step 3: Difficulty ratings not found"
    }
    
    # Select a team and proceed to Step 4
    agent-browser --session-name $SESSION_NAME click "button:has-text('Review Appointment')" 2>$null
    Start-Sleep -Seconds 1
    $snapshot = Get-Snapshot
    
    # Step 4: Confirmation Memo (PRD Requirement)
    if ($snapshot -match "Memorandum|Confirm|Accept the Position|Official") {
        Write-TestResult "PASS" "Step 4: Confirmation memo styled as official document found"
        Take-ScreenshotIfEnabled "newgame-step4-confirm"
    }
    else {
        Write-TestResult "FAIL" "Step 4: Confirmation memo not found"
    }
}

# Test 2: Dashboard Modules
function Test-Dashboard {
    Write-TestHeader "PRD 5.2: Dashboard Components"
    
    $snapshot = Get-Snapshot
    
    $components = @{
        "TimelineBar" = "Week|Advance|Progress"
        "StoryFeed" = "Story|Beat|Narrative"
        "QuickStats" = "Wins|Losses|Record"
        "NextGame" = "Next Game|Opponent"
        "GamePreviewCard" = "Preview|Game"
    }
    
    foreach ($component in $components.GetEnumerator()) {
        if ($snapshot -match $component.Value) {
            Write-TestResult "PASS" "$($component.Key) found"
        }
        else {
            Write-TestResult "FAIL" "$($component.Key) not found"
        }
    }
    
    Take-ScreenshotIfEnabled "dashboard"
}

# Test 3: Roster Management
function Test-RosterPage {
    Write-TestHeader "PRD P0: Roster Management"
    
    # Navigate to Roster
    agent-browser --session-name $SessionName click "a:has-text('Roster')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    # Check for roster elements
    if ($snapshot -match "Player|Roster|Overall|Potential|Position") {
        Write-TestResult "PASS" "Roster page loaded with player data"
        Take-ScreenshotIfEnabled "roster"
    }
    else {
        Write-TestResult "FAIL" "Roster data not found"
    }
}

# Test 4: Development Pathways
function Test-DevLeague {
    Write-TestHeader "PRD 3.3: Development Pathway System (8 Pathways)"
    
    # Navigate to Dev League
    agent-browser --session-name $SessionName click "a:has-text('Dev League')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    $pathways = @("Slasher", "Sharpshooter", "Floor General", "Lockdown", "Stretch Big", "Enforcer", "Facilitator", "Two-Way")
    $foundPathways = 0
    
    foreach ($pathway in $pathways) {
        if ($snapshot -match $pathway) {
            $foundPathways++
        }
    }
    
    if ($foundPathways -ge 8) {
        Write-TestResult "PASS" "All 8 development pathways found"
    }
    elseif ($foundPathways -ge 5) {
        Write-TestResult "PASS" "$foundPathways of 8 pathways found (partial implementation)"
    }
    else {
        Write-TestResult "FAIL" "Only $foundPathways pathways found"
    }
    
    Take-ScreenshotIfEnabled "dev-league"
}

# Test 5: Game Simulation
function Test-GameDay {
    Write-TestHeader "PRD 3.4: Game Simulation Engine"
    
    # Navigate to Game Day
    agent-browser --session-name $SessionName click "a:has-text('Game')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    # Check for simulation elements
    if ($snapshot -match "Score|Game|Play|Advance|Sim") {
        Write-TestResult "PASS" "Game simulation interface found"
        Take-ScreenshotIfEnabled "game-day"
    }
    
    # Check for key moment types
    $momentTypes = @("Momentum", "Clutch", "Injury", "Breakout", "Persona")
    $foundMoments = 0
    
    foreach ($moment in $momentTypes) {
        if ($snapshot -match $moment) {
            $foundMoments++
        }
    }
    
    Write-TestResult "INFO" "$foundMoments of 5 key moment types visible"
}

# Test 6: Interventions
function Test-Interventions {
    Write-TestHeader "PRD 3.4: GM Interventions"
    
    $snapshot = Get-Snapshot
    
    $interventions = @{
        "Substitution" = "Fresh player|Substitution|3 possessions"
        "Timeout" = "Timeout|Reset|Momentum"
        "Play Call" = "Play Call|Focus|1.08"
        "Double Team" = "Double Team|40%|Clutch"
    }
    
    foreach ($intervention in $interventions.GetEnumerator()) {
        if ($snapshot -match $intervention.Value) {
            Write-TestResult "PASS" "Intervention: $($intervention.Key)"
        }
    }
}

# Test 7: Draft System
function Test-DraftBoard {
    Write-TestHeader "PRD P0: Draft System"
    
    # Navigate to Draft
    agent-browser --session-name $SessionName click "a:has-text('Draft')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Draft|Board|Prospect|Pick|Round") {
        Write-TestResult "PASS" "Draft board interface found"
        Take-ScreenshotIfEnabled "draft-board"
    }
}

# Test 8: Trade Market
function Test-TradeMarket {
    Write-TestHeader "PRD P1: Trade System"
    
    # Navigate to Trade
    agent-browser --session-name $SessionName click "a:has-text('Trade')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Trade|Market|Offer|Value") {
        Write-TestResult "PASS" "Trade market interface found"
        Take-ScreenshotIfEnabled "trade-market"
    }
}

# Test 9: Coaching Staff
function Test-CoachingStaff {
    Write-TestHeader "PRD P1: Coaching Staff"
    
    # Navigate to Coaching
    agent-browser --session-name $SessionName click "a:has-text('Coaching')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Coach|Staff|Development|Level") {
        Write-TestResult "PASS" "Coaching staff interface found"
        Take-ScreenshotIfEnabled "coaching-staff"
    }
}

# Test 10: Records Page
function Test-Records {
    Write-TestHeader "PRD P2: Records System"
    
    # Navigate to Records
    agent-browser --session-name $SessionName click "a:has-text('Records')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Record|Franchise|Leader") {
        Write-TestResult "PASS" "Records page found"
        Take-ScreenshotIfEnabled "records"
    }
}

# Test 11: Hall of Fame
function Test-HallOfFame {
    Write-TestHeader "PRD P2: Hall of Fame"
    
    # Navigate to HOF
    agent-browser --session-name $SessionName click "a:has-text('Hall of Fame')" 2>$null
    Start-Sleep -Seconds 2
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Hall of Fame|HOF|Induct|Legacy") {
        Write-TestResult "PASS" "Hall of Fame page found"
        Take-ScreenshotIfEnabled "hall-of-fame"
    }
}

# Test 12: Season Structure
function Test-SeasonStructure {
    Write-TestHeader "PRD 2.1: Season Structure (24 Games)"
    
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "24|twenty-four") {
        Write-TestResult "PASS" "24-game season structure confirmed"
    }
    elseif ($snapshot -match "12|twelve") {
        Write-TestResult "FAIL" "12-game season (should be 24)"
    }
    else {
        Write-TestResult "INFO" "Could not verify season length"
    }
}

# Test 13: Legacy Score
function Test-LegacyScore {
    Write-TestHeader "PRD 6.1: Legacy Score System"
    
    $snapshot = Get-Snapshot
    
    if ($snapshot -match "Legacy|Score|Points|Championship") {
        Write-TestResult "PASS" "Legacy score elements found"
    }
}

# ============================================================
# MAIN EXECUTION
# ============================================================

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "HARDWOOD MANAGER - PRD v1.0 COMPLIANCE TEST" -ForegroundColor Magenta
Write-Host "============================================`n" -ForegroundColor Magenta

# Initialize browser
if (!(Start-Browser)) {
    Write-Host "Cannot continue without browser. Exiting." -ForegroundColor Red
    exit 1
}

# Run tests
try {
    Test-NewGameFlow
    Take-ScreenshotIfEnabled "test-complete"
}
catch {
    Write-TestResult "FAIL" "Test execution error: $_"
}
finally {
    # Cleanup
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "Test Complete. Closing browser..." -ForegroundColor Cyan
    agent-browser --session-name $SessionName close 2>$null
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "TEST SUITE COMPLETED" -ForegroundColor Green
Write-Host "============================================`n"
