import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">404</p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-fg">Collection not found</h1>
        <p className="mt-2 text-sm text-muted">The hymn collection you tried to open is not available.</p>
        <Link href="/" className="mt-5 inline-block rounded-2xl bg-primary px-4 py-3 font-medium text-white">
          Back home
        </Link>
      </div>
    </main>
  );
}
