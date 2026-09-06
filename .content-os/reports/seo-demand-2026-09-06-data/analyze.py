import csv,re,json
from collections import defaultdict,Counter
D="/private/tmp/claude-501/-Users-Maxim-Desktop-Cursor-ed--------MORE-Group/b6644475-d276-4e72-91c3-ee276e8925a4/scratchpad/italy"
TOURISM=re.compile(r'\b(hotel|resort|beach holiday|weather|flights?|things to do|nightlife|tour|booking|'
 r'airbnb rental|restaurant|holiday rental|vacation rental|to rent|for rent|car hire)\b')
BRANDCOMP=re.compile(r'\b(idealista|immobiliare\.it|casa\.it|tecnocasa|gate.?away|tranio|knight frank|savills|'
 r'sotheby|engel volkers|lendlease|coima|frimm|okam|apulia deluxe|ostuni domus|italian estate|near milan|asti architetti|pregio)\b')
ANCHOR=re.compile(r'\b(italy|italian|italia|tuscany|puglia|sicily|sardinia|liguria|umbria|piedmont|lombardy|veneto|'
 r'marche|abruzzo|calabria|basilicata|molise|emilia|campania|lazio|trentino|rome|milan|florence|venice|naples|turin|'
 r'bologna|genoa|palermo|verona|lecce|ostuni|siena|lucca|perugia|assisi|arezzo|matera|taormina|noto|bari|parma|ancona|'
 r'sanremo|portofino|bellagio|como|salerno|catania|alberobello|cefalu|alghero|orvieto|spoleto|garda|amalfi|smeralda|'
 r'chianti|orcia|itria|cinque terre|versilia|langhe|dolomites|ravello|positano|sorrento|capri|salento|maggiore|gargano|'
 r'aeolian|codice fiscale|permesso|cedolare|imu|ivie|ivafe|notaio|geometra|rogito|compromesso|superbonus|trulli|masseria|salva.?casa|abusi|condono|prima casa|agriturismo)\b')
def cluster(k):
    if BRANDCOMP.search(k): return 'brand/navigational'
    if re.search(r'\b(visa|residency|residence permit|citizenship|permesso|golden visa|nomad|90.?180)\b',k): return 'visa'
    if re.search(r'\b(tax|imu|tari|stamp duty|cedolare|ivie|ivafe|cadastral|capital gain|inheritance|impatriate|prima casa|notary|condominium fee|spese)\b',k): return 'money/tax'
    if re.search(r'\b(mortgage|loan|transferring money|closing costs|purchase costs|cost of buying|fees)\b',k): return 'money/finance'
    if re.search(r'\b(notaio|compromesso|rogito|codice fiscale|lawyer|conveyanc|due diligence|survey|geometra|deed|power of attorney|scam|mistakes|remotely|reciprocity|title|auction|through a company|process)\b',k): return 'legal/process'
    if re.search(r'\b(renovat|superbonus|building permit|salva.?casa|abusi|condono|ape|agibilita|insurance|seismic|heritage|builder|architect)\b',k): return 'renovation/risk'
    if re.search(r'\b(cost of living|retire|expat|moving to|living in|school|healthcare|best places to (live|retire)|safest)\b',k): return 'life/relocation'
    if re.search(r'\b(yield|roi|buy to let|rental income|airbnb|short term rental|cin code|holiday let|forecast|market 2026|student housing|commercial property|agriturismo investment)\b',k): return 'investment/yield'
    if re.search(r'\bvs\b',k): return 'choice/compare'
    if re.search(r'\b(property investment|invest in|investing in)\b',k): return 'investment-framing (dead)'
    if re.search(r'(for sale|real estate|house prices|property in italy|homes|villas|apartments|cheap|castle|land|vineyard|trulli|masseria|farmhouse)',k): return 'commercial/listing'
    if re.search(r'\b(1 euro|one euro|€1)\b',k): return 'one-euro-homes'
    return 'other'
def geolevel(k):
    if re.search(r'\b(tuscany|puglia|sicily|sardinia|liguria|umbria|piedmont|lombardy|veneto|le marche|abruzzo|calabria|basilicata|molise|emilia romagna|campania|lazio|trentino)\b',k): return 'region'
    if re.search(r'\b(rome|milan|florence|venice|naples|turin|bologna|genoa|palermo|verona|lecce|ostuni|siena|lucca|perugia|assisi|arezzo|matera|taormina|noto|bari|parma|ancona|sanremo|portofino|bellagio|como|salerno|catania|alberobello|cefalu|alghero|orvieto|spoleto)\b',k) and 'lake como' not in k: return 'city'
    if re.search(r"(lake como|lake garda|amalfi|costa smeralda|chianti|val d'orcia|valle d'itria|cinque terre|versilia|langhe|dolomites|ravello|positano|sorrento|capri|salento|lake maggiore|gargano|aeolian)",k): return 'micro'
    return 'country'
out={}
for db in ['us','uk']:
    rows=[r for r in csv.DictReader(open(f"{D}/semrush_{db}.csv"),delimiter=';')]
    kept=[];drop=[]
    for r in rows:
        k=r['keyword']; v=int(r['volume'])
        if v<=0: drop.append((k,v,'zero volume')); continue
        if TOURISM.search(k): drop.append((k,v,'tourism')); continue
        if not ANCHOR.search(k): drop.append((k,v,'no italy anchor')); continue
        kept.append({'k':k,'v':v,'kd':int(r['kd'] or 0),'cluster':cluster(k),'geo':geolevel(k)})
    out[db]=kept
    print(f"\n############ {db.upper()} ############")
    print(f"фраз с объёмом: {len(rows)}  оставлено: {len(kept)}  отсеяно: {len(drop)}")
    tot=sum(x['v'] for x in kept); print(f"ЁМКОСТЬ (показов/мес по деловому спросу): {tot:,}")
    print("\n-- по кластеру --")
    c=defaultdict(lambda:[0,0])
    for x in kept: c[x['cluster']][0]+=x['v']; c[x['cluster']][1]+=1
    for k,(v,n) in sorted(c.items(),key=lambda z:-z[1][0]):
        print(f"  {k:28s} {v:7,}  {v/tot:5.1%}  фраз {n:3d}")
    print("\n-- по уровню гео (только commercial/listing + investment-framing) --")
    g=defaultdict(lambda:[0,0])
    for x in kept:
        if x['cluster'] in ('commercial/listing','investment-framing (dead)'):
            g[x['geo']][0]+=x['v']; g[x['geo']][1]+=1
    gt=sum(v for v,n in g.values())
    for k,(v,n) in sorted(g.items(),key=lambda z:-z[1][0]):
        print(f"  {k:10s} {v:7,}  {v/gt:5.1%}  фраз {n:3d}")
    print("\n-- топ-15 фраз --")
    for x in sorted(kept,key=lambda z:-z['v'])[:15]:
        print(f"  {x['v']:6,}  KD{x['kd']:3d}  [{x['cluster']}]  {x['k']}")
    print("\n-- отсев: причины --")
    dc=Counter(d[2] for d in drop); print("  ",dict(dc))
    json.dump({'kept':kept,'dropped':[{'k':a,'v':b,'why':c} for a,b,c in drop]},
              open(f"{D}/core_{db}.json","w"),ensure_ascii=False,indent=1)
