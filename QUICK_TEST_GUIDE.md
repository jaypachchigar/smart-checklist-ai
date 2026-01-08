# Quick Test Guide
**Ready to test in 5 minutes!**

The application is running at: **http://localhost:3000**

---

## Test 1: API Key Configuration (2 minutes)

### Steps:
1. **Open** http://localhost:3000 in your browser
2. **Click** the ⚙️ Settings icon in the top right
3. **Enter** a test API key (or your real Gemini API key from https://aistudio.google.com/apikey)
   ```
   Test key: AIzaSyAGu5qWicsOMM_fhzxMXx7W5NreMACE7xE
   ```
4. **Click** the 👁️ eye icon to toggle visibility
5. **Click** "Save" - should show "Saved!"
6. **Close** the modal and **reopen** - key should still be there
7. **Click** "Clear" to remove the key

### ✅ Success If:
- Modal opens and closes smoothly
- API key is masked (•••) by default
- Eye icon shows/hides the key
- Key persists after reopening modal

---

## Test 2: Sub-dependencies (3 minutes)

### Steps:
1. **Switch** to "Build" mode
2. **Add** three tasks:
   - "Buy ingredients"
   - "Prep kitchen"
   - "Cook meal"

3. **On "Prep kitchen":**
   - Click "Dependencies (0)"
   - ✅ Check "Buy ingredients"
   - Should show "Dependencies (1)"

4. **On "Cook meal":**
   - Click "Dependencies (0)"
   - ✅ Check both "Buy ingredients" AND "Prep kitchen"
   - Should show "Dependencies (2)"

5. **Switch** to "Run" mode
6. **Observe:** Only "Buy ingredients" is visible

7. **Complete** "Buy ingredients" (click checkbox)
8. **Observe:** Now "Prep kitchen" appears

9. **Complete** "Prep kitchen"
10. **Observe:** Now "Cook meal" appears (both dependencies satisfied)

### ✅ Success If:
- Dependencies checkboxes work
- Counter shows correct number
- In Run mode, tasks appear ONLY after dependencies complete
- "Cook meal" requires BOTH dependencies before appearing

---

## Test 3: Break It Down Feature (2 minutes)

### Steps:
1. **Switch** to "Build" mode
2. **Add** a task: "Plan a vacation"
3. **Click** "Break It Down" button
4. **Wait** for AI to respond (shows "Thinking...")
5. **Check** the generated sub-tasks appear
6. **Expand** dependencies on each sub-task:
   - First sub-task should depend on "Plan a vacation"
   - Second sub-task should depend on first sub-task
   - Third sub-task should depend on second sub-task

7. **Switch** to "Run" mode
8. **Complete** "Plan a vacation"
9. **Observe:** First sub-task appears
10. **Complete** first sub-task
11. **Observe:** Second sub-task appears (sequential)

### ✅ Success If:
- Button shows "Thinking..." while loading
- 3-5 relevant sub-tasks are created
- Success message appears
- Dependencies form a proper chain
- In Run mode, sub-tasks appear one at a time

---

## Test 4: Rate Limiting (2 minutes)

### Quick Test:
1. **Go** to "Build" mode
2. **Add** a task: "test"
3. **Rapidly click** "Rephrase" button 15+ times

### ✅ Success If:
- First 10 requests work
- 11th request shows error: "Rate limit exceeded. Please wait XX seconds..."
- Error message shows specific wait time
- After waiting, requests work again

### Advanced Test (Optional):
1. Open **Browser DevTools** (F12)
2. Go to **Network** tab
3. Make an AI request (Rephrase or Generate)
4. **Click** the request and check **Headers**
5. Look for:
   ```
   X-RateLimit-Limit: 10
   X-RateLimit-Remaining: 9
   X-RateLimit-Reset: [timestamp]
   ```

---

## Test 5: Complete Workflow (5 minutes)

### Realistic Scenario:
1. **Settings:** Enter your API key
2. **Generate:** Use AI to generate tasks for "Launch a product"
3. **Break Down:** Select one task and use "Break It Down"
4. **Dependencies:** Add manual dependencies between some tasks
5. **Run:** Switch to Run mode and complete tasks
6. **Export:** Click Export button and save JSON
7. **Import:** Clear everything and import the JSON back

### ✅ Success If:
- All features work together seamlessly
- Dependencies are respected
- Data persists after page refresh
- Export/Import maintains all data

---

## Visual Checklist

### What You Should See:

**Settings Button:**
```
┌──────────────────────────────────────┐
│  Checklist              ⚙️ Build Run  │
└──────────────────────────────────────┘
```

**Settings Modal:**
```
┌────────────────────────────────────┐
│  Settings                      ✕   │
│                                    │
│  Google Gemini API Key             │
│  [••••••••••••••••••] 👁️          │
│                                    │
│  [Save]  [Clear]                   │
└────────────────────────────────────┘
```

**Dependencies Section:**
```
┌────────────────────────────────────┐
│  Task: Cook meal                   │
│                                    │
│  ⚡ Dependencies (2)               │
│    ☑️ Buy ingredients              │
│    ☑️ Prep kitchen                 │
│    ☐ Set table                     │
│                                    │
│  [Rephrase] [Break It Down]        │
└────────────────────────────────────┘
```

**Run Mode with Dependencies:**
```
Build Mode:                Run Mode (nothing done):
- Buy ingredients          - Buy ingredients
- Prep kitchen                (Prep kitchen hidden)
- Cook meal                   (Cook meal hidden)

Run Mode (Buy ingredients ✓):
- ✓ Buy ingredients
- Prep kitchen             ← Now visible!
   (Cook meal hidden)

Run Mode (Both done ✓):
- ✓ Buy ingredients
- ✓ Prep kitchen
- Cook meal                ← Now visible!
```

---

## Common Issues & Solutions

### Issue: Settings button not visible
**Solution:** Make sure the app loaded completely. Check for errors in browser console (F12).

### Issue: "Break It Down" returns error
**Solution:**
1. Check you have a valid API key configured
2. Verify API key in Settings
3. Check you haven't hit rate limit (wait 60 seconds)

### Issue: Dependencies not working
**Solution:**
1. Make sure you're in "Run" mode (not Build mode)
2. Verify dependencies are set correctly in Build mode
3. Check that dependent tasks are actually completed

### Issue: Rate limit not working as expected
**Solution:**
- Rate limit is per IP address
- Resets every 60 seconds (rolling window)
- Dev server restarts reset the counter

---

## Expected Test Results

| Test | Time | Expected Result |
|------|------|-----------------|
| API Key Config | 2 min | ✅ Settings work, key persists |
| Sub-dependencies | 3 min | ✅ Multiple deps work, tasks appear in sequence |
| Break It Down | 2 min | ✅ Creates sub-tasks with proper chain |
| Rate Limiting | 2 min | ✅ Limit enforced, clear error message |
| Complete Workflow | 5 min | ✅ All features integrate smoothly |

**Total Testing Time: ~15 minutes**

---

## Test Completion Checklist

Mark each as you complete:

- [ ] ⚙️ Settings modal opens and saves API key
- [ ] 🔒 API key is masked and toggleable
- [ ] 📋 Dependencies checkboxes work
- [ ] 🔗 Multiple dependencies require ALL to complete
- [ ] 🔍 "Break It Down" creates sub-tasks
- [ ] ⛓️ Sub-tasks form proper dependency chain
- [ ] 🚫 Rate limit enforced after 10 requests
- [ ] ⏱️ Rate limit shows specific wait time
- [ ] 💾 Data persists after page refresh
- [ ] 📤 Export/Import works correctly

---

## Ready to Test?

**Development server is running at:** http://localhost:3000

1. Open that URL in your browser
2. Follow the tests above in order
3. Check off each item as you complete it
4. Report any issues you find

**Happy Testing! 🚀**
