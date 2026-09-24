const API='https://village-paganayoh-api.dario-cdao.workers.dev';
const TOKEN_KEY='temporada_direta_token';

const state={user:null,properties:[],token:localStorage.getItem(TOKEN_KEY)||'',activeProperty:null};

const $=s=>document.querySelector(s);
const authView=$('#authView');
const propertiesView=$('#propertiesView');
const propertyGrid=$('#propertyGrid');
const propertyEmpty=$('#propertyEmpty');

function setAuthMsg(text='',ok=false){
  const el=$('#authMsg');
  el.textContent=text;
  el.classList.toggle('ok',!!ok);
}

async function api(path,options={}){
  const headers={
    'Content-Type':'application/json',
    ...(state.token?{'Authorization':'Bearer '+state.token}:{}),
    ...(options.headers||{})
  };
  const r=await fetch(API+path,{...options,headers});
  let data={};
  try{data=await r.json()}catch{}
  if(r.status===401&&state.token){
    clearSession();
  }
  if(!r.ok)throw new Error(data.erro||'Não foi possível concluir a operação.');
  return data;
}

function saveSession(token,user){
  state.token=token||'';
  state.user=user||null;
  if(token)localStorage.setItem(TOKEN_KEY,token);
  else localStorage.removeItem(TOKEN_KEY);
}

function clearSession(){
  saveSession('',null);
  state.properties=[];
  propertiesView.classList.add('hidden');
  $('#propertyDetailView')?.classList.add('hidden');
  authView.classList.remove('hidden');
  $('#logoutBtn').classList.add('hidden');
  renderProperties();
}

document.querySelectorAll('[data-auth]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-auth]').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const mode=btn.dataset.auth;
    $('#loginForm').classList.toggle('hidden',mode!=='login');
    $('#registerForm').classList.toggle('hidden',mode!=='register');
    setAuthMsg('');
  });
});

async function enterApp(user){
  state.user=user;
  authView.classList.add('hidden');
  propertiesView.classList.remove('hidden');
  $('#logoutBtn').classList.remove('hidden');
  $('#userSummary').textContent=user?.nome?('Olá, '+user.nome+'.'):'';
  await loadProperties();
}

function renderProperties(){
  propertyGrid.innerHTML='';
  propertyEmpty.classList.toggle('hidden',state.properties.length>0);

  for(const item of state.properties){
    const card=document.createElement('article');
    card.className='property-card';
    const label=item.tipo_locacao==='anual'
      ?'Locação anual'
      :item.tipo_locacao==='ambos'
        ?'Temporada + anual'
        :'Temporada';

    card.innerHTML=`
      <span class="tag">${label}</span>
      <h3>${escapeHtml(item.nome||'Imóvel')}</h3>
      <p>${escapeHtml(item.cidade||'')}${item.estado?' • '+escapeHtml(item.estado):''}</p>
      <div class="property-meta">
        <span>${item.publicado?'Publicado':'Rascunho'}</span>
        <span>${escapeHtml(item.papel||'owner')}</span>
      </div>
    `;

    card.tabIndex=0;
    card.setAttribute('role','button');
    card.setAttribute('aria-label','Abrir '+(item.nome||'imóvel'));
    card.addEventListener('click',()=>openPropertyDetail(item.id));
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPropertyDetail(item.id)}});
    propertyGrid.appendChild(card);
  }
}

function rentalLabel(type){
  return type==='anual'?'Locação anual':type==='ambos'?'Temporada + anual':'Temporada';
}

function applyPropertyMode(type){
  const temporada=type==='temporada'||type==='ambos';
  const anual=type==='anual'||type==='ambos';
  document.querySelectorAll('.temporada-only').forEach(el=>el.classList.toggle('hidden',!temporada));
  document.querySelectorAll('.anual-only').forEach(el=>el.classList.toggle('hidden',!anual));
}

function switchPropertyTab(name){
  const btn=document.querySelector('[data-property-tab="'+name+'"]');
  if(!btn||btn.classList.contains('hidden'))return;
  document.querySelectorAll('[data-property-tab]').forEach(x=>x.classList.toggle('active',x===btn));
  document.querySelectorAll('[data-property-panel]').forEach(x=>x.classList.toggle('hidden',x.dataset.propertyPanel!==name));
}

function valueOrEmpty(v){return v===null||v===undefined?'':v;}

