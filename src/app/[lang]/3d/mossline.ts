/* Mossline: floating moss island scroll fly-in. Single self-contained page (HTML + CSS + vanilla JS). */
export const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mossline — Measure the Living Planet</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--ink:#10291a;--ink2:#2c4434;--mist:#e7ebe8;--paper:#f6f7f4;--lime:#c6f35c;--lime2:#a9dd3a;--glass:rgba(244,247,243,.16);--line:rgba(255,255,255,.28);--sans:"Inter Tight","Helvetica Neue",Arial,sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--mist)}
body{font-family:var(--sans);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.mono{font-family:var(--mono);text-transform:uppercase;letter-spacing:.14em;font-size:11px}
.chip{display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 9px;background:var(--lime);color:var(--ink);border-radius:3px;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase}

/* nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:50;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:22px 34px}
.logo{display:flex;align-items:center;gap:9px;font-weight:600;font-size:21px;letter-spacing:-.02em}
.menu{display:flex;gap:30px}
.menu a{font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;display:inline-flex;align-items:center;gap:7px;transition:color .3s}
.menu a::after{content:"";width:6px;height:6px;border-right:1.3px solid currentColor;border-bottom:1.3px solid currentColor;transform:translateY(-2px) rotate(45deg)}
.menu a:hover{color:var(--lime2)}
.talk{justify-self:end;display:inline-flex;align-items:center;gap:12px;font-family:var(--mono);font-size:11.5px;letter-spacing:.16em}
.talk i{font-style:normal;width:20px;height:20px;border-radius:3px;background:var(--lime);color:var(--ink);display:grid;place-items:center;transition:transform .3s}
.talk:hover i{transform:translateX(3px)}

/* story */
#story{position:relative;height:640vh}
.stage{position:sticky;top:0;height:100vh;overflow:hidden;background:#dfe3e0}
.cam{position:absolute;inset:-9% -3% -3%;will-change:transform}
.cam canvas,.cam .plate{position:absolute;inset:0;width:100%;height:100%}
.cam .plate{object-fit:cover}
.mist{position:absolute;inset:-10%;pointer-events:none;background:radial-gradient(40% 30% at 20% 80%,rgba(255,255,255,.55),transparent 70%),radial-gradient(35% 25% at 85% 30%,rgba(255,255,255,.4),transparent 70%);animation:drift 18s ease-in-out infinite alternate}
@keyframes drift{to{transform:translate3d(4%,-2%,0)}}
#push{position:absolute;width:2px;height:2px;opacity:0;pointer-events:none}
.camF{visibility:hidden;pointer-events:none;-webkit-mask-image:linear-gradient(90deg,transparent 25%,#000 27.5%,#000 71.5%,transparent 74%);mask-image:linear-gradient(90deg,transparent 25%,#000 27.5%,#000 71.5%,transparent 74%)}
.camF img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.layer{position:absolute;inset:0;pointer-events:none}
.layer>*{pointer-events:auto}

/* rocks */
.rock{position:absolute;overflow:hidden;pointer-events:none;will-change:transform,filter}
.rock .bob{position:absolute;inset:0;animation:bob 7s ease-in-out infinite alternate}
.rock img{position:absolute;max-width:none}
@keyframes bob{from{transform:translateY(-1.2%) rotate(-1.2deg)}to{transform:translateY(1.6%) rotate(1.4deg)}}
.rk1{left:4%;top:13%;width:7.5vw;aspect-ratio:260/295}
.rk1 .bob{animation-duration:6s}
.rk1 img{width:461.538%;left:-11.538%;top:-67.797%}
.rk3{left:80%;top:58%;width:14vw;aspect-ratio:265/270}
.rk3 .bob{animation-duration:8.5s;animation-delay:-3s}
.rk3 img{width:452.830%;left:-337.736%;top:-88.889%}

/* hero */
.hero-copy{position:absolute;left:0;right:0;top:12.5vh;text-align:center;will-change:transform,filter,opacity}
.hero-copy h1{font-weight:500;line-height:.92;letter-spacing:-.045em;margin-top:18px;color:var(--ink);font-size:clamp(44px,6vw,96px)}
.hero-copy .ln{display:block;overflow:hidden;padding-bottom:.06em;white-space:nowrap}
.hero-copy.wrapit .ln{white-space:normal}
.hero-copy .ln span{display:inline-block;transform:translateY(105%);animation:rise 1.1s cubic-bezier(.2,.8,.2,1) .2s forwards}
@keyframes rise{to{transform:none}}
.hud{position:absolute;left:53.5%;top:62%;color:#fff}
.hud .x{position:absolute;left:-44px;top:4px;width:22px;height:22px}
.hud .x::before,.hud .x::after{content:"";position:absolute;background:#fff}
.hud .x::before{left:10.5px;top:0;width:1px;height:22px}
.hud .x::after{top:10.5px;left:0;height:1px;width:22px}
.hud pre{position:relative;font-family:var(--mono);font-size:11px;letter-spacing:.12em;line-height:1.65;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.35);margin-top:12px}
.hud pre::before{content:"";position:absolute;left:-8px;top:-8px;right:-14px;bottom:-10px;border:1px solid rgba(255,255,255,.55);clip-path:polygon(0 0,14px 0,14px 1px,1px 1px,1px 14px,0 14px,0 calc(100% - 14px),1px calc(100% - 14px),1px calc(100% - 1px),14px calc(100% - 1px),14px 100%,0 100%,0 0,100% 0,100% 14px,calc(100% - 1px) 14px,calc(100% - 1px) 1px,calc(100% - 14px) 1px,calc(100% - 14px) 0,100% 0,100% 100%,calc(100% - 14px) 100%,calc(100% - 14px) calc(100% - 1px),calc(100% - 1px) calc(100% - 1px),calc(100% - 1px) calc(100% - 14px),100% calc(100% - 14px),100% 100%,0 100%)}
.caption{position:absolute;left:34px;bottom:34px;padding-left:16px;border-left:2px solid var(--lime);font-family:var(--mono);font-size:11.5px;line-height:1.75;letter-spacing:.13em;text-transform:uppercase;color:var(--ink2)}
.hint{position:absolute;right:34px;bottom:36px;display:flex;align-items:center;gap:12px;font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--ink2)}
.hint b{width:20px;height:20px;border:1.3px solid currentColor;border-radius:50%;display:grid;place-items:center}
.hint b::after{content:"";width:5px;height:5px;border-right:1.3px solid currentColor;border-bottom:1.3px solid currentColor;transform:translateY(-1px) rotate(45deg);animation:nudge 1.6s ease-in-out infinite}
@keyframes nudge{50%{transform:translateY(1px) rotate(45deg)}}

/* fog */
.fog{position:absolute;left:-8vw;top:-6vh;width:56vw;height:60vh;visibility:hidden;pointer-events:none;-webkit-mask-image:radial-gradient(ellipse 52% 48% at 46% 46%,#000 44%,rgba(0,0,0,.7) 64%,transparent 100%);mask-image:radial-gradient(ellipse 52% 48% at 46% 46%,#000 44%,rgba(0,0,0,.7) 64%,transparent 100%)}
.fog i{position:absolute;inset:0}
.fog .f0{background:radial-gradient(60% 55% at 40% 45%,#d9dddd,#cfd4d4 60%,#c9cfcf);filter:blur(10px)}
.fog .f1{inset:-20%;opacity:.55;filter:blur(14px);background-size:cover;animation:fogA 26s ease-in-out infinite alternate;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='460'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.006 0.014' numOctaves='3' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 .74 0 0 0 0 .78 0 0 0 0 .79 1.4 0 0 0 -.7'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.fog .f2{inset:-20%;opacity:.9;filter:blur(8px);background-size:cover;animation:fogB 19s ease-in-out infinite alternate;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='460'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.004 0.009' numOctaves='4' seed='11'/%3E%3CfeColorMatrix values='0 0 0 0 .9 0 0 0 0 .92 0 0 0 0 .92 1.6 0 0 0 -.55'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
@keyframes fogA{to{transform:translate3d(6%,3%,0) scale(1.08)}}
@keyframes fogB{to{transform:translate3d(-7%,-2%,0) scale(1.12)}}

/* vision */
.vision{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(820px,90vw);color:#fff;text-align:center}
.vision h2{font-weight:500;font-size:clamp(34px,4.6vw,70px);line-height:1;letter-spacing:-.04em;margin:18px 0 20px;text-shadow:0 2px 40px rgba(10,30,15,.55),0 1px 3px rgba(10,30,15,.3)}
.vision h2 span{display:inline-block;margin-right:.24em;will-change:transform,filter,opacity}
.vision p{font-size:16px;line-height:1.45;text-shadow:0 1px 14px rgba(10,30,15,.7)}

/* accounting */
.acct{position:absolute;left:34px;top:14vh;width:min(560px,86vw);color:var(--ink);font-size:clamp(20px,1.9vw,29px);line-height:1.16;letter-spacing:-.02em;text-shadow:0 0 24px rgba(255,255,255,.8)}
.acct span{display:inline;will-change:opacity,filter}
.hs{position:absolute;display:flex;align-items:flex-start;gap:8px;transform-origin:11px 11px}
.hs .dot{width:22px;height:22px;border-radius:50%;background:var(--lime);border:0;cursor:pointer;position:relative;flex:none;transition:transform .3s;animation:ping 2.4s infinite}
.hs .dot::before,.hs .dot::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:1.4px;background:var(--ink);transform:translate(-50%,-50%)}
.hs .dot::after{transform:translate(-50%,-50%) rotate(90deg)}
.hs:hover .dot{transform:scale(1.15)}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(198,243,92,.7)}70%{box-shadow:0 0 0 14px rgba(198,243,92,0)}100%{box-shadow:0 0 0 0 rgba(198,243,92,0)}}
.hs .lbl{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);padding:6px 9px;border-radius:4px;background:rgba(246,248,245,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);white-space:nowrap}
.hs .lbl em{display:block;font-style:normal;color:#4f8a12;max-height:0;overflow:hidden;transition:max-height .45s}
.hs:hover .lbl em,.hs.on .lbl em{max-height:20px}

/* station */
.cred{position:absolute;left:34px;top:13vh;max-width:380px;color:var(--ink);font-size:clamp(22px,2vw,30px);line-height:1.08;letter-spacing:-.025em;text-shadow:0 0 24px rgba(255,255,255,.8);font-weight:500}
.cred .tag{display:flex;width:max-content;background:var(--lime);font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;padding:4px 8px;border-radius:3px;margin-bottom:14px;text-shadow:none}
.card{position:absolute;left:38%;top:38vh;width:250px;padding:18px;border-radius:10px;background:rgba(40,58,44,.32);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(16px) saturate(1.2);backdrop-filter:blur(16px) saturate(1.2);color:#fff;will-change:transform,opacity}
.card h4{font-size:15px;font-weight:500;line-height:1.2}
.card .note{font-family:var(--mono);font-size:9.5px;opacity:.7;margin-top:6px;letter-spacing:.1em;text-transform:uppercase}
.card .big{font-size:46px;font-weight:500;letter-spacing:-.04em;margin-top:14px;display:flex;align-items:baseline;gap:6px}
.card .big small{font-family:var(--mono);font-size:10px;letter-spacing:.1em}
.card .plus{position:absolute;right:16px;top:96px;background:var(--lime);color:var(--ink);font-family:var(--mono);font-size:10px;padding:3px 6px;border-radius:3px}
.card svg{display:block;margin-top:6px}
.card .q{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;opacity:.7;margin-top:4px}
.feats{position:absolute;right:34px;top:30vh;width:min(400px,36vw);padding:6px 16px;border-radius:10px;background:rgba(246,248,245,.62);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.feats a{display:grid;grid-template-columns:30px 1fr 16px;gap:8px;padding:11px 0;border-bottom:1px solid rgba(16,41,26,.14);font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;transition:color .3s,padding .3s;cursor:pointer}
.feats a:last-child{border-bottom:0}
.feats a b{font-weight:400;opacity:.6}
.feats a i{font-style:normal;transition:transform .3s}
.feats a:hover,.feats a.on{color:#4f8a12;padding-left:6px}
.feats a:hover i,.feats a.on i{transform:translateX(4px)}
.prog{position:absolute;left:50%;bottom:22px;width:120px;height:2px;margin-left:-60px;background:rgba(16,41,26,.18);border-radius:2px;overflow:hidden}
.prog i{position:absolute;inset:0;background:var(--lime2);transform-origin:left;transform:scaleX(0)}

/* solutions */
#sol{position:relative;z-index:5;margin-top:-30vh;background:#fff;border-radius:22px 22px 0 0;padding:70px 34px 90px;box-shadow:0 -30px 60px rgba(16,41,26,.12)}
.sol-head{display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap}
.sol-head h2{font-weight:500;font-size:clamp(34px,3.9vw,58px);line-height:1;letter-spacing:-.04em;max-width:640px;margin-top:20px}
.sol-head p{font-size:15px;max-width:360px;color:#4a5a4f;line-height:1.5}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:54px}
.sc{position:relative;height:440px;border-radius:12px;overflow:hidden;background:#1b3122;color:#fff;transition:transform .4s;will-change:transform}
.sc .bg{position:absolute;inset:0;background-size:cover;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.sc:hover .bg{transform:scale(1.07)}
.sc .ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,25,15,.45),transparent 35%,transparent 55%,rgba(10,25,15,.75))}
.sc .top{position:absolute;left:18px;right:18px;top:18px;display:flex;justify-content:space-between;align-items:center}
.sc .top i{font-style:normal;width:28px;height:28px;border-radius:50%;background:var(--lime);color:var(--ink);display:grid;place-items:center;transition:transform .5s}
.sc:hover .top i{transform:rotate(-45deg)}
.sc .bot{position:absolute;left:18px;right:18px;bottom:18px}
.sc h3{font-size:25px;font-weight:500;letter-spacing:-.03em;line-height:1.05}
.sc p{font-size:13.5px;line-height:1.45;max-height:0;overflow:hidden;opacity:.9;transition:max-height .6s,margin .6s}
.sc:hover p{max-height:80px;margin-top:10px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:60px;border-top:1px solid #e0e5e0}
.stats div{padding-top:22px}
.stats b{display:block;font-size:44px;font-weight:500;letter-spacing:-.04em}
.stats span{font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#6a7a6f}

@media (max-width:820px){
  .nav{padding:16px 18px}
  .menu{display:none}
  .rk1{width:16vw}
  .rk3{width:30vw;top:70%}
  .hud{left:50%;top:66%}
  .caption{left:18px;right:18px;bottom:70px}
  .hint{right:18px;bottom:24px}
  .cred{left:18px;top:11vh;max-width:80vw}
  .card{left:18px;top:auto;bottom:6vh;width:210px}
  .feats{right:18px;top:auto;bottom:6vh;width:45vw}
  .feats a{font-size:9.5px;grid-template-columns:22px 1fr}
  .feats a i{display:none}
  #sol{padding:50px 18px 70px}
  .cards{grid-template-columns:1fr}
  .sc{height:340px}
  .stats{grid-template-columns:repeat(2,1fr);row-gap:20px}
}
</style>
</head>
<body>

<nav class="nav">
  <a class="logo" href="#">
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2l12 7v14l-12 7-12-7V9z" fill="currentColor"/><path d="M16 8c-4 4-5 9-1 16 1-5 4-9 8-11-3 0-5 1-7 3 0-3 0-5 0-8z" fill="#c6f35c"/></svg>
    Mossline
  </a>
  <div class="menu"><a href="#sol">Solutions</a><a href="#">Our tech</a><a href="#">Company</a><a href="#">Resources</a></div>
  <a class="talk" href="#sol">LET'S TALK <i>›</i></a>
</nav>

<section id="story">
  <div class="stage">
    <div class="cam" id="cam">
      <canvas id="cv"></canvas>
      <img class="plate" id="plate" alt="" src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_031618_8ce6dca1-972d-429d-8d13-bf0691c37848.png&w=2400&q=88">
      <div class="mist"></div>
    </div>
    <video id="push" muted playsinline preload="auto" crossorigin="anonymous" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261106_025717_906b686d-9a9a-4dea-bab4-ae2454f8390e.mp4"></video>

    <div class="fog" id="fog"><i class="f0"></i><i class="f1"></i><i class="f2"></i></div>

    <div class="layer" id="L0">
      <div class="hero-copy" id="heroCopy">
        <span class="chip">Planet intelligence</span>
        <h1><span class="ln"><span id="heroLine">Measure the Living Planet</span></span></h1>
      </div>
    </div>

    <div class="cam camF" id="camF">
      <img alt="" src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_031657_baaa3380-5ece-482a-a623-a1838fd7653c.png&w=2400&q=90">
    </div>

    <div class="rock rk1" data-x="-.3" data-y="-.6" data-d="1.3"><div class="bob"><img alt="" src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025635_82593f6a-1cf7-41c1-94ac-96fb89ebfd1a.png&w=2400&q=85"></div></div>
    <div class="rock rk3" data-x="1" data-y=".55" data-d="1.8"><div class="bob"><img alt="" src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025635_82593f6a-1cf7-41c1-94ac-96fb89ebfd1a.png&w=2400&q=85"></div></div>

    <div class="layer" id="L1">
      <div class="hud" id="hud">
        <span class="x"></span>
        <span class="chip">Biodiversity</span>
        <pre>LAT  34.0922° N
LON 116.2432° W
ELEV 842 M</pre>
      </div>
      <div class="caption" id="caption">Real-time ecosystem insights.<br>Powered by science, blockchain,<br>and transparent data.</div>
      <div class="hint" id="hint"><b></b>SCROLL TO EXPLORE</div>
    </div>

    <div class="layer" id="L2">
      <div class="vision">
        <span class="chip" id="vChip">Our vision</span>
        <h2 id="vH"><span>From</span><span>Data</span><span>Chaos</span><span>to</span><br><span>Science-Backed,</span><br><span>Actionable</span><span>Insights</span></h2>
        <p id="vP">A breakthrough in environmental measurement,<br>built for commercial use.</p>
      </div>
    </div>

    <div class="layer" id="L3">
      <p class="acct" id="acct">Our ecosystem-level accounting translates complex field science into verifiable, compliance-ready metrics — so you can drive measurable results, not just reports.</p>
      <div class="hs" style="left:12%;top:58%"><button class="dot" aria-label="Soil carbon"></button><div class="lbl">Soil carbon<em>+3.8 t/ha</em></div></div>
      <div class="hs" style="left:33%;top:41%"><button class="dot" aria-label="Canopy moisture"></button><div class="lbl">Canopy moisture<em>71 % RH</em></div></div>
      <div class="hs" style="left:70%;top:66%"><button class="dot" aria-label="Species index"></button><div class="lbl">Species index<em>214 taxa</em></div></div>
      <div class="hs" style="left:83%;top:47%"><button class="dot" aria-label="Microclimate"></button><div class="lbl">Microclimate<em>14.2 °C</em></div></div>
    </div>

    <div class="layer" id="L4">
      <h3 class="cred" id="cred"><span class="tag">✕ Field station 07</span>Scientific credibility for corporate climate action</h3>
      <div class="card" id="card">
        <h4>Accumulated carbon<br>balance</h4>
        <div class="note">Plot 07 · 12 months</div>
        <div class="big"><span id="num">0</span><small>tCO₂e</small></div>
        <span class="plus">+2.6 tCO₂e</span>
        <svg width="220" height="70" viewBox="0 0 220 70"><polyline id="spark" points="0,60 30,55 60,57 90,44 120,46 150,30 180,24 214,10" fill="none" stroke="#c6f35c" stroke-width="1.6"/><circle cx="90" cy="44" r="2.4" fill="#fff"/><circle cx="150" cy="30" r="2.4" fill="#fff"/><circle cx="214" cy="10" r="3.4" fill="#c6f35c"/></svg>
        <div class="q">Q1 · Q2 · Q3 · Q4</div>
      </div>
      <div class="feats" id="feats">
        <a><b>01</b><span>Gold-standard observation system</span><i>→</i></a>
        <a><b>02</b><span>World-class atmospheric monitoring (AMRV)</span><i>→</i></a>
        <a><b>03</b><span>Integrated algorithmic processing</span><i>→</i></a>
        <a><b>04</b><span>Blockchain-secured traceability</span><i>→</i></a>
        <a><b>05</b><span>Built for scale and complexity</span><i>→</i></a>
      </div>
    </div>

    <div class="prog"><i id="prog"></i></div>
  </div>
</section>

<section id="sol">
  <div class="sol-head">
    <div>
      <span class="chip">Our solutions</span>
      <h2>Validating what the ecosystem does naturally</h2>
    </div>
    <p>Field sensors, atmospheric flux towers and satellite data fused into one auditable record — so every tonne you report can be traced back to the ground it came from.</p>
  </div>
  <div class="cards">
    <article class="sc"><div class="bg" style="background-image:url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025630_9a37a1e0-2547-4973-8160-c75205993914.png&w=1400&q=82');background-position:22% 70%;background-size:260%"></div><div class="ov"></div><div class="top"><span class="mono">[Nature-based solutions]</span><i>→</i></div><div class="bot"><h3>Forest &amp; peatland<br>carbon projects</h3><p>Continuous flux measurement replaces sampled estimates, so credits reflect what the land actually absorbs.</p></div></article>
    <article class="sc"><div class="bg" style="background-image:url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025545_b003e5cc-e68f-4fee-b686-c217a5d81eea.png&w=1400&q=82');background-position:50% 50%;background-size:190%"></div><div class="ov"></div><div class="top"><span class="mono">[Supply chain solutions]</span><i>→</i></div><div class="bot"><h3>Scope 3 sourcing<br>verification</h3><p>Trace commodities to the plots that grew them, with deforestation-free evidence attached to every shipment.</p></div></article>
    <article class="sc"><div class="bg" style="background-image:url('https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025630_9a37a1e0-2547-4973-8160-c75205993914.png&w=1400&q=82');background-position:62% 30%;background-size:230%"></div><div class="ov"></div><div class="top"><span class="mono">[Biodiversity credits]</span><i>→</i></div><div class="bot"><h3>Living species<br>baselines</h3><p>Acoustic and eDNA monitoring builds a measurable biodiversity baseline you can report against year over year.</p></div></article>
  </div>
  <div class="stats" id="stats">
    <div><b data-to="1240" data-comma="1">0</b><span>Sensors deployed</span></div>
    <div><b data-to="38">0</b><span>Countries monitored</span></div>
    <div><b data-to="2.1" data-dec="1">0</b><span>Mt CO₂e verified</span></div>
    <div><b data-to="99.4" data-dec="1">0</b><span>% Data uptime</span></div>
  </div>
</section>

<script>
(function(){
  "use strict";
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seg(p, a, b){ return clamp((p - a) / (b - a)); }
  function ease(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function vis(el, on){ el.style.visibility = on ? "visible" : "hidden"; }

  /* ---------- video frame cache + canvas scrub ---------- */
  var FPS = 24, video = $("#push"), cv = $("#cv"), ctx = cv.getContext("2d");
  var NF = 0, frames = [], cached = 0, want = 0, shown = -1, busy = false, grab = null, gctx = null, inited = false;

  function nearest(t){
    if (!NF) return -1;
    for (var k = 0; k < NF; k++){
      if (t - k >= 0 && frames[t - k]) return t - k;
      if (t + k < NF && frames[t + k]) return t + k;
    }
    return -1;
  }
  function drawWant(){
    if (busy || !NF) return;
    var n = nearest(want);
    if (n < 0 || n === shown) return;
    busy = true;
    createImageBitmap(frames[n]).then(function(bm){
      var cw = cv.width, ch = cv.height, s = Math.max(cw / bm.width, ch / bm.height), w = bm.width * s, h = bm.height * s;
      ctx.drawImage(bm, (cw - w) / 2, (ch - h) / 2, w, h);
      if (bm.close) bm.close();
      shown = n; busy = false;
      if (nearest(want) !== shown) drawWant();
    }).catch(function(){ busy = false; });
  }
  function store(i, q){
    if (frames[i] || !gctx) return;
    try {
      gctx.drawImage(video, 0, 0, 1600, 900);
      grab.toBlob(function(b){
        if (b && !frames[i]){ frames[i] = b; cached++; drawWant(); }
      }, "image/jpeg", q);
    } catch (e) { /* tainted canvas: keep the high-res still */ }
  }
  function sizeCanvas(){
    var d = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(cv.clientWidth * d);
    cv.height = Math.round(cv.clientHeight * d);
    shown = -1; drawWant();
  }
  function fallback(){
    var i = 1;
    function on(){
      store(i, .86); i++;
      if (i < NF) video.currentTime = Math.min(i / FPS, video.duration - .01);
      else video.removeEventListener("seeked", on);
    }
    video.addEventListener("seeked", on);
    video.currentTime = Math.min(1 / FPS, video.duration - .01);
  }
  function init(){
    if (inited) return; inited = true;
    NF = Math.max(2, Math.round(video.duration * FPS));
    frames = new Array(NF);
    grab = document.createElement("canvas"); grab.width = 1600; grab.height = 900;
    gctx = grab.getContext("2d");
    store(0, .9);
    if ("requestVideoFrameCallback" in video){
      var cb = function(now, meta){
        var i = Math.min(NF - 1, Math.round(meta.mediaTime * FPS));
        if (i > 0) store(i, .86);
        if (!video.ended) video.requestVideoFrameCallback(cb);
      };
      video.requestVideoFrameCallback(cb);
      var pr = video.play();
      if (pr && pr.catch) pr.catch(fallback);
    } else fallback();
  }
  if (video.readyState >= 2) init(); else video.addEventListener("loadeddata", init);
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();

  /* ---------- hero placement ---------- */
  var heroCopy = $("#heroCopy"), heroH1 = $("#heroCopy h1"), heroLine = $("#heroLine");
  function layoutHero(){
    var W = window.innerWidth, H = window.innerHeight;
    if (W < 821){
      heroCopy.style.top = ""; heroH1.style.fontSize = ""; heroCopy.classList.add("wrapit"); return;
    }
    heroCopy.classList.remove("wrapit");
    var bw = W * 1.06, bh = H * 1.12, k = Math.max(bw / 1600, bh / 900);
    var fernTop = -.09 * H + (bh - 900 * k) / 2 + 245 * k + .06 * H;
    var fs = Math.min(104, 72 * k);
    heroH1.style.fontSize = fs + "px";
    var lw = heroLine.offsetWidth;
    if (lw > W * .86){ fs = fs * (W * .86) / lw; heroH1.style.fontSize = fs + "px"; }
    heroCopy.style.top = (fernTop + .5 * fs - heroCopy.offsetHeight) + "px";
  }
  layoutHero();
  window.addEventListener("resize", layoutHero);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHero);

  /* ---------- word splitting ---------- */
  var vWords = $$("#vH span");
  var acct = $("#acct");
  acct.innerHTML = acct.textContent.split(" ").map(function(w){ return "<span>" + w + "</span>"; }).join(" ");
  var aWords = $$("#acct span");

  /* ---------- interactions ---------- */
  var hs = $$(".hs");
  hs.forEach(function(h){
    h.querySelector(".dot").addEventListener("click", function(){
      var on = !h.classList.contains("on");
      hs.forEach(function(o){ o.classList.remove("on"); });
      if (on) h.classList.add("on");
    });
  });
  var rows = $$("#feats a");
  rows.forEach(function(r){
    r.addEventListener("click", function(){
      var on = !r.classList.contains("on");
      rows.forEach(function(o){ o.classList.remove("on"); });
      if (on) r.classList.add("on");
    });
  });
  $$(".sc").forEach(function(c){
    c.addEventListener("pointermove", function(e){
      var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      c.style.transform = "perspective(1000px) rotateY(" + (x * 6) + "deg) rotateX(" + (-y * 6) + "deg)";
    });
    c.addEventListener("pointerleave", function(){ c.style.transform = ""; });
  });

  var mx = 0, my = 0, sx = 0, sy = 0;
  window.addEventListener("pointermove", function(e){ mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5; });

  /* ---------- solutions count-up ---------- */
  var stats = $$("#stats b"), sol = $("#sol"), counted = false;
  function fmt(v, el){
    var dec = +(el.getAttribute("data-dec") || 0), s = v.toFixed(dec);
    if (el.getAttribute("data-comma")) s = Math.round(v).toLocaleString("en-US");
    return s;
  }
  function countUp(){
    counted = true;
    var t0 = performance.now();
    (function step(now){
      var t = Math.min(1, (now - t0) / 1600), e = ease(t);
      stats.forEach(function(el){ el.textContent = fmt(+el.getAttribute("data-to") * e, el); });
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- per-frame controller ---------- */
  var story = $("#story"), cam = $("#cam"), camF = $("#camF"), plate = $("#plate"), fog = $("#fog");
  var L0 = $("#L0"), L1 = $("#L1"), L2 = $("#L2"), L3 = $("#L3"), L4 = $("#L4");
  var hud = $("#hud"), caption = $("#caption"), hint = $("#hint"), vChip = $("#vChip"), vP = $("#vP");
  var cred = $("#cred"), card = $("#card"), num = $("#num"), spark = $("#spark"), prog = $("#prog");
  var rocks = $$(".rock");
  var sparkLen = spark.getTotalLength();
  spark.style.strokeDasharray = sparkLen; spark.style.strokeDashoffset = sparkLen;
  var sp = 0, last = performance.now();

  function frame(now){
    var dt = Math.min(64, now - last); last = now;
    var r = story.getBoundingClientRect();
    var p = clamp(-r.top / (story.offsetHeight - window.innerHeight));
    sp += (p - sp) * (1 - Math.pow(.86, dt / 16.7));
    if (Math.abs(p - sp) < .0002) sp = p;
    sx += (mx - sx) * .06; sy += (my - sy) * .06;
    var H = window.innerHeight;

    // video scrub
    var vp = ease(seg(sp, .05, .70));
    if (NF){ want = Math.round(vp * (NF - 1)); drawWant(); }

    // camera
    var camT = "translate3d(" + (-sx * 18) + "px," + (-sy * 12 + (1 - vp) * H * .06) + "px,0) scale(" + (1 + .02 * (1 - vp)) + ")";
    cam.style.transform = camT; camF.style.transform = camT;

    // hand-off from high-res still to cached frames
    var ho = shown < 0 ? 0 : (shown === 0 ? seg(sp, .06, .105) : 1);
    plate.style.opacity = 1 - ho; vis(plate, ho < 1);
    camF.style.opacity = 1 - ho; vis(camF, ho < 1);

    // hero
    var h = seg(sp, .02, .1);
    heroCopy.style.transform = "translate3d(" + (-sx * 10) + "px," + (-h * 80 - sy * 6) + "px,0) scale(" + (1 + h * .12) + ")";
    heroCopy.style.filter = "blur(" + (h * 14) + "px)";
    heroCopy.style.opacity = 1 - h;
    hud.style.transform = "translate3d(" + (sx * 26) + "px," + (sy * 18 - h * 40) + "px,0)";
    hud.style.opacity = 1 - seg(sp, .02, .08);
    var ch = 1 - seg(sp, .01, .05);
    caption.style.opacity = ch; hint.style.opacity = ch;
    vis(L0, h < 1); vis(L1, h < 1);

    // rocks fly past
    var fp = seg(sp, .02, .2), fe = fp * fp;
    rocks.forEach(function(rk){
      var x = +rk.getAttribute("data-x"), y = +rk.getAttribute("data-y"), d = +rk.getAttribute("data-d");
      rk.style.transform = "translate3d(" + (x * fp * 70 + sx * -24 * d) + "vw," + (y * fp * 60 + sy * -16 * d) + "vh,0) scale(" + (1 + fe * 1.6 * d) + ")";
      rk.style.filter = "blur(" + (fe * 5 * d) + "px)";
      vis(rk, fp < 1);
    });

    // fog bank
    var fg = ease(seg(sp, .38, .47));
    fog.style.opacity = fg; vis(fog, fg > 0);
    fog.style.transform = "translate3d(" + ((fg - 1) * 18 + sx * -10) + "vw," + (sy * -6) + "px,0)";

    // vision
    var vIn = seg(sp, .16, .27), vOut = seg(sp, .34, .42);
    vWords.forEach(function(w, i){
      var k = clamp(vIn * 1.6 - i * .08);
      w.style.transform = "translate3d(0," + ((1 - k) * 30 - vOut * 60) + "px,0)";
      w.style.filter = "blur(" + ((1 - k) * 12 + vOut * 14) + "px)";
      w.style.opacity = k * (1 - vOut);
    });
    var vo = clamp(vIn * 2 - .6) * (1 - vOut);
    vChip.style.opacity = vo; vP.style.opacity = vo;
    vChip.style.transform = vP.style.transform = "translateY(" + (-vOut * 50) + "px)";
    vis(L2, vIn > 0 && vOut < 1);

    // accounting + hotspots
    var aIn = seg(sp, .45, .55), aOut = seg(sp, .63, .68), n = aWords.length;
    aWords.forEach(function(w, i){
      var k = clamp(aIn * 2.2 - i / n * 1.2);
      w.style.opacity = (.15 + .85 * k) * (1 - aOut);
      w.style.filter = "blur(" + ((1 - k) * 6 + aOut * 10) + "px)";
    });
    hs.forEach(function(el, i){
      var k = seg(sp, .49 + i * .02, .53 + i * .02);
      el.style.transform = "translate3d(" + (sx * -30) + "px," + (sy * -20) + "px,0) scale(" + (k * (1 - aOut)) + ")";
    });
    vis(L3, aIn > 0 && aOut < 1);

    // station
    var sIn = seg(sp, .72, .82), cIn = ease(seg(sp, .74, .86));
    cred.style.opacity = sIn;
    cred.style.transform = "translateY(" + ((1 - sIn) * 30) + "px)";
    cred.style.filter = "blur(" + ((1 - sIn) * 8) + "px)";
    card.style.opacity = cIn;
    card.style.transform = "translate3d(" + (sx * -14) + "px," + ((1 - cIn) * 60 + sy * -10) + "px,0) rotateY(" + (sx * 8) + "deg) rotateX(" + (-sy * 8) + "deg)";
    num.textContent = Math.round(24 * seg(sp, .76, .9));
    spark.style.strokeDashoffset = sparkLen * (1 - seg(sp, .77, .92));
    rows.forEach(function(rw, i){
      var k = ease(seg(sp, .76 + i * .025, .82 + i * .025));
      rw.style.opacity = k;
      rw.style.transform = "translateX(" + ((1 - k) * 40) + "px)";
    });
    vis(L4, sIn > 0 || cIn > 0);

    prog.style.transform = "scaleX(" + sp + ")";

    if (!counted && sol.getBoundingClientRect().top < H * .6) countUp();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
</script>
</body>
</html>`;
