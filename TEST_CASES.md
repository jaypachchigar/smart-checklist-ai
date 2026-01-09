# Comprehensive Test Cases for Sub-Dependency Visual Hierarchy

## Test Environment
- Browser: Chrome, Firefox, Safari
- Device: Desktop (1920x1080), Tablet (768px), Mobile (375px)
- Mode: Run Mode (where visual hierarchy is displayed)

---

## Test Case 1: Single Parent with Multiple Sub-Tasks
**Setup:**
```
Build Mode:
1. Add task: "Plan Birthday Party"
2. Click "Break It Down"
3. AI generates 3-4 sub-tasks
```

**Expected Result in Run Mode:**
```
□ Plan Birthday Party [+4 more]  ← Green border, green background
```

**After Completing Parent:**
```
☑ Plan Birthday Party
    ├── [SUB-TASK] ↳ Choose venue
    ├── [SUB-TASK] ↳ Send invitations
    ├── [SUB-TASK] ↳ Order cake
    └── [SUB-TASK] ↳ Buy decorations
```

**Verify:**
- ✅ Parent shows green border before completion
- ✅ Parent shows "+4 more" badge with pulsing animation
- ✅ Sub-tasks appear ONLY after parent is checked
- ✅ Sub-tasks have blue gradient background
- ✅ Sub-tasks have "SUB-TASK" badge
- ✅ Sub-tasks have blue arrow (↳) indicator
- ✅ Connecting lines visible (horizontal + vertical)
- ✅ 32px indentation from parent
- ✅ Slide-in animation when appearing
- ✅ Clicking anywhere on task checks it (not just checkbox)
- ✅ Hover shows elevated effect

---

## Test Case 2: Multiple Parents with Sub-Tasks
**Setup:**
```
Build Mode:
1. Add task: "Morning Routine"
   - Break It Down → 3 sub-tasks
2. Add task: "Work Tasks"
   - Break It Down → 4 sub-tasks
3. Add task: "Evening Routine"
   - Break It Down → 2 sub-tasks
```

**Expected Result:**
```
□ Morning Routine [+3 more]
□ Work Tasks [+4 more]
□ Evening Routine [+2 more]
```

**After Completing "Morning Routine":**
```
☑ Morning Routine
    ├── [SUB-TASK] ↳ Wake up at 6 AM
    ├── [SUB-TASK] ↳ Exercise for 30 minutes
    └── [SUB-TASK] ↳ Eat healthy breakfast
□ Work Tasks [+4 more]
□ Evening Routine [+2 more]
```

**Verify:**
- ✅ Each parent task has its own "+X more" badge
- ✅ Sub-tasks appear ONLY under their parent
- ✅ Other parents remain unchanged
- ✅ Visual hierarchy clear for each group
- ✅ No overlap between groups
- ✅ Vertical lines don't connect different groups

---

## Test Case 3: Parent with No Sub-Tasks + Parent with Sub-Tasks
**Setup:**
```
Build Mode:
1. Add task: "Buy Groceries" (no Break It Down)
2. Add task: "Cook Dinner"
   - Break It Down → 3 sub-tasks
3. Add task: "Clean Kitchen" (no Break It Down)
```

**Expected Result:**
```
□ Buy Groceries                    ← Regular gray border
□ Cook Dinner [+3 more]            ← Green border
□ Clean Kitchen                    ← Regular gray border
```

**Verify:**
- ✅ Only "Cook Dinner" has green border
- ✅ Only "Cook Dinner" has "+3 more" badge
- ✅ Other tasks have normal styling
- ✅ Clear visual distinction

---

## Test Case 4: Sequential Completion
**Setup:**
```
Parent: "Write Report"
Sub-tasks:
  1. Research topic
  2. Create outline
  3. Write draft
  4. Review and edit
```

**Step-by-Step:**
1. **Initial State:**
   ```
   □ Write Report [+4 more]
   ```

2. **After completing parent:**
   ```
   ☑ Write Report
       ├── [SUB-TASK] ↳ Research topic
       ├── [SUB-TASK] ↳ Create outline
       ├── [SUB-TASK] ↳ Write draft
       └── [SUB-TASK] ↳ Review and edit
   ```

3. **After completing "Research topic":**
   ```
   ☑ Write Report
       ├── [SUB-TASK] ↳ Research topic ☑
       ├── [SUB-TASK] ↳ Create outline
       ├── [SUB-TASK] ↳ Write draft
       └── [SUB-TASK] ↳ Review and edit
   ```

**Verify:**
- ✅ All sub-tasks visible after parent completion
- ✅ Completed sub-tasks show strikethrough
- ✅ Remaining sub-tasks stay visible
- ✅ Vertical line connects all sub-tasks
- ✅ No visual glitches during completion

---

## Test Case 5: Click Interaction
**Test clicking behavior on:**
1. **Checkbox directly** → Should toggle
2. **Task text** → Should toggle
3. **Empty space in task row** → Should toggle
4. **"SUB-TASK" badge** → Should toggle
5. **Arrow indicator** → Should toggle

**Verify:**
- ✅ Entire task row is clickable
- ✅ Cursor shows pointer on hover
- ✅ Visual feedback on hover (elevation)
- ✅ Active state on click (press down)
- ✅ No double-toggle issues

---

## Test Case 6: Mobile Responsiveness
**Test on 375px width device:**

