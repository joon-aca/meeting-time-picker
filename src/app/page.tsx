import { SiteGate } from "@/components/site-gate";

export default function HomePage() {
  return (
    <SiteGate
      eyebrow="Private"
      title="Meeting Time Picker"
      message="Open the meeting link from your invitation. This page does not list meetings."
      detail="Your invitation has the link for this meeting."
    />
  );
}
