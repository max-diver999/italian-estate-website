# -*- coding: utf-8 -*-
"""Restore length lost when fabricated enquiry statistics were removed, with
substance that is defensible without a private dataset."""
import io

def insert_before(path, heading, text):
    s = io.open(path, encoding="utf-8").read()
    if text.strip().split("\n")[0] in s:
        return
    assert heading in s, f"{path}: heading not found"
    io.open(path, "w", encoding="utf-8").write(s.replace(heading, text.rstrip() + "\n\n" + heading, 1))

insert_before(
    "src/content/compare/campobasso-vs-termoli-property.mdx",
    "## What Are the Pros and Cons of Campobasso vs Termoli?",
    """### Why the Two Markets Behave Differently

The comparison is really between two demand structures rather than two price levels. Campobasso is an administrative and university town: its tenant base is salaried public-sector staff, hospital employees and students, which produces low headline yields but twelve-month occupancy and rent that moves slowly in either direction. Termoli is a seasonal coastal market, where a large share of the annual return is earned in a few summer weeks and the rest of the year carries the cost of an empty flat.

That difference decides which risks matter. In Campobasso the binding question is resale: the foreign buyer pool is thin, so an exit depends on domestic demand and can take considerably longer than in a coastal comune. In Termoli the binding question is regulatory, because the summer income the price assumes is only lawful with a CIN registration and a condominium that permits tourist use. Confirm both before the caparra rather than after, since neither can be fixed by renegotiating the price.""")

insert_before(
    "src/content/compare/matera-vs-potenza-property.mdx",
    "## Who Should Choose Matera Versus Potenza?",
    """### Why the Two Markets Behave Differently

Matera prices in scarcity and international recognition; Potenza prices in local employment. That single difference explains most of the gap between them. Sassi cave stock cannot be replicated, so its value rests on tourism demand and on what the heritage authority permits, while Potenza's stock is ordinary regional-capital housing whose value tracks hospital and administrative payrolls.""")
