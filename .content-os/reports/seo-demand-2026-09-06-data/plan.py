import json,glob,os,re,csv
from collections import Counter,defaultdict
D=os.path.dirname(os.path.abspath(__file__))
S="/Users/Maxim/Desktop/Cursor_ed/Бизнес/MORE_Group/italian-estate-website/src/content"
inv={c:[os.path.basename(f).rsplit('.',1)[0] for f in sorted(glob.glob(f"{S}/{c}/*.md*"))]
     for c in ['guides','projects','areas','compare','developers','news']}
LAND=['invest-lake-como-property','invest-liguria-property','invest-milan-property','invest-puglia-property',
 'invest-rome-property','invest-sardinia-property','invest-sicily-property','invest-tuscany-property']
TIER=['tier-entry','tier-mid','tier-luxury']
SERVICE=['about','contact','methodology','get-shortlist','italy-property-consultation','privacy-policy','terms','image-credits','site-report']
INDEX=['/','guides','projects','areas','compare','developers','news']

plan=[]  # (action, url, note, demand)
def add(a,u,n,d=0): plan.append({'action':a,'url':u,'note':n,'demand':d})

# ---------- WAVE 1: geo listing spine ----------
REG=[("tuscany",10410,["invest-tuscany-property","guides/tuscany-property-investment-guide","guides/tuscany-inland-property-guide","areas/chianti","areas/val-dorcia","areas/versilia"]),
("sicily",4720,["invest-sicily-property","guides/sicily-property-investment-guide","areas/syracuse","areas/noto"]),
("sardinia",4550,["invest-sardinia-property","guides/sardinia-property-investment-guide","areas/costa-smeralda"]),
("abruzzo",3310,["guides/abruzzo-property-investment-guide","areas/pescara","areas/chieti"]),
("puglia",3090,["invest-puglia-property","guides/puglia-property-investment-guide","areas/valle-d-itria","areas/ostuni","areas/carovigno","areas/polignano-a-mare","areas/cisternino","areas/bari"]),
("umbria",2010,["guides/umbria-property-investment-guide","areas/assisi","areas/perugia","areas/urbino"]),
("calabria",1340,["guides/calabria-property-investment-guide","areas/scalea"]),
("liguria",940,["invest-liguria-property","guides/liguria-property-investment-guide","areas/portofino","areas/sanremo","areas/savona","areas/santa-margherita-ligure"]),
("piedmont",500,["guides/piedmont-property-investment-guide","areas/alba","areas/langhe"]),
("le-marche",400,["guides/marche-property-investment-guide","areas/ancona","areas/urbino"]),
("molise",350,["guides/molise-property-investment-guide","areas/campobasso","areas/termoli"])]
CITY=[("rome",3410,["invest-rome-property","guides/rome-property-investment-guide","areas/rome-centro-storico"]),
("florence",3110,["guides/florence-property-investment-guide","areas/florence"]),
("venice",2180,["guides/venice-property-investment-guide"]),
("lake-como",2040,["invest-lake-como-property","guides/lake-como-property-investment-guide","areas/como","areas/bellagio"]),
("milan",1470,["invest-milan-property","guides/milan-property-investment-guide","areas/milan-navigli"]),
("naples",980,["areas/naples"]),("lucca",980,["areas/lucca"]),("sorrento",970,[]),("positano",790,[]),
("amalfi-coast",770,[]),("bologna",680,["guides/bologna-property-investment-guide","areas/bologna"]),
("palermo",540,["areas/palermo"]),("turin",490,["areas/turin"]),("capri",460,[]),
("lake-garda",370,["compare/lake-garda-vs-lake-como-property"]),("verona",360,[]),
("ravello",230,[]),("orvieto",200,[])]
add('создать','/property-for-sale/','Хаб страны. Витрина всех объектов, счётчик в title',41370)
for name,d,src in REG+CITY:
    lvl='регион' if (name,d,src) in REG else 'город/микро'
    if src: add('склеить в /property-for-sale/%s/'%name, ' + '.join('/'+s+'/' for s in src), f'{lvl}, {len(src)} стр. в одну', d)
    else:   add('создать','/property-for-sale/%s/'%name, f'{lvl}, страницы нет', d)
# ---------- WAVE 2: property types ----------
for slug,t,d in [("cheap-property-italy","Дешёвая недвижимость",1730),("one-euro-houses-italy","Дома за 1 евро",1610),
 ("land-for-sale-italy","Земля",910),("vineyards-for-sale-italy","Виноградники",600),
 ("castles-for-sale-italy","Замки",370),("farmhouses-trulli-masserie-italy","Фермы, трулли, массерии",90)]:
    ex = 'guides/italy-1-euro-homes-program' if 'one-euro' in slug else None
    if ex: add('переделать','/property-for-sale/'+slug+'/',f'{t}. Из /{ex}/, сменить URL и title на "for sale"',d)
    else:  add('создать','/property-for-sale/'+slug+'/',t,d)
# ---------- WAVE 3: life / relocation (весь кластер отсутствует) ----------
for slug,t,d in [("cost-of-living-italy","Стоимость жизни",2070),("moving-to-italy-from-usa","Переезд из США",1320),
 ("best-places-to-live-italy","Где жить",1320),("permesso-di-soggiorno","Вид на жительство, документ",1600),
 ("italy-citizenship-by-descent","Гражданство по крови",1040),("moving-to-italy-from-uk","Переезд из Британии",620),
 ("cost-of-living-rome-milan-florence","Стоимость жизни по городам",580),
 ("international-schools-italy","Международные школы",210),("healthcare-italy-foreigners","Медицина",150)]:
    add('создать','/living/'+slug+'/',t,d)
