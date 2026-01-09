# Visual Guide: Sub-Task Hierarchy System

## 🎨 Quick Visual Reference

### Before Completing Parent Task
```
┌─────────────────────────────────────────────┐
│ □  Plan Birthday Party            [+4 more] │ ← Green border
│                                   ⚠️ Pulsing │ ← Light green bg
└─────────────────────────────────────────────┘
   ↑
   Click anywhere on this row to complete!
```

### After Completing Parent Task
```
┌─────────────────────────────────────────────┐
│ ☑  Plan Birthday Party                      │ ← Completed
└─────────────────────────────────────────────┘
    │
    │  32px indentation →
    │
    ├── ┌───────────────────────────────────────┐
    │   │ □ [SUB-TASK] ↳ Choose venue          │ ← Blue gradient
    │   └───────────────────────────────────────┘    Blue border
    │
    ├── ┌───────────────────────────────────────┐
    │   │ □ [SUB-TASK] ↳ Send invitations      │
    │   └───────────────────────────────────────┘
    │
    ├── ┌───────────────────────────────────────┐
    │   │ □ [SUB-TASK] ↳ Order cake            │
    │   └───────────────────────────────────────┘
    │
    └── ┌───────────────────────────────────────┐
        │ □ [SUB-TASK] ↳ Buy decorations       │
        └───────────────────────────────────────┘
```

---

## 🎯 Color Coding System

