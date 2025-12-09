import { Layout, Link } from "@/app/components";

export default async function ErrorPage() {
  const errorMessage =
    "An unexpected error occurred. Your error has been logged. Please try again later.";

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div
          role="alert"
          aria-live="polite"
          className="max-w-xl w-full bg-white text-slate-900 rounded-lg shadow-md ring-1 ring-slate-200 p-8"
        >
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-semibold mb-2">Error</h1>
            <p className="text-sm text-slate-600 mb-2">{errorMessage}</p>
            <Link href="/" className="mt-5!">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
