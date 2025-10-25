# AutoLab Design Guidelines

## Design Approach

**Reference-Based Approach: FlowCV-Inspired Academic Interface**

Drawing primary inspiration from FlowCV's clean, professional document editor aesthetic combined with modern productivity tool patterns (Notion, Linear). The design prioritizes clarity, focus, and academic professionalism while maintaining an approachable, student-friendly interface.

**Core Design Principles:**
- Clarity and Focus: Minimize distractions to support document creation
- Academic Professionalism: Interface reflects the quality of output documents
- Efficiency: Quick access to essential features without menu diving
- Confidence: Real-time preview reduces uncertainty during creation

---

## Layout System

### Split-Screen Architecture
**Desktop (1024px+):**
- Left Editor Panel: 45% width, fixed sidebar
- Right Preview Panel: 55% width, scrollable document preview
- Resizable divider between panels (drag to adjust ratio 30-70% range)
- Minimum panel width: 400px before switching to mobile layout

**Tablet (768-1023px):**
- Tabbed interface: Switch between Edit and Preview modes
- Full-width panels with tab toggle at top
- Sticky tab bar during scroll

**Mobile (<768px):**
- Stacked layout: Editor on top, collapsible preview below
- "Preview" button expands full-screen preview modal
- Bottom navigation for quick actions

### Spacing Primitives
Use Tailwind spacing units consistently: **2, 4, 6, 8, 12, 16, 24**
- Component padding: p-4 to p-6 (sections), p-2 (small elements)
- Section gaps: gap-6 to gap-8 (list items), gap-4 (form fields)
- Page margins: px-6 to px-8 (mobile), px-12 (tablet), px-16 (desktop)
- Vertical rhythm: mb-4 (tight), mb-6 (standard), mb-8 (section breaks)

---

## Typography Hierarchy

**Font Families:**
- Primary: Inter (UI, headings, body text)
- Monospace: JetBrains Mono (code sections in lab records)

**Type Scale:**
- Navbar Brand: text-xl font-bold (20px)
- Section Titles: text-lg font-semibold (18px)
- Field Labels: text-sm font-medium (14px)
- Body Text: text-base (16px)
- Input Text: text-sm to text-base (14-16px)
- Helper Text: text-xs (12px)
- Preview Document Title: text-2xl font-bold (24px)
- Preview Section Headers: text-xl font-semibold (20px)
- Preview Body: text-base leading-relaxed (16px, 1.75 line-height)

**Typography Principles:**
- Consistent weight hierarchy: bold for primary actions, semibold for headings, medium for labels, regular for body
- Generous line-height: 1.5 for UI text, 1.75 for document content
- Letter-spacing: slight tracking on uppercase labels (tracking-wide)

---

## Component Library

### Navigation Bar (Top Fixed)
**Structure:**
- Height: h-16 (64px), fixed top, full width
- Left section: Logo + app name "AutoLab"
- Center section: Current document name (editable inline with pencil icon)
- Right section: Language selector, Preview toggle, Save status, Export button (primary CTA)
- Border bottom: subtle divider

**Elements:**
- Logo: 32x32px icon with 8px margin-right
- Buttons: rounded-lg, px-4 py-2, font-medium
- Export button: Primary style with download icon
- Auto-save indicator: "Saved" with checkmark icon or "Saving..." with spinner

### Editor Panel (Left Side)

**Template Selector:**
- Dropdown/tabs at top of editor
- Three options: Physics Lab, Chemistry Lab, Computer Lab
- Selected template highlighted with accent treatment
- "New Template" option to start blank

**Section Manager:**
- Vertical list of collapsible accordions
- Each section has: drag handle (6 dots icon), section name, hide/show toggle, delete icon
- Active section: expanded with form fields visible
- Inactive sections: collapsed showing only section name
- "Add Section" button at bottom (+ icon with text)
- Drag handles enable reordering (visual lift on drag)

**Field Inputs:**
- Student Details: Grid of 2-column inputs (Name, Roll No, Date, Class)
- Text inputs: rounded-md border, px-3 py-2, focus ring
- Textarea fields: min-height 120px, auto-expand as typing
- Rich text toolbar: Bold, Italic, Underline, Bullet List, Numbered List icons
- Markdown support indicator: "Markdown enabled" with toggle switch
- Character count for required fields

**Customization Panel:**
- Collapsible drawer (slide from left or bottom sheet on mobile)
- Tabs: Layout, Typography, Theme, Header
- Font selector: Dropdown with preview
- Theme cards: Visual presets (Academic, Modern, Minimal)
- Layout toggle: Portrait/Landscape radio buttons
- Color scheme picker: Grid of predefined palettes
- Logo uploader: Drag-drop zone with 150x50px preview

### Preview Panel (Right Side)

**Document Canvas:**
- White paper simulation with A4 proportions
- Drop shadow: shadow-xl for depth
- Margins: Realistic 1-inch margins (px-16 py-20)
- Zoom controls: Bottom-right corner (50%, 75%, 100%, 125%, 150%)
- Page break indicators for multi-page records

