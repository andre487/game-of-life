var t,e,i,s;class n extends Error{constructor(t){super(t),this.name=this.constructor.name,Error.captureStackTrace?.(this,this.constructor)}}function a(){return Object.create(null)}function o(t){try{t()}catch(t){window.reportError(t)}}function h(t,...e){setTimeout(()=>t(...e),0)}function r(t){return function(e){!function(t,e=Error){throw new e(t)}(e,t)}}function l(t,e){let i=BigInt(t),s=BigInt(e);return i<0n?i=s+i:i>=s&&(i%=s),i}(i=t||(t={})).Stopped="Stopped",i.Running="Running",i.Stopping="Stopping",i.Completed="Completed";class _{constructor(e){this._stopFlag=!1,this._startCallbacks=[],this._stopCallbacks=[],this._roundCallbacks=[],this._state=t.Stopped,this._runRoundAsync=t=>{let e=this._lifeMap.populatedRect,i=a(),s=a=>{let o=e.left;(function r(){n(a,o),++o<=e.right?r():++a<=e.bottom?h(s,a):t(i)})()},n=(t,e)=>{let s=this._lifeMap.isAlive(t,e),n=0;for(let i=-1;i<=1;++i)for(let s=-1;s<=1;++s)if(!(0===i&&0===s)){let a=t+BigInt(i),o=e+BigInt(s);n+=this._lifeMap.isAlive(a,o)?1:0}let o=t.toString(),h=e.toString();s&&!(2===n||3===n)?(i[o]??=a(),i[o][h]=!1):s||3!==n||(i[o]??=a(),i[o][h]=!0)};h(s,e.top)},this._lifeMap=e}get state(){return this._state}onStart(t){this._startCallbacks.push(t)}onStop(t){this._stopCallbacks.push(t)}onRound(t){this._roundCallbacks.push(t)}stop(){this._stopFlag=!0,this._state=t.Stopping}run(){let e=e=>{let s=!1;for(let[t,i]of Object.entries(e))for(let[e,n]of Object.entries(i))this._lifeMap.isAlive(t,e,n),s=!0;h(()=>{this._roundCallbacks.forEach(o)}),s?this._stopFlag?(this._state=t.Stopped,h(()=>{this._stopCallbacks.forEach(o)})):i():(this._state=t.Completed,h(()=>{this._stopCallbacks.forEach(o)}))},i=()=>{h(this._runRoundAsync,e)};this._stopFlag=!1,i(),this._state=t.Running,h(()=>{this._startCallbacks.forEach(o)})}}const c=r(class extends n{});class d{constructor(t,e,i){this._game=t,this._saveGameController=e,this._messagesView=i,this._startButton=document.getElementById("start")??c("Button not found"),this._stopButton=document.getElementById("stop")??c("Button not found"),this._saveButton=document.getElementById("save")??c("Button not found"),this._loadButton=document.getElementById("load")??c("Button not found")}init(){this._game.onStart(()=>{this._startButton.setAttribute("disabled",""),this._stopButton.removeAttribute("disabled"),this._loadButton.setAttribute("disabled","")}),this._game.onStop(()=>{this._stopButton.setAttribute("disabled",""),this._startButton.removeAttribute("disabled"),this._saveGameController.doesSaveExist()&&this._loadButton.removeAttribute("disabled"),this._game.state===t.Completed&&this._messagesView.showMessage("The game is completed!")}),this._startButton.onclick=()=>{this._game.run()},this._stopButton.onclick=()=>{this._game.stop()},this._saveButton.onclick=()=>{this._saveGameController.save()},this._loadButton.onclick=()=>{this._saveGameController.load()},this._saveGameController.doesSaveExist()&&(this._loadButton.removeAttribute("disabled"),this._messagesView.showMessage("You have a saved game"))}}class u extends n{}class m{constructor(t,e){this._container=a(),this._width=BigInt(t),this._height=BigInt(e),this._minX=this._height-1n,this._maxX=0n,this._minY=this._width-1n,this._maxY=0n,this._changeListeners=[]}get width(){return this._width}get height(){return this._height}get populatedRect(){return{left:this._minX,right:this._maxX,top:this._minY,bottom:this._maxY}}get container(){return this._container}isAlive(t,e,i){let s=l(t,this._width),n=l(e,this._height);void 0!==i&&this._setStatusToContainer(s,n,i);let a=s.toString(),o=n.toString();return!!this._container[a]?.[o]}addChangeListener(t){-1===this._changeListeners.indexOf(t)&&this._changeListeners.push(t)}serialize(){let t=[this._width,this._height,this._minX,this._maxX,this._minY,this._maxY],e=[];for(let[t,i]of Object.entries(this._container))e.push(`${t}:${Object.keys(i).join(",")}`);return t.push(e.join("|")),t.join(";")}loadSerializedState(t){let e=t.split(";");if(e.length<7)throw new u("Invalid save data length");this._width=BigInt(e[0]),this._height=BigInt(e[1]),this._minX=BigInt(e[2]),this._maxX=BigInt(e[3]),this._minY=BigInt(e[4]),this._maxY=BigInt(e[5]);let i=a();for(let t of e[6].split("|")){let[e,s]=t.split(":");for(let t of(i[e]=a(),s.split(",")))i[e][t]=!0}this._container=i,this._changeListeners.forEach(o)}_setStatusToContainer(t,e,i){if(t>=this._width||t<0n||e>=this._height||e<0n)return;let s=t.toString(),n=e.toString();i?(this._container[s]??=a(),this._container[s][n]=!0):!i&&this._container[s]&&(delete this._container[s][n],0===Object.keys(this._container[s]).length&&delete this._container[s]),i&&(t-m.POPULATED_DELTA<this._minX&&(this._minX=t-m.POPULATED_DELTA,this._minX<0n&&(this._minX=0n)),t+m.POPULATED_DELTA>this._maxX&&(this._maxX=t+m.POPULATED_DELTA,this._maxX>=this._width&&(this._maxX=this._width-1n)),e-m.POPULATED_DELTA<this._minY&&(this._minY=e-m.POPULATED_DELTA,this._minY<0n&&(this._minY=0n)),e+m.POPULATED_DELTA>=this._maxY&&(this._maxY=e+m.POPULATED_DELTA,this._maxY>=this._height&&(this._maxY=this._height-1n)))}}m.POPULATED_DELTA=30n;class p extends n{}const g=r(p);(s=e||(e={})).Initial="Initial",s.Rendered="Rendered",s.Input="Input",s.Life="Life";class f{constructor(t){this._state=e.Initial,this._cellsByHorizontal=0,this._cellsByVertical=0,this._cellsHorizontalOffset=0n,this._cellsVerticalOffset=0n,this._curFrameRequest=null,this.render=()=>{this._ctx.clearRect(0,0,this._canvasWidth,this._canvasHeight);let t=this._cellsVerticalOffset,i=t+BigInt(this._cellsByVertical);for(;t<i;++t){let e=this._cellsHorizontalOffset,i=e+BigInt(this._cellsByHorizontal);for(;e<i;++e)this._setCellState(t,e,this._lifeMap.isAlive(t,e))}this._state!==e.Input&&(this._state=e.Rendered)},this.renderWhenFrame=()=>{this._curFrameRequest&&(cancelAnimationFrame(this._curFrameRequest),console.warn("Skip render frame")),this._curFrameRequest=requestAnimationFrame(()=>{this._curFrameRequest=null,this.render()})},this.beginInput=()=>{if(this._state!==e.Rendered)throw Error("Input is not available");this._state=e.Input,this._canvas.addEventListener("click",this._inputListener)},this.endInput=()=>{if(this._state!==e.Input)throw new p("Input is not available");this._state=e.Rendered,this._canvas.removeEventListener("click",this._inputListener)},this._inputListener=t=>{if(this._state!==e.Input)throw new p("The map not into INPUT state");let i=this._getCellByClientCoordinates(t.clientX,t.clientY);this._toggleCellState(i.top,i.left)},this._lifeMap=t,this._canvas=document.getElementById("map")??g("Canvas not found"),this._canvasRect=this._canvas.getBoundingClientRect(),this._canvasWidth=this._canvas.clientWidth,this._canvasHeight=this._canvas.clientHeight,this._ctx=this._canvas.getContext("2d")??g("Failed to create context"),this._ctx.fillStyle="#708090",this._ctx.strokeStyle="#e6e6fa",this._initMapData(),this._lifeMap.addChangeListener(()=>{this._initMapData(),this.render()})}_initMapData(){if(this._cellsByHorizontal=Math.floor(this._canvasWidth/f.CELL_WIDTH),this._cellsByHorizontal>this._lifeMap.width)throw new p("Map width is too low");if(this._cellsByVertical=Math.floor(this._canvasHeight/f.CELL_HEIGHT),this._cellsByVertical>this._lifeMap.height)throw new p("Map height is too low");this._cellsHorizontalOffset=(this._lifeMap.width-BigInt(this._cellsByHorizontal))/2n,this._cellsVerticalOffset=(this._lifeMap.height-BigInt(this._cellsByVertical))/2n}_getCellByClientCoordinates(t,e){let i=BigInt(Math.trunc((e-this._canvasRect.top)/f.CELL_HEIGHT)),s=BigInt(Math.trunc((t-this._canvasRect.left)/f.CELL_WIDTH));return{top:this._cellsVerticalOffset+i,left:this._cellsHorizontalOffset+s}}_toggleCellState(t,e){let i=!this._lifeMap.isAlive(t,e);this._setCellState(t,e,i)}_setCellState(t,e,i){this._lifeMap.isAlive(t,e,i);let s=Number(e-this._cellsHorizontalOffset)*f.CELL_WIDTH,n=Number(t-this._cellsVerticalOffset)*f.CELL_HEIGHT;i?this._ctx.fillRect(s,n,f.CELL_WIDTH,f.CELL_HEIGHT):(this._ctx.clearRect(s,n,f.CELL_WIDTH,f.CELL_HEIGHT),this._ctx.strokeRect(s,n,f.CELL_WIDTH,f.CELL_HEIGHT))}}f.CELL_WIDTH=10,f.CELL_HEIGHT=10;class E{constructor(){this._container=document.createElement("div"),this._container.className="messages-container",document.body.appendChild(this._container)}showMessage(t,e){e=e??"info";let i=document.createElement("div"),s=document.createElement("span");i.classList.add("message"),i.classList.add(e),i.innerHTML=t,s.className="close",s.innerHTML="&times;",i.appendChild(s),this._container.appendChild(i);let n=()=>{this._container.removeChild(i),s.onclick=null},a=setTimeout(n,E.LIFE_TIME);s.onclick=function(){return clearTimeout(a),n(),!1}}showError(t){this.showMessage(t,"error")}bindToErrors(){window.addEventListener("error",t=>{this.showError(`An error has occurred: ${t.error}`)}),window.addEventListener("unhandledrejection",t=>{this.showError(`An error has occurred: ${t.reason}`)})}}E.LIFE_TIME=1e4;class L{constructor(t){this._lifeMap=t}save(){window.localStorage.save=this._lifeMap.serialize()}load(){if(this.doesSaveExist()){let t=window.localStorage.save;this._lifeMap.loadSerializedState(t)}}doesSaveExist(){return!!window.localStorage.save}}!function(t){function e(){h(t),document.removeEventListener("DOMContentLoaded",e),window.removeEventListener("load",e)}if("interactive"===document.readyState||"complete"===document.readyState)return e();document.addEventListener("DOMContentLoaded",e),window.addEventListener("load",e)}(function(){let t=new E;t.bindToErrors();let e=new m(1024n,1024n),i=new f(e),s=new _(e),n=new d(s,new L(e),t);s.onStart(i.endInput),s.onStop(i.beginInput),s.onRound(i.renderWhenFrame),i.render(),i.beginInput(),n.init(),console.log("Game is ready!")});
//# sourceMappingURL=index.8022ca1a.js.map