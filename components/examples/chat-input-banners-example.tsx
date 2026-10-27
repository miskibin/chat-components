"use client"

import { ShieldAlert, WifiOff } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { ChatInput } from "@/components/ui/chat-input"
import {
  ComposerBanner,
  ComposerBannerAction,
  ComposerBannerActions,
  ComposerBannerBody,
  ComposerBannerContent,
  ComposerBannerCount,
  ComposerBannerDescription,
  ComposerBannerDismiss,
  ComposerBannerIcon,
  ComposerBannerRow,
  ComposerBannerTitle,
} from "@/components/ui/composer-banner"

/**
 * `banners` docks the drawer to the composer's top edge: each banner tucks
 * under the surface, and two of them read as one drawer with sections.
 */
export function ChatInputBannersExample() {
  const [offline, setOffline] = React.useState(true)
  const [asking, setAsking] = React.useState(true)

  const answer = (allowed: boolean) => {
    setAsking(false)
    toast(allowed ? "Allowed once" : "Denied")
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <ChatInput
        isGenerating={asking}
        onStop={() => setAsking(false)}
        banners={
          offline || asking ? (
            <>
              {offline ? (
                <ComposerBanner variant="warning" role="status">
                  <ComposerBannerRow>
                    <ComposerBannerIcon>
                      <WifiOff />
                    </ComposerBannerIcon>
                    <ComposerBannerContent>
                      <ComposerBannerTitle>Ollama is not running</ComposerBannerTitle>
                      <ComposerBannerDescription>
                        Local models are unavailable until it starts.
                      </ComposerBannerDescription>
                    </ComposerBannerContent>
                    <ComposerBannerActions>
                      <ComposerBannerDismiss onClick={() => setOffline(false)} />
                    </ComposerBannerActions>
                  </ComposerBannerRow>
                </ComposerBanner>
              ) : null}
              {asking ? (
                <ComposerBanner aria-label="Permission requested">
                  <ComposerBannerRow>
                    <ComposerBannerIcon>
                      <ShieldAlert />
                    </ComposerBannerIcon>
                    <ComposerBannerContent>
                      <ComposerBannerTitle>Run a command?</ComposerBannerTitle>
                      <ComposerBannerDescription>
                        The agent wants to run this in your checkout.
                      </ComposerBannerDescription>
                    </ComposerBannerContent>
                    <ComposerBannerCount>1/1</ComposerBannerCount>
                  </ComposerBannerRow>
                  <ComposerBannerBody inset>
                    <pre className="m-0 max-h-40 overflow-auto rounded-md bg-muted px-2 py-1.5 font-mono text-[12px] whitespace-pre-wrap">
                      npm install --save-dev vitest
                    </pre>
                  </ComposerBannerBody>
                  <ComposerBannerRow className="justify-end pe-1">
                    <ComposerBannerActions>
                      <ComposerBannerAction onClick={() => answer(false)}>
                        Deny
                      </ComposerBannerAction>
                      <ComposerBannerAction
                        variant="primary"
                        onClick={() => answer(true)}
                      >
                        Allow once
                      </ComposerBannerAction>
                    </ComposerBannerActions>
                  </ComposerBannerRow>
                </ComposerBanner>
              ) : null}
            </>
          ) : null
        }
        onSend={({ text }) => toast("Sent", { description: text })}
      />
      {!offline || !asking ? (
        <button
          type="button"
          onClick={() => {
            setOffline(true)
            setAsking(true)
          }}
          className="self-start px-1 text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Show the banners again
        </button>
      ) : null}
    </div>
  )
}
