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
    <div className="relative mx-auto max-w-5xl pb-12 pt-8">

      {/* ── Hero ── */}
      <section className="relative animate-fade-in-up overflow-hidden pt-16 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(124,92,252,0.1), transparent 50%)",
            }}
          />
          <svg
            className="h-full w-full"
            viewBox="0 0 1200 500"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            style={{ maxHeight: "500px" }}
          >
            <path
              d="M0,280 C120,120 240,440 360,280 C480,120 600,440 720,280 C840,120 960,440 1080,280 C1140,200 1200,250 1200,250"
              stroke="#7C5CFC" strokeWidth="0.8" fill="none" opacity="0.04"
            />
            <path
              d="M0,300 C120,140 240,460 360,300 C480,140 600,460 720,300 C840,140 960,460 1080,300 C1140,220 1200,270 1200,270"
              stroke="#7C5CFC" strokeWidth="0.6" fill="none" opacity="0.035"
            />
            <path
              d="M0,320 C120,160 240,480 360,320 C480,160 600,480 720,320 C840,160 960,480 1080,320 C1140,240 1200,290 1200,290"
              stroke="#7C5CFC" strokeWidth="0.5" fill="none" opacity="0.03"
            />
            <path
              d="M0,340 C120,180 240,500 360,340 C480,180 600,500 720,340 C840,180 960,500 1080,340 C1140,260 1200,310 1200,310"
              stroke="#7C5CFC" strokeWidth="0.4" fill="none" opacity="0.025"
            />
          </svg>
        </div>
        <div className="relative z-10">
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
              className="rounded-[12px] bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-brand-400"
            >
              Go To Dashboard
            </Link>
            <Link
              to="/upload"
              className="rounded-[12px] border border-surface-750 px-6 py-3 text-sm font-medium text-surface-300 transition-all duration-150 hover:scale-[1.02] hover:bg-surface-850"
            >
              Upload Image
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative animate-fade-in-up mt-8" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          How It Works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.number}
              className="rounded-[16px] border border-surface-750 bg-surface-850 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/[0.04]"
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
      <section className="relative animate-fade-in-up mt-10" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          Platform Capabilities
        </h2>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="w-full rounded-[12px] border border-surface-750 bg-surface-850 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/30 sm:w-[calc(50%_-_0.375rem)] lg:w-[calc(33.333%_-_0.5rem)]"
            >
              <div className="mb-3 h-0.5 w-8 rounded-full bg-brand-500" />
              <h3 className="text-base font-semibold text-surface-100">{c.title}</h3>
              <p className="mt-1 text-sm text-surface-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Investigation Workflow ── */}
      <section className="relative animate-fade-in-up mt-10" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-surface-500">
          Investigation Workflow
        </h2>
        <div className="mt-8 flex flex-col items-center gap-4 lg:flex-row lg:flex-nowrap lg:justify-center lg:gap-0 lg:overflow-x-auto">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center lg:flex-row lg:items-center">
              <div className="whitespace-nowrap rounded-[8px] border border-surface-750 bg-surface-850 px-4 py-3 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-500/20">
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
      <footer className="relative mt-10 border-t border-surface-750 pt-8 text-center">
        <p className="text-sm font-semibold text-surface-100">Forensic Leak Attribution Platform</p>
        <p className="mt-1 text-sm text-surface-400">Secure forensic watermarking and leak attribution.</p>
      </footer>
    </div>
  )
}
