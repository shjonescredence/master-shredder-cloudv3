# Assistant Panel Styling Cues for Claude Opus

## Current Problem
The ChatInterface panel currently has a dark background: `rgba(28, 25, 23, 0.95)` but needs to match the assistant panel styling exactly.

## Target Styling - Assistant Panel (.assistant-panel)

**From App.css line 1052-1057:**
```css
.assistant-panel {
  background: linear-gradient(135deg, rgba(25, 30, 35, 0.95), rgba(30, 35, 45, 0.98));
  border: 1px solid rgba(100, 120, 140, 0.2);
  padding: 24px;
}
```

## Current ChatInterface Styling Issue

**Currently has (WRONG - dark test background):**
```css
background: rgba(28, 25, 23, 0.95) !important;  /* Dark brown/black background */
backdrop-filter: blur(10px) !important;
border: 1px solid rgba(255, 255, 255, 0.1) !important;
```

**Needs to match assistant panel:**
```css
background: linear-gradient(135deg, rgba(25, 30, 35, 0.95), rgba(30, 35, 45, 0.98)) !important;
border: 1px solid rgba(100, 120, 140, 0.2) !important;
/* Keep the backdrop-filter: blur(10px) for glass effect */
```

## Key Differences to Fix

1. **Background**: Change from solid dark brown to blue-gray gradient
2. **Border**: Change from white border to blue-gray border  
3. **Colors**: Use the exact rgba values from assistant panel

## Exact CSS Values Needed

- **Background Gradient Start**: `rgba(25, 30, 35, 0.95)`
- **Background Gradient End**: `rgba(30, 35, 45, 0.98)`
- **Border Color**: `rgba(100, 120, 140, 0.2)`
- **Gradient Direction**: `135deg`

## File to Update
`client/src/components/ChatInterface.css` - the `.chat-interface` selector around line 32

## Expected Result
ChatInterface panel should have the same blue-gray gradient background as the assistant panel in the middle-left of the layout.
