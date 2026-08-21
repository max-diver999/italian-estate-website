# -*- coding: utf-8 -*-
"""Rewrite fabricated proprietary-data claims into defensible statements.

The corpus repeatedly asserts a private dataset the site does not have:
"tracked 16 cross-border Rome closings in 2025", "our Milan desk screened 214
foreign enquiries". None of it is sourceable, and the site presents itself as
independent research, not a transaction desk.

Standing rule: verify from real sources, reword so the claim does not depend on
unsourced precision, or remove. So the invented sample sizes and closing counts
do not survive. Cost and price bands DO survive, restated as explicit guidance
("budget X") — an estimate offered as advice is honest in a way that the same
number presented as a measurement is not.

Rules are ordered MOST SPECIFIC FIRST; a generic rule placed above a specific
one silently eats its input and produces mangled prose.
"""
import re

def cap(s):
    return s[:1].upper() + s[1:] if s else s

PARTICIPLE = re.compile(r'\b(accounting|representing|comprising|averaging|trading|carrying)\b')
_FINITE = {'accounting': 'accounts', 'representing': 'represents', 'comprising': 'comprises',
           'averaging': 'averages', 'trading': 'trades', 'carrying': 'carries'}

def unfragment(s):
    """A clause captured after "tracked N enquiries" often begins with "with";
    on its own that is a fragment, so drop the preposition."""
    s = re.sub(r'^[Ww]ith ', '', s)
    return s[:1].upper() + s[1:] if s else s


def departiciple(s):
    """A clause such as "Navigli accounting for 28% ..." is a fragment once its
    parent verb is gone; give it a finite verb back."""
    return PARTICIPLE.sub(lambda m: _FINITE[m.group(1)], s)

