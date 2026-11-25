# VOGUE — Fashion E-Commerce (Frontend Only)

Pure HTML + CSS + JavaScript. No backend, no database, no Node server, no API, no payment gateway.

```
VOGUE/
├── index.html
├── style.css
├── script.js
└── assets/images/placeholder.svg   (fallback if a photo fails to load)
```

## Run in VS Code
1. Extract the ZIP and open the `VOGUE` folder in VS Code (File → Open Folder).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.
(You can also just double-click `index.html`.)

## Deploy online (free)
- **Netlify:** open https://app.netlify.com/drop and drag the `VOGUE` folder onto the page.
- **GitHub Pages:** create a repo, upload the files, then Settings → Pages → Branch `main` / root → Save.
- **Vercel:** import the repo (Framework: "Other"), no build command, no output directory.

## Features
Loader with fallback timeout · animated editorial hero · sticky responsive navbar + mobile menu · men's & women's collections ·
14 products with working filters (All / Men / Women / New Arrivals / category) · product details modal (size, quantity) ·
cart drawer with quantity, remove, subtotal, localStorage · wishlist with localStorage · live search with no-results message ·
demo Sign In / Create Account with validation and show/hide password · newsletter form · marquee, scroll reveals,
hover zoom, toasts · `prefers-reduced-motion` respected.

## Extra animations (v2)
Custom cursor ring ("VIEW" / "EXPLORE" labels) · hero mouse-parallax + floating clickable product cards · magnetic buttons ·
button ripple · product image 3D tilt + shine sweep · cards reveal on scroll · word-by-word headings with animated underline ·
count-up stats · big outline text marquee · fly-to-bag animation · navbar hides on scroll down · back-to-top progress ring.
(Cursor/tilt/magnetic effects run only on desktop with a mouse; all motion is disabled for users who prefer reduced motion.)

## Notes
- Login, registration, newsletter and checkout are **demo interactions only**; nothing is sent or stored (passwords are never saved).
- Cart and wishlist are saved in the browser's localStorage.
- Photos load from Unsplash and need internet. If one is missing, a placeholder is shown. To use your own photos, replace the image IDs in `script.js` (`img:` fields).
