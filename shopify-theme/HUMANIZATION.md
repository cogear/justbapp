# Humanization Updates - b. Shopify Theme

## Overview
The theme has been updated to feel warmer, more personal, and more human-centered, better reflecting the "b." brand's focus on human connection over sterile perfection.

---

## Key Changes

### 1. **Handwritten Accents** ✍️
- Added **Caveat** handwritten font from Google Fonts
- New `.handwritten` and `.handwritten-large` CSS classes
- Optional handwritten styling for:
  - Hero subtitles
  - Section headings
  - Welcome messages
  - Signatures

**Usage**: Toggle "Use handwritten font" in section settings

---

### 2. **Warmer Interactions** 🌟

#### Buttons
- **Gradient backgrounds** instead of flat colors
- **Warm glow effect** on hover (expanding circle of light)
- **Bounce animation** using cubic-bezier easing
- **Warmer shadows** with sage green tint instead of black
- More generous padding for easier clicking

#### Product Cards
- Softer, warmer shadows
- Smoother, more playful transitions
- Support for handwritten "sale" badges
- More organic border radius

---

### 3. **Softer Design Tokens**

#### Border Radius
- Increased from `0.5rem` to `0.75rem` (small)
- Increased from `1rem` to `1.25rem` (medium)
- Increased from `2rem` to `2.5rem` (large)
- Added organic blob shape variable for future use

#### Shadows
- Changed from harsh black shadows to soft sage green tinted shadows
- Added `--shadow-warm` with dusty clay tint for special elements
- Reduced opacity for gentler depth

#### Transitions
- Updated to use `cubic-bezier` for more natural motion
- Added `--transition-bounce` for playful interactions
- Increased durations slightly (200ms, 350ms, 600ms)

---

### 4. **New Welcome Message Section** 💌

A dedicated section for personal greetings:
- Large handwritten welcome message
- Body text for longer descriptions
- Optional handwritten signature
- Warm background tint (dusty clay at 8% opacity)

**Perfect for**: Homepage greetings, about pages, thank you pages

---

### 5. **Typography Enhancements**

- Added `--font-handwritten` variable
- Maintained Georgia serif for headings (timeless, warm)
- System fonts for body (familiar, comfortable)
- Handwritten font for accents (personal, human)

---

## Design Philosophy

### Before: Clean but Sterile
- Perfectly geometric
- Uniform shadows
- Rigid spacing
- Mechanical transitions

### After: Warm & Human
- Slightly organic shapes
- Warm, tinted shadows
- Playful animations
- Personal handwritten touches
- Inviting interactions

---

## How to Use Humanization Features

### 1. **Handwritten Hero**
```
Sections > Hero
☑ Use handwritten font for subtitle
```
Perfect for: "Welcome home" or "Take a breath" messages

### 2. **Handwritten Section Titles**
```
Sections > Featured Collection
☑ Use handwritten font for title
```
Perfect for: "Handpicked for you" or "Made with love"

### 3. **Welcome Message**
```
Add Section > Welcome Message
Message: "Hey there, friend."
Description: Your warm welcome text
Signature: "- Sarah from b."
```

### 4. **Sale Badges** (in product templates)
Add class `product-card__badge` to any element for a rotated, handwritten-style badge

---

## Visual Examples

### Button Hover Effect
- **Before**: Simple lift + shadow
- **After**: Lift + scale + warm glow expanding from center

### Product Cards
- **Before**: Sharp corners, black shadows
- **After**: Softer corners, sage-tinted shadows, warmer feel

### Typography Mix
- **Headings**: Georgia serif (classic, warm)
- **Body**: System sans-serif (familiar, readable)
- **Accents**: Caveat handwritten (personal, human)

---

## Technical Details

### New CSS Variables
```css
--font-handwritten: 'Caveat', cursive;
--radius-organic: 60% 40% 30% 70% / 60% 30% 70% 40%;
--shadow-warm: 0 8px 16px -4px rgb(212 165 154 / 0.2);
--transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### New CSS Classes
```css
.handwritten          /* Handwritten accent text */
.handwritten-large    /* Large handwritten headings */
.product-card__badge  /* Rotated sale badge */
```

### Updated Sections
- `hero.liquid` - Handwritten subtitle option
- `featured-collection.liquid` - Handwritten title option
- `welcome-message.liquid` - NEW section

---

## Brand Alignment

These changes better reflect the "b." philosophy:

✅ **Human over machine** - Handwritten touches vs perfect geometry  
✅ **Warm over cold** - Sage/clay tinted shadows vs harsh black  
✅ **Playful over rigid** - Bounce animations vs linear motion  
✅ **Personal over corporate** - Welcome messages vs generic CTAs  
✅ **Organic over mechanical** - Softer shapes vs sharp edges  

---

## File Changes Summary

### Modified Files
- `assets/theme.css` - Added handwritten font, warmer tokens, new classes
- `sections/hero.liquid` - Added handwritten subtitle option
- `sections/featured-collection.liquid` - Added handwritten title option

### New Files
- `sections/welcome-message.liquid` - Personal greeting section

### Font Import
- Google Fonts: Caveat (400, 500, 600, 700)

---

## Recommendations

### For Maximum Warmth
1. Use handwritten font for hero subtitle: "just be"
2. Add welcome message section to homepage
3. Use handwritten titles sparingly (1-2 per page)
4. Let the warm shadows and animations do the rest

### For Subtle Humanization
1. Keep standard fonts
2. Enjoy the warmer shadows and interactions
3. Use welcome message on thank you/about pages only

---

## Before & After Summary

| Element | Before | After |
|---------|--------|-------|
| Button shadows | Black, harsh | Sage green, soft |
| Button hover | Simple lift | Lift + glow + bounce |
| Border radius | 0.5-2rem | 0.75-2.5rem |
| Typography | 2 fonts | 3 fonts (+ handwritten) |
| Transitions | Linear ease | Cubic-bezier curves |
| Personal touches | None | Handwritten accents |
| Welcome section | None | Dedicated section |

---

## Next Steps

1. **Upload updated theme** to Shopify
2. **Customize sections** with handwritten options
3. **Add welcome message** to homepage
4. **Test on mobile** to ensure warmth translates
5. **Gather feedback** on the more human feel

The theme now balances minimalism with warmth, creating a space that feels both calm and inviting - perfectly aligned with the "b." philosophy of human connection.
