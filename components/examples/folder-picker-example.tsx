"use client"

import { useState } from "react"

import { FolderPicker } from "@/components/ui/folder-picker"

const RECENT_FOLDERS = [
  "D:\\agent-ui",
  "D:\\railway-objects",
  "D:\\sigma2",
  "C:\\Users\\you\\Projects\\quickLink",
]

export function FolderPickerExample() {
  const [folder, setFolder] = useState(RECENT_FOLDERS[0])

  return (
    <FolderPicker
      value={folder}
      recents={RECENT_FOLDERS}
      detail="main"
      onChange={setFolder}
      onOpenFolder={() => setFolder("C:\\Users\\you\\Projects\\new-app")}
    />
  )
}
