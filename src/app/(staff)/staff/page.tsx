import { redirect } from "next/navigation";

/** The fund queue is the staff home until the M5 dashboard lands. */
export default function StaffHome() {
  redirect("/staff/fund");
}
