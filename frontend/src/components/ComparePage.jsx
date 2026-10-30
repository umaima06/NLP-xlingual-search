import { useState } from 'react'
import { compare } from '../api.js'
import { LANG, pct } from '../lang.js'

const PRESETS = [
  ['I love eating biryani.', 'నాకు బిర్యానీ తినడం చాలా ఇష్టం.'],
  ['आज बहुत तेज़ बारिश हो रही है।', 'It is raining heavily today.'],
  ['The exam starts tomorrow morning.', 'I enjoy watching movies on weekends.'],
]

export default function ComparePage() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [res, setRes] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function run(x = a, y = b) {
    if (!x.trim() || !y.trim()) { setError('Fill in both sentences.'); return }
    setLoading(true); setError('')
    try { setRes(await compare(x, y)) }
    catch (e) { setError(e.message); setRes(null) }
    finally { setLoading(false) }
  }

  const box = 'w-full rounded-xl border border-ink/20 bg-white px-4 py-3 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pink'

  return (
    <section>
      <p className="mb-4 text-sm text-ink/80">Enter any two sentences, in any of the three languages, to see how close their meanings are.</p>

      <div className="grid gap-3 md:grid-cols-2">
        <textarea rows={3} value={a} onChange={(e) => setA(e.target.value)} placeholder="Sentence 1" aria-label="Sentence 1" className={box} />
        <textarea rows={3} value={b} onChange={(e) => setB(e.target.value)} placeholder="Sentence 2" aria-label="Sentence 2" className={box} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => run()}
          disabled={loading}
          className="rounded-xl bg-pink px-6 py-3 text-sm font-bold hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? 'Comparing…' : 'Compare'}
        </button>
        <span className="ml-2 text-xs text-ink/60">Try:</span>
        {PRESETS.map(([x, y], i) => (
          <button
            key={i}
            onClick={() => { setA(x); setB(y); run(x, y) }}
            className="rounded-full border border-ink/20 bg-white px-3 py-1 text-sm hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Example {i + 1}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mt-4 text-sm font-medium text-rose">{error}</p>}

      {res && (
        <div className="mt-6 rounded-xl border border-ink/10 bg-white p-5 shadow-sm" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Match strength</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-display text-5xl font-semibold tabular-nums text-rose">{pct(res.strength)}</span>
            <span className="font-display text-xl">{res.verdict}</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-cream">
            <div className="h-full rounded-full bg-pink transition-[width] duration-500" style={{ width: pct(res.strength) }} />
          </div>
          <p className="mt-3 text-sm">
            Cosine similarity: {res.score.toFixed(3)} · Scripts: {LANG[res.script_a]?.script ?? 'Unknown'} and {LANG[res.script_b]?.script ?? 'Unknown'}
          </p>
          <p className="mt-1 text-xs text-ink/60">Match strength is the cosine similarity rescaled for display; it is not a probability.</p>
        </div>
      )}
    </section>
  )
}