**Verify:**
- ✅ Sub-tasks indented 24px (not 32px)
- ✅ Horizontal connecting line 16px (not 24px)
- ✅ "SUB-TASK" badge readable (9px font)
- ✅ Arrow indicator scaled down
- ✅ "+X more" badge readable
- ✅ Touch targets large enough (44px minimum)
- ✅ No horizontal scroll
- ✅ Text doesn't overflow

---

## Test Case 7: Long Task Titles
**Setup:**
```
Parent: "Organize and execute a comprehensive quarterly business review meeting with all department heads and stakeholders"
Sub-task: "Prepare detailed financial reports including revenue, expenses, profit margins, and cash flow analysis"
```

**Verify:**
- ✅ Text wraps properly
- ✅ Connecting lines still align correctly
- ✅ Indentation maintained
- ✅ Badge placement correct
- ✅ No overlap with other elements

---

## Test Case 8: Empty States
**Test:**
1. **No tasks at all** → "Nothing to do yet"
2. **All tasks completed** → "All done"
3. **All visible tasks completed, sub-tasks hidden** → "Complete the tasks above to unlock more"

**Verify:**
- ✅ Appropriate message shown
- ✅ No visual errors
- ✅ Clean layout

---

## Test Case 9: Animation and Performance
**Test:**
1. Complete parent task with 10 sub-tasks
2. Watch animation of sub-tasks appearing

**Verify:**
- ✅ Smooth slide-in animation (0.3s)
- ✅ No lag or jank
- ✅ All tasks animate simultaneously
- ✅ Connecting lines appear correctly
- ✅ No flickering

---

## Test Case 10: Color Contrast and Accessibility
**Verify:**
- ✅ "SUB-TASK" badge has sufficient contrast (WCAG AA)
- ✅ Blue text on light background readable
- ✅ Green parent indicators visible
- ✅ Connecting lines visible but not overwhelming
- ✅ Hover states provide clear feedback
- ✅ Focus states visible for keyboard navigation

---

## Test Case 11: Browser Compatibility
**Test on:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Verify:**
- ✅ Gradient backgrounds render correctly
- ✅ CSS animations work
- ✅ ::before and ::after pseudo-elements display
- ✅ Box shadows render
- ✅ Transform effects work
- ✅ Cursor pointer shows
- ✅ Click handlers work

---

## Test Case 12: Stress Test - Many Sub-Tasks
**Setup:**
```
Parent: "Complete Project"
Sub-tasks: 20+ items
```

**Verify:**
- ✅ All sub-tasks render correctly
- ✅ Vertical line extends to all sub-tasks
- ✅ Performance remains smooth
- ✅ Scrolling works properly
- ✅ No visual overflow issues
- ✅ Last sub-task's line ends correctly

---

## Test Case 13: Mixed Completion States
**Setup:**
```
☑ Task 1 (completed parent)
    ├── [SUB-TASK] ↳ Sub 1.1 ☑
    ├── [SUB-TASK] ↳ Sub 1.2
    └── [SUB-TASK] ↳ Sub 1.3
□ Task 2 (pending parent with hidden subs) [+3 more]
□ Task 3 (regular task, no subs)
```

**Verify:**
- ✅ Completed tasks show strikethrough
- ✅ Pending tasks normal style
- ✅ Green border only on Task 2
- ✅ Sub-tasks only visible under Task 1
- ✅ Visual hierarchy clear across all states

---

## Test Case 14: Unchecking Tasks
**Test:**
1. Complete parent → Sub-tasks appear
2. Complete all sub-tasks
3. **Uncheck parent task**

**Expected:**
- Sub-tasks should disappear (dependencies not met)
- Parent task shows "+X more" badge again

**Verify:**
- ✅ Sub-tasks hide when parent unchecked
- ✅ Badge reappears on parent
- ✅ No visual glitches
- ✅ Smooth transition

---

## Test Case 15: Rapid Clicking
**Test:**
1. Click parent task rapidly 5 times
2. Click sub-task rapidly 5 times

**Verify:**
- ✅ Toggle works consistently
- ✅ No duplicate animations
- ✅ State remains consistent
- ✅ No UI freeze or lag

---

## Visual Checklist for Each Test:

For every test case above, verify these visual elements:

### Parent Tasks (with sub-tasks):
- [ ] Green left border (3px solid #16a34a)
- [ ] Light green background (#f0fdf4)
- [ ] "+X more" badge visible
- [ ] Pulsing animation on badge
- [ ] Tooltip on hover showing "Complete this to unlock X sub-tasks"
- [ ] Cursor pointer on hover
- [ ] Elevation effect on hover

### Sub-Tasks:
- [ ] Blue gradient background (#e0f2fe → #f0f9ff)
- [ ] Thick blue left border (6px solid #2563eb)
- [ ] "SUB-TASK" badge in blue with white text
- [ ] Blue arrow (↳) indicator
- [ ] Horizontal connecting line (24px, 2px, #3b82f6)
- [ ] Vertical spine line (3px, #93c5fd)
- [ ] 32px indentation from parent
- [ ] Slide-in animation on appearance
- [ ] Box shadow for depth
- [ ] Hover effect (elevation + darker gradient)
- [ ] Cursor pointer on hover

### Connecting Lines:
- [ ] Horizontal line from spine to each sub-task
- [ ] Vertical line starts at first sub-task
- [ ] Vertical line ends at last sub-task
- [ ] Lines align properly with task rows
- [ ] No gaps or overlaps

---

## Success Criteria:
✅ All 15 test cases pass
✅ Visual checklist verified for each case
✅ No console errors
✅ Performance smooth on all devices
✅ Works across all major browsers
✅ Accessible and easy to understand for non-technical users
