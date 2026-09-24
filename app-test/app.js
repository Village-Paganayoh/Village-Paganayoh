const API='https://village-paganayoh-api.dario-cdao.workers.dev';
const TOKEN_KEY='temporada_direta_token';

const state={user:null,properties:[],token:localStorage.getItem(TOKEN_KEY)||''};

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

    propertyGrid.appendChild(card);
  }
}

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
