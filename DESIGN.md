# Design System: Zvision Cyber-Core - PRD
**Project ID:** 15262666748715504315

## 1. Visual Theme & Atmosphere
The atmosphere is "Cyber-Tactical" and "Glassmorphic Void." It feels like a high-end, futuristic command center. The aesthetic relies on deep blacks, stark neon accents, and frosted glass panels that suggest depth and advanced technology. 

## 2. Color Palette & Roles
* **Void Black (#050505):** Used for the main application background. Provides a stark canvas.
* **Cyber Lime (#A2E635):** The primary accent and brand color. Used for active states, key metrics, charts, and primary actions.
* **Surface Glass (rgba(255, 255, 255, 0.03)):** Used for card backgrounds and panels to create a glassmorphism effect.
* **Glass Border (rgba(255, 255, 255, 0.08)):** Used for subtle borders around panels.
* **Text Main (#EEEEEE):** Used for primary typography, highly legible against the dark background.
* **Text Muted (#6B7280):** Used for secondary information, metadata, and labels.
* **Danger Red (#EF4444):** Used for negative metrics or low-status indicators.
* **Warning Yellow (#EAB308):** Used for medium-status or warning indicators.

## 3. Typography Rules
* **Primary Display Font:** "Space Grotesk". Used for headings, large metrics, and primary UI elements. Weights are typically Bold (700) or Medium (500).
* **Secondary/Monospace Font:** "JetBrains Mono". Used for data labels, technical text, system statuses, and small caps metadata. Usually at smaller sizes (10px to 12px).

## 4. Component Stylings
* **Panels/Cards:** Referred to as "glass-panels". They have a frosted glass background (`bg-white/5` or specific rgba), a thin subtle border, a blur effect (`backdrop-blur-md`), and are subtly rounded (`rounded-xl` or `rounded-lg`). On hover, the border often glows with the Cyber Lime color.
* **Buttons/Nav Items:** Usually have a transparent background that shifts to a slight Cyber Lime tint (`bg-[#A2E635]/10`) on active/hover states, with a left border indicating selection.
* **Icons:** Material Symbols or Lucide icons, typically paired with the text color or the primary accent when active.

## 5. Layout Principles
* **Grid and Spacing:** Uses generous padding (e.g., `p-6`) for main containers, and tight logical groupings (`gap-4` to `gap-6`) for related data.
* **Background Pattern:** Employs a tactical grid background (very faint intersecting lines) to emphasize the technical theme.
* **Layering:** Uses true z-index layering with the glass panels floating above the grid background.

## 6. Design System Notes for Stitch Generation
**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Theme: Dark mode, Cyber-Tactical, Glassmorphic Void
- Background: Void Black (#050505) with faint tactical grid pattern
- Surface/Cards: Frosted glass (rgba(255, 255, 255, 0.03) with 12px backdrop blur) and thin subtle border (rgba(255, 255, 255, 0.08))
- Primary Accent: Cyber Lime (#A2E635) for glows, active states, buttons, and key metrics
- Text Primary: Off-White (#EEEEEE) in Space Grotesk font
- Text Secondary: Muted Gray (#6B7280) in JetBrains Mono font for technical data
- Cards: Gently rounded (12px), hover state gains Cyber Lime border pulse
