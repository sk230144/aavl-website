// Yahoo Finance's public chart endpoint, shared by the market data scripts. It needs no key but is
// unofficial; replace fetchChart() with a licensed feed if one is bought.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Raw chart result for one symbol. `params` are query parameters such as { range, interval } or { period1, period2, interval }. */
export async function fetchChart(symbol, params) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?${new URLSearchParams(params)}`
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) })
      if (response.status === 404) throw Object.assign(new Error('symbol not found'), { final: true })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const result = (await response.json()).chart?.result?.[0]
      if (!result?.timestamp?.length) throw Object.assign(new Error('no data in response'), { final: true })
      return result
    } catch (error) {
      if (error.final || attempt === 3) throw error
      await wait(1000 * attempt)
    }
  }
}

/** Exchange-local calendar date (YYYY-MM-DD) or minute (YYYY-MM-DDTHH:MM) for a unix timestamp. */
export const localDate = (seconds, gmtoffset) => new Date((seconds + gmtoffset) * 1000).toISOString().slice(0, 10)
export const localMinute = (seconds, gmtoffset) => new Date((seconds + gmtoffset) * 1000).toISOString().slice(0, 16)

export const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits

/** Run `task` over `items` with at most `size` in flight; results keep the input order. */
export async function pool(items, size, task) {
  const results = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await task(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker))
  return results
}
