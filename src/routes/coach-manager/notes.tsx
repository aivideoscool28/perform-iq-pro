import { createFileRoute } from "@tanstack/react-router";

import { NotesPage } from "@/components/coach-manager/notes/NotesPage";

export const Route = createFileRoute("/coach-manager/notes")({
  component: NotesPage,
});
