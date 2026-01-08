# Comprehensive Test Plan for Smart Dynamic Checklist Improvements

## Test Date
Date: 2026-01-08

## Areas Under Test
1. GEMINI API Key Configuration via UI
2. Improved AI Rate Limiting
3. Sub-dependencies Between Tasks
4. Break It Down Feature Functionality

---

## Test Case 1: API Key Configuration via UI

### TC1.1: Open Settings Modal
**Steps:**
1. Open the application
2. Click the Settings (gear) icon in the header

**Expected Result:**
- Settings modal opens
- Modal shows "Settings" title
- Has "Google Gemini API Key" input field
- Has "Save" and "Clear" buttons
- Shows link to Google AI Studio

**Status:** [ ]

### TC1.2: Save API Key
**Steps:**
1. Open Settings modal
2. Enter a test API key: `test-api-key-123456789`
3. Click "Save" button

**Expected Result:**
- Button shows "Saving..." then "Saved!"
- API key is stored in localStorage
- Modal can be closed

**Status:** [ ]

### TC1.3: API Key Persistence
**Steps:**
1. Save an API key
2. Close settings modal
3. Reopen settings modal

**Expected Result:**
- Previously saved API key is shown (masked as password)
- Can toggle visibility with eye icon

**Status:** [ ]

### TC1.4: Clear API Key
**Steps:**
1. Save an API key
2. Click "Clear" button

**Expected Result:**
- Input field is cleared
- API key removed from localStorage

**Status:** [ ]

### TC1.5: API Key Usage in Requests
**Steps:**
1. Configure API key in settings
2. Try to generate tasks using AI

**Expected Result:**
- API requests include the user's API key
- Backend accepts and uses the user-provided key

**Status:** [ ]

---

## Test Case 2: Improved AI Rate Limiting

### TC2.1: Normal Usage Within Limits
**Steps:**
1. Make 1-2 AI requests (generate tasks or rephrase)
2. Observe response

**Expected Result:**
- Requests succeed normally
- No rate limit errors

**Status:** [ ]

### TC2.2: Rate Limit Headers
**Steps:**
1. Make an AI request
2. Check browser Network tab for response headers

**Expected Result:**
- Response includes headers:
  - X-RateLimit-Limit: 10
  - X-RateLimit-Remaining: (decreasing number)
  - X-RateLimit-Reset: (timestamp)

**Status:** [ ]

### TC2.3: Exceed Rate Limit
**Steps:**
1. Rapidly make 11+ AI requests within 1 minute
2. Observe error message

**Expected Result:**
- After 10 requests, receive 429 error
- Error message shows: "Rate limit exceeded. Please wait X seconds before trying again."
- Specific retry time is shown

**Status:** [ ]

### TC2.4: Rate Limit Reset
**Steps:**
1. Hit rate limit
2. Wait for reset period (60 seconds)
3. Try another request

**Expected Result:**
- After waiting, requests work again
- Rate limit counter resets

**Status:** [ ]

---

## Test Case 3: Sub-dependencies Between Tasks

### TC3.1: Create Tasks Without Dependencies
**Steps:**
1. Go to Build mode
2. Add 3 tasks:
   - "Task A"
   - "Task B"
   - "Task C"

**Expected Result:**
- All tasks created successfully
- No dependencies set by default

**Status:** [ ]

### TC3.2: View Dependencies Section
**Steps:**
1. Create at least 2 tasks
2. Click "Dependencies (0)" button on any task

**Expected Result:**
- Dependencies section expands
- Shows checkboxes for all other tasks
- Shows explanatory text about dependencies

**Status:** [ ]

### TC3.3: Set Single Dependency
**Steps:**
1. Create "Task A" and "Task B"
2. On Task B, expand dependencies
3. Check the checkbox for "Task A"

**Expected Result:**
- Checkbox is checked
- Counter shows "Dependencies (1)"
- Data model updated with dependency

**Status:** [ ]

### TC3.4: Set Multiple Dependencies
**Steps:**
1. Create "Task A", "Task B", "Task C", "Task D"
2. On Task D, set dependencies on A, B, and C

**Expected Result:**
- All three checkboxes are checked
- Counter shows "Dependencies (3)"
- Task D depends on all three tasks

**Status:** [ ]

### TC3.5: Dependencies in Runner Mode
**Steps:**
1. Create tasks with dependencies (Task B depends on Task A)
2. Switch to Run mode

**Expected Result:**
- Only Task A is visible initially
- Task B is hidden until A is completed

**Status:** [ ]

### TC3.6: Complete Dependencies
**Steps:**
1. In Run mode with Task B depending on Task A
2. Complete Task A

**Expected Result:**
- Task B becomes visible
- Task B can now be completed

**Status:** [ ]

### TC3.7: Multiple Dependencies - All Must Be Complete
**Steps:**
1. Create Task D depending on Tasks A, B, and C
2. Switch to Run mode
3. Complete only Task A and B (not C)

**Expected Result:**
- Task D remains hidden
- Only becomes visible after ALL dependencies (A, B, C) are complete

**Status:** [ ]

### TC3.8: Remove Dependency
**Steps:**
1. Set a dependency on a task
2. Uncheck the dependency checkbox

**Expected Result:**
- Dependency is removed
- Counter updates correctly

**Status:** [ ]

---

## Test Case 4: Break It Down Feature