add('переделать','/living/retire-in-italy/','Из /guides/italy-retirement-property-guide/, сменить фокус с недвижимости на переезд',780)
# ---------- WAVE 4: visa ----------
add('оставить','/guides/italy-investor-visa-property/','Держит весь визовый кластер, 283 показа. Нужен title и внутренние ссылки, не переписывание',1780)
add('склеить в /guides/italy-investor-visa-property/','/guides/italy-residency-by-investment-guide/ + /guides/italy-investor-visa-requirements-2026/','Три страницы на один интент, каннибализация в GSC',0)
add('переделать','/guides/italy-digital-nomad-visa/','Из /guides/digital-nomad-italy-property-guide/, убрать property из фокуса',1320)
add('переделать','/guides/italy-elective-residence-visa/','Из /guides/italy-elective-residence-visa-property/, убрать property',460)
for c in ['elective-residence-vs-investor-visa-italy','flat-tax-vs-investor-visa-italy','italy-vs-malta-property-investment']:
    add('оставить','/compare/'+c+'/','Единственные три compare с живым интентом, он визовый не имущественный',0)
# ---------- WAVE 5: tax / process — чинить, не создавать ----------
add('переделать','/guides/ (индекс)','Листинг перехватывает 55 запросов налогового кластера на позиции 78. Убрать перечень заголовков из индексируемого текста, поставить canonical-хаб /taxes/',434)
add('создать','/taxes/','Хаб налогов, забирает у /guides/ 364 показа и раздаёт по статьям',390)
add('склеить в /guides/italy-capital-gains-tax-property/','/guides/selling-property-italy-foreigner/','Каннибализация на "selling property in italy taxes"',0)
add('склеить в /guides/italy-property-management-costs/','/guides/condominio-rules-foreign-owners/','Каннибализация на condominium fees',0)
# ---------- закрыть ----------
comp=inv['compare']; keep_comp=['elective-residence-vs-investor-visa-italy','flat-tax-vs-investor-visa-italy','italy-vs-malta-property-investment','lake-garda-vs-lake-como-property']
close_comp=[c for c in comp if c not in keep_comp]
add('закрыть','/compare/ x%d'%len(close_comp),'Нулевой спрос по всем "X vs Y property" в us и uk, 1 показ за 90 дней на всю коллекцию. 301 на соответствующие /property-for-sale/',0)
dev=inv['developers']
add('закрыть','/developers/ x%d'%(len(dev)-2),'13 из 15 названий застройщиков дали ноль в Semrush. Оставить coima и lendlease, у них есть брендовый спрос',0)
add('оставить','/developers/coima/ + /developers/lendlease/','coima 720+170, lendlease 2900+2400 брендового спроса',4190)
areas_dead=['versilia','val-dorcia','urbino','termoli','syracuse','scalea','savona','santa-margherita-ligure','sanremo','potenza','portofino','polignano-a-mare','pescara','parma','noto','monte-argentario','modena','matera','langhe','costa-smeralda','cisternino','chieti','chianti','carovigno','campobasso','bellagio','bari','assisi','arezzo','ancona','alba','valle-d-itria']
add('склеить в родительский регион','/areas/ x%d'%len(areas_dead),'Ноль коммерческого спроса на уровне города. Становятся секциями региональных витрин',0)
add('переделать','/projects/ x65','Спрос на названия проектов ноль во всех базах. Оставить как инвентарь под витринами, сменить title с имени проекта на "{тип} {гео} Italy", снять с роли самостоятельной цели',263)
add('оставить','/news/ x4 + /methodology/ + /about/ + /contact/ + правовые','Служебные, спрос не нужен',0)
add('оставить','/tier-entry/ /tier-mid/ /tier-luxury/','Внутренние фильтры по бюджету, переиспользовать как фасеты витрины',0)
json.dump(plan,open(D+"/plan.json","w"),ensure_ascii=False,indent=1)
c=Counter(p['action'].split(' в ')[0].split(' x')[0] for p in plan)
print("=== ПЛАН ПО ДЕЙСТВИЯМ ===")
for k,v in c.most_common(): print(f"  {k:32s} записей плана: {v}")
print("\n=== ТОЧНЫЙ СЧЁТ СТРАНИЦ ===")
create=[p for p in plan if p['action']=='создать']
print(f"  создать: {len(create)} страниц, суммарный спрос {sum(p['demand'] for p in create):,}/мес")
merged_src=sum(len(p['url'].split(' + ')) for p in plan if p['action'].startswith('склеить'))
print(f"  склеить: {merged_src+len(areas_dead)+len(close_comp)*0} исходных URL -> {len([p for p in plan if p['action'].startswith('склеить')])} целевых")
print(f"  закрыть: {len(close_comp)} compare + {len(dev)-2} developers = {len(close_comp)+len(dev)-2}")
print(f"  переделать: 65 projects + {len([p for p in plan if p['action']=='переделать'])-1} прочих")
print(f"\n  сейчас в sitemap: 298 URL")
