export class Combo {
 constructor(){this.reset()}
 reset(){this.total=0;this.count=0;this.best=0;this.remaining=0;this.gain=0;this.notice=0;}
 advance(seconds){this.notice=Math.max(0,this.notice-seconds);this.remaining=Math.max(0,this.remaining-seconds);if(this.remaining<=1e-9){this.remaining=0;this.count=0;}}
 pass(){this.count++;this.best=Math.max(this.best,this.count);this.gain=100*this.count;this.total+=this.gain;this.remaining=3;this.notice=.85;return this.gain;}
}
