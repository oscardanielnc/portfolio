import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 sm:px-6">
      <p className="font-mono text-xs tracking-wide text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">
        <Link href="/" className="underline decoration-line-strong underline-offset-4 hover:text-accent">
          Go to oscarnavarro.dev
        </Link>
      </p>
    </main>
  );
}
