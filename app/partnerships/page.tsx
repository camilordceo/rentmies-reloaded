import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentmies — Invertimos En Ti',
  description: 'Alianza Rentmies para inmobiliarias en Colombia. Financiamos campañas, operamos agentes IA y damos cashback a compradores.',
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
:root{--teal:#40d99d;--teal-90:rgba(64,217,157,.9);--teal-10:rgba(64,217,157,.1);--teal-05:rgba(64,217,157,.05);--teal-glow:rgba(64,217,157,.2);--mint:#4fffb4;--lgray:#e5e5e5;--mgray:#f0f0f0;--black:#1a1a1a;--bg:#fff;--bg2:#f8f8f8;--muted:#6b7280;--sec:#9ca3af;--r-lg:8px;--r-xl:12px;--r-full:9999px}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--black);background:var(--bg);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{text-decoration:none;color:inherit}button{font-family:inherit;cursor:pointer;border:none;background:none}
.container{max-width:1120px;margin:0 auto;padding:0 24px}@media(max-width:640px){.container{padding:0 16px}}
h1{font-size:clamp(2rem,5.5vw,3.2rem);font-weight:500;line-height:1.08;letter-spacing:-.025em}
h2{font-size:clamp(1.4rem,3.5vw,2.2rem);font-weight:500;line-height:1.15;letter-spacing:-.02em}
h3{font-size:1.125rem;font-weight:500;line-height:1.4}p{font-size:1rem;line-height:1.7}
.scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;background:var(--teal);transform-origin:left;transform:scaleX(0);z-index:9999}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:var(--teal);color:#fff;font-weight:500;font-size:.9375rem;padding:12px 28px;border-radius:var(--r-lg);transition:transform 150ms,box-shadow 150ms,background 200ms;min-height:44px}
.btn-p:hover{background:var(--teal-90);transform:translateY(-1px);box-shadow:0 4px 16px var(--teal-glow)}.btn-p:active{transform:translateY(0) scale(.98);box-shadow:none}
.btn-s{display:inline-flex;align-items:center;gap:8px;background:transparent;color:var(--black);font-weight:500;font-size:.9375rem;padding:12px 28px;border-radius:var(--r-lg);border:1px solid var(--lgray);transition:all 200ms;min-height:44px}
.btn-s:hover{border-color:var(--teal);color:var(--teal)}.btn-lg{padding:14px 36px;font-size:1rem}
.arrow-i{width:16px;height:16px}
.tag{display:inline-flex;align-items:center;gap:6px;font-size:.8125rem;font-weight:500;color:var(--teal);background:var(--teal-10);padding:6px 14px;border-radius:var(--r-full);border:1px solid rgba(64,217,157,.15);margin-bottom:16px}.tag svg{width:14px;height:14px}
nav{position:fixed;top:3px;left:0;right:0;z-index:100;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:rgba(255,255,255,.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--lgray);transition:box-shadow 200ms}
.logo{font-size:1.25rem;font-weight:600;letter-spacing:-.02em}.logo span{color:var(--teal)}
.nav-r{display:flex;align-items:center;gap:24px}.nav-l{font-size:.875rem;font-weight:500;color:var(--muted);transition:color 200ms}.nav-l:hover{color:var(--black)}
@media(max-width:768px){.nav-desk{display:none}.nav-r{gap:12px}}
.slots-badge{display:inline-flex;align-items:center;gap:6px;background:#fef2f2;color:#dc2626;font-size:.75rem;font-weight:600;padding:4px 12px;border-radius:var(--r-full);border:1px solid #fecaca;animation:pbadge 2s ease-in-out infinite}
@keyframes pbadge{0%,100%{opacity:1}50%{opacity:.7}}
.hero{padding:140px 0 80px;background:radial-gradient(at 20% 30%,rgba(64,217,157,.06) 0%,transparent 50%),radial-gradient(at 80% 70%,rgba(79,255,180,.04) 0%,transparent 50%),#fff;overflow:hidden}
.hero-g{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}.hero-l{max-width:540px}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:.8125rem;font-weight:500;color:var(--teal);margin-bottom:24px}
.dot{width:6px;height:6px;background:var(--teal);border-radius:50%;animation:pulse 2.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.hero-l h1{margin-bottom:20px}.hero-l>p{color:var(--muted);font-size:1.0625rem;margin-bottom:32px;max-width:460px}
.hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
.proof-row{display:flex;gap:40px}.proof-n{font-size:1.75rem;font-weight:600;line-height:1;margin-bottom:2px}.proof-l{font-size:.8125rem;color:var(--muted)}
.hero-visual{position:relative;display:flex;justify-content:center;align-items:center;min-height:420px}
.building-scene{width:100%;max-width:420px;height:420px;perspective:800px;position:relative}
.building-card{width:100%;height:100%;border-radius:var(--r-xl);overflow:hidden;border:1px solid var(--lgray);box-shadow:0 20px 60px rgba(0,0,0,.08);position:relative;transition:transform 100ms ease}
.building-img{width:100%;height:100%;object-fit:cover;display:block}
.building-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(26,26,26,.7) 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:28px}
.building-overlay h3{color:#fff;font-size:1.25rem;margin-bottom:4px}.building-overlay p{color:rgba(255,255,255,.8);font-size:.875rem}
.building-badge{position:absolute;top:20px;right:20px;background:var(--teal);color:#fff;font-size:.75rem;font-weight:600;padding:6px 14px;border-radius:var(--r-full);box-shadow:0 4px 12px var(--teal-glow)}
.float-card{position:absolute;background:#fff;border:1px solid var(--lgray);border-radius:var(--r-lg);padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,.06);z-index:2;animation:floaty 3s ease-in-out infinite}
.float-card-1{top:30px;left:-30px}.float-card-2{bottom:60px;right:-20px;animation-delay:1.5s}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.float-card .fc-l{font-size:.6875rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}.float-card .fc-v{font-size:1.25rem;font-weight:600}.float-card .fc-d{font-size:.75rem;font-weight:500;color:var(--teal)}
@media(max-width:960px){.hero-g{grid-template-columns:1fr;gap:48px}.hero-visual{min-height:320px}.building-scene{max-width:100%;height:320px}.float-card{display:none}}
.sec{padding:96px 0}.sec-alt{background:var(--bg2)}
.prob-h{max-width:560px;margin-bottom:48px}.prob-h p{color:var(--muted);margin-top:12px}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.pcard{background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);padding:28px 24px;transition:transform 200ms,box-shadow 200ms,border-color 200ms}
.pcard:hover{border-color:var(--teal);box-shadow:0 8px 24px rgba(0,0,0,.06);transform:translateY(-4px)}
.pcard-i{width:40px;height:40px;background:#fef2f2;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;margin-bottom:16px}.pcard-i svg{width:20px;height:20px;color:#dc2626}
.pcard h3{margin-bottom:8px}.pcard p{color:var(--muted);font-size:.9375rem}
@media(max-width:768px){.pgrid{grid-template-columns:1fr;gap:12px}}
.oh{text-align:center;max-width:580px;margin:0 auto 56px}.oh p{color:var(--muted);margin-top:12px}
.vstack{max-width:720px;margin:0 auto;background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.si{display:grid;grid-template-columns:48px 1fr auto;gap:16px;align-items:start;padding:24px;border-bottom:1px solid var(--lgray);transition:background 200ms}.si:last-child{border-bottom:none}.si:hover{background:var(--teal-05)}
.sn{width:36px;height:36px;background:var(--teal-10);border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;font-size:.8125rem;font-weight:600;color:var(--teal)}
.sb h3{margin-bottom:4px}.sb p{color:var(--muted);font-size:.875rem}
.sv{text-align:right;flex-shrink:0}.sv-s{font-size:.9375rem;font-weight:500;color:var(--sec);text-decoration:line-through}.sv-l{font-size:.75rem;color:var(--sec)}
.ototal{max-width:720px;margin:24px auto 0;background:var(--bg);border:2px solid var(--teal);border-radius:var(--r-xl);padding:40px;text-align:center;position:relative;overflow:hidden}
.ototal::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--teal-05) 0%,transparent 50%);pointer-events:none}.ototal>div{position:relative}
.ot-label{font-size:.8125rem;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
.ot-strike{font-size:1.5rem;font-weight:500;color:var(--sec);text-decoration:line-through;margin-bottom:4px}
.ot-real{font-size:2rem;font-weight:600;color:var(--teal);margin-bottom:8px}
.ot-sub{color:var(--muted);font-size:.9375rem;max-width:440px;margin:0 auto}
@media(max-width:640px){.si{grid-template-columns:36px 1fr;gap:12px}.sv{grid-column:2;text-align:left}.ototal{padding:28px 20px}}
.sh{text-align:center;max-width:500px;margin:0 auto 56px}.sh p{color:var(--muted);margin-top:12px}
.sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.scard{background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);padding:32px 24px;transition:transform 200ms,box-shadow 200ms,border-color 200ms}
.scard:hover{border-color:var(--teal);box-shadow:0 8px 24px rgba(0,0,0,.06);transform:translateY(-4px)}
.scard-n{font-size:2.5rem;font-weight:600;color:var(--mgray);line-height:1;margin-bottom:16px}.scard h3{margin-bottom:8px}.scard p{color:var(--muted);font-size:.9375rem}
@media(max-width:768px){.sgrid{grid-template-columns:1fr;gap:16px}}
.csplit{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;max-width:880px;margin:0 auto}.csplit-l p{color:var(--muted);margin-top:16px;max-width:400px}
.calc-card{background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.calc-label{font-size:.8125rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;font-weight:500}
.calc-slider-wrap{margin-bottom:24px}.calc-price-display{font-size:1.75rem;font-weight:600;margin-bottom:12px}
.calc-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;background:var(--lgray);outline:none}
.calc-slider::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:var(--teal);cursor:pointer;box-shadow:0 2px 8px var(--teal-glow);transition:transform 150ms}
.calc-slider::-webkit-slider-thumb:hover{transform:scale(1.15)}
.calc-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:var(--teal);cursor:pointer;border:none}
.calc-results{border-top:1px solid var(--lgray);padding-top:20px}
.calc-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--lgray)}.calc-row:last-child{border-bottom:none}
.calc-row-l{font-size:.9375rem;color:var(--muted)}.calc-row-v{font-weight:500}.calc-row-v.hl{font-size:1.5rem;font-weight:600;color:var(--teal)}
.calc-note{margin-top:16px;font-size:.8125rem;color:var(--sec);display:flex;align-items:center;gap:6px}.calc-note svg{width:14px;height:14px;color:var(--teal);flex-shrink:0}
@media(max-width:768px){.csplit{grid-template-columns:1fr;gap:32px}}
.agrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:880px;margin:0 auto}
.acard{background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);padding:24px;transition:transform 200ms,box-shadow 200ms,border-color 200ms}
.acard:hover{border-color:var(--teal);box-shadow:0 4px 16px rgba(0,0,0,.04);transform:translateY(-2px)}
.acard-i{width:40px;height:40px;background:var(--teal-10);border-radius:var(--r-lg);display:flex;align-items:center;justify-content:center;margin-bottom:14px}.acard-i svg{width:20px;height:20px;color:var(--teal)}
.acard h3{margin-bottom:4px;font-size:1rem}.acard p{color:var(--muted);font-size:.8125rem}
@media(max-width:768px){.agrid{grid-template-columns:1fr 1fr;gap:12px}}@media(max-width:480px){.agrid{grid-template-columns:1fr}}
.gbox{max-width:640px;margin:0 auto;background:var(--bg);border:1px solid var(--lgray);border-radius:var(--r-xl);padding:48px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.gicon{width:56px;height:56px;background:var(--teal-10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}.gicon svg{width:28px;height:28px;color:var(--teal)}
.gbox h2{margin-bottom:16px}.gbox p{color:var(--muted);max-width:460px;margin:0 auto}
.faq-h{text-align:center;margin-bottom:48px}.faq-l{max-width:640px;margin:0 auto}.fi{border-bottom:1px solid var(--lgray)}
.ft{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;font-size:1rem;font-weight:500;color:var(--black);text-align:left;transition:color 200ms;min-height:44px}.ft:hover{color:var(--teal)}
.fi-icon{width:24px;height:24px;flex-shrink:0;transition:transform 300ms;color:var(--sec)}.fi.open .fi-icon{transform:rotate(45deg);color:var(--teal)}
.fa{max-height:0;overflow:hidden;transition:max-height 400ms ease,padding-bottom 300ms;color:var(--muted);font-size:.9375rem;line-height:1.7;padding-bottom:0}.fi.open .fa{max-height:250px;padding-bottom:20px}
.fcta{padding:96px 0;background:var(--bg2);text-align:center}.fcta h2{margin-bottom:12px}.fcta>div>p{color:var(--muted);max-width:440px;margin:0 auto 32px}.fcta-note{margin-top:16px}
footer{padding:32px 0;border-top:1px solid var(--lgray);text-align:center}footer p{font-size:.8125rem;color:var(--sec)}
[data-reveal]{opacity:0;transform:translateY(20px);transition:opacity 600ms ease,transform 600ms cubic-bezier(.16,1,.3,1)}[data-reveal].visible{opacity:1;transform:translateY(0)}
[data-reveal="left"]{transform:translateX(-30px)}[data-reveal="left"].visible{transform:none}
[data-reveal="right"]{transform:translateX(30px)}[data-reveal="right"].visible{transform:none}
[data-reveal="scale"]{transform:scale(.95)}[data-reveal="scale"].visible{transform:none}
[data-reveal-d="1"]{transition-delay:80ms}[data-reveal-d="2"]{transition-delay:160ms}[data-reveal-d="3"]{transition-delay:240ms}[data-reveal-d="4"]{transition-delay:320ms}
@media(prefers-reduced-motion:reduce){[data-reveal]{transition-duration:.01ms!important;opacity:1!important;transform:none!important}}
a:focus-visible,button:focus-visible{outline:2px solid var(--teal);outline-offset:2px;border-radius:4px}
.modal-overlay{position:fixed;inset:0;background:rgba(26,26,26,.5);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;pointer-events:none;transition:opacity 300ms}.modal-overlay.active{opacity:1;pointer-events:all}
.modal-box{background:#fff;border-radius:var(--r-xl);max-width:520px;width:100%;max-height:90vh;overflow-y:auto;padding:40px;box-shadow:0 20px 60px rgba(0,0,0,.12);transform:translateY(20px) scale(.97);transition:transform 300ms cubic-bezier(.16,1,.3,1);position:relative}.modal-overlay.active .modal-box{transform:none}
.modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:var(--r-lg);color:var(--muted);transition:background 200ms,color 200ms}.modal-close:hover{background:var(--mgray);color:var(--black)}.modal-close svg{width:20px;height:20px}
.modal-box h2{font-size:1.5rem;margin-bottom:4px}.modal-box .modal-sub{color:var(--muted);font-size:.9375rem;margin-bottom:28px}
.form-group{margin-bottom:20px}.form-label{display:block;font-size:.875rem;font-weight:500;margin-bottom:6px}.form-label .req{color:#dc2626}
.form-input,.form-select,.form-textarea{width:100%;padding:10px 14px;border:1px solid var(--lgray);border-radius:var(--r-lg);background:var(--mgray);font-size:.9375rem;font-family:inherit;color:var(--black);transition:border-color 200ms;min-height:44px}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--teal);background:#fff}
.form-textarea{resize:vertical;min-height:80px}
.form-select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:480px){.form-row{grid-template-columns:1fr}}
.form-hint{font-size:.75rem;color:var(--sec);margin-top:4px}.form-submit{width:100%;margin-top:8px}
.form-slots{text-align:center;margin-top:16px;font-size:.8125rem;color:var(--sec)}
.form-success{text-align:center;padding:40px 0}
.form-success-icon{width:64px;height:64px;background:var(--teal-10);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}.form-success-icon svg{width:32px;height:32px;color:var(--teal)}
.form-success h2{margin-bottom:8px;font-size:1.5rem}.form-success p{color:var(--muted)}
.form-error{background:#fef2f2;color:#dc2626;font-size:.875rem;padding:12px 16px;border-radius:var(--r-lg);margin-bottom:16px;display:none}
@keyframes spin{to{transform:rotate(360deg)}}
`

const bodyHTML = `
<div class="scroll-progress" id="scrollProgress"></div>

<nav role="navigation" aria-label="Principal"><a href="https://www.rentmies.com" class="logo">rent<span>mies</span></a><div class="nav-r"><div class="nav-desk" style="display:flex;gap:32px;align-items:center"><a href="#alianza" class="nav-l">Alianza</a><a href="#como" class="nav-l">Cómo Funciona</a><a href="#faq" class="nav-l">Preguntas</a></div><span class="slots-badge">Solo 10 cupos</span><button class="btn-p" style="padding:8px 20px;font-size:.875rem" onclick="openModal()">Aplicar</button></div></nav>

<section class="hero"><div class="container"><div class="hero-g"><div class="hero-l">
<div class="eyebrow"><span class="dot"></span>Aceptando 10 aliados fundadores en Colombia</div>
<h1>Nosotros invertimos en ti. Tú inviertes en ti mismo.</h1>
<p>Rentmies pone desde $1.000.000/mes detrás de tu crecimiento — financiando campañas, operando agentes IA en todos los canales, y dándole a tus compradores cashback. Tú cierras. Ambos ganamos.</p>
<div class="hero-ctas"><button class="btn-p btn-lg" data-magnetic onclick="openModal()">Reserva Tu Mercado <svg class="arrow-i" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button><a href="#como" class="btn-s btn-lg">Cómo Funciona</a></div>
<div class="proof-row"><div><div class="proof-n" data-counter="25000" data-prefix="" data-suffix="M+" data-format="raw">0</div><div class="proof-l">En propiedades vendidas</div></div><div><div class="proof-n" data-counter="100000" data-suffix="+" data-format="short">0</div><div class="proof-l">Conversaciones IA</div></div><div><div class="proof-n" data-counter="1" data-suffix="%">0</div><div class="proof-l">Cashback comprador</div></div></div>
</div>
<div class="hero-visual"><div class="building-scene" id="buildingScene"><div class="building-card">
<img class="building-img" src="/imagen-proyecto-vendido-partnership.png" alt="Proyecto Gorrión de Prodsa" loading="eager">
<div class="building-overlay"><h3>Proyecto Gorrión de Prodsa</h3><p>Desde $450.000.000</p></div>
<span class="building-badge">Vendido con Rentmies</span>
</div><div class="float-card float-card-1"><div class="fc-l">Leads esta semana</div><div class="fc-v">47</div><div class="fc-d">+28% ↑</div></div><div class="float-card float-card-2"><div class="fc-l">Cashback comprador</div><div class="fc-v">$4.5M</div><div class="fc-d">Pagado en 7 días</div></div></div></div>
</div></div></section>

<section class="sec"><div class="container"><div class="prob-h" data-reveal><span class="tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>El problema</span><h2>Estás gastando tu propio dinero en leads que te ghostean</h2><p>La mayoría de agencias queman millones al mes en publicidad, obtienen leads de baja calidad, y no logran escalar de forma predecible.</p></div>
<div class="pgrid"><div class="pcard" data-reveal data-reveal-d="1"><div class="pcard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><h3>Tú eres el presupuesto de marketing</h3><p>Millones van a portales, Facebook, Google cada mes. Si no convierte, esa plata se perdió — y el riesgo fue 100% tuyo.</p></div>
<div class="pcard" data-reveal data-reveal-d="2"><div class="pcard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><h3>Los leads se enfrían en minutos</h3><p>Alguien pregunta a las 11pm. Respondes a las 8am. Para ese momento, ya habló con 3 agencias más.</p></div>
<div class="pcard" data-reveal data-reveal-d="3"><div class="pcard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div><h3>Sin ventaja competitiva para compradores</h3><p>Todas las agencias ofrecen lo mismo. Necesitas algo único que haga que los compradores elijan tus proyectos primero.</p></div></div></div></section>

<section class="sec sec-alt" id="alianza"><div class="container"><div class="oh" data-reveal><span class="tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>La Alianza Rentmies</span><h2>Todo lo que necesitas para vender más — y nosotros pagamos la cuenta</h2><p>Diseñamos esto para que la única respuesta lógica sea "sí".</p></div>
<div class="vstack" data-reveal><div class="si"><div class="sn">01</div><div class="sb"><h3>Desde $1.000.000/mes en inversión de marketing</h3><p>Financiamos campañas en Meta, Google y más — llevando leads calificados directamente a ti.</p></div><div class="sv"><div class="sv-s">$12M/año</div><div class="sv-l">valor</div></div></div><div class="si"><div class="sn">02</div><div class="sb"><h3>Generador de Anuncios IA</h3><p>Crea, lanza y gestiona tus propias campañas encima de lo que nosotros invertimos.</p></div><div class="sv"><div class="sv-s">$7.2M/año</div><div class="sv-l">valor</div></div></div><div class="si"><div class="sn">03</div><div class="sb"><h3>Agentes de Comunicación IA</h3><p>24/7 en WhatsApp, llamadas, redes, email y widget web — entrenados en tus proyectos.</p></div><div class="sv"><div class="sv-s">$21.6M/año</div><div class="sv-l">valor</div></div></div><div class="si"><div class="sn">04</div><div class="sb"><h3>Dashboard Unificado y Analítica</h3><p>Cada conversación, canal y métrica — una sola pantalla.</p></div><div class="sv"><div class="sv-s">$5.7M/año</div><div class="sv-l">valor</div></div></div><div class="si"><div class="sn">05</div><div class="sb"><h3>Programa de Cashback para Compradores</h3><p>Los compradores reciben cashback una semana después del cierre. Tus proyectos se venden más rápido.</p></div><div class="sv"><div class="sv-s" style="text-decoration:none;color:var(--teal)">Invaluable</div><div class="sv-l">ventaja</div></div></div></div>
<div class="ototal" data-reveal><div><div class="ot-label">Valor total de la alianza</div><div class="ot-strike">$46.500.000+/año</div><div class="ot-real">$0 por adelantado — nosotros invertimos en ti</div><div class="ot-sub">Solo ganamos cuando tú ganas: comisión del 1.5% sobre negocios que generemos para ti.</div></div></div></div></section>

<section class="sec" id="como"><div class="container"><div class="sh" data-reveal><span class="tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>Cómo funciona</span><h2>Tres pasos. Cero riesgo.</h2><p>Sin letra pequeña. Sin costos ocultos. Una alianza alineada por resultados.</p></div>
<div class="sgrid"><div class="scard" data-reveal data-reveal-d="1"><div class="scard-n">01</div><h3>Aplica y Sé Aprobado</h3><p>Evaluamos cada aliado cuidadosamente. Solo 10 alianzas fundadoras por mercado. Toma 2 minutos.</p></div><div class="scard" data-reveal data-reveal-d="2"><div class="scard-n">02</div><h3>Lanzamos Tus Campañas</h3><p>Activamos agentes IA en todos los canales y empezamos a correr pauta con nuestro presupuesto. Leads llegan en días.</p></div><div class="scard" data-reveal data-reveal-d="3"><div class="scard-n">03</div><h3>Tú Cierras, Ambos Ganamos</h3><p>Lead de Rentmies cierra → tomamos 1.5% de comisión. Parte va al comprador como cashback.</p></div></div></div></section>

<section class="sec sec-alt"><div class="container"><div class="csplit"><div class="csplit-l" data-reveal="left"><span class="tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Tu ventaja injusta</span><h2>Los compradores reciben cashback en cada negocio</h2><p>Una semana después del cierre, los compradores reciben un reembolso. La ventaja competitiva que hace que tu pipeline convierta más rápido que el de cualquiera.</p><div style="margin-top:24px"><button class="btn-p" onclick="openModal()">Reserva Tu Mercado <svg class="arrow-i" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button></div></div>
<div data-reveal="right"><div class="calc-card"><div class="calc-label">Calculadora de Cashback</div><div class="calc-slider-wrap"><div class="calc-price-display" id="calcPrice">$450.000.000</div><input type="range" class="calc-slider" id="calcSlider" min="100000000" max="2000000000" step="25000000" value="450000000" aria-label="Precio de la propiedad"><div style="display:flex;justify-content:space-between;margin-top:6px"><span style="font-size:.75rem;color:var(--sec)">$100M</span><span style="font-size:.75rem;color:var(--sec)">$2.000M</span></div></div><div class="calc-results"><div class="calc-row"><span class="calc-row-l">Precio de venta</span><span class="calc-row-v" id="calcPurchase">$450.000.000</span></div><div class="calc-row"><span class="calc-row-l">Comisión Rentmies (1.5%)</span><span class="calc-row-v" id="calcCommission">$6.750.000</span></div><div class="calc-row"><span class="calc-row-l">Cashback comprador (1%)</span><span class="calc-row-v hl" id="calcCashback">$4.500.000</span></div></div><div class="calc-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>Pagado al comprador 1 semana después del cierre</div><div style="margin-top:8px;font-size:.7rem;color:var(--sec)">*Aplican términos y condiciones.</div></div></div></div></div></section>

<section class="sec"><div class="container"><div class="oh" data-reveal><span class="tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="20" rx="2"/><path d="m2 12 10 10"/><path d="m2 2 20 20"/></svg>Potenciado por IA</span><h2>Todos los canales. Todos los leads. Atendidos.</h2><p>Entrenados con más de 100.000 conversaciones inmobiliarias. Responde al instante, califica leads, agenda citas las 24/7.</p></div>
<div class="agrid"><div class="acard" data-reveal data-reveal-d="1"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><h3>WhatsApp</h3><p>Respuestas instantáneas, detalles de proyectos, agendamiento</p></div><div class="acard" data-reveal data-reveal-d="2"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div><h3>Llamadas</h3><p>Agentes de voz IA que califican y convierten</p></div><div class="acard" data-reveal data-reveal-d="3"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div><h3>Email</h3><p>Campañas drip y respuestas inmediatas</p></div><div class="acard" data-reveal data-reveal-d="3"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div><h3>Redes Sociales</h3><p>Instagram y Facebook DMs en automático</p></div><div class="acard" data-reveal data-reveal-d="4"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><h3>Widget Web</h3><p>Embed en cualquier sitio, captura cada visitante</p></div><div class="acard" data-reveal data-reveal-d="4"><div class="acard-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg></div><h3>Dashboard</h3><p>Analítica unificada y gestión de leads</p></div></div></div></section>

<section class="sec sec-alt"><div class="container"><div class="gbox" data-reveal="scale"><div class="gicon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></div><h2>Si no generamos leads, no nos pagas ni un peso</h2><p>Invertimos nuestro capital por adelantado. Si nuestras campañas no producen cierres, nuestra comisión es cero. Solo ganamos cuando tú ganas.</p></div></div></section>

<section class="sec" id="faq"><div class="container"><div class="faq-h" data-reveal><h2>Preguntas que hacen las agencias</h2></div><div class="faq-l">
<div class="fi" data-reveal><button class="ft" aria-expanded="false"><span>¿Cómo gana dinero Rentmies?</span><svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button><div class="fa">Tomamos una comisión del 1.5% sobre ventas generadas a través de nuestras campañas. De eso, una parte va directamente al comprador como cashback. Nuestro margen está en el restante más el valor de la alianza a largo plazo.</div></div>
<div class="fi" data-reveal data-reveal-d="1"><button class="ft" aria-expanded="false"><span>¿Tengo que pagar algo por adelantado?</span><svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button><div class="fa">No. Invertimos nuestro propio capital. No pagas nada a menos que generemos una venta para ti.</div></div>
<div class="fi" data-reveal data-reveal-d="2"><button class="ft" aria-expanded="false"><span>¿Por qué solo 10 alianzas?</span><svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button><div class="fa">Invertimos más de $1.000.000/mes por aliado con configuración dedicada de agentes IA y optimización continua. Para entregar resultados reales, limitamos las alianzas para ir profundo, no amplio.</div></div>
<div class="fi" data-reveal data-reveal-d="3"><button class="ft" aria-expanded="false"><span>¿Hay contrato de permanencia?</span><svg class="fi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button><div class="fa">Nos ganamos tu alianza cada mes. Acuerdos justos, términos transparentes, sin permanencias forzadas.</div></div>
</div></div></section>

<section class="fcta" id="apply"><div class="container"><h2 data-reveal>Las agencias correctas no esperan.<br><span style="color:var(--teal)">Aplican.</span></h2><p data-reveal>10 alianzas fundadoras. Ventaja de primer jugador en tu mercado. Cuando se llenen, la puerta se cierra.</p><button class="btn-p btn-lg" data-reveal data-magnetic onclick="openModal()">Reserva Tu Mercado <svg class="arrow-i" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button><div class="fcta-note" data-reveal><span class="slots-badge" style="font-size:.7rem">Solo 10 cupos</span></div></div></section>

<footer><div class="container"><p>&copy; 2026 Rentmies. Invertimos en agencias que invierten en sí mismas.</p><p style="margin-top:8px;font-size:.75rem;color:var(--sec)">Aplican términos y condiciones. El programa de alianzas, cashback y comisiones está sujeto a disponibilidad y aprobación por parte de Rentmies. Rentmies se reserva el derecho de modificar o descontinuar el programa en cualquier momento.</p></div></footer>

<div class="modal-overlay" id="modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Aplicación de alianza"><div class="modal-box"><button class="modal-close" onclick="closeModal()" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
<div id="formView"><h2>Reserva Tu Mercado</h2><p class="modal-sub">10 alianzas fundadoras disponibles. Cuéntanos sobre tu agencia para ver si hay fit.</p>
<div class="form-error" id="formError"></div>
<div id="appForm">
<div class="form-row"><div class="form-group"><label class="form-label">Nombre completo <span class="req">*</span></label><input class="form-input" type="text" id="fName" placeholder="María García" required></div><div class="form-group"><label class="form-label">Email <span class="req">*</span></label><input class="form-input" type="email" id="fEmail" placeholder="maria@agencia.com" required></div></div>
<div class="form-row"><div class="form-group"><label class="form-label">Nombre de la agencia <span class="req">*</span></label><input class="form-input" type="text" id="fBrokerage" placeholder="García Inmobiliaria"></div><div class="form-group"><label class="form-label">Ciudad / Mercado <span class="req">*</span></label><input class="form-input" type="text" id="fCity" placeholder="Bogotá"></div></div>
<div class="form-row"><div class="form-group"><label class="form-label">Ventas promedio/mes (últimos 3 meses) <span class="req">*</span></label><select class="form-select" id="fSales"><option value="">Seleccionar rango</option><option value="1-3">1–3 ventas/mes</option><option value="4-8">4–8 ventas/mes</option><option value="9-15">9–15 ventas/mes</option><option value="16-30">16–30 ventas/mes</option><option value="30+">30+ ventas/mes</option></select></div><div class="form-group"><label class="form-label">Precio promedio de cierre <span class="req">*</span></label><select class="form-select" id="fPrice"><option value="">Seleccionar rango</option><option value="<200M">Menos de $200M</option><option value="200-400M">$200M – $400M</option><option value="400-700M">$400M – $700M</option><option value="700M-1B">$700M – $1.000M</option><option value="1B+">Más de $1.000M</option></select></div></div>
<div class="form-group"><label class="form-label">Número de asesores activos <span class="req">*</span></label><select class="form-select" id="fAgents"><option value="">Seleccionar rango</option><option value="1-5">1–5 asesores</option><option value="6-15">6–15 asesores</option><option value="16-50">16–50 asesores</option><option value="50+">50+ asesores</option></select></div>
<div class="form-group"><label class="form-label">Teléfono WhatsApp <span class="req">*</span></label><input class="form-input" type="tel" id="fPhone" placeholder="+57 310 123 4567"></div>
<div class="form-group"><label class="form-label">Canales de marketing actuales</label><input class="form-input" type="text" id="fChannels" placeholder="ej. Portales, Facebook Ads, Google, referidos..."><div class="form-hint">Nos ayuda a entender dónde amplificar tu presencia</div></div>
<div class="form-group"><label class="form-label">¿Cuál es tu mayor reto de crecimiento ahora?</label><textarea class="form-textarea" id="fChallenge" placeholder="ej. No hay suficientes leads calificados, seguimiento lento, costos de pauta altos..."></textarea></div>
<button class="btn-p btn-lg form-submit" id="submitBtn" onclick="submitForm()">Enviar Aplicación <svg class="arrow-i" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
<div class="form-slots"><span class="slots-badge">Solo 10 cupos</span> — aplicaciones revisadas en 24 horas</div><div style="margin-top:12px;font-size:.7rem;color:var(--sec);text-align:center">Al enviar, aceptas nuestros términos y condiciones del programa de alianzas.</div>
</div></div>
<div id="successView" style="display:none"><div class="form-success"><div class="form-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg></div><h2>Aplicación recibida</h2><p>Revisaremos tu aplicación en 24 horas y te contactaremos si hay fit. Mantén tu WhatsApp activo.</p></div></div>
</div></div>
`

export default function PartnershipsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script src="/partnerships.js" strategy="afterInteractive" />
    </>
  )
}
