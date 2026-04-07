// Config
var SUPABASE_URL='https://kkqzzdtdkrxdlfrllauy.supabase.co';
var SUPABASE_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXp6ZHRka3J4ZGxmcmxsYXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjU2NzYsImV4cCI6MjA5MTEwMTY3Nn0.yTaqwqDBIcLF0UL0AiBxDajAq7fEZN0xDbSZ-ZVOCqk';

window.addEventListener('scroll',function(){var el=document.getElementById('scrollProgress');if(el)el.style.transform='scaleX('+(window.scrollY/(document.body.scrollHeight-window.innerHeight))+')';},{passive:true});
var nav=document.querySelector('nav');if(nav)window.addEventListener('scroll',function(){nav.style.boxShadow=window.scrollY>10?'0 1px 3px rgba(0,0,0,.04)':'none';},{passive:true});
var obs=new IntersectionObserver(function(e){e.forEach(function(n){if(n.isIntersecting)n.target.classList.add('visible');});},{threshold:.08,rootMargin:'0px 0px -40px 0px'});document.querySelectorAll('[data-reveal]').forEach(function(el){obs.observe(el);});
function animateCounter(el,target,duration){duration=duration||1500;var start=performance.now(),prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'',fmt=el.dataset.format;function format(n){if(fmt==='short'){if(n>=1e6)return prefix+(n/1e6).toFixed(0)+'M'+suffix;if(n>=1e3)return prefix+(n/1e3).toFixed(0)+'K'+suffix;}if(fmt==='raw')return prefix+n.toLocaleString('es-CO')+suffix;return prefix+n.toLocaleString('es-CO')+suffix;}function update(now){var p=Math.min((now-start)/duration,1),eased=1-Math.pow(1-p,3);el.textContent=format(Math.round(target*eased));if(p<1)requestAnimationFrame(update);}requestAnimationFrame(update);}
var counterObs=new IntersectionObserver(function(e){e.forEach(function(n){if(n.isIntersecting){animateCounter(n.target,parseInt(n.target.dataset.counter));counterObs.unobserve(n.target);}});},{threshold:.5});document.querySelectorAll('[data-counter]').forEach(function(el){counterObs.observe(el);});
var scene=document.getElementById('buildingScene');if(scene&&window.innerWidth>960){var card=scene.querySelector('.building-card');scene.addEventListener('mousemove',function(e){var r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(800px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)';});scene.addEventListener('mouseleave',function(){card.style.transform='';card.style.transition='transform 400ms ease';});scene.addEventListener('mouseenter',function(){card.style.transition='transform 100ms ease';});}
document.querySelectorAll('[data-magnetic]').forEach(function(btn){btn.addEventListener('mousemove',function(e){var r=btn.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;btn.style.transform='translate('+(x*.12)+'px,'+(y*.12)+'px)';});btn.addEventListener('mouseleave',function(){btn.style.transform='';});});
document.querySelectorAll('.ft').forEach(function(t){t.addEventListener('click',function(){var i=t.closest('.fi'),o=i.classList.contains('open');document.querySelectorAll('.fi.open').forEach(function(x){x.classList.remove('open');x.querySelector('.ft').setAttribute('aria-expanded','false');});if(!o){i.classList.add('open');t.setAttribute('aria-expanded','true');}});});
var slider=document.getElementById('calcSlider');if(slider)slider.addEventListener('input',function(){var v=parseInt(slider.value),f=function(n){return '$'+n.toLocaleString('es-CO');};document.getElementById('calcPrice').textContent=f(v);document.getElementById('calcPurchase').textContent=f(v);document.getElementById('calcCommission').textContent=f(Math.round(v*.015));document.getElementById('calcCashback').textContent=f(Math.round(v*.01));});

window.openModal=function(){var m=document.getElementById('modal');m.classList.add('active');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';document.getElementById('formView').style.display='';document.getElementById('successView').style.display='none';document.getElementById('formError').style.display='none';};
window.closeModal=function(){var m=document.getElementById('modal');m.classList.remove('active');m.setAttribute('aria-hidden','true');document.body.style.overflow='';};
var modalEl=document.getElementById('modal');if(modalEl){modalEl.addEventListener('click',function(e){if(e.target===e.currentTarget)window.closeModal();});} document.addEventListener('keydown',function(e){if(e.key==='Escape')window.closeModal();});

window.submitForm=async function(){
  var btn=document.getElementById('submitBtn');
  var errEl=document.getElementById('formError');
  errEl.style.display='none';
  var req=['fName','fEmail','fBrokerage','fCity','fSales','fPrice','fAgents','fPhone'];
  var ok=true;
  req.forEach(function(id){var el=document.getElementById(id);if(!el.value.trim()){el.style.borderColor='#dc2626';ok=false;}else el.style.borderColor='';});
  if(!ok){errEl.textContent='Por favor completa todos los campos obligatorios.';errEl.style.display='block';return;}

  btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><circle cx="12" cy="12" r="10" opacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Enviando...';
  btn.disabled=true;

  var data={
    full_name:document.getElementById('fName').value.trim(),
    email:document.getElementById('fEmail').value.trim(),
    brokerage_name:document.getElementById('fBrokerage').value.trim(),
    city:document.getElementById('fCity').value.trim(),
    avg_sales_month:document.getElementById('fSales').value,
    avg_closing_price:document.getElementById('fPrice').value,
    num_agents:document.getElementById('fAgents').value,
    phone:document.getElementById('fPhone').value.trim(),
    marketing_channels:document.getElementById('fChannels').value.trim(),
    growth_challenge:document.getElementById('fChallenge').value.trim(),
    created_at:new Date().toISOString()
  };

  try{
    var res=await fetch(SUPABASE_URL+'/rest/v1/partnership_applications',{
      method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON,'Prefer':'return=representation'},
      body:JSON.stringify(data)
    });
    if(!res.ok)throw new Error('Supabase error: '+res.status);

    var msg='\uD83C\uDFE2 *Nueva aplicaci\u00F3n de alianza*\n\n\uD83D\uDC64 '+data.full_name+'\n\uD83C\uDFE0 '+data.brokerage_name+'\n\uD83D\uDCCD '+data.city+'\n\uD83D\uDCCA Ventas/mes: '+data.avg_sales_month+'\n\uD83D\uDCB0 Precio promedio: '+data.avg_closing_price+'\n\uD83D\uDC65 Asesores: '+data.num_agents+'\n\uD83D\uDCF1 '+data.phone+'\n\uD83D\uDCE7 '+data.email+'\n\n\uD83D\uDCE3 Canales: '+(data.marketing_channels||'N/A')+'\n\uD83C\uDFAF Reto: '+(data.growth_challenge||'N/A');

    fetch('https://api.callbell.eu/v1/messages/send',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer EmbeccJyn5eQbJ1uHxxLuZk8WCw5BtCR.5d61154a5b3d8135768c2628857401412b197a9033bfad48e035dcccaa56656e'},
      body:JSON.stringify({to:'+573103565492',from:'whatsapp',type:'text',channel_uuid:'a2e109f41ee2458bb6c08',content:{text:msg}})
    }).catch(function(){});

    document.getElementById('formView').style.display='none';
    document.getElementById('successView').style.display='';
  }catch(err){
    console.error(err);
    errEl.textContent='Error al enviar. Intenta de nuevo o esc\u00EDbenos por WhatsApp.';
    errEl.style.display='block';
    btn.innerHTML='Enviar Aplicaci\u00F3n <svg class="arrow-i" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
    btn.disabled=false;
  }
};
