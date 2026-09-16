#!/usr/bin/env python3
import os, json, urllib.request, re
from datetime import datetime, timedelta, timezone
from pathlib import Path

url = os.environ.get("AIRBNB_ICAL_URL", "").strip()
if not url:
    raise SystemExit("AIRBNB_ICAL_URL não foi configurado nos Secrets do GitHub.")

req = urllib.request.Request(url, headers={"User-Agent":"Village-Paganayoh-Calendar/1.0"})
with urllib.request.urlopen(req, timeout=30) as r:
    text = r.read().decode("utf-8", errors="replace")

text = re.sub(r"\r?\n[ \t]", "", text)

def date_value(block, field):
    m = re.search(rf"^{field}(?:;[^:]*)?:(\d{{8}})", block, re.M)
    return datetime.strptime(m.group(1), "%Y%m%d").date() if m else None

periods=[]
for block in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", text, re.S):
    start=date_value(block,"DTSTART")
    end=date_value(block,"DTEND")
    if not start or not end:
        continue
    last=end-timedelta(days=1)
    if last < start:
        last=start
    periods.append({"start":start.isoformat(),"end":last.isoformat()})

periods.sort(key=lambda p:p["start"])
merged=[]
for p in periods:
    if not merged:
        merged.append(p.copy()); continue
    prev=merged[-1]
    prev_end=datetime.fromisoformat(prev["end"]).date()
    cur_start=datetime.fromisoformat(p["start"]).date()
    if cur_start <= prev_end + timedelta(days=1):
        if p["end"] > prev["end"]:
            prev["end"]=p["end"]
    else:
        merged.append(p.copy())

payload={"source":"Airbnb iCal","updated_at":datetime.now(timezone.utc).isoformat(),"periods":merged}
Path("disponibilidade.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n", encoding="utf-8")
print(f"{len(merged)} período(s) de indisponibilidade gravado(s).")
