"use client"

import { FolderPicker } from "@/components/ui/folder-picker"

export function FolderPickerEmptyExample() {
  return (
    <FolderPicker
      recents={[]}
      placeholder="Choose a working folder"
      onOpenFolder={() => undefined}
      variant="inline"
    />
  )
}
