# De-branding pass, 2026-08-21

Deterministic HEAD → final transform, kept so the edit is auditable and
reproducible rather than a 3,400-line diff nobody can check.

Run order (`replay.sh`): restore `src/` from HEAD → `debrand.py` (which calls
`claims.py` first) → `manual-spots.py` → repo glue fixer → `dedupe.py` → `topups.py`.

Three bugs are guarded against explicitly, each having caused real damage:

1. **Never collapse leading whitespace.** `re.sub(r'[ \t]{2,}', ' ', s)` flattened
   YAML frontmatter indentation in 219 files and broke the build. Every collapse
   rule now requires a non-space to its left.
2. **Never use `\s*` after a token you delete.** `\s` matches newlines, so the
   blank line before a markdown table got eaten and the table glued onto the
   previous paragraph. Horizontal whitespace only.
3. **Never let text rules touch URLs.** `more-group/` is a Cloudinary *folder
   name*; stripping it produced `image/upload//italy/…` and broke every hero
   image. URLs are masked out before any rule runs and restored afterwards.

Prose-only tidying is gated on the file extension: an indented `: 0` in an
`.astro` file is a ternary's else-branch, not an orphaned prose colon.
