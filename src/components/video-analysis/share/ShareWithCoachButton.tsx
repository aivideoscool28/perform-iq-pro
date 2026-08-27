import { useState } from "react";
import { Check, Send } from "lucide-react";
import { toast } from "sonner";

import {
  shareVideoWithCoach,
} from "./video-sharing";

type Props = {
  analysisId: string;
};

export function ShareWithCoachButton({
  analysisId,
}: Props) {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleShare() {
    if (sharing || shared) return;

    setSharing(true);

    try {
      await shareVideoWithCoach(analysisId);

      setShared(true);

      toast.success(
        "Videoanalyse mit deinem Trainer geteilt.",
      );
    } catch (error) {
      console.error(
        "Could not share video analysis:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Teilen fehlgeschlagen.",
      );
    } finally {
      setSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing || shared}
      className="
        inline-flex items-center gap-2
        rounded-xl bg-orange-500
        px-4 py-2.5
        text-sm font-semibold text-white
        transition
        hover:bg-orange-600
        disabled:cursor-default
        disabled:bg-green-100
        disabled:text-green-700
      "
    >
      {shared ? (
        <>
          <Check className="h-4 w-4" />
          Mit Trainer geteilt
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />

          {sharing
            ? "Wird geteilt…"
            : "Mit Trainer teilen"}
        </>
      )}
    </button>
  );
}
