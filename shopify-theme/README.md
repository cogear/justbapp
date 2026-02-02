# b. Just Be - Shopify Theme

A custom Shopify theme matching the minimalist, mindful aesthetic of the b. (just be) web application.

## Design Philosophy

This theme embodies the "b." philosophy of mindful living with:

- **Warm, earthy color palette**: Sage green, dusty clay, warm sand
- **Premium typography**: Georgia serif for headings, clean sans-serif for body
- **Smooth animations**: Gentle transitions and hover effects
- **Minimalist layout**: Clean, spacious design with generous whitespace
- **Mobile-first**: Fully responsive across all devices

## Color Palette

- **Background**: #F5F2EB (Warm Sand)
- **Text**: #2D2D2D (Soft Charcoal)
- **Primary**: #8DA399 (Sage Green)
- **Accent**: #D4A59A (Dusty Clay)
- **Secondary**: #E0E6E6 (Morning Mist)
- **Dark Mode Background**: #1A1A1A (Deep Night)

## Features

### Sections
- **Hero**: Immersive hero section with image overlay
- **Featured Collection**: Product grid with hover effects
- **Text with Image**: Alternating layout for storytelling
- **Header**: Sticky navigation with cart drawer toggle
- **Footer**: Multi-column footer with newsletter signup

### Components
- **Cart Drawer**: Slide-out cart with AJAX updates
- **Product Cards**: Elegant cards with image zoom on hover
- **Buttons**: Rounded buttons with smooth hover animations

### Functionality
- AJAX cart (add to cart without page reload)
- Cart drawer with quantity updates
- Product image gallery with thumbnails
- Variant selection
- Responsive navigation
- Smooth scroll

## Installation

1. **Compress the theme folder** into a ZIP file:
   ```bash
   cd shopify-theme
   zip -r b-just-be-theme.zip .
   ```

2. **Upload to Shopify**:
   - Go to your Shopify admin
   - Navigate to Online Store > Themes
   - Click "Add theme" > "Upload ZIP file"
   - Select the `b-just-be-theme.zip` file

3. **Customize**:
   - Click "Customize" on the uploaded theme
   - Adjust colors, fonts, and content in the theme editor
   - Add your products and collections

## Customization

### Colors
Navigate to Theme Settings > Colors to adjust:
- Background color
- Text color
- Primary color (buttons, links)
- Accent color
- Secondary color

### Typography
Navigate to Theme Settings > Typography to select:
- Heading font (Georgia recommended)
- Body font (Sans-serif recommended)
- Base font size

### Layout
Navigate to Theme Settings > Layout to adjust:
- Max content width
- Border radius for cards and buttons

## File Structure

```
shopify-theme/
├── assets/
│   ├── theme.css          # Main stylesheet
│   └── theme.js           # Theme JavaScript
├── config/
│   └── settings_schema.json  # Theme settings
├── layout/
│   └── theme.liquid       # Main layout file
├── sections/
│   ├── header.liquid      # Header section
│   ├── footer.liquid      # Footer section
│   ├── hero.liquid        # Hero section
│   ├── featured-collection.liquid
│   ├── text-with-image.liquid
│   └── main-product.liquid
├── snippets/
│   ├── cart-drawer.liquid # Cart drawer
│   └── meta-tags.liquid   # SEO meta tags
└── templates/
    ├── index.json         # Homepage template
    └── product.json       # Product page template
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For questions or issues with this theme, please contact support.

## License

© 2026 b. Just Be. All rights reserved.