function fillPropertyDetailsForm(item){
  if(!item)return;
  $('#detailsName').value=valueOrEmpty(item.nome);
  $('#detailsRentalType').value=item.tipo_locacao||'temporada';
  $('#detailsDescription').value=valueOrEmpty(item.descricao);
  $('#detailsAddress').value=valueOrEmpty(item.endereco);
  $('#detailsNeighborhood').value=valueOrEmpty(item.bairro);
  $('#detailsCity').value=valueOrEmpty(item.cidade);
  $('#detailsState').value=valueOrEmpty(item.estado);
  $('#detailsZip').value=valueOrEmpty(item.cep);
  $('#detailsCountry').value=valueOrEmpty(item.pais||'Brasil');
  $('#detailsCapacity').value=valueOrEmpty(item.capacidade);
  $('#detailsBedrooms').value=valueOrEmpty(item.quartos);
  $('#detailsSuites').value=valueOrEmpty(item.suites);
  $('#detailsBathrooms').value=valueOrEmpty(item.banheiros);
  $('#detailsParking').value=valueOrEmpty(item.vagas);
  $('#detailsPhone').value=valueOrEmpty(item.telefone_contato);
  $('#detailsWhatsapp').value=valueOrEmpty(item.whatsapp_contato);
  $('#detailsLatitude').value=valueOrEmpty(item.latitude);
  $('#detailsLongitude').value=valueOrEmpty(item.longitude);
  $('#detailsMsg').textContent='';
  $('#detailsMsg').className='inline-msg';
  $('#detailsSaveStatus').textContent='Salvo';
}

function numericOrNull(selector){
  const raw=$(selector).value.trim();
  if(raw==='')return null;
  const n=Number(raw);
  return Number.isFinite(n)?n:null;
}

function propertyDetailsPayload(){
  return {
    nome:$('#detailsName').value.trim(),
    tipo_locacao:$('#detailsRentalType').value,
    descricao:$('#detailsDescription').value.trim(),
    endereco:$('#detailsAddress').value.trim(),
    bairro:$('#detailsNeighborhood').value.trim(),
    cidade:$('#detailsCity').value.trim(),
    estado:$('#detailsState').value.trim().toUpperCase(),
    cep:$('#detailsZip').value.trim(),
    pais:$('#detailsCountry').value.trim()||'Brasil',
    capacidade:numericOrNull('#detailsCapacity'),
    quartos:numericOrNull('#detailsBedrooms'),
    suites:numericOrNull('#detailsSuites'),
    banheiros:numericOrNull('#detailsBathrooms'),
    vagas:numericOrNull('#detailsParking'),
    telefone_contato:$('#detailsPhone').value.trim(),
    whatsapp_contato:$('#detailsWhatsapp').value.trim(),
    latitude:numericOrNull('#detailsLatitude'),
    longitude:numericOrNull('#detailsLongitude')
  };
}

async function openPropertyDetail(id){
  try{
    const d=await api('/app/imoveis/'+id);
    const item=d.imovel;
    state.activeProperty=item;
    propertiesView.classList.add('hidden');
    $('#propertyDetailView').classList.remove('hidden');
    $('#detailPropertyName').textContent=item.nome||'Imóvel';
    $('#detailPropertyLocation').textContent=[item.cidade,item.estado,item.pais].filter(Boolean).join(' • ');
    $('#detailRentalType').textContent=rentalLabel(item.tipo_locacao);
    $('#detailStatus').textContent=Number(item.publicado)===1?'Publicado':'Rascunho';
    $('#overviewStatus').textContent=Number(item.publicado)===1?'Publicado':'Rascunho';
    fillPropertyDetailsForm(item);
    applyPropertyMode(item.tipo_locacao);
    switchPropertyTab('overview');
    window.scrollTo({top:0,behavior:'smooth'});
  }catch(err){
    alert(err.message);
  }
}

$('#backToProperties')?.addEventListener('click',()=>{
  state.activeProperty=null;
  $('#propertyDetailView').classList.add('hidden');
  propertiesView.classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
});

document.querySelectorAll('[data-property-tab]').forEach(btn=>{
  btn.addEventListener('click',()=>switchPropertyTab(btn.dataset.propertyTab));
});
document.querySelectorAll('[data-go-tab]').forEach(btn=>{
  btn.addEventListener('click',()=>switchPropertyTab(btn.dataset.goTab));
});

$('#propertyDetailsForm')?.addEventListener('input',()=>{
  $('#detailsSaveStatus').textContent='Alterações pendentes';
});

