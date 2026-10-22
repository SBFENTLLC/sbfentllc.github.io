// Follow the visible browser viewport, including iPhone toolbar and rotation changes.
function viewportSize(env=globalThis){const v=env.visualViewport;return {width:Math.max(1,Math.round(v?.width||env.innerWidth||844)),height:Math.max(1,Math.round(v?.height||env.innerHeight||390)),left:Math.round(v?.offsetLeft||0),top:Math.round(v?.offsetTop||0)};}
class RaceViewport{
 constructor(element,resize,env=globalThis){this.element=element;this.env=env;this.resize=resize;this.last='';this.canvasSize='';this.refresh=()=>this.update();for(const event of ['resize','orientationchange'])env.addEventListener?.(event,this.refresh);env.visualViewport?.addEventListener?.('resize',this.refresh);env.visualViewport?.addEventListener?.('scroll',this.refresh);this.update();}
 update(){const q=viewportSize(this.env),key=Object.values(q).join(':');if(key===this.last)return q;this.last=key;Object.assign(this.element.style,{width:q.width+'px',height:q.height+'px',left:q.left+'px',top:q.top+'px'});this.element.dataset.landscape=String(q.width>q.height);this.element.dataset.short=String(q.height<330);this.element.dataset.narrow=String(q.width<360);const dimensions=q.width+':'+q.height;if(dimensions!==this.canvasSize){this.canvasSize=dimensions;this.resize(q);}return q;}
}

export {viewportSize,RaceViewport};
