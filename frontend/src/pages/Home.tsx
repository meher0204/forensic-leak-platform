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
    <div className="mx-auto max-w-5xl space-y-24 pb-16">

      {/* ── Section 1: Hero ── */}
      <section className="pt-12 text-center">
        <h1 className="text-4xl font-bold text-surface-100 tracking-tight">
          Forensic Leak Attribution Platform
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-surface-400 leading-relaxed">
          Generate uniquely watermarked image copies for recipients and identify the source of leaked content through forensic watermark recovery.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/"
            className="rounded-[14px] bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400"
          >
            Go To Dashboard
          </Link>
          <Link
            to="/upload"
            className="rounded-[14px] border border-surface-700 px-6 py-3 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800"
          >
            Upload Image
          </Link>
        </div>
      </section>

      {/* ── Section 2: How It Works ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 text-center">
          How It Works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.number} className="rounded-[20px] border border-surface-700 bg-surface-800 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">{s.number}</p>
              <h3 className="mt-3 text-sm font-semibold text-surface-100">{s.title}</h3>
              <p className="mt-2 text-sm text-surface-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Platform Capabilities ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 text-center">
          Platform Capabilities
        </h2>
        <div className="mt-8 mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {capabilities.map((c) => (
            <div key={c.title} className="w-full rounded-[14px] border border-surface-700 bg-surface-800 px-5 py-4 sm:w-[calc(50%_-_0.375rem)] lg:w-[calc(33.333%_-_0.5rem)]">
              <h3 className="text-sm font-semibold text-surface-100">{c.title}</h3>
              <p className="mt-1 text-sm text-surface-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Investigation Workflow ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-500 text-center">
          Investigation Workflow
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="rounded-[14px] border border-surface-700 bg-surface-800 px-4 py-3 text-center">
                <p className="text-sm font-medium text-surface-200">{step}</p>
              </div>
              {i < flowSteps.length - 1 && (
                <span className="text-surface-600 text-lg">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Footer ── */}
      <footer className="border-t border-surface-700 pt-8 text-center">
        <p className="text-sm font-semibold text-surface-100">Forensic Leak Attribution Platform</p>
        <p className="mt-1 text-sm text-surface-400">Secure forensic watermarking and leak attribution.</p>
      </footer>

    </div>
  )
}
