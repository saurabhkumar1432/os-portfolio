# 🎮 Testing Guide - New Features

## 🌐 Server Running: http://localhost:5173/

---

## ✅ All Features Ready to Test!

### 🎯 Quick Feature Overview:

| # | Feature | Access Method | Keyboard Shortcut |
|---|---------|---------------|-------------------|
| 1 | Command Palette | Ctrl+K | `Ctrl + K` |
| 2 | Notifications | Bell icon in system tray | - |
| 3 | **Quick Settings** ⚙️ | Settings icon in system tray | - |
| 4 | **Window Peek** 🖼️ | Hover taskbar button 500ms | - |
| 5 | **Calculator** 🧮 | Desktop icon / Start menu | - |

---

## 🧪 Step-by-Step Testing Guide

### 1️⃣ Quick Settings Panel ⚙️

**Location:** System tray (bottom-right corner)

#### Test Steps:
1. Look at the bottom-right of the screen
2. Find the **Settings icon** ⚙️ (before the bell icon)
3. Click the settings icon
4. ✅ Panel should slide in from the right

#### What to Test:
```
✓ Theme Switcher:
  - Click "Light" → Should switch to light theme instantly
  - Click "Dark" → Should switch to dark theme instantly
  - Click "Auto" → Should use system preference

✓ System Sounds:
  - Toggle ON/OFF → Icon should change
  - Setting should persist

✓ Reduce Motion:
  - Toggle ON/OFF → Affects animation speed
  - Try with Command Palette (Ctrl+K)

✓ Blur Effects:
  - Toggle ON/OFF → Affects glassmorphism
  - Notice panel and command palette

✓ Performance Mode:
  - Click "Balanced" → Default settings
  - Click "Performance" → High quality
  - Click "Power Saver" → Reduced effects

✓ Image Quality:
  - Switch between Low/Medium/High
  - Affects wallpaper rendering

✓ Close Methods:
  - Press Escape → Should close
  - Click outside → Should close
  - Click settings icon again → Should toggle
```

#### Expected Result:
- ✅ Smooth slide-in animation
- ✅ Glassmorphism design (blur + transparency)
- ✅ All toggles work instantly
- ✅ Settings persist after reload
- ✅ Dark/Light theme support

---

### 2️⃣ Window Peek Preview 🖼️

**Location:** Taskbar buttons (bottom)

#### Test Steps:
1. Open a few apps (Projects, Terminal, About)
2. Look at the taskbar buttons at the bottom
3. Hover your mouse over any taskbar button
4. Wait 500ms
5. ✅ Preview should appear above the button

#### What to Test:
```
✓ Hover Detection:
  - Hover for 500ms → Preview appears
  - Move mouse away immediately → Preview should NOT appear
  - Move mouse away after showing → Preview disappears

✓ Preview Content:
  - Shows app icon
  - Shows window title
  - Shows app ID
  - Shows simulated window content

✓ Quick Actions:
  - Click Minimize button (−) → Window minimizes
  - Click Maximize button (□) → Window maximizes/restores
  - Click Close button (×) → Window closes
  - All actions work WITHOUT focusing window first

✓ Click to Focus:
  - Click anywhere on the preview → Window comes to front
  - Preview disappears after clicking

✓ Multiple Windows:
  - Each taskbar button has independent peek
  - Hover different buttons → Each shows correct preview
```

#### Expected Result:
- ✅ Smooth fade + scale animation
- ✅ Intelligent positioning (stays within viewport)
- ✅ Arrow pointing to taskbar button
- ✅ Quick actions work instantly
- ✅ Clean glassmorphism design

---

### 3️⃣ Calculator App 🧮

**Location:** Desktop icon OR Start menu

#### Test Steps:
1. Find **Calculator** icon on desktop (4th icon from top)
   - OR click Start menu → Find Calculator
2. Double-click to open
3. ✅ Calculator window should open

#### What to Test:

**Standard Mode:**
```
✓ Basic Operations:
  1. Click: 5 + 3 = → Should show 8
  2. Click: 10 − 4 = → Should show 6
  3. Click: 7 × 6 = → Should show 42
  4. Click: 20 ÷ 4 = → Should show 5

✓ Decimals:
  1. Click: 5.5 + 2.5 = → Should show 8
  2. Click: 10.5 × 2 = → Should show 21

✓ Special Functions:
  - Click ± → Toggles sign (positive/negative)
  - Click % → Converts to percentage (50 → 0.5)
  - Click C → Clears everything
  - Click CE → Clears current entry
  - Click ⌫ → Deletes last digit

✓ Keyboard Input:
  - Type: 123 + 456 Enter → Should show 579
  - Type: Escape → Should clear
  - Type: Backspace → Should delete digit
```

**Scientific Mode:**
```
✓ Mode Switching:
  - Click "Scientific" button at top
  - Panel should expand to the right
  - Extra buttons appear

✓ Trigonometric:
  - Type: 90 → Click sin → Should show 1 (90° sine)
  - Type: 0 → Click cos → Should show 1 (0° cosine)
  - Type: 45 → Click tan → Should show 1 (45° tangent)

✓ Advanced Functions:
  - Type: 16 → Click √ → Should show 4 (square root)
  - Type: 5 → Click x² → Should show 25 (square)
  - Type: 3 → Click x³ → Should show 27 (cube)
  - Type: 5 → Click n! → Should show 120 (factorial)
  - Click π → Should show 3.14159... (pi)
  - Click e → Should show 2.71828... (Euler's number)

✓ Logarithms:
  - Type: 10 → Click log → Should show 1 (log base 10)
  - Type: 2.71828 → Click ln → Should show ~1 (natural log)
  - Type: 2 → Click eˣ → Should show 7.389... (e^2)

✓ Other:
  - Type: 50 → Click % → Should show 0.5
  - Type: 4 → Click 1/x → Should show 0.25
```

