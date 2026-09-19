#!/usr/bin/env python3
from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
changed = False

# Integração original Airbnb + feriados (mantida para instalações novas)
if 'AIRBNB_CALENDAR_SYNC_V1' not in s:
    css = '''
<style id="AIRBNB_CALENDAR_SYNC_V1">
.day.holiday:not(.reserved):not(.selected){border-color:#d3aa57;box-shadow:inset 0 -3px 0 #d3aa57}
.day.holiday:not(.reserved):not(.selected)::after{content:"";position:absolute;top:5px;right:5px;width:6px;height:6px;border-radius:50%;background:#d3aa57}
.calendar-sync{margin-top:12px;text-align:center;color:#7b827f;font-size:.72rem}
</style>
'''
    js = '''
<script>
/* Airbnb + feriados Brasil/Bahia */
(function(){
 function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31)-1,da=((h+l-7*m+114)%31)+1;return new Date(y,mo,da)}
 function add(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
 function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
 function holidays(y){const e=easter(y),a=[[new Date(y,0,1),'Confraternização Universal'],[add(e,-2),'Paixão de Cristo'],[new Date(y,3,21),'Tiradentes'],[new Date(y,4,1),'Dia Mundial do Trabalho'],[new Date(y,6,2),'Independência da Bahia'],[new Date(y,8,7),'Independência do Brasil'],[new Date(y,9,12),'Nossa Senhora Aparecida'],[new Date(y,10,2),'Finados'],[new Date(y,10,15),'Proclamação da República'],[new Date(y,10,20),'Consciência Negra'],[new Date(y,11,25),'Natal']];return Object.fromEntries(a.map(x=>[iso(x[0]),x[1]]))}
 function decorate(){const title=document.querySelector('.month-title');if(!title)return;const txt=title.textContent.trim();const months=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];const parts=txt.toLowerCase().split(/\\s+/);const mi=months.indexOf(parts[0]),y=Number(parts[1]);if(mi<0||!y)return;const hs=holidays(y);document.querySelectorAll('.days .day:not(.empty)').forEach(el=>{const d=Number(el.textContent.trim());const name=hs[`${y}-${String(mi+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`];if(name){el.classList.add('holiday');el.title=name}})}
 async function sync(){try{const r=await fetch('disponibilidade.json?ts='+Date.now(),{cache:'no-store'});const data=await r.json();if(Array.isArray(data.periods)&&typeof reservedPeriods!=='undefined'){reservedPeriods.splice(0,reservedPeriods.length,...data.periods);if(typeof renderCalendar==='function')renderCalendar()}let st=document.getElementById('calendar-sync-status');if(!st){st=document.createElement('div');st.id='calendar-sync-status';st.className='calendar-sync';document.querySelector('.calendar-card')?.appendChild(st)}if(st&&data.updated_at)st.textContent='Disponibilidade sincronizada com o Airbnb • '+new Date(data.updated_at).toLocaleString('pt-BR');decorate()}catch(e){console.warn('Sincronização do calendário:',e)}}
 const obs=new MutationObserver(()=>decorate());document.addEventListener('DOMContentLoaded',()=>{const days=document.querySelector('.days');if(days)obs.observe(days,{childList:true});decorate();sync()});
})();
</script>
'''
    s = s.replace('</head>', css + '</head>', 1)
    s = s.replace('</body>', js + '</body>', 1)
    changed = True

# Reservas diretas: combina Airbnb + Cloudflare D1 em uma única lista.
# Regra operacional: o próprio dia do checkout também fica bloqueado para vistoria/faxina.
if 'DIRECT_RESERVATIONS_SYNC_V3' not in s:
    direct_js = '''
<script id="DIRECT_RESERVATIONS_SYNC_V3">
/* Reservas diretas Cloudflare D1 + Airbnb; checkout bloqueado para vistoria/faxina */
(function(){
 const API='https://village-paganayoh-api.dario-cdao.workers.dev/disponibilidade';
 function validPeriod(p){return p&&/^\\d{4}-\\d{2}-\\d{2}$/.test(p.start||'')&&/^\\d{4}-\\d{2}-\\d{2}$/.test(p.end||'')&&p.start<=p.end}
 function mergePeriods(periods){
   const list=periods.filter(validPeriod).sort((a,b)=>a.start.localeCompare(b.start));
   const out=[];
   for(const p of list){
     if(!out.length){out.push({start:p.start,end:p.end});continue}
     const last=out[out.length-1];
     const next=new Date(last.end+'T12:00:00'); next.setDate(next.getDate()+1);
     const nextKey=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
     if(p.start<=nextKey){if(p.end>last.end)last.end=p.end}else out.push({start:p.start,end:p.end});
   }
   return out;
 }
 async function syncAll(){
   try{
     const [airbnbResult,directResult]=await Promise.allSettled([
       fetch('disponibilidade.json?ts='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Airbnb '+r.status);return r.json()}),
       fetch(API+'?ts='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Reservas diretas '+r.status);return r.json()})
     ]);
     const airbnb=airbnbResult.status==='fulfilled'&&Array.isArray(airbnbResult.value.periods)?airbnbResult.value.periods:[];
     const rows=directResult.status==='fulfilled'&&Array.isArray(directResult.value.periodos)?directResult.value.periodos:[];
     const direct=rows.map(r=>({start:r.checkin,end:r.checkout})).filter(validPeriod);
     const combined=mergePeriods([...airbnb,...direct]);
     if(typeof reservedPeriods!=='undefined'){reservedPeriods.splice(0,reservedPeriods.length,...combined);if(typeof renderCalendar==='function')renderCalendar()}
     let st=document.getElementById('calendar-sync-status');
     if(!st){st=document.createElement('div');st.id='calendar-sync-status';st.className='calendar-sync';document.querySelector('.calendar-card')?.appendChild(st)}
     if(st){const sources=[];if(airbnbResult.status==='fulfilled')sources.push('Airbnb');if(directResult.status==='fulfilled')sources.push('reservas diretas');st.textContent=sources.length?'Disponibilidade sincronizada: '+sources.join(' + '):'Não foi possível atualizar a disponibilidade agora.'}
   }catch(e){console.warn('Sincronização de reservas diretas:',e)}
 }
 document.addEventListener('DOMContentLoaded',()=>{setTimeout(syncAll,250)});
})();
</script>
'''
    old_start = s.find('<script id="DIRECT_RESERVATIONS_SYNC_V2">')
    if old_start < 0:
        old_start = s.find('<script id="DIRECT_RESERVATIONS_SYNC_V1">')
    if old_start >= 0:
        old_end = s.find('</script>', old_start)
        if old_end >= 0:
            old_end += len('</script>')
            s = s[:old_start] + direct_js.strip() + s[old_end:]
        else:
            s = s.replace('</body>', direct_js + '</body>', 1)
    else:
        s = s.replace('</body>', direct_js + '</body>', 1)
    changed = True

if changed:
    p.write_text(s, encoding='utf-8')
    print('Integrações do calendário instaladas/atualizadas no index.html.')
else:
    print('Integrações do calendário já estão instaladas.')
