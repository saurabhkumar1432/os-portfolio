# Keyboard Shortcuts & Accessibility Guide

## Global Keyboard Shortcuts

### Window Management
| Shortcut | Action |
|----------|--------|
| `Alt + Tab` | Switch between open windows |
| `Alt + F4` | Close active window |
| `Alt + Space` | Open window menu |
| `Win + D` | Minimize all windows / Show desktop |
| `Win + M` | Minimize active window |

### Application Shortcuts
| Shortcut | Action |
|----------|--------|
| `Win + E` | Open File Explorer |
| `Win + T` | Open Terminal |
| `Win + S` | Open Search |
| `Ctrl + N` | New file/note (in applicable apps) |
| `Ctrl + O` | Open file (in applicable apps) |
| `Ctrl + S` | Save (in applicable apps) |
| `Ctrl + W` | Close current window |

### Desktop Navigation
| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate to next icon |
| `Shift + Tab` | Navigate to previous icon |
| `Arrow Keys` | Navigate between desktop icons |
| `Enter` | Open selected icon/item |
| `Space` | Select/deselect icon |
| `Ctrl + A` | Select all icons |
| `Escape` | Close context menus and cancel operations |

### Context Menus
| Shortcut | Action |
|----------|--------|
| `Right-click` or `Shift + F10` | Open context menu |
| `Arrow Keys` | Navigate menu items |
| `Enter` | Select menu item |
| `Escape` | Close menu |

---

## App-Specific Shortcuts

### Terminal
| Shortcut | Action |
|----------|--------|
| `Ctrl + C` | Cancel current command |
| `Ctrl + L` | Clear screen |
| `Arrow Up/Down` | Command history |
| `Tab` | Auto-complete (if implemented) |

### Notepad
| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New note |
| `Ctrl + S` | Save note |
| `Ctrl + C` | Copy selected text |
| `Ctrl + V` | Paste text |
| `Ctrl + X` | Cut selected text |
| `Ctrl + A` | Select all text |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |

### File Explorer
| Shortcut | Action |
|----------|--------|
| `Backspace` | Go up one folder |
| `Enter` | Open selected file/folder |
| `Delete` | Delete selected file/folder |
| `F2` | Rename selected item |
| `Ctrl + C` | Copy path |
| `Arrow Keys` | Navigate files |

### Screenshot Tool
| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New screenshot |
| `Ctrl + S` | Save screenshot |
| `Ctrl + C` | Copy to clipboard |
| `Delete` | Delete current screenshot |
| `Escape` | Cancel capture |

### Task Manager
| Shortcut | Action |
|----------|--------|
| `Delete` | End selected task |
| `Tab` | Navigate table |
| `Arrow Keys` | Select process |
| `Enter` | View process details |

### Color Picker
| Shortcut | Action |
|----------|--------|
| `Ctrl + C` | Copy current color |
| `Space` | Save current color |
| `Ctrl + R` | Random color |
| `Arrow Keys` | Fine-tune color (when canvas focused) |

---

## Accessibility Features

### Screen Reader Support

#### ARIA Labels
All interactive elements have proper labels:
- Buttons: `aria-label="Descriptive action"`
- Form inputs: Associated `<label>` elements
- Icons: `aria-hidden="true"` for decorative icons
- Status updates: `aria-live` regions for dynamic content

#### Semantic HTML
- Proper heading hierarchy (`<h1>`, `<h2>`, etc.)
- Landmark regions (`<nav>`, `<main>`, `<aside>`)
- List structures for navigation
- Table structure for data grids

#### Focus Management
- Visible focus indicators on all interactive elements
- Focus trap in modal dialogs
- Logical tab order
- Skip links to main content

### Visual Accessibility

#### High Contrast Mode
- Toggle via Settings app
- Increased contrast ratios
- Bold borders and outlines
- Clear visual separation

#### Dark Mode
- Toggle via Settings app or system preference
- Reduced eye strain in low-light
- All apps support dark theme
- Smooth transitions between modes

#### Text Scaling
- Respects browser/system font size settings
- Relative units (rem, em) used throughout
- No fixed pixel fonts
- Maintains layout at larger sizes

#### Color Blindness Support
- Not relying solely on color for information
- Text labels with color codes
- Icons and patterns in addition to colors
- Multiple visual cues for status

### Motor Accessibility

#### Large Click Targets
- Minimum 44×44px touch targets
- Generous padding on buttons
- Large icons on desktop
- Easy-to-click context menus

#### Keyboard-Only Operation
- Full keyboard navigation support
- No mouse-required features
- Visible focus indicators
- Logical tab order

#### Reduce Motion
- Respects `prefers-reduced-motion`
- Animations can be disabled
- Smooth transitions without motion sickness triggers
- Essential animations only

---

## Touch & Mobile Accessibility

### Touch Gestures
| Gesture | Action |
|---------|--------|
| **Tap** | Select/activate |
| **Long press** | Open context menu |
| **Swipe left/right** | Navigate (in applicable apps) |
| **Pinch to zoom** | Zoom in/out (where supported) |
| **Two-finger scroll** | Scroll content |

