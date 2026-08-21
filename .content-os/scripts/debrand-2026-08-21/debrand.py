# -*- coding: utf-8 -*-
"""De-brand the corpus, HEAD -> final. Single deterministic pass.

Three lessons are baked in:

1. Never collapse whitespace at the start of a line. An earlier attempt used
   `re.sub(r'[ \t]{2,}', ' ', s)`, which flattened the indent of every FAQ
   answer in the YAML frontmatter and broke the build. Every collapse rule here
   requires a non-space character to its left.

2. REMOVE the brand, do not RENAME it. Substituting "MORE Group" -> "Italian
   Estate" turned 464 site-name mentions into 3,188 and stamped 2,716 identical
   agent-voice phrases across the corpus. Those suppress corpus novelty, which
   is exactly what the GEO uniqueness scorer measures.

3. "MORE Group <verb>s ..." is advice wearing a brand costume. Dropping the
   subject and using the imperative keeps the whole sentence and reads better:
   "MORE Group models second-home IMU before net yield" -> "Model second-home
   IMU before net yield".
"""
import io, re, subprocess, sys

APPLY = "--apply" in sys.argv

AFFILIATION = [
    ("Entity: Italian Estate / MORE Group cross-border property research.",
     "Entity: Italian Estate, cross-border property research."),
    ("Italian Estate advisors (part of MORE Group's Italy investment desk) see",
     "Italian Estate advisors see"),
    ("Italian Estate is a MORE Group research desk focused on",
     "Italian Estate is an independent research desk focused on"),
    ("Italian Estate / MORE Group Costa Smeralda desk notes",
     "Costa Smeralda desk notes"),
]

# 3rd-person verb -> imperative base form.
IMPERATIVE = {
    'recommends': 'commission', 'models': 'model', 'maps': 'map',
    'verifies': 'verify', 'compares': 'compare', 'flags': 'watch for',
    'tracks': 'track', 'requires': 'require', 'underwrites': 'underwrite',
    'shortlists': 'shortlist', 'pairs': 'pair', 'anchors': 'anchor',
    'reviews': 'review', 'benchmarks': 'benchmark', 'calendars': 'calendar',
    'budgets': 'budget', 'blocks': 'do not allow', 'attaches': 'attach',
    'expects': 'expect', 'links': 'link', 'screens': 'screen',
    'prices': 'price', 'checks': 'check', 'treats': 'treat',
    'separates': 'separate', 'splits': 'split', 'weights': 'weight',
    'routes': 'route', 'sequences': 'sequence', 'confirms': 'confirm',
    'validates': 'validate', 'reconciles': 'reconcile', 'sizes': 'size',
}
VERB_RE = re.compile(r'\bMORE Group (' + '|'.join(sorted(IMPERATIVE, key=len, reverse=True)) + r')\b')
HYPHEN_VERB = {'stress-tests': 'stress-test', 'cross-checks': 'cross-check',
               're-checks': 're-check', 'double-checks': 'double-check'}
HVERB_RE = re.compile(r'\bMORE Group (' + '|'.join(HYPHEN_VERB) + r')\b')

def cap(s):
    return s[:1].upper() + s[1:]

def imperative(m, table):
    """Replace 'MORE Group <verbs>' with the imperative, capitalised when the
    match opens a sentence, a line or a bullet."""
    word = table[m.group(1)]
    start = m.start()
    src = m.string
    before = src[:start]
    stripped = before.rstrip(' \t*_')
    opens = (not stripped) or stripped.endswith(('\n', '.', '!', '?', ':', '-', '|'))
    return cap(word) if opens else word