### Parent Tasks (with hidden sub-tasks)
- **Border:** 3px solid GREEN (#16a34a)
- **Background:** Light green (#f0fdf4)
- **Badge:** "+X more" in green with pulsing animation
- **Meaning:** "I have hidden sub-tasks! Complete me to unlock them!"

### Sub-Tasks
- **Border:** 6px solid BLUE (#2563eb)
- **Background:** Blue gradient (#e0f2fe → #f0f9ff)
- **Badge:** "SUB-TASK" in blue with white text
- **Arrow:** Bold blue ↳ symbol
- **Meaning:** "I'm a smaller step of the task above me!"

### Regular Tasks (no sub-tasks)
- **Border:** 1px solid gray (#e5e5e5)
- **Background:** Light gray (#fafafa)
- **Meaning:** "I'm a standalone task"

---

## 🖱️ Interaction Guide

### Clicking Behavior
```
┌─────────────────────────────────────────────┐
│ ← Click ANYWHERE in this area to check/uncheck
│ □ [SUB-TASK] ↳ Research topic              │
│                ↑ ← Click here works too!    │
└─────────────────────────────────────────────┘
```

**You can click:**
- ✅ The checkbox
- ✅ The task text
- ✅ The "SUB-TASK" badge
- ✅ The arrow indicator (↳)
- ✅ Empty space in the row

**Visual Feedback:**
- Cursor changes to pointer (👆)
- Task elevates slightly on hover
- Shadow appears on hover
- Task presses down on click

---

## 📱 Connecting Lines Explained

### Horizontal Line
```
    │
    ├────→ [SUB-TASK] ↳ Task 1
    │  ↑
    │  24px wide, 2px thick, blue
    │
```
- Connects each sub-task to the vertical spine
- Shows "this task belongs to the group"

### Vertical Spine
```
    │ ← 3px wide, light blue
    │
    ├── [SUB-TASK] ↳ Task 1
    │
    ├── [SUB-TASK] ↳ Task 2
    │
    └── [SUB-TASK] ↳ Task 3
        ↑
        Line ends at last sub-task
```
- Connects all sub-tasks in a group
- Starts at first sub-task's center
- Ends at last sub-task's center
- Creates visual "tree branch" effect

---

## 📐 Spacing and Layout

### Desktop (1920px+)
```
Parent Task
│
├── 32px indent → [SUB-TASK] Task 1
│                  ↑
│                  24px connecting line
│
└── 32px indent → [SUB-TASK] Task 2
```

### Mobile (375px)
```
Parent Task
│
├── 24px indent → [SUB-TASK] Task 1
│                  ↑
│                  16px connecting line
│
└── 24px indent → [SUB-TASK] Task 2
```

---

## ✨ Animation Effects

### 1. Sub-Task Appearance
```
When parent is completed:
  ← Slides in from left (0.3s)
  ← Fades in (opacity 0 → 1)

[SUB-TASK] ↳ Research topic
```

### 2. Parent Badge Pulse
```
+3 more
   ↑
Pulses continuously (2s cycle)
Opacity: 1.0 → 0.7 → 1.0
```

### 3. Hover Elevation
```
Regular state:
┌────────────────┐
│ Task Name      │
└────────────────┘

Hover state:
┌────────────────┐
│ Task Name      │ ← Lifts up 1px
└────────────────┘    Shadow appears
```

---

## 🎨 Complete Visual Example

### Example: "Prepare Presentation" Task

**STEP 1: Initial State (Build Mode)**
- User adds "Prepare Presentation"
- User clicks "Break It Down"
- AI generates 4 sub-tasks (invisible to user in Build mode)

**STEP 2: Run Mode - Before Completion**
```
┌────────────────────────────────────────────────┐
│ □  Prepare Presentation          💚 [+4 more] │ Green border
│                                      ⚠️ Pulsing │ Green background
└────────────────────────────────────────────────┘
    ↑
    "Complete this to unlock 4 sub-tasks" (tooltip)
```

**STEP 3: User Clicks Parent (Anywhere on Row)**
```
┌────────────────────────────────────────────────┐
│ ☑  Prepare Presentation                        │ Completed
└────────────────────────────────────────────────┘
    │
    │ ← Vertical spine appears
    │
    ├── ┌──────────────────────────────────────────┐
    │   │ 💙 □ [SUB-TASK] ↳ Research topic        │ Slides in
    │   └──────────────────────────────────────────┘ Blue gradient
    │
    ├── ┌──────────────────────────────────────────┐
    │   │ 💙 □ [SUB-TASK] ↳ Create outline        │ Slides in
    │   └──────────────────────────────────────────┘
    │
    ├── ┌──────────────────────────────────────────┐
    │   │ 💙 □ [SUB-TASK] ↳ Design slides         │ Slides in
    │   └──────────────────────────────────────────┘
    │
    └── ┌──────────────────────────────────────────┐
        │ 💙 □ [SUB-TASK] ↳ Practice delivery     │ Slides in
        └──────────────────────────────────────────┘
```

**STEP 4: User Completes First Sub-Task**
```
☑  Prepare Presentation
    │
    ├── ☑ [SUB-TASK] ↳ Research topic        ← Strikethrough
    ├── □ [SUB-TASK] ↳ Create outline
    ├── □ [SUB-TASK] ↳ Design slides
    └── □ [SUB-TASK] ↳ Practice delivery
```

**STEP 5: All Done!**
```
☑  Prepare Presentation
    ├── ☑ [SUB-TASK] ↳ Research topic
    ├── ☑ [SUB-TASK] ↳ Create outline
    ├── ☑ [SUB-TASK] ↳ Design slides
    └── ☑ [SUB-TASK] ↳ Practice delivery

    🎉 All tasks completed!
```

---

## 🧪 Testing Quick Reference

### What to Look For:

#### ✅ Visual Elements Present:
1. Green border on parent tasks with sub-tasks
2. "+X more" badge with pulsing animation
3. Blue gradient background on sub-tasks
4. "SUB-TASK" badge on every sub-task
5. Blue arrow (↳) before sub-task text
6. Horizontal connecting lines
7. Vertical spine connecting all sub-tasks
8. 32px indentation (24px on mobile)

#### ✅ Interactions Work:
1. Click anywhere on task to toggle
2. Cursor shows pointer on hover
3. Task elevates on hover
4. Parent completion reveals sub-tasks
5. Sub-tasks slide in smoothly
6. Completion state updates correctly

#### ✅ Responsive Design:
1. Works on desktop (1920px)
2. Works on tablet (768px)
3. Works on mobile (375px)
4. No horizontal scroll
5. Text wraps properly
6. Touch targets large enough

---

## 🎯 For Non-Technical Users

### What Each Color Means:
- **GREEN** = "Finish me first to unlock more tasks!"
- **BLUE** = "I'm a smaller step of the task above me"
- **GRAY** = "I'm a regular task"

### How to Use:
1. See a green task with "+X more"? → Click it to unlock hidden tasks!
2. After clicking, blue sub-tasks appear below → Complete them one by one
3. Click anywhere on a task row to check it off (not just the checkbox!)
4. Lines show which tasks belong together
5. Complete all blue tasks to finish that section

### Visual Cues:
- **Pulsing badge** = Attention! Hidden tasks here!
- **Blue border + gradient** = This is a sub-task
- **Lines connecting tasks** = These are related
- **Indentation** = This task is "inside" the one above
- **Pointer cursor** = You can click this!

---

## 🚀 Summary

This visual hierarchy system makes it **impossible to miss** the relationship between tasks:

1. ✅ **Color coding** - Green = parent, Blue = sub-task
2. ✅ **Badges** - "SUB-TASK" label on every sub-task
3. ✅ **Connecting lines** - Visual tree structure
4. ✅ **Indentation** - Physical nesting
5. ✅ **Animations** - Smooth transitions
6. ✅ **Click anywhere** - Easy interaction
7. ✅ **Mobile friendly** - Works on all devices

**Result:** Even non-technical users instantly understand the task hierarchy!