$('#propertyDetailsForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!state.activeProperty?.id)return;

  const btn=$('#savePropertyDetailsBtn');
  const msg=$('#detailsMsg');
  btn.disabled=true;
  btn.textContent='Salvando...';
  msg.textContent='';
  msg.className='inline-msg';

  try{
    const payload=propertyDetailsPayload();
    if(!payload.nome)throw new Error('Informe o nome do imóvel.');

    const d=await api('/app/imoveis/'+state.activeProperty.id,{
      method:'PUT',
      body:JSON.stringify(payload)
    });

    state.activeProperty=d.imovel||{...state.activeProperty,...payload};
    const item=state.activeProperty;

    $('#detailPropertyName').textContent=item.nome||'Imóvel';
    $('#detailPropertyLocation').textContent=[item.cidade,item.estado,item.pais].filter(Boolean).join(' • ');
    $('#detailRentalType').textContent=rentalLabel(item.tipo_locacao);
    applyPropertyMode(item.tipo_locacao);
    fillPropertyDetailsForm(item);

    const idx=state.properties.findIndex(x=>Number(x.id)===Number(item.id));
    if(idx>=0)state.properties[idx]={...state.properties[idx],...item};
    renderProperties();

    msg.textContent='Alterações salvas com sucesso.';
    msg.className='inline-msg ok';
    $('#detailsSaveStatus').textContent='Salvo';
  }catch(err){
    msg.textContent=err.message;
    msg.className='inline-msg error';
    $('#detailsSaveStatus').textContent='Não salvo';
  }finally{
    btn.disabled=false;
    btn.textContent='Salvar alterações';
  }
});

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));
}

async function loadProperties(){
  try{
    const d=await api('/app/imoveis');
    state.properties=d.imoveis||[];
    renderProperties();
  }catch(err){
    setAuthMsg(err.message);
  }
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=e.submitter;
  setAuthMsg('');
  btn.disabled=true;
  btn.textContent='Entrando...';

  try{
    const d=await api('/auth/login',{
      method:'POST',
      body:JSON.stringify({
        email:$('#loginEmail').value.trim(),
        senha:$('#loginPassword').value
      })
    });

    saveSession(d.token,d.usuario);
    $('#loginPassword').value='';
    await enterApp(d.usuario);

  }catch(err){
    setAuthMsg(err.message);
  }finally{
    btn.disabled=false;
    btn.textContent='Entrar';
  }
});

$('#registerForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=e.submitter;
  setAuthMsg('');
  btn.disabled=true;
  btn.textContent='Criando conta...';

  try{
    const d=await api('/auth/register',{
      method:'POST',
      body:JSON.stringify({
        nome:$('#registerName').value.trim(),
        email:$('#registerEmail').value.trim(),
        telefone:$('#registerPhone').value.trim(),
        senha:$('#registerPassword').value
      })
    });

    saveSession(d.token,d.usuario);
    $('#registerPassword').value='';
    await enterApp(d.usuario);

  }catch(err){
    setAuthMsg(err.message);
  }finally{
    btn.disabled=false;
    btn.textContent='Criar conta';
  }
});

function openProperty(){
  $('#propertyForm').reset();
  document.querySelector('input[name="rentalType"][value="temporada"]').checked=true;
  $('#propertyDialog').showModal();
}

$('#newPropertyBtn').onclick=openProperty;
$('#emptyNewPropertyBtn').onclick=openProperty;
$('#closePropertyDialog').onclick=()=>$('#propertyDialog').close();
$('#cancelProperty').onclick=()=>$('#propertyDialog').close();

$('#propertyForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=e.submitter;
  btn.disabled=true;
  btn.textContent='Salvando...';

  try{
    await api('/app/imoveis',{
      method:'POST',
      body:JSON.stringify({
        nome:$('#propertyName').value.trim(),
        cidade:$('#propertyCity').value.trim(),
        estado:$('#propertyState').value.trim().toUpperCase(),
        tipo_locacao:document.querySelector('input[name="rentalType"]:checked').value
      })
    });

    $('#propertyDialog').close();
    await loadProperties();

  }catch(err){
    alert(err.message);
  }finally{
    btn.disabled=false;
    btn.textContent='Salvar imóvel';
  }
});

$('#logoutBtn').onclick=async()=>{
  try{
    if(state.token)await api('/auth/logout',{method:'POST'});
  }catch{}
  clearSession();
};

async function restoreSession(){
  if(!state.token)return;

  try{
    const d=await api('/auth/me');
    await enterApp(d.usuario);
  }catch{
    clearSession();
  }
}

restoreSession();