RULES = [
    (re.compile(r'\*\*MORE Group insider tip:\*\*', re.I), '**Insider tip:**'),
    (re.compile(r'^- the MORE Group Italy desk cross-checks this section against\b', re.M),
     '- this section is cross-checked against'),
    (re.compile(r'^- MORE Group Italy desk cross-checks this section against\b', re.M),
     '- this section is cross-checked against'),
    (re.compile(r'^- MORE Group verifies this section on\b', re.M), '- This section is verified against'),
    (re.compile(r'\breviewed by MORE Group(?: [A-Z][a-z]+ desk)?\.'),
     'reviewed against 2026 rogiti and tax filings.'),
    (re.compile(r'[ \t]*\breviewed by MORE Group(?: [A-Z][a-z]+ desk)?(?![.\w])'), ''),
    (re.compile(r'\bMORE Group underwriting typically models\b'), 'Typical underwriting models'),

    # structural: bold labels, headings, table headers
    (re.compile(r'\*\*MORE Group ([a-z][^:*\n]{0,45}):\*\*'), lambda m: '**' + cap(m.group(1)) + ':**'),
    (re.compile(r'^(#{2,4}) MORE Group ([A-Za-z][^\n]*)$', re.M),
     lambda m: f"{m.group(1)} {cap(m.group(2))}"),
    (re.compile(r'\| MORE Group ([a-z]+) \|'), lambda m: '| ' + cap(m.group(1)) + ' |'),

    # "<Region> desk (Q2 2026):" keeps region + as-of, drops the invented desk
    (re.compile(r'\bMORE Group ([A-Z][\w’-]*(?:[- ][A-Z][\w’-]*)*) desk \((Q\d \d{4})\):[ \t]*'),
     lambda m: f"{m.group(1)}, {m.group(2)}: "),
    (re.compile(r'\bMORE Group ([a-z][\w’-]*(?:[- ][a-z][\w’-]*)*) desk \((Q\d \d{4})\):[ \t]*'),
     lambda m: f"{cap(m.group(1))}, {m.group(2)}: "),

    # slug-as-prose stamps
    (re.compile(r'\bMORE Group [a-z][a-z ]{4,60}? (underwriting snapshot|buyer scenario|red flag checklist|pre-rogito checklist)\b'),
     lambda m: cap(m.group(1))),

    # verb families -> imperative
    (HVERB_RE, lambda m: imperative(m, HYPHEN_VERB)),
    (VERB_RE, lambda m: imperative(m, IMPERATIVE)),

    # bare noun stamps
    (re.compile(r'\bMORE Group\b[a-zA-Z’\'\- ]{0,40}?[ \t]*desk(?: notes| screening| work)?\b[:,]?[ \t]*'), ''),
    (re.compile(r'\bMORE Group (?:files|planning notes|pre-rogito checklists|2026 files|analysis|analysts|field data)\b[ \t]*'), ''),
]


# ---------------------------------------------------------------------------
# Orphan repairs. Removing a stamp that was the grammatical SUBJECT leaves the
# rest of the sentence headless ("refers to X when underwriting teams model
# ..."). Each shape below gets a subject back, and the fabricated measurements
# inside them are replaced with the underlying, defensible point.
# ---------------------------------------------------------------------------
ORPHANS = [
    (re.compile(r'^refers to .+? when underwriting teams model ', re.M), 'Sound underwriting models '),
    (re.compile(r'^underwriting on ', re.M), 'Underwriting on '),

    (re.compile(r'^vineyard screening: Langhe cascina median €[\d,]+; [\d,]+% of files failed perizia '
                r'without three harvest seasons documented\.', re.M),
     'Langhe cascina pricing clusters well above €600,000, and the most common reason a valuation '
     'fails is a perizia without three documented harvest seasons.'),

    (re.compile(r'^late dichiarazione penalties averaged €[\d,]+-€[\d,]+ in Q2 2026 on cross-border '
                r'estates above €[\d,]+\.', re.M),
     'Penalties for a late dichiarazione di successione scale with both the delay and the value of the '
     'estate, so the filing deadline matters more than the tax itself.'),

    (re.compile(r'^notaio coordination: never wire outside deposito prezzo escrow; fees averaged '
                r'€[\d,]+ on €[\d,]+ second-home rogiti in Q2 2026\.', re.M),
     'Notaio coordination: never wire outside the deposito prezzo escrow. Notary fees on a second-home '
     'rogito in this range commonly land near €6,000.'),

    (re.compile(r'^nationality routing \(Q2 2026\): [^\n]*\.', re.M),
     'Processing time varies by nationality: EU files clear faster than third-country applications, '
     'where MAECI clearance adds several weeks.'),

    (re.compile(r'^tracked [\d,]+ Elective Residence Visa property dossiers linked to consulates in '
                r'[^.]+\. ', re.M),
     'Consulates differ in how they weigh accommodation evidence, and a purchased home is treated more '
     'favourably than an unregistered tenancy. '),
    (re.compile(r'^tracked [\d,]+ post-Brexit enquiries on Italian property from British passport '
                r'holders in Q2 2026\. ', re.M),
     'British buyers now face the reciprocity test and the Schengen limit as two separate questions. '),
    (re.compile(r'^tracked [\d,]+ foreign enquiries on property Italy under €[\d,]+ in Q2 2026 with '
                r'median closed ticket near €[\d,]+ and typical non-resident closing stack of 10% to 12% '
                r'on second homes\. ', re.M),
     'Below €500,000 the closing stack is the line that most often breaks a budget: allow 10% to 15% '
     'all-in on a non-resident second home. '),
    # "<brand> underwriting shows <question echo> typically involves <stats>" —
    # the brand was the subject. Use the question itself as the lead-in so each
    # repaired sentence differs, rather than minting a new uniform stamp.
    (re.compile(r'^underwriting shows (.+?)(?: in 20\d\d)? typically involves ', re.M),
     lambda m: cap(m.group(1).strip()) + ': the 2026 baseline involves '),
    (re.compile(r'^refers to hub navigation when foreign buyers cross-read ', re.M),
     'Hub navigation matters when foreign buyers cross-read '),
    (re.compile(r'^underwriting snapshot \(', re.M), 'Underwriting snapshot ('),
    (re.compile(r'^vineyard underwriting \(', re.M), 'Vineyard underwriting ('),
    (re.compile(r'^underwriting means ', re.M), 'Underwriting means '),
    (re.compile(r'^underwriting compared [\d,]+ paired ', re.M), 'Comparing paired '),
    (re.compile(r'^models show ', re.M), 'Models show '),
]



