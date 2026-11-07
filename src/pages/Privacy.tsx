import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/surface";
import { site } from "@/config/site";

const sections = [
  {
    title: "What this site is",
    body: "A small, private place with one reader in mind. There are no accounts, no profiles, and no public pages. The opening screen asks for a passphrase so a random visitor can't wander in.",
  },
  {
    title: "What stays on this device",
    body: "The fact that you unlocked the site is kept in this browser tab's session storage, so it lasts until you close the tab or tap the lock button. If you answer the last page, your answer is saved in this browser's local database so the page can remember it. Nothing else is stored here.",
  },
  {
    title: "What gets sent to Papi",
    body: "Only what you explicitly send. If you tap 'Send it to Papi' on the last page, your answer, the date or activity you picked, and any note you wrote are sent to a private backend and stored for him. You see the exact text before it leaves. If you don't tap send, nothing leaves this device.",
  },
  {
    title: "No tracking, no email",
    body: "There are no analytics scripts, advertising pixels, or session recordings. No third-party trackers watch what you read. This version doesn't ask for your email address and doesn't send any email.",
  },
  {
    title: "The passphrase is a door, not a vault",
    body: "The passphrase keeps casual visitors out. It is not military-grade security, and the story is part of the site itself. Don't put anything here you'd be devastated to have exposed.",
  },
];

export default function Privacy() {
  return (
    <div>
      <PageHeader
        eyebrow="Privacy"
        title="Where your stuff lives."
        intro="In plain language, because a privacy page you can't understand isn't really privacy."
      />

      <div className="mt-8 grid gap-4">
        {sections.map((section, index) => (
          <Card key={section.title} className="p-6 sm:p-7">
            <div className="flex gap-4">
              <span className="font-display text-2xl leading-none text-rose-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-xl text-ink">{section.title}</h2>
                <p className="mt-2 text-pretty text-[0.88rem] leading-relaxed text-ink-muted">{section.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-xl2 border border-line bg-surface p-6">
        <p className="text-[0.86rem] leading-relaxed text-ink-muted">
          Something feels off, or you want everything removed? Tell {site.him.name}. He built this, so he can
          take it apart. You can also lock the site from the lock button in the header, or by closing this tab.
        </p>
      </div>
    </div>
  );
}
