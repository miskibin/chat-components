# ChatInput Component

A customizable, accessible chat input component built for React applications using the shadcn/ui design system.

## Features

- 💬 Modern chat interface with auto-resizing textarea
- 🛠️ Support for toggleable tools/actions
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- 🔄 Loading state with stop generation button
- 📱 Responsive design with mobile-friendly UI
- ♿ Accessibility-focused with proper ARIA attributes
- 🎨 Fully customizable with Tailwind CSS


## Installation

copy [chat-input.tsx](components/chat-input.tsx) file to `/components/ui/chat-input.tsx` 


## Usage

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

## Props

| Prop               | Type                                                          | Default        | Description                                |
| ------------------ | ------------------------------------------------------------- | -------------- | ------------------------------------------ |
| `onSend`           | `(message: string) => void`                                   | Required       | Function called when a message is sent     |
| `onStopGeneration` | `() => void`                                                  | -              | Function called when generation is stopped |
| `isLoading`        | `boolean`                                                     | `false`        | Whether the component is in loading state  |
| `placeholder`      | `string`                                                      | `"Message..."` | Placeholder text for the textarea          |
| `tools`            | `Array<{ icon: React.ReactNode, label: string, id: string }>` | `[]`           | Array of tools to display in the toolbar   |
| `...props`         | `TextareaHTMLAttributes<HTMLTextAreaElement>`                 | -              | All other textarea props                   |

## Component Architecture

The ChatInput component intelligently handles:

1. **Auto-resizing textarea** that grows with content up to a maximum height
2. **Dynamic toolbar positioning** that adjusts the textarea padding based on the toolbar height
3. **Tool toggling** for enabling/disabling various input tools
4. **Loading states** with different UI for sending vs. stopping generation

## Customization

The component uses Tailwind CSS and can be customized using the `className` prop or by modifying the component styling. It integrates with the shadcn/ui theme system, picking up your application's color scheme automatically.

```jsx
<ChatInput 
  className="border-2 border-primary" 
  // Other props
/>
```

## Accessibility

This component follows accessibility best practices:
- Proper keyboard navigation
- Screen reader-friendly elements with appropriate ARIA labels
- Focus management
- High contrast visual indicators

## License

MIT