set -e
cd /home/user/italian-estate-website
python3 - <<'PY'
import subprocess
for f in [x for x in subprocess.check_output(["git","ls-tree","-r","--name-only","HEAD","--","src/"],text=True).split() if x]:
    open(f,"wb").write(subprocess.check_output(["git","show",f"HEAD:{f}"]))
PY
python3 /tmp/debrand4.py --apply
python3 /tmp/manual_spots.py > /dev/null
node scripts/fix-markdown-glue-and-slug-links.mjs > /dev/null 2>&1
python3 /tmp/dedupe_final.py > /dev/null
python3 /tmp/topups.py
echo "replay complete"
