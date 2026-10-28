import { ArrowRight, LogOut, MapPin, Pencil, Repeat } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlanSkeleton } from "@/components/plan/plan-skeleton";
import { STATUS_COPY } from "@/components/profile/status-copy";
import { Button } from "@/components/ui/button";
import { type PathwayId, getPathway } from "@/content/pathways";
import { signOut } from "@/lib/actions/auth";
import { requirePlan } from "@/lib/auth/session";
import { palette, pathwayColors } from "@/lib/design/tokens";

export const metadata: Metadata = { title: "Profile" };

const TAG_TINTS = [
  "bg-area-career",
  "bg-area-financial",
  "bg-area-relocation",
  "bg-area-network",
  "bg-area-wellness",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

async function ProfileContent({ saved }: { saved: Promise<boolean> }) {
  const { profile, plan, cohort } = await requirePlan();
  const pathwayId = plan.pathway_id as PathwayId;
  const pathway = getPathway(pathwayId);
  const status = STATUS_COPY[pathwayId];
  const name = profile.full_name || profile.preferred_name || "Student";
  const classYear = profile.class_year ?? cohort?.class_year;
  const ring = palette[pathwayColors[pathwayId].fill];

  return (
    <div className="flex flex-col gap-6">
      {(await saved) && (
        <p
          role="status"
          className="bg-success-50 rounded-lg px-4 py-3 text-sm font-semibold text-green-700"
        >
          Profile saved.
        </p>
      )}
      <header className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="text-navy-900 grid size-28 place-items-center rounded-full bg-blue-100 font-serif text-4xl font-bold"
          style={{ boxShadow: `0 0 0 5px ${ring}` }}
        >
          {initials(name)}
        </span>
        <h1 className="text-heading-lg text-navy-900 mt-4 font-serif font-bold">{name}</h1>
        <p className="text-ink-600">Senior{classYear ? ` · Class of ${classYear}` : ""}</p>
        {profile.major && <p className="text-navy-900 font-semibold">{profile.major}</p>}
        <p className="text-body-sm text-ink-600">{profile.school}</p>
      </header>

      <section aria-label="Status" className="bg-success-50 rounded-card p-5">
        <p className="text-caption font-bold tracking-wide text-green-700 uppercase">
          {pathway.name}
        </p>
        <p className="text-navy-900 mt-1 font-semibold">{status.headline}</p>
        <p className="text-body-sm text-ink-600 mt-1">{status.body}</p>
      </section>

      <dl className="grid gap-4">
        <div>
          <dt className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
            Destination
          </dt>
          <dd className="rounded-card text-navy-900 mt-1 border bg-white px-4 py-3 font-semibold">
            {profile.destination_role ?? "Not set yet"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
            Target city
          </dt>
          <dd className="rounded-card text-navy-900 mt-1 flex items-center gap-2 border bg-white px-4 py-3 font-semibold">
            <MapPin aria-hidden="true" className="size-4" />
            {profile.target_city ?? "Not set yet"}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-600 font-semibold tracking-wide uppercase">
            My journey
          </dt>
          <dd className="mt-2">
            {profile.journey_tags.length ? (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {profile.journey_tags.map((tag, i) => (
                  <li
                    key={tag}
                    className={`${TAG_TINTS[i % TAG_TINTS.length]} rounded-card text-navy-900 px-3 py-3 text-center text-sm font-semibold`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-600 text-sm">No journey tags yet.</p>
            )}
          </dd>
        </div>
      </dl>

      <Button asChild size="lg">
        <Link href="/launch-file">
          View My Beyond Blue <ArrowRight aria-hidden="true" />
        </Link>
      </Button>

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button asChild variant="outline" className="bg-white">
          <Link href="/profile/edit">
            <Pencil aria-hidden="true" /> Edit profile
          </Link>
        </Button>
        <Button variant="ghost" disabled title="Switching pathways arrives in the next release">
          <Repeat aria-hidden="true" /> Switch pathway
        </Button>
        <form action={signOut}>
          <Button type="submit" variant="ghost">
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const saved = searchParams.then((p) => p.saved === "1");
  return (
    <Suspense fallback={<PlanSkeleton />}>
      <ProfileContent saved={saved} />
    </Suspense>
  );
}