### Mobile Optimizations
- Touch-friendly button sizes (min 44×44px)
- No hover-dependent features
- Swipe navigation in windows
- Bottom-aligned important actions
- Single-column layouts on small screens

---

## Customization Options

### Via Settings App

#### Appearance
- **Theme**: Light, Dark, Auto (system)
- **Accent Color**: Multiple color options
- **Icon Size**: Small, Medium, Large
- **Wallpaper**: Multiple options

#### Accessibility
- **High Contrast**: On/Off
- **Reduce Motion**: On/Off
- **Text Size**: 100%, 125%, 150%
- **Screen Reader Mode**: Enhanced labels

#### Input
- **Keyboard Shortcuts**: Enable/disable
- **Touch Gestures**: Configure sensitivity
- **Mouse Speed**: Adjust cursor speed
- **Scroll Speed**: Adjust scroll behavior

---

## Testing Checklist

### Keyboard Navigation
- [ ] Can reach all interactive elements via Tab
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate menus

### Screen Reader
- [ ] All buttons have labels
- [ ] Images have alt text
- [ ] Headings are properly nested
- [ ] Lists use list elements
- [ ] Tables have headers
- [ ] Form inputs have labels

### Visual
- [ ] Sufficient contrast ratios (4.5:1 text, 3:1 large text)
- [ ] No color-only information
- [ ] Text scales properly
- [ ] Works in high contrast mode
- [ ] Works in dark mode

### Motor
- [ ] Large enough click targets (44×44px min)
- [ ] No precision-required actions
- [ ] No time-limited interactions
- [ ] Works with keyboard only
- [ ] Works with touch only

---

## Browser Compatibility

### Fully Supported
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Limited Support
- ⚠️ Safari 13 (no screenshot tool)
- ⚠️ Firefox 87- (limited screen capture)

### Not Supported
- ❌ Internet Explorer 11
- ❌ Legacy Edge (pre-Chromium)

---

## Assistive Technology Compatibility

### Screen Readers
- ✅ **NVDA** (Windows) - Full support
- ✅ **JAWS** (Windows) - Full support
- ✅ **VoiceOver** (macOS/iOS) - Full support
- ✅ **TalkBack** (Android) - Basic support

### Voice Control
- ✅ **Dragon NaturallySpeaking** - Compatible
- ✅ **Windows Speech Recognition** - Compatible
- ✅ **macOS Voice Control** - Compatible

### Screen Magnifiers
- ✅ **ZoomText** - Full support
- ✅ **Windows Magnifier** - Full support
- ✅ **macOS Zoom** - Full support

---

## Accessibility Standards Compliance

### WCAG 2.1 Level AA
- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text
- ✅ **2.1.1 Keyboard**: All functionality keyboard accessible
- ✅ **2.4.7 Focus Visible**: Clear focus indicators
- ✅ **3.2.4 Consistent Identification**: Consistent UI elements
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA labels

### Section 508
- ✅ Keyboard accessible
- ✅ Alternative text for images
- ✅ Sufficient color contrast
- ✅ No flashing content
- ✅ Time-independent interactions

### ADA Compliance
- ✅ Perceivable content
- ✅ Operable interface
- ✅ Understandable information
- ✅ Robust technical implementation

---

## Quick Tips

### For Keyboard Users
1. Press `Tab` to navigate between elements
2. Use `Arrow Keys` on desktop to move between icons
3. Press `Enter` to open items
4. Press `Escape` to close menus and dialogs
5. Hold `Shift` while tabbing to go backwards

### For Screen Reader Users
1. Use heading navigation to jump between sections
2. Use landmark navigation to skip to main content
3. Form mode is automatic on inputs
4. Tables have proper headers for navigation
5. Live regions announce important changes

### For Touch Users
1. Long-press for right-click menu
2. Swipe to navigate in windows
3. Pinch to zoom in supported apps
4. Double-tap to open items
5. Two-finger scroll for content

### For Users with Motor Disabilities
1. Increase icon size in Settings
2. Use keyboard shortcuts instead of mouse
3. Enable high contrast for better visibility
4. No time limits on any interactions
5. Large click targets throughout

---

## Getting Help

### Accessibility Support
If you encounter any accessibility barriers:

1. **Report Issues**: Document the barrier you encountered
2. **Suggest Improvements**: Share how we could make it better
3. **Test with Us**: Help test accessibility features
4. **Share Feedback**: Let us know what works and what doesn't

### Resources
- [WebAIM](https://webaim.org/) - Web accessibility resources
- [A11y Project](https://www.a11yproject.com/) - Accessibility best practices
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Official standards

---

## Continuous Improvement

We're committed to improving accessibility:
- Regular accessibility audits
- User testing with assistive technology users
- Following WCAG 2.1 Level AA standards
- Implementing user feedback
- Staying up-to-date with best practices

**Your feedback helps make this better for everyone!**
