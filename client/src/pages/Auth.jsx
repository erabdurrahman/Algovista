export default function Auth() {
  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Login / Register</h1>
      <p className="mt-3 text-slate-600">Create an account or login to track your DSA progress.</p>

      <form className="mt-6 grid gap-4 md:max-w-md">
        <input type="text" placeholder="Name" className="rounded-lg border border-slate-300 p-3 text-sm" />
        <input type="email" placeholder="Email" className="rounded-lg border border-slate-300 p-3 text-sm" />
        <input type="password" placeholder="Password" className="rounded-lg border border-slate-300 p-3 text-sm" />
        <button type="button" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Continue
        </button>
      </form>
    </section>
  )
}
