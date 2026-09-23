const state={user:null,properties:[]};

const $=s=>document.querySelector(s);
const authView=$('#authView');
const propertiesView=$('#propertiesView');
const propertyGrid=$('#propertyGrid');
const propertyEmpty=$('#propertyEmpty');

document.querySelectorAll('[data-auth]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-auth]').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const mode=btn.dataset.auth;
    $('#loginForm').classList.toggle('hidden',mode!=='login');
    $('#registerForm').classList.toggle('hidden',mode!=='register');
    $('#authMsg').textContent='';
  });
});

function enterApp(user){
  state.user=user;
  authView.classList.add('hidden');
  propertiesView.classList.remove('hidden');
  $('#logoutBtn').classList.remove('hidden');
  renderProperties();
}

function renderProperties(){
  propertyGrid.innerHTML='';
  propertyEmpty.classList.toggle('hidden',state.properties.length>0);
  for(const item of state.properties){
    const card=document.createElement('article');
    card.className='property-card';
    const label=item.tipo_locacao==='anual'?'Locação anual':item.tipo_locacao==='ambos'?'Temporada + anual':'Temporada';
    card.innerHTML=`
      <span class="tag">${label}</span>
      <h3>${item.nome}</h3>
      <p>${item.cidade}${item.estado?' • '+item.estado:''}</p>
    `;
    propertyGrid.appendChild(card);
  }
}

$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  $('#authMsg').textContent='Protótipo: backend de autenticação será conectado na próxima etapa.';
});

$('#registerForm').addEventListener('submit',e=>{
  e.preventDefault();
  enterApp({
    nome:$('#registerName').value.trim(),
    email:$('#registerEmail').value.trim()
  });
});

function openProperty(){
  $('#propertyForm').reset();
  $('#propertyDialog').showModal();
}
$('#newPropertyBtn').onclick=openProperty;
$('#emptyNewPropertyBtn').onclick=openProperty;
$('#closePropertyDialog').onclick=()=>$('#propertyDialog').close();
$('#cancelProperty').onclick=()=>$('#propertyDialog').close();

$('#propertyForm').addEventListener('submit',e=>{
  e.preventDefault();
  state.properties.push({
    id:Date.now(),
    nome:$('#propertyName').value.trim(),
    cidade:$('#propertyCity').value.trim(),
    estado:$('#propertyState').value.trim().toUpperCase(),
    tipo_locacao:document.querySelector('input[name="rentalType"]:checked').value
  });
  $('#propertyDialog').close();
  renderProperties();
});

$('#logoutBtn').onclick=()=>{
  state.user=null;
  state.properties=[];
  propertiesView.classList.add('hidden');
  authView.classList.remove('hidden');
  $('#logoutBtn').classList.add('hidden');
};
