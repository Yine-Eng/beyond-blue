import { Document, Font, Link, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { LaunchFileData } from "@/lib/data/launch-file";
import { palette } from "@/lib/design/tokens";

/**
 * The Launch File as a branded PDF (PRD US-LF-2). Loaded only when a student taps Download, so
 * react-pdf never ships in the page bundle. Text stays real text with embedded brand fonts.
 */

let fontsRegistered = false;
function registerFonts(origin: string) {
  if (fontsRegistered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: `${origin}/fonts/inter-latin-400-normal.woff` },
      { src: `${origin}/fonts/inter-latin-700-normal.woff`, fontWeight: 700 },
    ],
  });
  Font.register({
    family: "SourceSerif",
    src: `${origin}/fonts/source-serif-4-latin-700-normal.woff`,
    fontWeight: 700,
  });
  Font.register({
    family: "Marker",
    src: `${origin}/fonts/permanent-marker-latin-400-normal.woff`,
  });
  // Keep long words and URLs on the page instead of hyphenating them.
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10,
    color: palette["ink-900"],
    backgroundColor: palette["cream-50"],
    padding: 40,
    paddingBottom: 56,
  },
  cover: {
    backgroundColor: palette["navy-900"],
    color: palette["cream-50"],
    padding: 24,
    borderRadius: 8,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette["gold-400"],
  },
  title: { fontFamily: "Marker", fontSize: 30, marginTop: 6 },
  name: { fontFamily: "SourceSerif", fontWeight: 700, fontSize: 18, marginTop: 12 },
  meta: { marginTop: 4, fontSize: 10 },
  section: { marginTop: 22 },
  sectionTitle: {
    fontFamily: "SourceSerif",
    fontWeight: 700,
    fontSize: 15,
    color: palette["navy-900"],
    borderBottomWidth: 2,
    borderBottomColor: palette["gold-400"],
    paddingBottom: 3,
    marginBottom: 8,
  },
  item: { backgroundColor: "#FFFFFF", borderRadius: 6, padding: 10, marginBottom: 8 },
  itemTitle: { fontWeight: 700, fontSize: 11, color: palette["navy-900"] },
  itemMeta: { fontSize: 8.5, color: palette["ink-600"], marginTop: 2 },
  row: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: palette["cream-200"],
    paddingVertical: 4,
  },
  label: { width: "35%", fontWeight: 700, color: palette["ink-600"], paddingRight: 6 },
  value: { width: "65%" },
  link: { color: palette["blue-700"], marginTop: 6 },
  empty: { color: palette["ink-600"], fontStyle: "normal" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: palette["ink-600"],
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function LaunchFileDocument({ data, origin }: { data: LaunchFileData; origin: string }) {
  const { file, student } = data;
  return (
    <Document
      title={`${student.name} · Beyond Blue Launch File`}
      author={student.name}
      subject="Beyond Blue Launch File"
      creator="Beyond Blue"
      language="en-US"
    >
      <Page size="LETTER" style={s.page}>
        <View style={s.cover}>
          <Text style={s.eyebrow}>
            Beyond Blue · {student.school}
            {student.classYear ? ` · Class of ${student.classYear}` : ""}
          </Text>
          <Text style={s.title}>My Launch File</Text>
          <Text style={s.name}>{student.name}</Text>
          <Text style={s.meta}>
            {student.pathway} pathway
            {student.destination ? ` · ${student.destination}` : ""}
            {student.targetCity ? ` · ${student.targetCity}` : ""}
            {student.major ? ` · ${student.major}` : ""}
          </Text>
          <Text style={s.meta}>
            {file.total} outputs · {data.stepsComplete} of {data.stepsTotal} steps complete ·
            exported {date(new Date().toISOString())}
          </Text>
        </View>

        {file.sections.map((section) => (
          <View key={section.id} style={s.section}>
            <Text style={s.sectionTitle} minPresenceAhead={60}>
              {section.title}
            </Text>
            {section.id === "network" &&
              file.mentors.map((m) => (
                <View key={m.name} style={s.item} wrap={false}>
                  <Text style={s.itemTitle}>{m.name}</Text>
                  <Text style={s.itemMeta}>
                    Mentor · {m.role}
                    {m.city ? ` · ${m.city}` : ""}
                  </Text>
                </View>
              ))}
            {section.items.length === 0 &&
              !(section.id === "network" && file.mentors.length > 0) && (
                <Text style={s.empty}>Still to come.</Text>
              )}
            {section.items.map((item) => (
              <View key={item.taskId} style={s.item} wrap={item.rows.length > 6}>
                <Text style={s.itemTitle}>
                  {item.title}
                  {item.verified ? "  · Verified" : ""}
                </Text>
                <Text style={s.itemMeta}>
                  Completed {date(item.completedAt)} · {item.pathwayName} pathway
                </Text>
                {item.rows.map((row) => (
                  <View key={row.label} style={s.row}>
                    <Text style={s.label}>{row.label}</Text>
                    <Text style={s.value}>{row.value}</Text>
                  </View>
                ))}
                {item.kind === "link" && item.url && (
                  <Link src={item.url} style={s.link}>
                    {item.url}
                  </Link>
                )}
                {item.kind === "file" && (
                  <Link src={`${origin}/tasks/${item.taskId}`} style={s.link}>
                    Uploaded file: open it in Beyond Blue
                  </Link>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>Beyond Blue · From Countdown to Launchpad</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderLaunchFilePdf(data: LaunchFileData, origin: string): Promise<Blob> {
  registerFonts(origin);
  return pdf(<LaunchFileDocument data={data} origin={origin} />).toBlob();
}
