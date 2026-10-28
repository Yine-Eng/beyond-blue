"use server";

import { getLaunchFile } from "@/lib/data/launch-file";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ActionResult, ok } from "./action-result";

/**
 * Records a PDF export with a snapshot of what it contained. The snapshot is rebuilt on the
 * server (never taken from the browser) and leaves out signed file links.
 */
export async function recordLaunchFileExport(): Promise<ActionResult<null>> {
  try {
    const { file, student } = await getLaunchFile();
    const snapshot = {
      pathway: student.pathway,
      total: file.total,
      mentors: file.mentors.map((m) => m.name),
      sections: file.sections.map((s) => ({
        id: s.id,
        items: s.items.map((i) => ({
          taskId: i.taskId,
          title: i.title,
          completedAt: i.completedAt,
          verified: i.verified,
          pathway: i.pathwayName,
        })),
      })),
    };
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("launch_files")
      .insert({ student_id: auth.user!.id, snapshot: snapshot as Json });
    if (error) throw error;
    return ok(null);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error(
      JSON.stringify({ event: "launch_file_export_error", message: (error as Error).message }),
    );
    // Recording is best-effort: the student already has their PDF.
    return ok(null);
  }
}
