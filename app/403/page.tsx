import { InfoHero, InfoShell } from "@/components/InfoPage";

export const metadata = { title: "Not allowed — Caio Pizza", robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <InfoShell>
      <InfoHero
        kicker="403"
        title="This page is for"
        titleEm="admins."
        intro="Your account doesn't have access here."
        actions={[{ href: "/", label: "Back to the menu" }, { href: "/account", label: "Your account" }]}
      />
    </InfoShell>
  );
}
