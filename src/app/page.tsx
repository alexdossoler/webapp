export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
            Prompt Builder
          </p>
          <h1 className="text-4xl font-semibold text-yellow-300 md:text-5xl">
            Handyman Help Landing Page Prompt
          </h1>
          <p className="text-base text-neutral-300 md:text-lg">
            Use this prompt to recreate the provided flyer as a responsive marketing
            website.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl shadow-yellow-500/10">
          <h2 className="text-lg font-semibold text-yellow-300">Generated Prompt</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200 md:text-base">
            {`Design a single-page marketing website that faithfully matches the attached “Handyman Help” flyer. The page should use a black background with bold, high-contrast yellow text for headings and a thick red horizontal band near the top. Layout: a large ALL-CAPS headline reading “HANDYMAN HELP” in a condensed, heavy sans-serif at the top. Beneath it, add a short yellow tagline line: “Small home repairs + installs • Reliable mobile service.”

Create a two-column layout. The left column is the primary text area on black: a white italic sentence “For a fast quote, please message or text” above a very large phone number in yellow “(407) 234-5863.” Below, add a bulleted list in white with yellow emphasis for key phrases. Include bullets for: “Exact location (address or ZIP) + best time window”, “What you need done (1–2 sentences)”, “Photos/video (2–4 helps a lot)”, “Materials on-site? (Yes/No)”, and “Any access notes (gate code, parking, pets, stairs)”.

Add a subheading “Common requests:” in yellow, followed by two lines of white bullets: “TV mount • Faucet/Disposal” and “Ceiling fan/Light • Door/Hardware”. Near the bottom, include a bold yellow callout: “Text (407) 234-5863”. Under that, add a smaller white line: “Book online (optional):” and a muted gray hyperlink with the URL https://alexdossoler.github.io/spartanburg-service-hub/.

The right column should stack three photo cards of a handyman drilling under a sink, mounting a TV, and installing a ceiling fan. Use rounded corners, thin white borders, and subtle drop shadows. Ensure the layout collapses to a single column on mobile with the images stacking beneath the text. Use consistent spacing, strong typography hierarchy, and maintain the black/red/yellow color scheme.`}
          </p>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h2 className="text-lg font-semibold text-yellow-300">Usage Notes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-300 md:text-base">
            <li>Replace the photo placeholders with real images from the flyer.</li>
            <li>Keep the bold yellow typography to preserve the brand feel.</li>
            <li>Use ample spacing so the bullet list stays readable on mobile.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
