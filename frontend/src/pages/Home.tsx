import { Link } from "react-router-dom"

const steps = [
  { number: "01", title: "Upload Original Image", desc: "Upload a high-resolution image to serve as the master copy for all watermarked variants." },
  { number: "02", title: "Generate Unique Watermarked Copies", desc: "Each recipient receives a copy with a unique forensic watermark embedded using LSB steganography." },
  { number: "03", title: "Distribute Copies To Recipients", desc: "Watermarked copies are assigned to recipients and made available for immediate download." },
  { number: "04", title: "Upload Leaked Image For Attribution", desc: "When a leak is suspected, upload the compromised image to identify the original recipient." },
]

const capabilities = [
  { title: "Watermark Generation", desc: "Generate unique forensic watermarks per recipient." },
  { title: "Leak Attribution", desc: "Recover watermark signatures from leaked images." },
  { title: "Recipient Tracking", desc: "Track which recipient received which copy." },
  { title: "Investigation History", desc: "Store attribution investigations and results." },
  { title: "Evidence Management", desc: "Maintain uploaded originals and generated copies." },
]

const flowSteps = [
  "Original Image",
  "Watermarked Copies",
  "Recipients",
  "Leak Occurs",
  "Recovered Watermark",
  "Identified Recipient",
]

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl pb-12">

      {/* ── Hero ── */}
      <section className="animate-fade-in-up pt-16 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-400">
          Forensic Watermarking
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-surface-100">
          Leak Attribution Platform
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-surface-400">
          Generate uniquely watermarked image copies for recipients and identify the source of leaked content through forensic watermark recovery.
        </p>
        <p className="mt-3 text-sm text-surface-500">
          Secure forensic watermarking with per-recipient traceability and automated leak attribution.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/"
            className="rounded-[14px] bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-brand-400"
          >
            Go To Dashboard
          </Link>
          <Link
            to="/upload"
            className="rounded-[14px] border border-surface-700 px-6 py-3 text-sm font-medium text-surface-300 transition-all duration-150 hover:scale-[1.02] hover:bg-surface-800"
          >
            Upload Image
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="animate-fade-in-up mt-8" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          How It Works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.number}
              className="rounded-[20px] border border-surface-700 bg-surface-800 p-7 transition-all duration-150 hover:-translate-y-0.5 hover:border-surface-600"
            >
              <div className="mb-4 h-0.5 w-8 rounded-full bg-brand-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">{s.number}</p>
              <div className="mt-3 flex min-h-[48px] items-start">
                <h3 className="text-base font-semibold text-surface-100">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-surface-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Capabilities ── */}
      <section className="animate-fade-in-up mt-10" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          Platform Capabilities
        </h2>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="w-full rounded-[14px] border border-surface-700 bg-surface-800 px-5 py-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-500 sm:w-[calc(50%_-_0.375rem)] lg:w-[calc(33.333%_-_0.5rem)]"
            >
              <div className="mb-3 h-0.5 w-8 rounded-full bg-brand-500" />
              <h3 className="text-base font-semibold text-surface-100">{c.title}</h3>
              <p className="mt-1 text-sm text-surface-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Investigation Workflow ── */}
      <section className="animate-fade-in-up mt-10" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          Investigation Workflow
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4 lg:flex-row lg:flex-nowrap lg:justify-center lg:gap-0 lg:overflow-x-auto">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="whitespace-nowrap rounded-[10px] border border-surface-700 bg-surface-800 px-4 py-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-500/20">
                <p className="text-sm font-medium text-surface-200">{step}</p>
              </div>
              {i < flowSteps.length - 1 && (
                <span className="mt-2 rotate-90 text-lg text-surface-600 lg:ml-1 lg:mt-0 lg:rotate-0">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-surface-700 pt-8 text-center">
        <p className="text-sm font-semibold text-surface-100">Forensic Leak Attribution Platform</p>
        <p className="mt-1 text-sm text-surface-400">Secure forensic watermarking and leak attribution.</p>
      </footer>

    </div>
  )
}
