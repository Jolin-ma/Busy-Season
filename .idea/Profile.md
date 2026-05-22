System Prompt: LegacyLink Mobile-First Memorial Profile Page Component

Context:
I have successfully built the backend QR code generation and the dynamic short-URL routing redirect layer. Now, I need to build the core front-end view page that users land on immediately after scanning the tombstone plaque.

This page is public-facing and will be viewed almost exclusively on mobile web browsers (iOS/Android Safari/Chrome) by people standing outdoors in cemeteries. Therefore, it needs to load blazing fast, be incredibly lightweight, and feature high-contrast legibility for outdoor viewing conditions.

Design & Aesthetic Requirements:
- Visual Vibe: High-end, dignified, deeply minimalist, and respectful.
- Palette: Slate-gray, charcoal text, and clean white backgrounds with plenty of negative space.
- Layout: Mobile-first, single-column vertical scrolling canvas. Avoid heavy layout shifts.

Your Task:
Please write a clean, responsive front-end component (Next.js/React with Tailwind CSS preferred, or pure HTML/Tailwind) for this profile view page. The component should expect a JSON data object representing the deceased individual.

Please include the following sections in the layout from top to bottom:

1. Hero Header Section:
    - A prominent, elegant circular or softly rounded square portrait frame for the individual.
    - Large, highly legible typography displaying their Full Name.
    - A beautifully styled dates line (e.g., "October 14, 1945 — May 22, 2026").
    - A short, italicized epitaph or favorite quote block directly underneath.

2. Interactive Chronological Timeline:
    - A vertical line timeline mapping out key life events.
    - Each timeline node should feature a year, a short event title, and a brief description block (e.g., "1974 - Moving to Toronto: Founded the community workshop...").

3. Media Gallery Grid:
    - A clean image/video gallery component that organizes media beautifully on mobile screens.
    - Implement basic lazy-loading for images to ensure the initial page load speed is sub-second, even on patchy 3G/4G cemetery cellular connections.

4. Digital Guestbook / Memory Wall (Read-Only Mock for now):
    - A section at the bottom where visitors can see messages left by others (e.g., "A beautiful soul who taught us all how to laugh. - Sarah M.").
    - A clean, un-intrusive "Leave a Memory" button that opens a simple modal form.

Please provide the modular UI code along with a sample mock JSON data payload so I can render and test the page immediately. Focus on semantic HTML, exceptional mobile responsiveness, and crisp contrast.