**Section Rendering:**
- Section headers: Bold, larger font, bottom border, mb-4
- Student details: Grid layout (2 columns)
- Theory/Conclusion: Justified text paragraphs
- Code sections: Monospace font, syntax highlighting, rounded container
- Images: Centered or aligned, max-width with caption below
- Output sections: Bordered container with slight background differentiation

**Preview Mode Toggle:**
- Full-screen preview (hides editor)
- Print layout simulation
- Page numbers footer
- Header with institution logo and student details

### Media Insertion

**Image Upload Interface:**
- Click-to-upload or drag-drop zone within section
- Thumbnail preview (120x120px) before insertion
- Alignment buttons: Left, Center, Right
- Size slider: 25%, 50%, 75%, 100% width
- Caption input field below image
- Delete/replace options on hover

**Media Gallery (Optional Panel):**
- Grid of previously uploaded images for reuse
- Quick insert by clicking thumbnail
- "Upload New" prominent button

### Export Modal

**Trigger:** Export button in navbar

**Modal Structure:**
- Title: "Export Lab Record"
- Format options: PDF and DOCX as large clickable cards with icons
- Settings: Page size (A4/Letter), Orientation (Portrait/Landscape), Include header checkbox
- File name input with template name as default
- Two CTAs: "Download" (primary) and "Cancel" (secondary)

### File Management Sidebar

**Trigger:** Hamburger menu icon or "My Records" link

**Structure:**
- Slide-in panel from left (320px width)
- Search bar at top
- List of saved records: Name, date modified, thumbnail preview
- Actions per record: Duplicate, Rename, Delete (icon buttons)
- "New Record" button at top (prominent primary button)
- Filter dropdown: All, Physics, Chemistry, Computer

### Authentication Flow

**Login Screen:**
- Centered card (max-w-md)
- AutoLab logo and tagline: "Smart Laboratory Record Generator"
- "Sign in with Google" button (large, full-width)
- Multi-language selector at bottom
- Minimal illustration of split-screen interface

**User Menu (Navbar Right):**
- Avatar/initial bubble (32x32px rounded-full)
- Dropdown: Profile, Settings, Logout
- Current plan/usage indicator if applicable

---

## Responsive Patterns

**Mobile Adaptations:**
- Bottom navigation bar: Edit, Preview, Export, Menu (4 icons)
- Swipe gestures: Left/right to switch editor/preview
- Floating "Add Section" button (fixed bottom-right)
- Full-screen modals for customization and export
- Collapsible sections default to closed

**Tablet Optimizations:**
- 2-column grid for student details forms
- Side-by-side preview/edit with 50-50 split
- Toolbar consolidation: Icon-only buttons with tooltips

---

## Interaction Patterns

**Real-time Feedback:**
- 300ms debounce on typing before preview updates
- Smooth transitions when reordering sections (200ms ease)
- Loading skeleton for preview when processing heavy content
- Success toast notifications: "Record saved", "Exported successfully"

**Drag-and-Drop:**
- Visual lift: Scale 1.02, shadow-2xl when dragging
- Drop zones: Highlighted outline when draggable hovers
- Snap-back animation if dropped in invalid area

**Form Validation:**
- Inline error messages below invalid fields (red text)
- Required field indicators: Asterisk (*) in label
- Submit/export disabled until required fields complete
- Validation on blur, not on every keystroke

---

## Accessibility

**Keyboard Navigation:**
- Tab order: Navbar → Editor fields → Section controls → Preview
- Ctrl/Cmd + S: Quick save
- Ctrl/Cmd + P: Toggle preview mode
- Escape: Close modals/dropdowns
- Focus indicators: 2px accent outline, offset 2px

**Screen Reader Support:**
- ARIA labels on icon-only buttons
- Role="region" for editor and preview panels
- Live region announcements for auto-save status
- Descriptive alt text on uploaded images

**Contrast & Readability:**
- Minimum 4.5:1 contrast for body text
- 3:1 contrast for large text (18px+)
- Focus states clearly visible in all themes
- Interactive elements minimum 44x44px touch target

---

## Multilingual Support

**Language Switcher:**
- Dropdown in navbar (flag icon + current language code)
- Options: English, Deutsch, Español
- Persists selection to user profile
- Right-to-left (RTL) support if adding Arabic/Hebrew

**Translated Elements:**
- All UI labels, buttons, placeholders
- Template names and default section titles
- Error messages and validation text
- Export filenames maintain user input (don't translate)

---

## Special Considerations

**Performance Optimizations:**
- Virtual scrolling for preview with 100+ pages
- Lazy load images in media gallery
- Debounced auto-save (30-second intervals or on blur)
- Optimistic UI updates (instant feedback, async persistence)

**Academic Aesthetics:**
- Professional, clean typography without decoration
- Structured layouts that mirror academic papers
- Subtle visual hierarchy emphasizing content over chrome
- Print-friendly preview that matches exported PDF exactly

**Smart Features Integration:**
- AI text suggestions: Inline ghosted text with "Tab to accept"
- Grammar check: Wavy underline on potential errors (tooltip on hover)
- Auto-fill frequent fields: Dropdown suggestions based on history
- Template quick-fill: "Use last record's student details" checkbox

This comprehensive design framework ensures AutoLab delivers a polished, professional, and highly functional lab record creation experience that rivals commercial productivity tools while serving the specific needs of academic users.