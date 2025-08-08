# Master Shredder Design System

## Color Tokens

### Brand Colors
- `ms-blue-start`: #2563eb - Primary brand blue start
- `ms-blue-end`: #1d4ed8 - Primary brand blue end

### Panel Colors
- `panel-gradient-from`: rgba(25, 30, 35, 0.95) - Panel gradient start
- `panel-gradient-to`: rgba(30, 35, 45, 0.98) - Panel gradient end
- `panel-glass-bg`: rgba(255, 255, 255, 0.05) - Glass panel background
- `panel-dark-border`: rgba(100, 120, 140, 0.2) - Dark panel border
- `panel-glass-border`: rgba(255, 255, 255, 0.1) - Glass panel border

### Status Colors
- `status-ready`: rgb(34, 197, 94) - Success/Ready state
- `status-processing`: rgb(59, 130, 246) - Processing/Loading state
- `status-error`: rgb(239, 68, 68) - Error/Failed state

### Button Colors
- `button-primary`: rgb(37, 99, 235) - Primary button background
- `button-secondary`: rgb(75, 85, 99) - Secondary button background

## Spacing Tokens

### Panel Spacing
- `panel-sm`: 16px - Small panel padding
- `panel-md`: 20px - Medium panel padding
- `panel-lg`: 24px - Large panel padding

## Shadow Tokens

### Panel Shadows
- `shadow-panel-primary`: 0 20px 40px rgba(0, 0, 0, 0.4) - Primary panel shadow
- `shadow-panel-secondary`: 0 15px 30px rgba(0, 0, 0, 0.3) - Secondary panel shadow
- `shadow-panel-tertiary`: 0 10px 20px rgba(0, 0, 0, 0.2) - Tertiary panel shadow

## Background Tokens

### Gradients
- `bg-panel-gradient` - Default panel gradient background

## Usage Examples

### Panels
```tsx
// Primary Panel
<div className="bg-panel-gradient border border-panel-dark-border shadow-panel-primary p-panel-lg">

// Glass Panel
<div className="bg-panel-glass-bg border border-panel-glass-border backdrop-blur-lg">
```

### Status Indicators
```tsx
// Ready State
<div className="text-status-ready">Ready</div>

// Processing State
<div className="text-status-processing">Processing</div>
```

### Buttons
```tsx
// Primary Button
<button className="bg-button-primary hover:bg-button-primary/90">

// Secondary Button
<button className="bg-button-secondary hover:bg-button-secondary/90">
```
