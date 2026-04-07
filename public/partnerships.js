// Config — API keys live server-side in /api/partnerships

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

  // Validate only fields that actually exist in the form
  var requiredIds=['fName','fEmail','fBrokerage','fCity','fAgents','fPhone'];
  var ok=true;
  requiredIds.forEach(function(id){
    var el=document.getElementById(id);
    if(!el||!el.value.trim()){if(el)el.style.borderColor='#dc2626';ok=false;}
    else el.style.borderColor='';
  });
  if(!ok){errEl.textContent='Por favor completa todos los campos obligatorios.';errEl.style.display='block';return;}

  btn.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><circle cx="12" cy="12" r="10" opacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Enviando...';
  btn.disabled=true;

  var getValue=function(id){var el=document.getElementById(id);return el?el.value.trim():'';};

  var data={
    full_name:getValue('fName'),
    email:getValue('fEmail'),
    brokerage_name:getValue('fBrokerage'),
    city:getValue('fCity'),
    avg_sales_month:getValue('fSales')||'N/A',
    avg_closing_price:getValue('fPrice')||'N/A',
    num_agents:getValue('fAgents'),
    phone:getValue('fPhone'),
    marketing_channels:getValue('fChannels'),
    growth_challenge:getValue('fChallenge'),
  };

  try{
    var res=await fetch('/api/partnerships',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!res.ok){
      var body=await res.json().catch(function(){return{};});
      throw new Error(body.error||'Error '+res.status);
    }
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
