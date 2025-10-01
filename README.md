# Shadcn Chat Components

## [demo](https://chat-input-azure.vercel.app/)

A collection of customizable, accessible chat UI components built for React applications using the shadcn/ui design system.

![image](https://github.com/user-attachments/assets/9fc27797-d32a-4166-a0fc-c5f5e93d1b3e)

## Components

This package includes several components for building modern chat interfaces:

- **ChatInput**: A textarea component with tools and loading states
- **Message**: A versatile message component with actions and pattern handling
- **GenerationStatus**: A component for displaying AI generation progress

## Features

- 💬 Modern chat interface with rich components
- 🛠️ Support for customizable action buttons and tools
- 🔍 Pattern handling for citations and other special content
- 🧠 **Thinking model support** - Automatically handles `<think>...</think>` tags in collapsible sections
- ⌨️ Keyboard shortcuts support
- 🔄 Generation status indicators with stop capability
- 📱 Responsive design with mobile-friendly UI
- ♿ Accessibility-focused with proper ARIA attributes
- 🎨 Fully customizable with Tailwind CSS

## Installation

Copy the component files into your project:

- [ChatInput](components/chat-input.tsx) → `/components/ui/chat-input.tsx`
- [Message](components/message.tsx) → `/components/ui/message.tsx`
- [GenerationStatus](components/generation-status.tsx) → `/components/ui/generation-status.tsx`

## Usage Examples

### Chat Input

```jsx
import { ChatInput } from "@/components/ui/chat-input";
import { FileText, Code, ImageIcon } from "lucide-react";

export default function ChatPage() {
  const handleSendMessage = (message) => {
    console.log("Message sent:", message);
    // Process message here
  };
  
  const handleStopGeneration = () => {
    console.log("Generation stopped");
    // Handle stopping generation
  };
  
  const tools = [
    {
      id: "files",
      label: "Files",
      icon: <FileText size={14} />,
    },
    {
      id: "code",
      label: "Code",
      icon: <Code size={14} />,
    },
    {
      id: "images",
      label: "Images",
      icon: <ImageIcon size={14} />,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <ChatInput
        onSend={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isLoading={false}
        placeholder="Type your message..."
        tools={tools}
      />
    </div>
  );
}
```

## Usage: Message Component

The `Message` component is a flexible chat message UI element that supports:
- Custom action buttons (inside or outside the message)
- Inline editing (for user messages)
- Pattern handling (e.g. citations, links, custom markup)
- Markdown rendering with Tailwind prose styling

### Basic Example

```tsx
import { Message, PatternHandler } from "@/components/message";
import { Copy, ThumbsUp, ThumbsDown, Info } from "lucide-react";

// Optional: Define pattern handlers for special inline content
const patternHandlers: PatternHandler[] = [
  {
    pattern: /\[(\d+)\]/g,
    render: (match) => <span style={{ color: 'blue' }}>{match[0]}</span>,
  },
];

const actionButtons = [
  {
    id: "copy",
    icon: <Copy size={14} />,
    onClick: () => alert("Copy clicked"),
    title: "Copy message",
    position: "inside",
  },
  {
    id: "like",
    icon: <ThumbsUp size={14} />,
    onClick: () => alert("Like clicked"),
    title: "Like response",
    position: "inside",
  },
  {
    id: "info",
    icon: <Info size={14} />,
    onClick: () => alert("Info clicked"),
    title: "View message info",
    position: "inside",
  },
];

export default function Example() {
  return (
    <Message
      content={"This is a message with a citation [1]."}
      sender="assistant"
      actionButtons={actionButtons}
      patternHandlers={patternHandlers}
    />
  );
}
```

### Props

| Prop               | Type                        | Description                                  |
| ------------------ | --------------------------- | -------------------------------------------- |
| `content`          | `string`                    | The message text (supports markdown)         |
| `sender`           | `'user'                     | 'assistant'`                                 | Who sent the message |
| `actionButtons`    | `ActionButton[]`            | Custom action buttons (see below)            |
| `editable`         | `boolean`                   | If true, message can be edited (user only)   |
| `onEdit`           | `(content: string) => void` | Callback for when message is edited          |
| `patternHandlers`  | `PatternHandler[]`          | Array of pattern handlers for inline content |
| `className`        | `string`                    | Additional class for the message container   |
| `contentClassName` | `string`                    | Additional class for the content wrapper     |

#### ActionButton
| Prop        | Type                  | Description                                |
| ----------- | --------------------- | ------------------------------------------ |
| `id`        | `string`              | Unique button id                           |
| `icon`      | `React.ReactNode`     | Icon to display                            |
| `onClick`   | `() => void`          | Click handler                              |
| `title`     | `string`              | Tooltip/title text                         |
| `className` | `string`              | Additional class for the button            |
| `position`  | `'inside'\|'outside'` | Where to show the button (default: inside) |

#### PatternHandler
| Prop      | Type                                          | Description                           |
| --------- | --------------------------------------------- | ------------------------------------- |
| `pattern` | `RegExp`                                      | Regex to match special inline content |
| `render`  | `(match: RegExpExecArray) => React.ReactNode` | Render function for the match         |

### Pattern Handling Example

To highlight citations like `[1]` in blue and make them clickable:

```tsx
const patternHandlers: PatternHandler[] = [
  {
    pattern: /\[(\d+)\]/g,
    render: (match) => (
      <a href={`#citation-${match[1]}`} style={{ color: 'blue', fontWeight: 600 }}>
        {match[0]}
      </a>
    ),
  },
];

