import { SiteGate } from "@/components/site-gate";

export default function NotFound() {
  return (
    <SiteGate
      eyebrow="Missing"
      title="Poll Not Found"
      message="That link does not match a meeting. Use the invitation link you were sent."
      detail="Check the address for a missing character."
    />
  );
}