### TC4.1: Generate Sub-tasks
**Steps:**
1. Create a task: "Plan a birthday party"
2. Click "Break It Down" button

**Expected Result:**
- Button shows "Thinking..." while processing
- AI generates 3-5 sub-tasks
- Success message shows: "Successfully created X sub-tasks with dependencies!"

**Status:** [ ]

### TC4.2: Sub-tasks Have Dependencies
**Steps:**
1. After breaking down a task, check the generated sub-tasks
2. Expand dependencies on each sub-task

**Expected Result:**
- First sub-task depends on the parent task
- Second sub-task depends on the first sub-task
- Third sub-task depends on the second sub-task
- Forms a sequential dependency chain

**Status:** [ ]

### TC4.3: Sub-tasks in Runner Mode
**Steps:**
1. Break down a parent task into sub-tasks
2. Switch to Run mode
3. Complete parent task

**Expected Result:**
- After completing parent task, first sub-task appears
- After completing first sub-task, second appears
- Sequential progression through all sub-tasks

**Status:** [ ]

### TC4.4: Sub-tasks Quality
**Steps:**
1. Test with various parent tasks:
   - "Plan a birthday party"
   - "Write a research paper"
   - "Build a website"
2. Click "Break It Down" on each

**Expected Result:**
- Sub-tasks are relevant and actionable
- Properly formatted (no numbering or bullets)
- Logical sequence of steps

**Status:** [ ]

### TC4.5: Error Handling
**Steps:**
1. Remove/clear API key
2. Try to use "Break It Down"

**Expected Result:**
- Clear error message shown
- App doesn't crash
- User can recover and try again

**Status:** [ ]

### TC4.6: Rate Limiting on Break It Down
**Steps:**
1. Use "Break It Down" feature 11 times rapidly

**Expected Result:**
- After 10 uses, rate limit error appears
- Error message shows wait time
- Feature becomes available after wait period

**Status:** [ ]

---

## Test Case 5: Integration Tests

### TC5.1: Complete Workflow
**Steps:**
1. Configure API key in Settings
2. Generate tasks using AI
3. Break down one task into sub-tasks
4. Set manual dependencies on other tasks
5. Switch to Run mode
6. Complete tasks observing dependency behavior

**Expected Result:**
- All features work together seamlessly
- Dependencies are respected
- No conflicts or errors

**Status:** [ ]

### TC5.2: Data Persistence
**Steps:**
1. Create tasks with dependencies
2. Refresh the page
3. Check that all data persists

**Expected Result:**
- Tasks remain
- Dependencies remain
- Completion state remains

**Status:** [ ]

### TC5.3: Export/Import with New Fields
**Steps:**
1. Create tasks with multiple dependencies
2. Export data
3. Clear all data
4. Import the exported data

**Expected Result:**
- All tasks restored correctly
- Multiple dependencies preserved
- New `dependencies` field supported

**Status:** [ ]

---

## Test Case 6: Edge Cases

### TC6.1: Circular Dependencies Prevention
**Steps:**
1. Create Task A depending on Task B
2. Try to make Task B depend on Task A

**Expected Result:**
- System allows this (user responsibility)
- Both tasks remain hidden in Run mode
- No infinite loop or crash

**Status:** [ ]

### TC6.2: Self-Dependency Prevention
**Steps:**
1. Try to make a task depend on itself

**Expected Result:**
- Task is not shown in its own dependencies list
- Self-dependency is impossible

**Status:** [ ]

### TC6.3: Delete Task with Dependents
**Steps:**
1. Create Task A and Task B (B depends on A)
2. Delete Task A

**Expected Result:**
- Task A is deleted
- Task B's dependency remains but becomes invalid
- Task B becomes visible (no valid dependency)

**Status:** [ ]

### TC6.4: Break It Down on Empty Task
**Steps:**
1. Create a task with very short title like "X"
2. Click "Break It Down"

**Expected Result:**
- Either generates reasonable sub-tasks
- Or shows appropriate error message
- Doesn't crash

**Status:** [ ]

---

## Browser Compatibility Tests

### TC7.1: Chrome
**Expected:** All features work correctly

**Status:** [ ]

### TC7.2: Firefox
**Expected:** All features work correctly

**Status:** [ ]

### TC7.3: Safari
**Expected:** All features work correctly

**Status:** [ ]

### TC7.4: Mobile Responsive
**Expected:** UI is usable on mobile devices

**Status:** [ ]

---

## Performance Tests

### TC8.1: Large Number of Tasks
**Steps:**
1. Create 50+ tasks
2. Set various dependencies
3. Test responsiveness

**Expected Result:**
- App remains responsive
- No lag in UI
- Dependencies calculate correctly

**Status:** [ ]

### TC8.2: Complex Dependency Graph
**Steps:**
1. Create 20 tasks with interconnected dependencies
2. Switch to Run mode
3. Complete tasks in sequence

**Expected Result:**
- Dependencies resolve correctly
- No performance degradation

**Status:** [ ]

---

## Summary

Total Test Cases: 40+
- API Configuration: 5 tests
- Rate Limiting: 4 tests
- Sub-dependencies: 8 tests
- Break It Down: 6 tests
- Integration: 3 tests
- Edge Cases: 4 tests
- Browser Compatibility: 4 tests
- Performance: 2 tests

**Testing Status:** Ready for manual testing
**Automated Testing:** Not implemented (manual testing recommended)
