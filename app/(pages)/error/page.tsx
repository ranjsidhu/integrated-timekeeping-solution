import { Layout } from "@/app/components";

type ErrorPageProps = {
  searchParams: Promise<{ type: string }>;
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { type } = await searchParams;
  const errorType = type;
  const fallbackErrorMessage = "An unexpected error occurred.";

  const errorMap: Record<string, string> = {
    "user-fetch-failed":
      "Failed to fetch user details. Please try again later.",
    "user-roles-missing": "User roles are missing. Access denied.",
    "unauthorised-access-attempted":
      "The email provided does not match the session user.",
    "user-not-found": "The specified user was not found.",
  };

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
            <p className="text-sm text-slate-600 mb-2">
              {errorMap[errorType] ?? fallbackErrorMessage}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
