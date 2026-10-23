AAVL 99 TERMINAL - Live index dashboard
=======================================

KYA HAI YEH
  Aapke 99 stocks ka market-cap weighted index "AAVL 99" (base 1000, 25-Sep-2026),
  TradingView jaisa chart ke saath, jo har 60 second mein live update hota hai.

EK BAAR KA SETUP
  1. Python install karein (3.9 ya naya): https://www.python.org/downloads/
     Windows par install karte waqt "Add Python to PATH" tick zaroor karein.
  2. Is folder ko unzip karke kahin bhi rakh dein.

CHALANA
  Windows : START_Windows.bat par double-click
  Mac     : START_Mac_Linux.command par double-click (ya Terminal mein: python3 aavl99_terminal.py)
  Browser apne aap khulega: http://127.0.0.1:8099
  Band karna: black window band kar dein (ya Ctrl+C).

  Bina internet ke try karna ho:  python aavl99_terminal.py --demo   (nakli prices, upar banner dikhega)

DASHBOARD MEIN
  - "Today": aaj ka minute-by-minute chart, dotted line = pichla close
  - "Since 25 Sep": base date se roz ka index
  - Right side: har stock ka price, day %, index mein kitne points jode (Pts), weight
  - "Data checks": koi ticker na mile ya sheet ka price asli price se bahut alag ho to yahan dikhega

WI-FI PAR SHARE KARNA (view only)
  Program chalu karte hi kaali window mein 2 link dikhenge:
     On this computer : http://127.0.0.1:8099        <- aapke liye (buttons ke saath)
     Share on Wi-Fi   : http://192.168.x.x:8099      <- yeh link doosron ko bhejein
  Wahi Wi-Fi link aapke dashboard par bhi upar-right mein likha dikhega.
  - Usi Wi-Fi se jude phone/laptop par yeh link kholne par sirf chart aur stocks dikhenge.
    "Refresh now" aur "Save closes to Excel" buttons unhe na dikhenge, na chalenge.
  - Aapka computer on aur yeh program chalu rehna zaroori hai.
  - Pehli baar Windows Firewall poochega "Allow access?" -> "Private networks" tick karke
    "Allow access" dabayein. Warna doosre devices link nahi khol payenge.
  - Link na khule to: Windows Settings > Network & internet > Wi-Fi > apna Wi-Fi >
    "Network profile type" ko "Private" karein.
  - Wi-Fi link (192.168...) router ke hisaab se kabhi-kabhi badal sakta hai; har baar
    kaali window mein naya link dekh lein.
  - Share band karna ho:  python aavl99_terminal.py --local-only

EXCEL (AAVL_99.xlsx) UPDATE KARNA
  Shaam 4 baje ke baad "Save closes to Excel" dabayein (Excel file band honi chahiye).
  Yeh 25-Sep se aaj tak ke official NSE closing prices sheet mein bhar dega.
  25-Sep ka column bhi official close se replace hoga, taaki Excel aur dashboard ka index same rahe.
  Ya command se:  python aavl99_terminal.py --update-excel

ZAROORI BAATEIN
  - Prices Yahoo Finance se aate hain (NSE). Yeh 1-2 minute peeche ho sakte hain; trading ke liye
    broker ka live feed hi use karein.
  - Chalte market mein dikhne wala index last traded price par hai. NSE ka official close aakhri
    30 minute ka average hota hai, isliye closing ke baad value thodi badal sakti hai.
  - Kisi company ka bonus/split ho to constituents.csv mein us line ka source_price ratio se
    divide kar dein (1:1 bonus = price / 2). Market cap wahi rehne dein.
  - Ticker badalna ho to constituents.csv ka nse_symbols column edit karein
    (kai options "|" se de sakte hain, jaise LTM|LTIM).
  - Shares = aapki sheet ka Market Cap / Price. Sheet mein galti ho to weight galat hoga;
    Data checks mein aisi companies ki warning aayegi.

PORTFOLIO AUR BETA (AAVL99_Portfolio.xlsx)
  - Summary sheet ke peele (yellow) cell mein investment amount daalein; har stock ki quantity,
    sector allocation aur baaki cash apne aap nikal aayega.
  - Beta nikalne ke liye: START_Beta_Windows.bat par double-click (Excel file band rakhein).
    Yeh 1 saal ka daily data (25-Sep-2025 se 25-Sep-2026) download karke har stock ka beta
    Nifty 50 ke against nikalega aur Excel mein bhar dega. Phir Excel kholkar Summary dekhein.
  - Jin stocks ka 60 din se kam data hai (jaise SBI Funds, July 2026 mein list hua) unka beta
    khaali rahega; portfolio beta baaki stocks par nikalta hai (coverage Summary mein dikhega).

FILES
  aavl99_terminal.py   program
  constituents.csv     99 companies, NSE symbols, market cap, price
  AAVL_99.xlsx         daily tracking sheet
  AAVL99_Portfolio.xlsx  99-stock portfolio, sectors, beta
  aavl99_beta.py       beta calculator
  web/                 dashboard page + TradingView Lightweight Charts (Apache 2.0)