**History:**
```
✓ Calculation History:
  - Do some calculations
  - History appears at bottom
  - Click any history entry → Loads that result
  - Shows last 10 calculations
```

#### Expected Result:
- ✅ All calculations accurate
- ✅ Smooth mode transitions
- ✅ Keyboard works perfectly
- ✅ History displays correctly
- ✅ Beautiful UI with dark/light theme
- ✅ Responsive layout

---

## 🎨 Visual Design Checks

### Consistency Checklist:
```
✓ All panels use glassmorphism (blur + transparency)
✓ Animations are smooth (60fps)
✓ Colors match the theme (blue accents)
✓ Hover states provide feedback
✓ Rounded corners everywhere
✓ Shadows for depth
✓ Typography is consistent
✓ Spacing follows grid
```

### Theme Switching:
```
✓ Open Quick Settings
✓ Switch to Light theme
✓ Check all components update:
  - Quick Settings panel
  - Command Palette (Ctrl+K)
  - Window Peek
  - Calculator
  - Notifications
  - System tray

✓ Switch to Dark theme
✓ Everything should adapt
```

---

## 🎯 Integration Testing

### Feature Interaction Tests:

**Test 1: Multiple Features at Once**
```
1. Open Calculator
2. Open Command Palette (Ctrl+K)
3. Open Quick Settings
4. Hover for Window Peek
→ All should work without conflicts
→ Proper z-index layering
```

**Test 2: Settings Affect Features**
```
1. Open Quick Settings
2. Enable "Reduce Motion"
3. Open Command Palette (Ctrl+K)
→ Animations should be simpler/faster

4. Toggle "Blur Effects" OFF
→ Glassmorphism should reduce/disable
```

**Test 3: Keyboard Navigation**
```
1. Press Ctrl+K → Command Palette opens
2. Press Escape → Closes
3. Click Settings icon → Quick Settings opens
4. Press Escape → Closes
→ Escape key should work universally
```

---

## 🐛 Edge Cases to Test

### Window Peek:
```
✓ Hover and quickly move away → Should not show
✓ Multiple windows open → Each peek independent
✓ Window at edge of screen → Peek stays visible
✓ Minimized window → Peek still works
```

### Quick Settings:
```
✓ Rapid clicking settings icon → No glitches
✓ Change theme while other features open → All update
✓ Toggle settings rapidly → No lag
```

### Calculator:
```
✓ Divide by zero → Handles gracefully (returns 0)
✓ Very large numbers → Handles correctly
✓ Rapid key presses → No missed inputs
✓ Switch modes during calculation → State preserved
```

---

## 📊 Performance Checks

### Load Time:
```
✓ Initial page load under 2 seconds
✓ App launches instantly
✓ No lag when opening panels
✓ Smooth 60fps animations
```

### Memory:
```
✓ Open all features
✓ Use for 5 minutes
✓ Close everything
→ No memory leaks (check DevTools)
```

### Responsiveness:
```
✓ All clicks respond immediately
✓ No delayed animations
✓ Keyboard input instant
✓ Hover detection smooth
```

---

## ✅ Final Checklist

Before considering testing complete:

- [ ] Quick Settings panel works perfectly
- [ ] All theme switches work
- [ ] All toggles respond instantly
- [ ] Window Peek appears on hover
- [ ] Window Peek quick actions work
- [ ] Calculator opens and displays correctly
- [ ] All calculator buttons work
- [ ] Standard mode calculations accurate
- [ ] Scientific mode calculations accurate
- [ ] Keyboard input works everywhere
- [ ] History displays and works
- [ ] All animations smooth
- [ ] Theme switching updates everything
- [ ] No console errors
- [ ] No visual glitches
- [ ] Settings persist after reload

---

## 🎉 Success Criteria

### ✅ PASS if:
- All features work as described
- No console errors
- Smooth animations (60fps)
- Settings persist
- Keyboard shortcuts work
- Visual design consistent
- No performance issues

### ⚠️ NEEDS WORK if:
- Features partially work
- Some console warnings
- Occasional lag
- Minor visual inconsistencies

### ❌ FAIL if:
- Features don't work
- Console errors present
- Severe lag or freezing
- Visual bugs

---

## 🚀 After Testing

### If Everything Works:
```bash
# Build for production
npm run build

# Test production build
npm run preview

# Deploy when ready!
```

### If Issues Found:
Create a list of issues with:
- Feature affected
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

---

## 💡 Pro Tips

### Testing Efficiency:
1. **Start Fresh:** Clear browser cache, hard reload (Ctrl+Shift+R)
2. **DevTools Open:** Keep console open to catch errors
3. **Multiple Browsers:** Test in Chrome, Firefox, Edge
4. **Mobile View:** Toggle device emulation in DevTools
5. **Performance Tab:** Monitor frame rate and memory

### Finding Issues:
- Console errors (red text)
- Network failures (failed requests)
- Visual glitches (misaligned elements)
- Laggy animations (dropped frames)
- State bugs (incorrect values)

---

## 🎊 You're All Set!

**Open:** http://localhost:5173/

**Test all 5 features and enjoy your modern Portfolio OS!** 🚀

### Quick Feature Access:
- **Ctrl+K** → Command Palette
- **Bell icon** → Notifications
- **Settings icon** → Quick Settings
- **Hover taskbar** → Window Peek
- **Desktop icon** → Calculator

### Have Fun Testing! 🎮
