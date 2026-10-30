import { useState } from 'react'
import { search } from '../api.js'
import { LANG, pct } from '../lang.js'

const EXAMPLES = [
  'It is raining heavily today',
  'వర్షం పడుతోంది',
  'मुझे बिरयानी पसंद है',
  'The exam starts tomorrow morning',
  'నాకు జ్వరంగా ఉంది',
  'asdfghjkl qwerty',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showWeak, setShowWeak] = useState(false)

  async function run(q, weak = showWeak) {
    const text = (q ?? query).trim()
    if (!text) { setError('Enter a sentence to search.'); return }
    setQuery(text); setLoading(true); setError('')
    try { setData(await search(text, 5, !weak)) }
    catch (e) { setError(e.message); setData(null) }
    finally { setLoading(false) }
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="Type a sentence in English, Hindi or Telugu"
          aria-label="Search sentence"
          className="flex-1 rounded-xl border border-ink/20 bg-white px-4 py-3 text-base focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-pink"
        />
        <button
          onClick={() => run()}
          disabled={loading}
          className="rounded-xl bg-pink px-6 py-3 text-sm font-bold hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink/60">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => run(ex)}
            className="rounded-full border border-ink/20 bg-white px-3 py-1 text-sm hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {ex}
          </button>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={showWeak}
          onChange={(e) => { setShowWeak(e.target.checked); if (data && query.trim()) run(query, e.target.checked) }}
          className="h-4 w-4 accent-rose"
        />
        Also show the closest sentences when the match is weak
      </label>

      {error && <p role="alert" className="mt-4 text-sm font-medium text-rose">{error}</p>}

      {data && (
        <div className="mt-6" aria-live="polite">
          <p className="mb-3 text-sm text-ink/60">
            Query script: {LANG[data.query_script]?.script ?? 'Unknown'} · best similarity {data.best_score.toFixed(3)} · threshold {data.threshold}
          </p>

          {data.results.length === 0 ? (
            <div className="rounded-xl bg-blush p-5">
              <p className="font-display text-xl font-semibold">No close match found</p>
              <p className="mt-1 text-sm">
                No sentence in the collection scores above the threshold ({data.threshold}) for this query. Try a
                different sentence, or tick the box above to see the closest sentences anyway.
              </p>
            </div>
          ) : (
            <>
              {!data.matched && (
                <p className="mb-3 rounded-xl bg-blush p-3 text-sm">
                  <b>Low confidence.</b> No sentence scores above the threshold. These are only the closest ones in the collection.
                </p>
              )}
              <ol className="space-y-3">
                {data.results.map((r, i) => (
                  <li key={r.id} className={`rounded-xl border border-ink/10 bg-white p-4 shadow-sm ${r.confident ? '' : 'opacity-70'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg leading-snug"><span className="mr-2 font-display text-rose">{i + 1}.</span>{r.text}</p>
                      <span className={`shrink-0 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase ${LANG[r.lang].badge}`}>{LANG[r.lang].name}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream">
                        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: pct(r.strength), background: LANG[r.lang].color }} />
                      </div>
                      <span className="w-28 text-right text-sm tabular-nums">{pct(r.strength)} · {r.score.toFixed(3)}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink/50">Topic: {r.topic === 'flores' ? 'general (FLORES-200)' : r.topic}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-ink/60">
                Bar and percentage: match strength (the cosine score rescaled for display, not a probability). Second number: cosine similarity.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}