<Message
  content={"This is a message with a citation [1]."}
  sender="assistant"
  patternHandlers={patternHandlers}
/>
```

### Thinking Model Support

The Message component automatically detects and handles content from "thinking" models that include `<think>...</think>` tags. The reasoning content is hidden by default and displayed in a collapsible section.

```tsx
const messageFromThinkingModel = `<think>
Let me analyze this step by step:
1. First I need to understand the user's question
2. Then consider the best approach
3. Finally provide a clear answer
</think>

Based on your question, here's the answer: The sky appears blue due to Rayleigh scattering of sunlight in Earth's atmosphere.`;

<Message
  content={messageFromThinkingModel}
  sender="assistant"
/>
```

**Features:**
- ✨ Automatic parsing of `<think>...</think>` tags
- 🔒 Hidden by default with "Model reasoning" collapsible section
- 🧠 Brain icon and intuitive toggle interface
- 📝 Preserves markdown formatting in both reasoning and final content
- ⚡ Optimized parsing with single-pass content processing

The component will:
1. Extract the first `<think>...</think>` block from the message
2. Display only the remaining content as the main message
3. Show a collapsible "Model reasoning" section with a brain icon
4. Allow users to expand/collapse to view the model's internal reasoning

### Editing

To allow editing (for user messages):

```tsx
<Message
  content={userMessage}
  sender="user"
  editable={true}
  onEdit={newContent => setUserMessage(newContent)}
/>
```

---

For a full chat experience, see how `Message` is used in `MessageList` in `app/message-list.tsx`.

### Generation Status

```jsx
import { GenerationStatus } from "@/components/ui/generation-status";

export default function ChatInterface() {
  const [generationStage, setGenerationStage] = useState("thinking");
  
  // Change stage after some time (simulation)
  useEffect(() => {
    if (generationStage === "thinking") {
      const timer = setTimeout(() => setGenerationStage("searching"), 3000);
      return () => clearTimeout(timer);
    }
  }, [generationStage]);
  
  return (
    <div className="p-4">
      <GenerationStatus stage={generationStage} />
    </div>
  );
}
```

## Component Props

### ChatInput Props

| Prop               | Type                        | Description                                |
| ------------------ | --------------------------- | ------------------------------------------ |
| `onSend`           | `(message: string) => void` | Function called when a message is sent     |
| `onStopGeneration` | `() => void`                | Function called when generation is stopped |
| `isLoading`        | `boolean`                   | Whether the component is in loading state  |
| `placeholder`      | `string`                    | Placeholder text for the textarea          |
| `tools`            | `Array<ToolItem>`           | Array of tools to display in the toolbar   |

### Message Props

| Prop               | Type                        | Description                                  |
| ------------------ | --------------------------- | -------------------------------------------- |
| `content`          | `string`                    | The message content                          |
| `sender`           | `"user" \| "assistant"`     | Who sent the message                         |
| `actionButtons`    | `ActionButton[]`            | Custom action buttons for the message        |
| `editable`         | `boolean`                   | Whether the message can be edited            |
| `onEdit`           | `(content: string) => void` | Called when a message is edited              |
| `patternHandlers`  | `PatternHandler[]`          | Handlers for special content patterns        |
| `className`        | `string`                    | Additional CSS class for the component       |
| `contentClassName` | `string`                    | Additional CSS class for the content wrapper |

### GenerationStatus Props

| Prop        | Type                                                  | Description                            |
| ----------- | ----------------------------------------------------- | -------------------------------------- |
| `stage`     | `"thinking" \| "searching" \| "responding" \| "idle"` | Current generation stage               |
| `className` | `string`                                              | Additional CSS class for the component |

## Customization

The components use Tailwind CSS and can be customized using the `className` props or by modifying the component styling. They integrate with the shadcn/ui theme system, picking up your application's color scheme automatically.

## Accessibility

These components follow accessibility best practices:
- Proper keyboard navigation
- Screen reader-friendly elements with appropriate ARIA labels
- Focus management
- High contrast visual indicators

## License

MIT
