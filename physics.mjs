export const TAU=Math.PI*2;
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class World {
 constructor(random=Math.random){this.random=random;this.reset();}
 rand(a,b){return a+(b-a)*this.random()}
 ring(r){
  // Some consecutive rings share a rotating corridor, chosen independently of the ball.
  if(!this.corridor||this.corridor.left===0){
   const omega=this.rand(.28,.85)*(this.random()<.5?-1:1);
   this.corridor={left:this.random()<.68?Math.floor(this.rand(2,5)):1,phase:this.rand(-Math.PI,Math.PI)-omega*this.time,omega,gap:this.rand(.72,1.04)};
  }
  const c=this.corridor;c.left--;
  return {r,a:wrap(c.phase+c.omega*this.time+this.rand(-.07,.07)),omega:c.omega,gap:c.gap+this.rand(-.04,.04),hue:this.rand(0,360),width:this.rand(2,3.3),lastHit:-99,id:this.serial++};
 }
 reset(){this.corridor=null;this.serial=0;this.time=0;this.passed=0;this.hits=0;this.gravity=this.rand(140,200);this.ball={x:this.rand(-24,24),y:-35,vx:this.rand(180,250)*(this.random()<.5?-1:1),vy:this.rand(-110,0),r:7};this.rings=Array.from({length:12},(_,i)=>this.ring(128+43*i));this.events=[];}
 step(dt){
  this.events=[];let left=dt;
  while(left>1e-9){
   const b=this.ball,speed=Math.hypot(b.vx,b.vy);
   const h=Math.min(left,1/360,2/(speed+300));left-=h;this.time+=h;
   const contraction=Math.min(24,Math.max(0,(this.rings[0].r-128)*1.7));
   for(const r of this.rings){r.r-=contraction*h;r.a=wrap(r.a+r.omega*h)}
   const drag=.00035*speed;b.vx*=Math.exp(-drag*h);b.vy*=Math.exp(-drag*h);b.vy+=this.gravity*h;b.x+=b.vx*h;b.y+=b.vy*h;
   for(const r of this.rings.slice(0,3)){
    const angle=Math.atan2(b.y,b.x),diff=wrap(angle-r.a),rad=Math.hypot(b.x,b.y),reach=b.r+r.width/2;
    if(Math.abs(rad-r.r)>reach+1)continue;
    let closest=angle;
    if(Math.abs(diff)<r.gap/2)closest=r.a+(diff>=0?1:-1)*r.gap/2;
    const ux=Math.cos(closest),uy=Math.sin(closest),qx=r.r*ux,qy=r.r*uy;
    let dx=b.x-qx,dy=b.y-qy,dist=Math.hypot(dx,dy);
    if(dist>=reach)continue;
    let nx=dist>1e-8?dx/dist:-ux,ny=dist>1e-8?dy/dist:-uy;
    const sx=-contraction*ux-r.omega*qy,sy=-contraction*uy+r.omega*qx;
    const vn=(b.vx-sx)*nx+(b.vy-sy)*ny;
    // Resolve contact along its normal; never aim at a gap or alter free flight.
    b.x+=nx*(reach-dist+.001);b.y+=ny*(reach-dist+.001);
    if(vn<0){b.vx-=1.995*vn*nx;b.vy-=1.995*vn*ny;
     if(this.time-r.lastHit>.055){r.lastHit=this.time;this.hits++;this.events.push({type:'hit',x:qx,y:qy,hue:r.hue,power:-vn,nx,ny});}
    }
   }
   while(Math.hypot(b.x,b.y)>this.rings[0].r+b.r+4){
    const r=this.rings.shift();this.passed++;this.events.push({type:'pass',r:r.r,hue:r.hue,a:r.a});this.rings.push(this.ring(this.rings.at(-1).r+this.rand(38,48)));
   }
  }
 }
}
