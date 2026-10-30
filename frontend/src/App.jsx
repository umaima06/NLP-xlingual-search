import { useEffect, useState } from 'react'
import SearchPage from './components/SearchPage.jsx'
import ComparePage from './components/ComparePage.jsx'
import { getInfo } from './api.js'
import { LANG } from './lang.js'

const SAMPLE = [
  ['en', 'It is raining heavily today.'],
  ['hi', 'आज बहुत तेज़ बारिश हो रही है।'],
  ['te', 'ఈ రోజు భారీ వర్షం పడుతోంది.'],
]

const STEPS = [
  ['Embed', 'A pretrained multilingual model turns every sentence in the collection into a list of numbers (a vector).'],
  ['Compare', 'Your query becomes a vector too. Cosine similarity measures how close it is to every stored vector.'],
  ['Rank', 'The closest sentences are shown with scores. If the best score is below the threshold, the app reports that no close match was found.'],
]

export default function App() {
  const [tab, setTab] = useState('search')
  const [info, setInfo] = useState(null)
  useEffect(() => { getInfo().then(setInfo).catch(() => setInfo(false)) }, [])
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const seg = (t) =>
    `rounded-lg px-5 py-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
      tab === t ? 'bg-pink text-ink' : 'text-ink/70 hover:bg-blush'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <span className="font-display text-xl font-semibold">Meaning <span className="italic text-rose">Search</span></span>
          <nav className="flex items-center gap-6 text-sm" aria-label="Sections">
            <button onClick={() => go('try')} className="hover:text-rose">Try it</button>
            <button onClick={() => go('how')} className="hover:text-rose">How it works</button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center">
          <p className="inline-block rounded-full bg-blush px-4 py-1 text-xs font-bold tracking-wide">English · हिन्दी · తెలుగు</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight md:text-5xl">
            Search sentences by <span className="italic text-rose">meaning</span>, not by words
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink/80">
            Type a sentence in English, Hindi or Telugu. The app finds the closest-meaning sentences in the
            collection, in any of the three languages. A match does not need to share any words with your query.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => go('try')} className="rounded-xl bg-pink px-6 py-3 text-sm font-bold hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">Try it</button>
            <button onClick={() => go('how')} className="rounded-xl border border-ink/30 px-6 py-3 text-sm font-bold hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">How it works</button>
          </div>

          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-white p-5 text-left shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink/50">Same meaning, no shared words</p>
            <div className="space-y-3">
              {SAMPLE.map(([l, t]) => (
                <div key={l} className="flex items-center gap-3">
                  <span className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold ${LANG[l].badge}`}>{LANG[l].name}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOOL */}
        <section id="try" className="mx-auto max-w-3xl px-5 py-8">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-6 flex gap-1 rounded-xl bg-cream p-1" role="tablist" aria-label="Tool">
              <button role="tab" aria-selected={tab === 'search'} className={`${seg('search')} flex-1`} onClick={() => setTab('search')}>Search</button>
              <button role="tab" aria-selected={tab === 'compare'} className={`${seg('compare')} flex-1`} onClick={() => setTab('compare')}>Compare</button>
            </div>
            {info === false && (
              <div role="alert" className="mb-5 rounded-xl bg-blush p-3 text-sm">
                Cannot reach the backend. Start it with <code>uvicorn main:app --port 8000</code> in the backend folder.
              </div>
            )}
            {tab === 'search' ? <SearchPage /> : <ComparePage />}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-5xl px-5 pb-16 pt-8">
          <h2 className="text-center font-display text-3xl font-semibold">How it <span className="italic text-rose">works</span></h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <div key={title} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink text-sm font-bold">{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-ink/80">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10 py-5 text-center text-xs text-ink/60">
        {info === null ? '' : info
          ? `Model: ${info.model} · ${info.corpus_size} sentences · ${info.dimensions}-dimensional vectors · threshold ${info.threshold}`
          : 'Model details unavailable'}
      </footer>
    </div>
  )
}