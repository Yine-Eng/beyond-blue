"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import { type ActionResult, withValidation } from "./action-result";

export async function updateProfile(
  _prev: ActionResult<never> | null,
  formData: FormData,
): Promise<ActionResult<never>> {
  const input = {
    preferredName: formData.get("preferredName") ?? "",
    fullName: formData.get("fullName") ?? "",
    major: formData.get("major") ?? "",
    destinationRole: formData.get("destinationRole") ?? "",
    targetCity: formData.get("targetCity") ?? "",
    journeyTags: formData.getAll("journeyTags"),
  };
  return withValidation(profileSchema, input, async (data) => {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_name: data.preferredName,
        full_name: data.fullName,
        major: data.major,
        destination_role: data.destinationRole,
        target_city: data.targetCity,
        journey_tags: data.journeyTags,
      })
      .eq("id", user.id);
    if (error) throw error;
    revalidatePath("/profile");
    redirect("/profile?saved=1");
  });
}
