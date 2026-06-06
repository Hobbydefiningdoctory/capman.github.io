<div align="center">

<img src="logo/1.png" alt="capman" width="320" />

<br/>

**Give your AI agent a map of your app — instead of letting it click around blindly.**

[![npm](https://img.shields.io/npm/v/capman?color=%237f0000&labelColor=%230a0a0a&style=flat-square)](https://www.npmjs.com/package/capman)
[![license](https://img.shields.io/npm/l/capman?color=%23c9a84c&labelColor=%230a0a0a&style=flat-square)](./LICENSE)
[![tests](https://img.shields.io/badge/tests-132%20passing-%237f0000?labelColor=%230a0a0a&style=flat-square)](#)
[![zero deps](https://img.shields.io/badge/zero-runtime_deps-%23444038?labelColor=%230a0a0a&style=flat-square)](#)

<br/>

[**Install**](#-quick-start) · [**Docs**](https://github.com/Hobbydefiningdoctory/capman/blob/main/CODEBASE.md) · [**Changelog**](https://github.com/Hobbydefiningdoctory/capman/blob/main/CHANGELOG.md) · [**npm**](https://npmjs.com/package/capman)

</div>

---

## The Problem

When an AI agent answers *"are there seats available Friday?"*, today it navigates your app like a tourist:

```
AI clicks → Home → Explore → Events → Category → Availability
```

Slow. Wasteful. Touches screens it shouldn't.

## The Solution

Your app publishes a **capability manifest** — a machine-readable list of what it can do, what API to call, and what data it's allowed to touch. The agent reads the manifest and goes directly to the answer.

```
User query → match capability → call API → structured result
```

---

## ⚡ Quick Start

**1. Install**

```bash
npm install capman
```

**2. Generate your manifest**

```bash
# From an existing OpenAPI/Swagger spec
npx capman generate --from openapi.json
npx capman generate --from https://api.your-app.com/openapi.json

# AI-assisted from a plain-English description
npx capman generate --ai

# Start from scratch
npx capman init
```

**3. Ask in plain language**

```typescript
import { CapmanEngine, readManifest } from 'capman'

const engine = new CapmanEngine({
  manifest: readManifest(),
  baseUrl:  'https://api.your-app.com',
})

const result = await engine.ask('Check availability for blue jacket')

console.log(result.match.capability?.id)   // 'check_product_availability'
console.log(result.resolution.apiCalls)    // [{ method: 'GET', url: '...' }]
console.log(result.resolvedVia)            // 'keyword' | 'llm' | 'cache'
console.log(result.verdict)               // 'clear' | 'marginal' | 'uncertain'
console.log(result.trace.reasoning)       // full step-by-step breakdown
```

**4. Try it live**

```bash
npx capman demo
```

---

## 🔍 How Matching Works

capman runs a three-tier cascade on every query:

```
  Query
    │
    ▼
┌─────────────────────────┐
│   BM25 keyword match    │  ← always runs, sub-millisecond, free
└────────────┬────────────┘
             │ confidence < 50%?
             ▼
┌─────────────────────────┐
│   Fuzzy match (Fuse.js) │  ← typos, paraphrases, partial words
└────────────┬────────────┘
             │ still uncertain?
             ▼
┌─────────────────────────┐
│    LLM reranker         │  ← BM25 narrows top-3 → LLM picks best
└─────────────────────────┘
```

**Pick your cost/accuracy tradeoff:**

```typescript
// Free — keyword only, sub-millisecond
new CapmanEngine({ manifest, mode: 'cheap' })

// Recommended — keyword first, LLM fallback
new CapmanEngine({ manifest, mode: 'balanced', llm: myLLM })

// Maximum accuracy — LLM first, keyword fallback
new CapmanEngine({ manifest, mode: 'accurate', llm: myLLM })
```

Pass any LLM — Anthropic, OpenAI, or anything that takes a string and returns a string.

---

## 📦 What You Get Back

Every `ask()` call returns a rich result — not just an endpoint:

| Field | Type | Description |
|---|---|---|
| `match.capability` | `Capability \| null` | What was matched |
| `match.confidence` | `0–100` | Match confidence score |
| `resolution.apiCalls` | `ApiCall[]` | Exact HTTP calls to make |
| `resolvedVia` | `'keyword' \| 'llm' \| 'cache'` | How it was resolved |
| `verdict` | `'clear' \| 'marginal' \| 'uncertain'` | Whether to proceed or ask user |
| `missingParams` | `string[]` | Params the agent should ask for |
| `partialSuccess` | `PartialSuccess \| null` | Mixed success on multi-endpoint calls |
| `trace` | `Trace` | Full step-by-step execution breakdown |

`verdict` tells your agent whether to proceed confidently (`clear`), ask the user to confirm (`marginal`), or say it's not sure (`uncertain`).

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🗺️ Three manifest generators**
OpenAPI import, AI-assisted, or write it yourself with `capman init`.

</td>
<td width="50%">

**🔎 Execution trace on every query**
Keyword scores, LLM reasoning, timing — always visible.

</td>
</tr>
<tr>
<td>

**💡 `explain()` without executing**
See what would match and why, with per-candidate score explanations — before any API call.

</td>
<td>

**❤️ `health()` operator snapshot**
Circuit breaker state, LLM quota, cache size, learning stats. Never throws.

</td>
</tr>
<tr>
<td>

**🔒 Privacy enforcement**
`public / user_owned / admin` checked per capability before any API call is made.

</td>
<td>

**📈 Adaptive learning**
Time-decayed BM25 IDF. Successful resolutions boost future matching. Configurable half-life.

</td>
</tr>
<tr>
<td>

**🧠 Semantic embedding support**
Bring your own embedding model as a third RRF signal alongside BM25 and Fuse.js.

</td>
<td>

**🛡️ LLM protection**
Rate limiting, per-call cooldown, and circuit breaker built in. No surprise bills.

</td>
</tr>
<tr>
<td>

**🔄 Safe concurrency**
`ConcurrentCapmanEngine` — zero-dependency promise queue for shared server instances.

</td>
<td>

**💾 Pluggable caching**
Memory, file-backed, or memory+file combo with optional TTL.

</td>
</tr>
</table>

---

## 🆕 What's New in v0.6.2

### Concurrency Safety
- `manifestVersion` optimistic guard — `ask()` skips cache write when `loadManifest()` was called mid-flight
- All derived state assigned atomically before `await` in `loadManifest()`
- New: **`ConcurrentCapmanEngine`** — zero-dependency promise queue for shared-instance server use

```typescript
import { ConcurrentCapmanEngine } from 'capman'

// ask() and explain() calls are automatically serialised
const engine = new ConcurrentCapmanEngine(opts)
```

### New APIs
- **`engine.health()`** — operator snapshot: circuit breaker, LLM rate limit, cache size, learning stats, embedding readiness. Never throws; returns `status: 'unhealthy'` on internal error.
- **`ResolveResult.partialSuccess`** — populated when a multi-endpoint capability has mixed success/failure; `completedCalls` and `failedCalls` surfaced for consumer compensation logic.
- **`EngineOptions.llmTagFilter`** — narrows capabilities sent to LLM by tag; BM25 always uses full manifest; falls back gracefully with warning.
- **`EngineOptions.llmWithMessages`** — structured system/user message interface; capability context → system, sanitised query → user. Stronger injection resistance.

---

## 🖥️ CLI

| Command | Description |
|---|---|
| `capman init` | Create a starter `capman.config.js` |
| `capman generate` | Build manifest from `capman.config.js` |
| `capman generate --from <path\|url>` | Import from OpenAPI / Swagger spec |
| `capman generate --ai` | Generate manifest using AI |
| `capman validate` | Validate your manifest for errors |
| `capman inspect` | Print all capabilities in the manifest |
| `capman explain "query"` | Show what would match and why — no execution |
| `capman run "query"` | Run a query against your manifest |
| `capman run "query" --debug` | Run with full candidate scoring |
| `capman demo` | Live demo with a sample app |

---

## ✅ Honest Limits

**Works well:**
- Structured data retrieval via APIs
- Auto-generating manifests from OpenAPI specs
- Privacy enforcement before any API call
- Full tracing — always know what happened and why
- Caching and learning that improve over time

**Current limits:**
- Real-time infra status — capman calls APIs, it doesn't monitor them
- UI-only state with no API backing — if there's no API, there's nothing to call
- Very ambiguous queries — use `mode: 'accurate'` or `fuzzyMatch: true`
- `FileCache` and `FileLearningStore` are single-instance only — concurrent writers will corrupt the file
- Multi-endpoint capabilities: if one endpoint fails mid-flight, prior side effects can't be rolled back

---

## 📚 More Docs

| Document | Description |
|---|---|
| [CODEBASE.md](./CODEBASE.md) | Full technical reference — every option, every field, every internal decision |
| [CONCURRENCY.md](./CONCURRENCY.md) | Safe/unsafe patterns, three recommended concurrency approaches |
| [CHANGELOG.md](./CHANGELOG.md) | Full version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Dev setup, PR guidelines |

---

<div align="center">

**MIT License** · [github.com/Hobbydefiningdoctory/capman](https://github.com/Hobbydefiningdoctory/capman)

</div>
