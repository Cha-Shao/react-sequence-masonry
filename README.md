# React Responsive Masonry

A lightweight, responsive masonry layout React component.

## Features

- Responsive columns with customizable breakpoints
- Adjustable gutter size
- Works in Next.js, React, or any React framework
- Smooth layout transition
- **accurate `tabIndex`**

## Installation

```bash
npm install react-responsive-masonry
```

# Usage

```tsx
import { Masonry } from "react-responsive-masonry"

export default function Page() {
  return (
    <Masonry colsBreakPoint={{ 1200: 4, 800: 3, 500: 2 }} gutter="1rem">
      <ChildA />
      <ChildB />
      <ChildC />
      {/* ... */}
    </Masonry>
  )
}
```

# Props

| Prop             | Type                               | Default  | Description                                 |
| ---------------- | ---------------------------------- | -------- | ------------------------------------------- |
| `children`       | `ReactNode`                        | -        | Elements to display in the masonry          |
| `gutter`         | `string \| number`                 | `"1rem"` | Spacing between items                       |
| `colsBreakPoint` | `number \| Record<number, number>` | `3`      | Number of columns or responsive breakpoints |