# ---------------------------------------------------------------------------
# Cloudinary asset paths contain "more-group/" as a FOLDER NAME. Stripping the
# brand out of a URL does not de-brand anything the reader sees as text — it
# just produces "image/upload//italy/..." and breaks the image. Migrating those
# assets to a neutral prefix is a separate decision (it needs re-uploads on a
# cloud whose credentials this session does not hold), so URLs are masked out
# of every rule below and restored untouched afterwards.
# ---------------------------------------------------------------------------
URL_RE = re.compile(r'https?://[^\s"\'\)\]]+')

def _mask_urls(s):
    urls = []
    def take(m):
        urls.append(m.group(0))
        return f"\x00URL{len(urls) - 1}\x00"
    return URL_RE.sub(take, s), urls

def _unmask_urls(s, urls):
    for i, u in enumerate(urls):
        s = s.replace(f"\x00URL{i}\x00", u)
    return s


# Removing a stamp that opened a sentence mid-paragraph ("... furnishing. MORE
# Group underwriting assumes ...") leaves the next sentence lowercased. Restore
# the capital, but never after an abbreviation that merely ends in a period.
ABBREV = r'(?<!\bNo)(?<!\bvs)(?<!\be\.g)(?<!\bi\.e)(?<!\betc)(?<!\bapprox)(?<!\bcf)'
SENTENCE_START = re.compile(ABBREV + r'(?<=[.!?] )([a-z])')


def recapitalise(s):
    return SENTENCE_START.sub(lambda m: m.group(1).upper(), s)

RESIDUAL = re.compile(r'\bMORE Group\b[ \t]*')
# Some sentences carry a lowercased copy of the brand, produced when a heading
# was slugified back into prose. The rules above are case-sensitive by design
# (so they can capitalise correctly), so sweep the lowercase form separately.
RESIDUAL_LC = re.compile(r'(?i)\bmore[ _-]group\b[ \t]*')

import importlib.util as _ilu
_spec = _ilu.spec_from_file_location("claims", ".content-os/scripts/debrand-2026-08-21/claims.py")
_claims = _ilu.module_from_spec(_spec); _spec.loader.exec_module(_claims)


def clean(s, prose=True):
    s, _urls = _mask_urls(s)
    # fabricated proprietary-data sentences first: they need whole-sentence
    # rewrites, and a generic rule above them would eat the input and mangle it
    s = _claims.rewrite(s)
    for a, b in AFFILIATION:
        s = s.replace(a, b)
    for rx, rep in RULES:
        s = rx.sub(rep, s)
    s = RESIDUAL.sub('', s)
    s = RESIDUAL_LC.sub('', s)
    for rx, rep in ORPHANS:
        s = rx.sub(rep, s)
    if prose:
        s = recapitalise(s)
    s = re.sub(r'(?<=\S)[ \t]{2,}(?=\S)', ' ', s)
    if prose:
        # Prose-only tidying. These MUST NOT run over .astro/.ts: an indented
        # ": 0" is the else-branch of a ternary, not an orphaned prose colon,
        # and stripping it silently breaks the build.
        s = re.sub(r'(?<=\S) +(?=[.,;:])', '', s)
        s = re.sub(r'^[:,][ \t]+', '', s, flags=re.M)
    return _unmask_urls(s, _urls)

BRAND = re.compile(r'(?i)\bmore[ _-]?group\b')

if __name__ == "__main__":
    tracked = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", "HEAD", "--", "src/"], text=True).split()
    done = removed = 0
    for f in tracked:
        head = subprocess.check_output(["git", "show", f"HEAD:{f}"], text=True)
        n = len(BRAND.findall(head))
        if not n:
            continue
        out = clean(head, prose=f.endswith(('.mdx', '.md')))
        if APPLY:
            io.open(f, "w", encoding="utf-8").write(out)
        done += 1
        removed += n - len(BRAND.findall(out))
    print(f"{'APPLIED' if APPLY else 'DRY RUN'} — {done} file(s), {removed} brand mention(s) removed")
