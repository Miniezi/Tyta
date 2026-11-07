import {World,TAU} from './physics.mjs';
import {Combo} from './combo.mjs';
const combo=new Combo();let viewZoom=1;
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),world=new World();
let w=0,h=0,dpr=1,scale=1,speed=1.5,mode='ion',selected='auto',nextMood=12,hue=world.rand(0,360),hueTarget=hue,trail=[],particles=[],pulses=[],time=0,last=0,acc=0,flash=0;
const names={ion:'Ионный свет',dust:'Звёздная пыль',prism:'Призма',nova:'Импульс'},modes=Object.keys(names);
const stars=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.1+.2,p:Math.random()*TAU}));
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);scale=Math.min(w/(w<600?620:920),h/840);ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
const color=(hh,a=1,l=67)=>`hsla(${hh},85%,${l}%,${a})`;
function setMood(m){mode=m;hueTarget=hue+world.rand(65,210);}
let audio=null,lastSound=-1;
function enableAudio(){
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  if(!audio||audio.state==='closed')audio=new Audio();
  if(audio.state!=='running')audio.resume().catch(()=>{});
 }catch{}
}
// Sound is enabled by default; a gesture unlocks it on autoplay-restricted browsers.
enableAudio();
addEventListener('pointerdown',enableAudio,{passive:true});
addEventListener('touchend',enableAudio,{passive:true});
addEventListener('keydown',enableAudio);
function note(pass,power){
 if(!audio||audio.state!=='running'||audio.currentTime-lastSound<.035)return;
 lastSound=audio.currentTime;
 const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
 const tones=[0,3,5,7,10,12,15];osc.type='sine';
 osc.frequency.value=(pass?440:165)*Math.pow(2,tones[(world.passed+world.hits)%tones.length]/12);
 gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(pass?.055:Math.min(.06,.018+power/15000),t+.006);
 gain.gain.exponentialRampToValueAtTime(.0001,t+(pass?.6:.24));
 osc.connect(gain);gain.connect(audio.destination);osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start();osc.stop(t+.65);
}
function tick(dt){combo.advance(dt/speed);world.step(dt);time+=dt;hue+=(hueTarget-hue)*Math.min(1,dt*.16);if(time>nextMood){if(selected==='auto'){let choices=modes.filter(m=>m!==mode);setMood(choices[Math.floor(Math.random()*choices.length)])}else hueTarget=hue+world.rand(50,160);nextMood=time+world.rand(12,23)}
 for(const ev of world.events){const eh=hue+ev.hue*.35;if(ev.type==='hit'){note(false,ev.power);if(true){const n=mode==='dust'?20:mode==='nova'?22:12;for(let i=0;i<n;i++){let a=Math.atan2(ev.ny,ev.nx)+world.rand(-1.6,1.6),s=world.rand(15,100);particles.push({x:ev.x,y:ev.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:world.rand(.2,.75),max:.75,hue:eh,r:world.rand(.7,2.1)})}}pulses.push({x:ev.x,y:ev.y,r:3,life:.4,hue:eh,pass:false})}else{combo.pass();note(true,0);pulses.push({x:0,y:0,r:ev.r,life:.65,hue:eh,pass:true});if(mode==='nova')flash=.15;}}
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=35*dt;p.life-=dt}particles=particles.filter(p=>p.life>0).slice(-450);
 for(const p of pulses){p.life-=dt;p.r+=dt*(p.pass?48:40)}pulses=pulses.filter(p=>p.life>0).slice(-20);flash=Math.max(0,flash-dt);
 trail.push({x:world.ball.x,y:world.ball.y,t:time});while(trail.length&&time-trail[0].t>.35)trail.shift();
}
function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#070a11';ctx.fillRect(0,0,w,h);const cx=w/2,cy=h/2-8;const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.65);bg.addColorStop(0,color(hue,.075,38));bg.addColorStop(1,'#070a1100');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 for(const s of stars){ctx.fillStyle=`rgba(181,206,226,${(.1+.1*Math.sin(time*.35+s.p))*(mode==='dust'?2.1:1)})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,TAU);ctx.fill()}
 viewZoom+=(Math.min(1,190/Math.max(190,world.rings[0].r))-viewZoom)*.055;ctx.translate(cx,cy);ctx.scale(scale*viewZoom,scale*viewZoom);
 for(let i=world.rings.length-1;i>=0;i--){const r=world.rings[i],hh=hue+r.hue*.32+i*19+time*1.8,fade=Math.max(.12,1-i*.065),gap=r.gap/2;ctx.lineWidth=r.width;ctx.lineCap='round';ctx.strokeStyle=color(hh,fade,mode==='prism'?74:64);ctx.shadowColor=color(hh,.65);ctx.shadowBlur=mode==='ion'?13:mode==='nova'?18:5;
 ctx.beginPath();ctx.arc(0,0,r.r,r.a+gap,r.a+TAU-gap);ctx.stroke();ctx.shadowBlur=0;
 if(mode==='prism'){ctx.lineWidth=.65;ctx.strokeStyle=color(hh+45,.28);ctx.beginPath();ctx.arc(0,0,r.r+5,r.a+gap+.02,r.a+TAU-gap-.02);ctx.stroke()}
 for(const a of [r.a-gap,r.a+gap]){ctx.fillStyle=color(hh,fade,82);ctx.beginPath();ctx.arc(Math.cos(a)*r.r,Math.sin(a)*r.r,r.width*.75,0,TAU);ctx.fill()}
 }
 ctx.globalCompositeOperation='lighter';for(const p of pulses){ctx.strokeStyle=color(p.hue,p.life*(p.pass?.32:.7));ctx.lineWidth=p.pass?1:1.2;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.stroke()}
 for(const p of particles){ctx.fillStyle=color(p.hue,Math.max(0,p.life/p.max));ctx.beginPath();if(mode==='dust'){ctx.moveTo(p.x-p.r*2,p.y);ctx.lineTo(p.x+p.r*2,p.y);ctx.moveTo(p.x,p.y-p.r*2);ctx.lineTo(p.x,p.y+p.r*2);ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.7;ctx.stroke()}else{ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill()}}
 if(true){for(let i=1;i<trail.length;i++){const p=trail[i],a=Math.max(0,1-(time-p.t)/.35);ctx.strokeStyle=mode==='prism'?color(hue+i*3,a*.4):`rgba(194,224,244,${a*.3})`;ctx.lineWidth=world.ball.r*2*a;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(p.x,p.y);ctx.stroke()}}
 ctx.globalCompositeOperation='source-over';const b=world.ball;ctx.shadowColor='#d2eeff';ctx.shadowBlur=15;const ball=ctx.createRadialGradient(b.x-2,b.y-3,1,b.x,b.y,b.r);ball.addColorStop(0,'#fff');ball.addColorStop(.55,'#e8f3fb');ball.addColorStop(1,'#83a4bc');ctx.fillStyle=ball;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();ctx.shadowBlur=0;
 if(flash){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=color(hue,flash*.1);ctx.fillRect(0,0,w,h)}
 $('score').textContent=combo.count.toLocaleString('ru');$('timer').textContent=combo.remaining.toFixed(1).replace('.',',')+' с';$('timerFill').style.transform=`scaleX(${combo.remaining/3})`;
}
function frame(now){if(!last)last=now;let elapsed=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden){acc+=elapsed*speed;while(acc>=1/120){tick(1/120);acc-=1/120}}draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
addEventListener('visibilitychange',()=>{last=0;acc=0});
