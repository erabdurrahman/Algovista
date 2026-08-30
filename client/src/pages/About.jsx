export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* 1. Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900">About Algovista</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          <strong>Algovista</strong> is an interactive full-stack learning platform designed to help computer science students master fundamental Data Structures & Algorithms visually, step-by-step, and with AI-assisted intuition.
        </p>
      </div>

      {/* 2. System Architecture */}
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">High-Level Architecture</h2>
        <p className="mt-1 text-xs text-slate-500">
          Clean client-server separation with a lightweight 3-table relational database and secure AI endpoints.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-900 p-5 font-mono text-xs text-cyan-300 overflow-x-auto">
          <pre>{`                    ALGOVISTA
                         |
              +----------+----------+
              |                     |
      React Frontend (Vite)    Express Backend (:5000)
              |                     |
       +------+------+        +-----+------+
       |             |        |            |
  Algorithms     Progress   Auth        AI API / Progress
  Visualizer     Dashboard  API         MySQL Controller
       |             |        |            |
       |             +--------+------------+
       |                      |
       |                   MySQL (3 Tables: users, algorithms, progress)
       |
    Browser`}</pre>
        </div>
      </div>

      {/* 3. Tech Stack Matrix */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Frontend Technology</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
            <li><strong className="text-slate-800">React 19 & Vite:</strong> Fast declarative UI and hot-module reloading.</li>
            <li><strong className="text-slate-800">Tailwind CSS:</strong> Modern responsive developer styling.</li>
            <li><strong className="text-slate-800">React Router v7:</strong> Declarative client-side routing.</li>
            <li><strong className="text-slate-800">SVG & Dynamic CSS:</strong> Scalable vector graphics for graph traversals and animated bar charts for sorting/searching.</li>
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-base font-bold text-slate-900">Backend & Database</h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
            <li><strong className="text-slate-800">Node.js & Express:</strong> Lightweight REST API architecture.</li>
            <li><strong className="text-slate-800">MySQL Database:</strong> Relational storage for users, algorithms metadata, and user progress.</li>
            <li><strong className="text-slate-800">JWT & bcryptjs:</strong> Secure hashed passwords and token-based sessions.</li>
            <li><strong className="text-slate-800">OpenAI API:</strong> Server-side AI explanation integration with offline fallback.</li>
          </ul>
        </div>
      </div>

      {/* 4. College Viva / Presentation Notes */}
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Key Features for Viva & Project Presentation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Deterministic Step Engine</h4>
            <p className="mt-1 text-[11px] text-slate-600">
              Algorithms generate discrete execution frames containing array snapshots, pointer indexes, and code line references.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Dynamic Progress Math</h4>
            <p className="mt-1 text-[11px] text-slate-600">
              Progress percentage is computed on the fly using MySQL relationships rather than static counters.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">Secure AI Proxy</h4>
            <p className="mt-1 text-[11px] text-slate-600">
              API keys remain protected strictly on the backend, safeguarding credentials from frontend exposure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
