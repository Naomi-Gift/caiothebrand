export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 text-center">
      <span className="text-6xl font-black text-gray-200">403</span>
      <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
      <p className="text-sm text-gray-500">Your account doesn&apos;t have admin privileges.</p>
      <a href="/login" className="mt-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">
        Sign in with a different account
      </a>
    </div>
  );
}
