# Dogfood Report: Hardwood Manager

| Field | Value |
|-------|-------|
| **Date** | 2026-04-02 |
| **App URL** | http://localhost:5173 |
| **Session** | hardwood-dogfood |
| **Scope** | Full app exploration |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 1 |
| **Total** | **3** |

## Issues

### ISSUE-001: Awkward phrasing in Official Memorandum

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | content |
| **URL** | http://localhost:5173/new-game |
| **Repro Video** | N/A |
| **Status** | FIXED |

**Description**

The appointment memorandum displays "You have been selected based on your The Rebuild management style." This is grammatically awkward. The style name should be quoted or formatted differently to read naturally.

**Repro Steps**

1. Navigate to http://localhost:5173/new-game
   ![Step 1](screenshots/01_newgame_step1.png)

2. Enter GM name and proceed through Steps 1-3
   ![Step 2](screenshots/04_newgame_step4.png)

3. **Observe:** Step 4 shows "your The Rebuild management style" instead of "your 'Rebuild' management style"

**Fix Applied:** Added quotes around the style name: `'{GM_STYLES.find(s => s.id === selectedStyle)?.label}'`

---

### ISSUE-002: All players show "Rookie" contract status

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | content |
| **URL** | http://localhost:5173/roster |
| **Repro Video** | N/A |
| **Status** | FIXED |

**Description**

All 15 players on the roster display "Rookie" as their contract type. This is unrealistic for a basketball team - there should be a mix of veterans, restricted free agents, and players with multi-year contracts.

**Repro Steps**

1. Navigate to http://localhost:5173/roster
   ![Step 1](screenshots/05_roster.png)

2. **Observe:** Every player shows "Rookie" contract status in the CONTRACT column

**Fix Applied:** Updated `getContract` function in PlayerTable.jsx to show varied contract types based on `contract_years` field and player age:
- `Rookie (Xy)` for young players
- `Xy remaining` for players with years left
- `Long-term` for 3+ year contracts
- `Expiring` for players with 0 years left

---

### ISSUE-003: Multiple pages redirect to Dashboard during regular season

| Field | Value |
|-------|-------|
| **Severity** | medium |
| **Category** | functional |
| **URL** | http://localhost:5173/trade, /coaching, /draft |
| **Repro Video** | N/A |
| **Status** | NOT A BUG (User Error) |

**Description**

The Trade Market, Coaching, and Draft pages redirect to the Dashboard when navigating directly to `/trade`, `/coaching`, `/draft`.

**Root Cause:** The correct URLs are `/trade-market`, `/coaching-staff`, `/draft-board`. The test used incorrect shorter URLs that don't exist as routes.

**Repro Steps**

1. Navigate to http://localhost:5173/trade (WRONG URL)
   - Expected: Trade Market page
   - Actual: Redirects to Dashboard

2. Navigate to http://localhost:5173/trade-market (CORRECT URL)
   - Expected: Trade Market page
   - Actual: Trade Market page loads correctly

**Conclusion:** This was a testing error. The app works correctly with proper URLs.

---

### ISSUE-004: Scouting page shows "0 prospects" despite available scouts

| Field | Value |
|-------|-------|
| **Severity** | low |
| **Category** | functional |
| **URL** | http://localhost:5173/scouting |
| **Repro Video** | N/A |
| **Status** | FIXED |

**Description**

The Scouting page displays "TOP PROSPECTS (0)" despite having 2 scouts (Larry Spoelstra Level 5, Pat Jackson Level 3) and a reveal timeline. The prospect pool was empty because draft prospects were not generated when creating a new game.

**Repro Steps**

1. Navigate to http://localhost:5173/scouting
   ![Step 1](screenshots/10_scouting.png)

2. **Observe:** TOP PROSPECTS shows 0 despite scouts being available

**Fix Applied:** Modified NewGame.jsx to generate draft class and 90 prospects when creating a new game, including:
- Created `generateProspectName()` helper function with realistic basketball names
- Added draft class creation with year 2026
- Inserted 90 prospects with varied ratings (elite, lottery, mid-first, remaining)

---
