// The instruments shown on the website. Shared by the build-time snapshot (fetch-market-data.mjs)
// and the live quote relay (worker/src/index.js), so both always cover the same ids.
// `range` is how much daily history the build keeps ('1d' = quote only, for the ticker); `ohlc` keeps
// open/high/low for candlestick charts.
export const INSTRUMENTS = [
  { id: 'SENSEX', label: 'SENSEX', name: 'S&P BSE SENSEX', yahoo: '^BSESN', range: '5y', ohlc: true },
  { id: 'NIFTY', label: 'NIFTY 50', name: 'NIFTY 50', yahoo: '^NSEI', range: '1y' },
  { id: 'BSE500', label: 'BSE 500', name: 'S&P BSE 500', yahoo: 'BSE-500.BO', range: '1y' },
  { id: 'USDINR', label: 'USD/INR', name: 'US dollar / Indian rupee', yahoo: 'INR=X', range: '1y' },
  { id: 'GOLD', label: 'Gold (USD)', name: 'Gold futures, USD per troy ounce', yahoo: 'GC=F', range: '1y' },
  { id: 'RELIANCE', label: 'Reliance', name: 'Reliance Industries', yahoo: 'RELIANCE.BO', range: '1d' },
  { id: 'HDFCBANK', label: 'HDFC Bank', name: 'HDFC Bank', yahoo: 'HDFCBANK.BO', range: '1d' },
  { id: 'TCS', label: 'TCS', name: 'Tata Consultancy Services', yahoo: 'TCS.BO', range: '1d' },
  { id: 'INFY', label: 'Infosys', name: 'Infosys', yahoo: 'INFY.BO', range: '1d' },
  { id: 'ICICIBANK', label: 'ICICI Bank', name: 'ICICI Bank', yahoo: 'ICICIBANK.BO', range: '1d' },
  { id: 'SBIN', label: 'SBI', name: 'State Bank of India', yahoo: 'SBIN.BO', range: '1d' },
  { id: 'ITC', label: 'ITC', name: 'ITC', yahoo: 'ITC.BO', range: '1d' },
]
