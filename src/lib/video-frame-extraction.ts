export type ExtractedVideoFrames = {
  frames: { t: number; image: string }[];
  duration: number;
};

export async function extractFrames(
  file: File,
  count = 6,
): Promise<{
  frames: { t: number; image: string }[];
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    let settled = false;

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    const fail = (msg: string) => {
      if (settled) return;

      settled = true;
      cleanup();
      reject(new Error(msg));
    };

    const hardTimeout = setTimeout(
      () =>
        fail(
          "Zeitüberschreitung beim Lesen des Videos. Bitte ein anderes Format (MP4/H.264) versuchen.",
        ),
      45000,
    );

    const resolveDuration = (): Promise<number> =>
      new Promise((res) => {
        const d = video.duration;

        if (isFinite(d) && d > 0) {
          res(d);
          return;
        }

        const onDur = () => {
          if (isFinite(video.duration) && video.duration > 0) {
            video.removeEventListener("durationchange", onDur);
            video.currentTime = 0;
            res(video.duration);
          }
        };

        video.addEventListener("durationchange", onDur);

        try {
          video.currentTime = 1e6;
        } catch {
          // ignore
        }

        setTimeout(() => {
          video.removeEventListener("durationchange", onDur);

          res(
            isFinite(video.duration) && video.duration > 0
              ? video.duration
              : 0,
          );
        }, 4000);
      });

    const seekTo = (t: number): Promise<void> =>
      new Promise((res, rej) => {
        const timeout = setTimeout(() => {
          video.removeEventListener("seeked", onSeeked);
          rej(new Error("seek-timeout"));
        }, 8000);

        const onSeeked = () => {
          clearTimeout(timeout);
          video.removeEventListener("seeked", onSeeked);
          res();
        };

        video.addEventListener("seeked", onSeeked, {
          once: true,
        });

        try {
          video.currentTime = t;
        } catch (e) {
          clearTimeout(timeout);
          rej(e as Error);
        }
      });

    video.onloadedmetadata = async () => {
      try {
        const duration = await resolveDuration();

        if (!duration || duration < 0.1) {
          fail(
            "Videodauer konnte nicht ermittelt werden. Bitte ein anderes Video versuchen.",
          );
          return;
        }

        const canvas = document.createElement("canvas");

        const maxW = 640;
        const vw = video.videoWidth || maxW;
        const vh = video.videoHeight || 360;
        const scale = Math.min(1, maxW / vw);

        canvas.width = Math.max(2, Math.round(vw * scale));
        canvas.height = Math.max(2, Math.round(vh * scale));

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          fail("Canvas nicht verfügbar.");
          return;
        }

        const frames: { t: number; image: string }[] = [];

        const times = Array.from({ length: count }, (_, i) =>
          Math.max(
            0,
            Math.min(
              duration - 0.05,
              (duration * (i + 0.5)) / count,
            ),
          ),
        );

        for (const t of times) {
          try {
            await seekTo(t);

            await new Promise((r) =>
              requestAnimationFrame(() => r(null)),
            );

            ctx.drawImage(
              video,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            frames.push({
              t,
              image: canvas.toDataURL("image/jpeg", 0.72),
            });
          } catch {
            // skip bad frame
          }
        }

        if (frames.length < 2) {
          fail(
            "Es konnten nicht genug Bilder aus dem Video gelesen werden. Bitte ein anderes Video versuchen.",
          );
          return;
        }

        settled = true;
        clearTimeout(hardTimeout);
        cleanup();

        resolve({
          frames,
          duration,
        });
      } catch (e) {
        fail(
          e instanceof Error
            ? e.message
            : "Frames konnten nicht extrahiert werden.",
        );
      }
    };

    video.onerror = () =>
      fail(
        "Video konnte nicht geladen werden. Unterstützte Formate: MP4/H.264, MOV, WebM.",
      );
  });
}


