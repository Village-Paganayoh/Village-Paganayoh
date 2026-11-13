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

now=datetime.now(timezone.utc).isoformat()
payload={"source":"Airbnb iCal","updated_at":now,"periods":merged}
Path("disponibilidade.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n", encoding="utf-8")

# Histórico cumulativo: períodos já vistos nunca são removidos.
history_path=Path("airbnb_historico.json")
try:
    history=json.loads(history_path.read_text(encoding="utf-8")) if history_path.exists() else {}
except Exception:
    history={}
entries=history.get("periods", [])
by_key={f"{p.get('start','')}|{p.get('end','')}":p for p in entries if p.get("start") and p.get("end")}
active_keys=set()
for p in merged:
    key=f"{p['start']}|{p['end']}"
    active_keys.add(key)
    if key not in by_key:
        by_key[key]={
            "start":p["start"],
            "end":p["end"],
            "first_seen":now,
            "last_seen":now,
            "active":True
        }
    else:
        by_key[key]["last_seen"]=now
        by_key[key]["active"]=True

for key,item in by_key.items():
    if key not in active_keys:
        item["active"]=False

history_payload={
    "source":"Airbnb iCal - histórico cumulativo",
    "updated_at":now,
    "periods":sorted(by_key.values(), key=lambda p:(p.get("start",""),p.get("end","")))
}
history_path.write_text(json.dumps(history_payload,ensure_ascii=False,indent=2)+"\n", encoding="utf-8")
print(f"{len(merged)} período(s) atuais; {len(history_payload['periods'])} período(s) no histórico.")
