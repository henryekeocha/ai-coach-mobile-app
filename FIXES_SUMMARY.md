# Fixes Applied

## Summary
Fixed multiple issues related to coach creation, discovery, video sessions, and session management.

## 1. Create Coach Form - Fixed ✅

**Issue**: When creating a coach and making it public, the coach wasn't showing up on the discover page, and video call options weren't available.

**Root Cause**: The form was only saving `tavus_persona_id` but the coach detail page was checking for `tavus_replica_id`.

**Fix**:
- Updated create form to save both `tavus_persona_id` and `tavus_replica_id`
- Improved success alert to offer viewing the newly created coach
- File: `app/(tabs)/create.tsx:95-108`

## 2. Discover Page - Refresh Functionality ✅

**Issue**: Newly created public coaches didn't appear immediately on the discover page.

**Fix**:
- Added pull-to-refresh functionality to the discover page
- Users can now swipe down to refresh the coach list
- File: `app/(tabs)/index.tsx:18-42, 116-118`

## 3. Video Call Option - Fixed ✅

**Issue**: Video call option wasn't showing when starting a session with a coach that has a Tavus persona.

**Root Cause**: Field name mismatch - form saved `tavus_persona_id` but detail page checked `tavus_replica_id`.

**Fix**:
- Create form now saves to both fields for compatibility
- Video session option now appears correctly for coaches with Tavus personas
- File: `app/coach/[id].tsx:295-310`

## 4. End Session Feature - Added ✅

**Issue**: No way to end an active session from the Chats section.

**Fix**:
- Added an "End" button to active sessions in the Chats tab
- Button archives the session, moving it to "Previous Sessions"
- Red-colored button with X icon for clear visual indication
- Files:
  - `app/(tabs)/conversations.tsx:16, 199-208, 242-275, 423-427, 498-508`

## Testing Checklist

- [ ] Create a new coach with all fields filled
- [ ] Make it public and verify it appears on Discover page (use pull-to-refresh)
- [ ] Add a Tavus persona to a coach and verify video option shows
- [ ] Start a text session and verify it appears in Chats
- [ ] Expand a coach in Chats and click "End" on an active session
- [ ] Verify ended session moves to "Previous Sessions"

## Technical Details

### Files Modified
1. `app/(tabs)/create.tsx` - Coach creation form
2. `app/(tabs)/index.tsx` - Discover page with refresh
3. `app/(tabs)/conversations.tsx` - Chats page with end session

### Database Fields
- `tavus_persona_id` - Original field for Tavus persona
- `tavus_replica_id` - Additional field for Tavus replica
- Both are now populated when creating a coach with video capability

### UI Improvements
- Pull-to-refresh on discover page
- Better success messaging on coach creation
- Visual "End" button for active sessions
- Consistent avatar display across all screens
