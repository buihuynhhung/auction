type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid: "Email hoac mat khau khong dung.",
  forbidden: "Tai khoan nay khong co quyen vao khu vuc quan tri.",
};

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = params?.error ? errorMessages[params.error] : null;
  const next = safeNextPath(params?.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Dau gia noi bo
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Dang nhap</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Dung tai khoan cong ty de truy cap he thong.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Mat khau
            </span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Dang nhap
          </button>
        </form>
      </div>
    </main>
  );
}
