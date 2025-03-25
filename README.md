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

### Message Component

```jsx
import { Message } from "@/components/ui/message";
import { Copy, ThumbsUp, ThumbsDown, Info } from "lucide-react";

export default function ChatMessages() {
  const actionButtons = [
    {
      id: "copy",
      icon: <Copy size={14} />,
      onClick: () => console.log("Copy clicked"),
      title: "Copy message",
      position: "inside",
    },
    {
      id: "like",
      icon: <ThumbsUp size={14} />,
      onClick: () => console.log("Like clicked"),
      title: "Like response",
      position: "inside",
    },
    {
      id: "info",
      icon: <Info size={14} />,
      onClick: () => console.log("Info clicked"),
      title: "View message info",
      position: "inside",
    },
  ];

  return (
    <div className="space-y-4">
      <Message
        content="How can I help you today?"
        sender="assistant"
        actionButtons={actionButtons}
      />
      
      <Message
        content="I need help with React components"
        sender="user"
        editable={true}
        onEdit={(newContent) => console.log("Edited:", newContent)}
      />
    </div>
  );
}
```

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
