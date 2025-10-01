# Thinking Model Support Documentation

## Overview

The Message component now supports "thinking" models that include reasoning in `<think>...</think>` tags. This feature automatically extracts the model's internal reasoning and presents it in a clean, collapsible interface.

## Features

### ✨ Automatic Detection
- Detects `<think>...</think>` tags anywhere in the message content
- Uses optimized regex pattern for efficient parsing
- Handles nested content and complex reasoning blocks

### 🎨 Clean UI
- Hides reasoning content by default for cleaner conversation flow
- Collapsible "Model reasoning" section with brain icon
- Smooth expand/collapse animation with rotating chevron
- Styled with muted colors to distinguish from main content

### ⚡ Performance Optimized
- Single-pass parsing with `useMemo` for efficiency
- Prevents unnecessary re-renders with `useCallback` hooks
- Optimized button filtering and markdown component creation

## Usage Examples

### Basic Thinking Model Output

```tsx
const messageContent = `<think>
The user is asking about the capital of France. This is a straightforward factual question.
I should provide a clear, direct answer.
</think>

The capital of France is Paris.`;

<Message 
  content={messageContent} 
  sender="assistant" 
/>
```

### Complex Multi-step Reasoning

```tsx
const complexReasoning = `<think>
This is a complex math problem. Let me break it down:

1. First, I need to identify what the user is asking
2. The equation is: 2x + 5 = 15
3. Solving for x:
   - Subtract 5 from both sides: 2x = 10
   - Divide by 2: x = 5
4. Let me verify: 2(5) + 5 = 10 + 5 = 15 ✓
</think>

To solve 2x + 5 = 15:

1. Subtract 5 from both sides: 2x = 10
2. Divide by 2: x = 5

Therefore, x = 5.`;

<Message 
  content={complexReasoning} 
  sender="assistant" 
/>
```

### Code Analysis Example

```tsx
const codeAnalysis = `<think>
The user has provided a React component with a potential performance issue. Let me analyze:

1. The component is re-rendering on every parent update
2. The expensive calculation is running on every render
3. I should recommend useMemo to optimize this
4. I should also suggest useCallback for the event handler
</think>

I notice a performance issue in your component. The expensive calculation runs on every render. Here's how to optimize it:

\`\`\`jsx
// Before (inefficient)
function Component({ data }) {
  const result = expensiveCalculation(data);
  return <div>{result}</div>;
}

// After (optimized)
function Component({ data }) {
  const result = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{result}</div>;
}
\`\`\``;

<Message 
  content={codeAnalysis} 
  sender="assistant" 
/>
```

## Implementation Details

### Parsing Logic
- Uses non-greedy regex: `/<think>([\s\S]*?)<\/think>/i`
- Extracts only the first `<think>` block to prevent conflicts
- Trims whitespace from extracted reasoning
- Removes the entire `<think>...</think>` block from display content

### Performance Optimizations
1. **Single useMemo for parsing**: Combines regex matching and content extraction
2. **useCallback for processContent**: Prevents recreation on every render
3. **Memoized button filtering**: Prevents recalculation of inside/outside buttons
4. **Optimized markdown components**: Creates component map only when needed

### Accessibility
- Proper ARIA labels for collapsible sections
- Keyboard navigation support
- Screen reader friendly content structure
- High contrast visual indicators

## API Reference

The thinking model support is automatically enabled - no additional props required. The Message component will detect and handle `<think>` tags transparently.

### Styling Customization

The reasoning section can be customized via CSS classes:

```css
/* Reasoning container */
.reasoning-container {
  @apply mt-3 text-sm border rounded-md bg-muted/40;
}

/* Reasoning trigger button */
.reasoning-trigger {
  @apply text-muted-foreground hover:text-foreground transition-colors;
}

/* Reasoning content */
.reasoning-content {
  @apply prose prose-xs max-w-none text-muted-foreground whitespace-pre-wrap break-words;
}
```

## Browser Support

Works in all modern browsers with React 16.8+ (hooks support required).

## Future Enhancements

Potential future improvements:
- Support for multiple `<think>` blocks
- Configurable default open/closed state
- Custom icons and labels
- Streaming reveal of reasoning content
- Syntax highlighting for code in reasoning blocks