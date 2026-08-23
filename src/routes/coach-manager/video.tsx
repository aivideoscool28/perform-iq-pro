import { createFileRoute } from "@tanstack/react-router";

import { VideoPage } from "@/components/coach-manager/video/VideoPage";

export const Route = createFileRoute("/coach-manager/video")({
  component: VideoPage,
});
