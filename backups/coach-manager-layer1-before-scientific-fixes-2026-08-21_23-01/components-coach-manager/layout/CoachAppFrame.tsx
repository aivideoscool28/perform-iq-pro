import type { ReactNode } from "react";
import { CoachSideMenu } from "@/components/coach-manager/layout/CoachSideMenu";
import { CoachTopBar } from "@/components/coach-manager/layout/CoachTopBar";

type CoachAppFrameProps = {
  children: ReactNode;
};

export function CoachAppFrame({ children }: CoachAppFrameProps) {
  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <div className="flex min-h-screen">
        <CoachSideMenu />

        <div className="min-w-0 flex-1">
          <CoachTopBar />

          <main className="w-full px-4 py-4 lg:px-5 lg:py-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
