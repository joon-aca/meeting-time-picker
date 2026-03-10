import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-foreground leading-tight">
          ACA Board<br />Meeting Picker
        </h1>
        <p className="font-serif text-foreground/70 text-lg leading-relaxed">
          A simple way to find the best meeting time. Pick your availability and we'll do the rest.
        </p>
        <Link
          to="/poll/team-offsite-planning"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          View Demo Poll
        </Link>
      </div>
    </div>
  );
}