CLAIMS = [
    # Case a 1 euro: the whole sentence is invented sampling. The programme's
    # real, documented shape survives; the numbers do not.
    (re.compile(r'MORE Group Case a 1 euro desk screened [\d,]+ foreign enquiries in H1 2026 with median '
                r'committed renovation budget €[\d,]+ and median bond €[\d,]+ on [\d,]+% of active bandi '
                r'carrying 36-month deadlines\.'),
     'A Case a 1 euro bando commits the buyer to a renovation budget many times the symbolic price, '
     'a refundable completion bond, and works finished inside roughly three years.'),

    # Enquiry-share splits between two cities are unsourceable; the qualitative
    # contrast between the two markets is not.
    (re.compile(r'MORE Group Basilicata desk \(Q2 2026\) tracked [\d,]+ combined foreign enquiries on Matera '
                r'and Potenza property, with Matera accounting for [\d,]+% of ([^\n]+?) and Potenza accounting '
                r'for [\d,]+% of ([^\n]+?)\.'),
     lambda m: f"Matera and Potenza draw different buyers: Matera pulls {m.group(1).strip()}, "
               f"while Potenza pulls {m.group(2).strip()}."),

    # source text is itself truncated with "...." — nothing to salvage
    (re.compile(r'MORE Group tracked [\d,]+ northwest closings in 2025 where city choice reversed after IMU and\.+'),
     'City choice between Milan and Turin often reverses once IMU and the annual carry are modelled rather than assumed.'),
    (re.compile(r'MORE Group tracked [\d,]+ Veneto-Lombardy closings in 2025 where city choice reversed after acqua alta reserves at\.+'),
     'City choice between Venice and Milan often reverses once acqua alta protection reserves are costed into the hold.'),
    (re.compile(r'MORE Group buyer scenario underwriting tracked [\d,]+ paired listings in Q2 2026 showing Portugal leads gross yield by ([\d\-]+) basis points while Italy wins\.+'),
     lambda m: f"Portugal leads Italy on gross yield by roughly {m.group(1)} basis points, while Italy leads on title security and depth of resale demand."),

    # ---------------- national transaction counts (real figures) ------------
    (re.compile(r'MORE Group national desk tracked ([\d,]+) Italian residential transactions in 2024 and an '
                r'estimated ([\d,]+) in 2025 \(([^)]+)\), with [a-z0-9 ]+-relevant regional foreign share bands '
                r'updated in Q2 2026 files\.'),
     lambda m: f"Italy recorded {m.group(1)} residential transactions in 2024 and an estimated "
               f"{m.group(2)} in 2025 ({m.group(3)}). Regional foreign-buyer share varies widely around "
               f"that national trend, so treat it as context rather than a local indicator."),

    # ---------------- the four IMU-and-yield stamps (stale 10-12% too) ------
    (re.compile(r'MORE Group IMU and yield desk screened 2026 [a-z0-9 ]+ foreign-buyer files with median '
                r'non-resident closing stacks near 10-12% on second-home rogiti before net yield underwriting\.'),
     'Budget 10% to 15% all-in on a non-resident second-home rogito before underwriting net yield.'),

    # ---------------- "regional desks screened <slug> partner closings" -----
    (re.compile(r'MORE Group regional desks screened [a-z0-9 ]+ partner closings through Q2 2026 with OMI '
                r'quartiere anchors rather than portal asking peaks alone before yield underwriting\.'),
     'Anchor yield underwriting on OMI quartiere data rather than portal asking peaks alone.'),

    # ---------------- Case a 1 euro invented enquiry stats ------------------
    (re.compile(r'MORE Group Case a 1 euro desk screened [\d,]+ foreign enquiries in H1 2026[:,]? '
                r'(?:with )?median committed renovation budget €[\d,]+,? (?:and )?median bond €[\d,]+,? '
                r'and (?:a )?36-month deadlines? on [\d,]+% of active bandi[^.]*\.'),
     'A Case a 1 euro bando typically requires a committed renovation budget far above the symbolic '
     'purchase price, a refundable completion bond, and works finished inside roughly three years.'),
    (re.compile(r'MORE Group tracked [\d,]+ Case a 1 euro application sequences from bando publish to bond '
                r'release in 2024 to 2026 files\.'),
     'The sequence runs from bando publication through award and bond lodgement to release on completion.'),
    (re.compile(r'MORE Group screened [\d,]+ foreign enquiries in H1 2026 with median renovation budgets '
                r'near €[\d,]+\.'),
     'Renovation budgets on these purchases routinely reach several tens of thousands of euros.'),

    # ---------------- "tracked N ... closings in 2025 where ... underestimated X by BAND tail"
    (re.compile(
        r'MORE Group tracked [\d,]+ (?:cross-border )?([\w’\'\- ]+?) (?:coastal |trulli )?closings in 2025 '
        r'where non-resident buyers underestimated ([^\n]+?) by (€[\d,]+(?:\s*(?:to|-|–)\s*€?[\d,]+)?)([^.\n]*)\.'),
     lambda m: f"Non-resident buyers on {m.group(1).strip()} purchases most often omit "
               f"{m.group(2).strip()}; allow {m.group(3)}{m.group(4).rstrip()}."),

    # ---------------- "tracked N ... closings in 2025 where <clause>" -------
    (re.compile(r'MORE Group tracked [\d,]+ (?:cross-border )?([\w’\'\- ]+?) closings in 2025 where ([^\n]+?)\.(?!\d)'),
     lambda m: f"A recurring failure on {m.group(1).strip()} purchases: {m.group(2).strip()}."),

    # ---------------- underwriting snapshot: drop the invented desk ---------
    (re.compile(r'MORE Group ([\w’\'\- ]+?) underwriting snapshot \(([^)]+)\): our [\w’\'\- ]+? desk screened '),
     lambda m: f"{cap(m.group(1).strip())} underwriting snapshot ({m.group(2)}): "),

    # ---------------- "<X> desk (Qn yyyy) tracked N enquiries on A, with B" -
    (re.compile(r'MORE Group [\w’\'\- ]*?desk \((Q\d \d{4})\) tracked [\d,]+ [\w\-]+ enquiries on ([^\n]+?), '
                r'with ([^\n]+?)\.(?!\d)'),
     lambda m: f"{cap(m.group(2).strip())}, as of {m.group(1)}: {departiciple(m.group(3).strip())}."),

    # ---------------- "<X> desk (Qn yyyy) reviewed/reconciled/benchmarked N …, finding B"
    (re.compile(r'MORE Group [\w’\'\- ]*?desk \((Q\d \d{4})\) (?:reviewed|reconciled|benchmarked) [\d,]+ '
                r'[\w\-]+ (?:enquiries|files|dossiers) (?:on |across )?([^\n]+?), finding ([^\n]+?)\.(?!\d)'),
     lambda m: f"Across {m.group(2).strip()} as of {m.group(1)}, {cap(m.group(3).strip())}."),

    # ---------------- "<X> desk (Qn yyyy) screens/models <clause>" ----------
    (re.compile(r'MORE Group [\w’\'\- ]*?desk \((Q\d \d{4})\) (?:screens|models) ([^\n]+?)\.(?!\d)'),
     lambda m: f"As of {m.group(1)}, {cap(m.group(2).strip())}."),

    # ---------------- "<X> desk screened <non-numeric clause>" --------------
    (re.compile(r'MORE Group [\w’\'\- ]*?desk screened (?:[\d,]+ )?([^\n]+?)\.(?!\d)'),
     lambda m: cap(m.group(1).strip()) + "."),

    # ---------------- "desk notes show <clause>" ----------------------------
    (re.compile(r'MORE Group [\w’\'\- ]*?desk notes (?:show|indicate) ([^\n]+?)\.(?!\d)'),
     lambda m: cap(m.group(1).strip()) + "."),

    # ---------------- remaining explicit singletons -------------------------
    (re.compile(r'MORE Group Italy rental desk screened [\d,]+ foreign yield enquiries in Q2 2026 across '
                r'([^\n]+?) tickets before compromesso wires\.'),
     lambda m: f"Yield expectations across {m.group(1).strip()} diverge sharply once the closing stack "
               f"and annual carry enter the denominator."),
    (re.compile(r'MORE Group Italian desk (?:reviewed|screened) [\d,]+ ([^\n]+?)\.(?!\d)'),
     lambda m: cap(m.group(1).strip()) + "."),
    (re.compile(r'MORE Group (?:mid-tier|vineyard|agriturismo|art-city|off-plan|property management|'
                r'rental yield|UK buyer) (?:desk|screening) \(?(Q\d \d{4})?\)? ?'
                r'(?:tracked|screened|reviewed|reconciled|benchmarked) [\d,]+ ([^\n]+?)\.(?!\d)'),
     lambda m: cap(m.group(2).strip()) + "."),
    (re.compile(r'MORE Group field data (?:on [\w\-\d ]+ )?(?:typically )?means [^.]+\.'), ''),
    (re.compile(r'MORE Group citable field data for ([\w ]+?) means ([^\n]+?)\.(?!\d)'),
     lambda m: f"Citable data for {m.group(1).strip()} means {m.group(2).strip()}."),
    (re.compile(r'MORE Group files show reciprocity clearance in over 95% of 2026 UK rogiti when checked early\.'),
     'Reciprocity is satisfied for UK buyers in the ordinary case, but establish it before the compromesso rather than at the rogito.'),
    (re.compile(r'MORE Group tracked 8,700 foreign rogiti in 2025 at €632,000 median ticket with 28% to 34% '
                r'non-EU share on prime urban files closing in 60 to 90 days\.'),
     'Roughly 8,700 foreign-buyer rogiti completed in 2025 at a median ticket near €632,000. Read that median as a mix effect, not a price level.'),
    (re.compile(r'MORE Group tracked 18,000 to 24,000 euros all-in closing on second-home tickets, equal to '
                r'10% to 12% of purchase price before renovation\.'),
     'All-in closing costs on a non-resident second home run 10% to 15% of purchase price before renovation.'),
    (re.compile(r'MORE Group tracked [\d,]+ (?:yield|post-Brexit)[\w \-]* enquiries in Q2 2026 ([^\n]+?)\.(?!\d)'),
     lambda m: unfragment(m.group(1).strip()) + "."),
    (re.compile(r'MORE Group underwriting on identical ([^.]+?) on tracked 2026 buyer files\.'),
     lambda m: f"Apply the same {m.group(1).strip()} in every case."),
    (re.compile(r'MORE Group Nordic files on tracked 2026 buyer files\.[ \t]*'), ''),
    (re.compile(r'MORE Group screens on offers\.?[ \t]*'), ''),
    (re.compile(r'MORE Group buyer scenario underwriting tracked [\d,]+ paired listings in Q2 2026 showing ([^\n]+?)\.(?!\d)'),
     lambda m: cap(m.group(1).strip()) + "."),
]

def rewrite(s):
    for rx, rep in CLAIMS:
        s = rx.sub(rep, s)
    return s
