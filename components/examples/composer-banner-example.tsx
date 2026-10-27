"use client"

import { CircleHelp, Info, OctagonX } from "lucide-react"
import { toast } from "sonner"

import {
  ComposerBanner,
  ComposerBannerAction,
  ComposerBannerActions,
  ComposerBannerContent,
  ComposerBannerDescription,
  ComposerBannerDismiss,
  ComposerBannerIcon,
  ComposerBannerRow,
  ComposerBannerTitle,
  ComposerDock,
} from "@/components/ui/composer-banner"

/**
 * Three banners stacked in a dock above a stand-in composer surface. The
 * surface is `relative z-10` and opaque, which is what lets each banner tuck
 * its bottom rem underneath it.
 */
export function ComposerBannerExample() {
  return (
    <div className="w-full max-w-2xl">
      <ComposerDock>
        <ComposerBanner variant="info">
          <ComposerBannerRow>
            <ComposerBannerIcon>
              <Info />
            </ComposerBannerIcon>
            <ComposerBannerContent>
              <ComposerBannerTitle>Handoff ready</ComposerBannerTitle>
              <ComposerBannerDescription>
                Codex will be told what Claude changed since it last ran.
              </ComposerBannerDescription>
            </ComposerBannerContent>
            <ComposerBannerActions>
              <ComposerBannerDismiss onClick={() => toast("Dismissed")} />
            </ComposerBannerActions>
          </ComposerBannerRow>
        </ComposerBanner>
        <ComposerBanner>
          <ComposerBannerRow>
            <ComposerBannerIcon>
              <CircleHelp />
            </ComposerBannerIcon>
            <ComposerBannerContent>
              <ComposerBannerTitle>Which package manager?</ComposerBannerTitle>
            </ComposerBannerContent>
            <ComposerBannerActions>
              <ComposerBannerAction onClick={() => toast("npm")}>npm</ComposerBannerAction>
              <ComposerBannerAction variant="outline" onClick={() => toast("pnpm")}>
                pnpm
              </ComposerBannerAction>
            </ComposerBannerActions>
          </ComposerBannerRow>
        </ComposerBanner>
        <ComposerBanner variant="error" role="alert">
          <ComposerBannerRow>
            <ComposerBannerIcon>
              <OctagonX />
            </ComposerBannerIcon>
            <ComposerBannerContent>
              <ComposerBannerTitle>Turn failed</ComposerBannerTitle>
              <ComposerBannerDescription>
                The CLI exited with code 1.
              </ComposerBannerDescription>
            </ComposerBannerContent>
            <ComposerBannerActions>
              <ComposerBannerAction variant="primary" onClick={() => toast("Retrying")}>
                Retry
              </ComposerBannerAction>
            </ComposerBannerActions>
          </ComposerBannerRow>
        </ComposerBanner>
      </ComposerDock>
      <div className="relative z-10 rounded-2xl border bg-background px-3.5 py-3 text-[15px] text-muted-foreground shadow-lg">
        Ask anything
      </div>
    </div>
  )
}
