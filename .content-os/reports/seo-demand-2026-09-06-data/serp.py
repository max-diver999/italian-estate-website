import os,sys,json,re,urllib.parse,urllib.request,concurrent.futures as cf
U=os.environ['XMLRIVER_USER']; K=os.environ['XMLRIVER_KEY']
D=os.path.dirname(os.path.abspath(__file__))
CO={'us':2840,'uk':2826,'au':2036,'de':2276,'ae':2784,'ca':2124}
US=["homes for sale in italy","houses for sale in italy","houses for sale in tuscany italy","italy real estate",
"property for sale in italy","italian real estate","italy golden visa","moving to italy from usa",
"cost of living in italy","houses for sale in sicily italy","italy digital nomad visa","best places to live in italy",
"villas for sale in italy","italy citizenship by descent","cheap houses in italy","italy property for sale",
"houses for sale in rome italy","permesso di soggiorno","cheap houses for sale in italy","houses for sale in sardinia italy",
"houses for sale in florence italy","lake como italy real estate","one euro houses italy","houses for sale lake como italy",
"houses for sale in sorrento italy","property tax in italy","codice fiscale italy","italy elective residence visa",
"italy retirement visa","houses for sale in umbria italy","italy investor visa","how to buy property in italy",
"tuscany italy property investment","invest in puglia italy property","italy vs malta property investment","rome vs milan property"]
UK=["houses for sale in italy","property for sale in italy","property for sale in tuscany italy","italy property for sale",
"houses for sale in tuscany italy","homes for sale in italy","italian property for sale","houses in italy for sale",
"permesso di soggiorno","property for sale in puglia italy","sicily property for sale","property for sale in sardinia italy",
"sardinia property for sale","tuscany property for sale","houses for sale in sicily italy","property in italy",
"moving to italy from uk","property for sale in abruzzo italy","abruzzo property for sale","houses for sale in puglia italy",
"italy golden visa","houses for sale in sardinia italy","cheap houses for sale in italy","cheap houses in italy",
"1 euro houses italy","property for sale in sicily italy","puglia property for sale","property for sale in umbria italy",
"italy digital nomad visa","venice property for sale","property for sale in liguria italy","property for sale in calabria italy"]
GEN=["houses for sale in italy","property for sale in italy","italy property for sale","buying property in italy",
"italy golden visa","cost of living in italy","houses for sale in tuscany italy","italy real estate",
"can foreigners buy property in italy","italy investor visa","1 euro houses italy","property tax in italy",
"villas for sale in italy","retire in italy","italy digital nomad visa"]
JOBS=[('us',q) for q in US]+[('uk',q) for q in UK]+[('au',q) for q in GEN]+[('de',q) for q in GEN[:10]]+[('ae',q) for q in GEN[:10]]+[('ca',q) for q in GEN[:10]]
def fetch(job):
    c,q=job
    url=("https://xmlriver.com/search/xml?user=%s&key=%s&query=%s&groupby=10&country=%d&lr=en&device=desktop"
         %(U,K,urllib.parse.quote_plus(q),CO[c]))
    for _ in range(3):
        try:
            x=urllib.request.urlopen(url,timeout=60).read().decode('utf-8','replace')
            if '<error' in x and 'limit' in x.lower(): continue
            docs=re.findall(r'<doc>(.*?)</doc>',x,re.S)
            out=[]
            for d in docs:
                u=re.search(r'<url>(.*?)</url>',d); t=re.search(r'<title>(.*?)</title>',d)
                ct=re.search(r'<contenttype>(.*?)</contenttype>',d)
                if u: out.append({'url':u.group(1),'title':(t.group(1) if t else ''),'type':(ct.group(1) if ct else '')})
            ai = 1 if re.search(r'<ai>\s*<present>1',x) else 0
            return {'country':c,'query':q,'ai_overview':ai,'results':out[:10]}
        except Exception as e:
            err=str(e)
    return {'country':c,'query':q,'error':err,'results':[]}
res=[]
with cf.ThreadPoolExecutor(8) as ex:
    for r in ex.map(fetch,JOBS): res.append(r)
json.dump(res,open(D+"/serp.json","w"),ensure_ascii=False,indent=1)
ok=sum(1 for r in res if r['results'])
print("jobs",len(JOBS),"with results",ok,"cost RUB",round(len(JOBS)*0.025,3))
