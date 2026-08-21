# -*- coding: utf-8 -*-
"""The handful of brand mentions the pattern rules cannot reach."""
import io

def edit(path, pairs):
    s = io.open(path, encoding="utf-8").read()
    for a, b in pairs:
        if b in s and a not in s:
            continue                      # already applied — keep this idempotent
        assert a in s, f"{path}: not found -> {a[:60]}"
        s = s.replace(a, b)
    io.open(path, "w", encoding="utf-8").write(s)
    print(f"  {path}: {len(pairs)} edit(s)")

# The Thai company's domain sat in Organization JSON-LD sameAs on every page.
edit("src/data/site.ts", [("    'https://moregroup.estate/about/',\n", "")])

# Analytics helper names ship inside the inline <script> on every page.
edit("src/components/GoogleAnalytics.astro", [
    ("trackMoreGroupEvent", "trackSiteEvent"),
    ("window.moreGroupTrack", "window.italianEstateTrack"),
])

# The generic sweep leaves these two readable but stripped of their subject;
# give them a real title instead of the slug remnant.
edit("src/content/guides/italy-property-investment-guide.mdx", [
    ("## What red flags do researchers see repeatedly?",
     "## What red flags recur on Italian purchases?")])

edit("src/content/areas/sanremo.mdx", [
    ("## What should investors know about field notes?",
     "## What should investors know about Sanremo market conditions?"),
    ("What should investors know about field notes means Song Festival STR peaks",
     "Sanremo market conditions centre on Song Festival STR peaks")])
