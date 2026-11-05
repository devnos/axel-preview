var e=2300,t=e=>(e=Math.min(1,Math.max(0,e)),e*e*(3-2*e)),n=`M4 26 13.4 5.5c.9-2 3.7-2 4.6 0L28 26l-9.6-4.8a5.3 5.3 0 0 0-4.8 0L4 26Z`;function r(e,t){let r=Math.min(e*.62,720),i=document.createElement(`canvas`).getContext(`2d`),a=(e,t)=>[...`AXEL`].reduce((n,r,i)=>n+e.measureText(r).width+(i<3?.09*t:0),0);i.font=`800 100px Manrope, Arial, sans-serif`;let o=210+a(i,100),s=Math.round(100*r/o),c=1.55*s,l=.55*s,u=document.createElement(`canvas`),d=u.getContext(`2d`,{willReadFrequently:!0});d.font=`800 ${s}px Manrope, Arial, sans-serif`;let f=Math.ceil(c+l+a(d,s))+8,p=Math.ceil(c)+8;u.width=f,u.height=p,d.font=`800 ${s}px Manrope, Arial, sans-serif`,d.fillStyle=d.strokeStyle=`#fff`,d.save(),d.translate(4,4),d.scale(c/32,c/32),d.lineWidth=3,d.lineJoin=d.lineCap=`round`,d.stroke(new Path2D(n)),d.restore(),d.textBaseline=`middle`;let m=4+c+l;for(let e of`AXEL`)d.fillText(e,m,4+c/2+s*.04),m+=d.measureText(e).width+.09*s;let h=d.getImageData(0,0,f,p).data,g=Math.max(2,Math.round(r/260)),_=[],v=(e-f)/2,y=(t-p)/2;for(let e=0;e<p;e+=g)for(let t=0;t<f;t+=g)h[(e*f+t)*4+3]>140&&_.push(v+t+(Math.random()-.5)*g*.5,y+e+(Math.random()-.5)*g*.5);return _}function i(e,t,n){let r=e.createProgram();for(let[i,a]of[[e.VERTEX_SHADER,t],[e.FRAGMENT_SHADER,n]]){let t=e.createShader(i);if(e.shaderSource(t,a),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))return null;e.attachShader(r,t),e.deleteShader(t)}return e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS)?r:null}function a(n,a){let o=document.documentElement,s=()=>{o.classList.remove(`is-preloading`),o.classList.contains(`pre-in`)||(o.classList.add(`pre-in`),setTimeout(()=>o.classList.remove(`pre-in`),700)),window.__lenis?.start(),window.dispatchEvent(new Event(`axel:preloaded`))};if(!o.classList.contains(`is-preloading`)){a();return}let c=window.__axelPreAt??0,l=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;if(!n||l||document.hidden||performance.now()-c>1300){s(),a();return}let{gl:u}=n,d=i(u,`
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`,`
  precision mediump float;
  uniform vec4 u_col;
  void main() { gl_FragColor = u_col; }
`),f=i(u,`
  attribute vec2 a_home;
  attribute vec2 a_target;
  attribute float a_seed;
  uniform float u_t;
  uniform vec2 u_view;
  uniform float u_yoff;
  uniform float u_glow;
  varying float v_alpha;
  varying float v_r;
  varying float v_halo;
  varying vec3 v_col;
  varying float v_amp;
  float eio(float x) { x = clamp(x, 0.0, 1.0); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
  float eo(float x) { x = clamp(x, 0.0, 1.0); return 1.0 - pow(1.0 - x, 3.0); }
  void main() {
    float g = eio((u_t - 100.0 - a_seed * 250.0) / 750.0);
    float o = eo((u_t - 1450.0 - a_seed * 200.0) / 600.0);
    vec2 d = a_target - a_home;
    vec2 n = vec2(-d.y, d.x) / max(length(d), 1.0);
    float arc = (a_seed - 0.5) * 0.35 * length(d);
    vec2 p = mix(a_home, a_target, g) + n * arc * sin(g * 3.14159);
    p = mix(p, a_home, o) - n * arc * 0.6 * sin(o * 3.14159);
    float halo = 2.0 + 7.0 * u_glow * (1.0 - o);
    v_r = mix(1.1, 1.45, g) * (1.0 - 0.35 * o);
    v_halo = halo;
    v_amp = 0.05 + 0.13 * u_glow;
    float size = 2.0 * (v_r + halo);
    v_alpha = smoothstep(0.0, 260.0, u_t - a_seed * 120.0) * (1.0 - o * o);
    v_col = mix(vec3(0.8, 0.07, 0.07), vec3(1.0, 0.25, 0.2), clamp(0.35 * a_seed + 0.65 * u_glow * g, 0.0, 1.0));
    gl_PointSize = size;
    vec2 c = vec2(p.x, p.y + u_yoff);
    gl_Position = vec4(c.x / u_view.x * 2.0 - 1.0, 1.0 - c.y / u_view.y * 2.0, 0.0, 1.0);
  }
`,`
  precision mediump float;
  varying float v_alpha;
  varying float v_r;
  varying float v_halo;
  varying vec3 v_col;
  varying float v_amp;
  void main() {
    float s = 2.0 * (v_r + v_halo);
    float d = length(gl_PointCoord - 0.5) * s;
    float core = 1.0 - smoothstep(v_r - 0.5, v_r + 0.5, d);
    float sig = v_halo * 0.42;
    float halo = exp(-d * d / (2.0 * sig * sig)) * v_amp;
    gl_FragColor = vec4(v_col * (core + halo) * v_alpha, 1.0);
  }
`);if(!d||!f){s(),a();return}window.__lenis?.stop();let p=new Set([` `,`PageDown`,`PageUp`,`Home`,`End`,`ArrowDown`,`ArrowUp`]),m=e=>{p.has(e.key)&&!e.target.closest?.(`input, textarea, [contenteditable]`)&&e.preventDefault()};window.addEventListener(`keydown`,m);let h=[7/255,8/255,11/255],g=u.getUniformLocation(d,`u_col`),_=u.getAttribLocation(d,`a_position`),v=e=>u.getUniformLocation(f,e),y=v(`u_t`),b=v(`u_view`),x=v(`u_yoff`),S=v(`u_glow`),C=u.getAttribLocation(f,`a_home`),w=u.getAttribLocation(f,`a_target`),T=u.getAttribLocation(f,`a_seed`),E=null,D=0,O=0,k=-1,A=-1,j=!1,M=1;function N(){let e=window.innerWidth,t=window.innerHeight,{pageW:i,pageH:a}=n.band(),o=r(Math.min(e,i),t);D=o.length/2;let s=new Float32Array(D*5),c=window.scrollY;for(let e=0;e<D;e++){let n=Math.floor(Math.random()*i/6)*6+3,r=Math.floor((a-c-Math.random()*t)/6)*6+3;s.set([n,a-r-c,o[2*e],o[2*e+1],Math.random()],e*5)}E=u.createBuffer(),u.bindBuffer(u.ARRAY_BUFFER,E),u.bufferData(u.ARRAY_BUFFER,s,u.STATIC_DRAW)}function P(e,r){n.drawField(A<0?0:e-A);let i=t((r-1500)/700);if(u.enable(u.BLEND),u.useProgram(d),u.bindBuffer(u.ARRAY_BUFFER,n.quad),u.enableVertexAttribArray(_),u.vertexAttribPointer(_,2,u.FLOAT,!1,0,0),u.blendFunc(u.SRC_ALPHA,u.ONE_MINUS_SRC_ALPHA),u.uniform4f(g,h[0],h[1],h[2],1-.08*i),u.drawArrays(u.TRIANGLE_STRIP,0,4),E&&r<2300){let{bandTop:e,bandH:i,pageW:a}=n.band();u.useProgram(f),u.blendFunc(u.ONE,u.ONE),u.bindBuffer(u.ARRAY_BUFFER,E),u.enableVertexAttribArray(C),u.vertexAttribPointer(C,2,u.FLOAT,!1,20,0),u.enableVertexAttribArray(w),u.vertexAttribPointer(w,2,u.FLOAT,!1,20,8),u.enableVertexAttribArray(T),u.vertexAttribPointer(T,1,u.FLOAT,!1,20,16),u.uniform1f(y,r),u.uniform2f(b,a,i),u.uniform1f(x,window.scrollY-e),u.uniform1f(S,t((r-1e3)/250)*(1-t((r-1450)/400))),u.drawArrays(u.POINTS,0,D),u.disableVertexAttribArray(C),u.disableVertexAttribArray(w),u.disableVertexAttribArray(T)}u.disable(u.BLEND),n.bind()}function F(){j||(j=!0,cancelAnimationFrame(O),window.removeEventListener(`keydown`,m),document.removeEventListener(`visibilitychange`,F),E&&u.deleteBuffer(E),u.deleteProgram(d),u.deleteProgram(f),n.bind(),n.drawField(0),s(),a())}function I(e){if(!o.classList.contains(`is-preloading`)){F();return}k<0&&(k=e);let t=(e-k)*M;t>=2300?F():(P(e,t),A=e,O=requestAnimationFrame(I))}document.addEventListener(`visibilitychange`,F);let L=document.fonts?.load?Promise.race([document.fonts.load(`800 100px Manrope`),new Promise(e=>setTimeout(e,250))]):Promise.resolve();P(performance.now(),0),L.catch(()=>{}).then(()=>{if(j)return;let t=2800-(performance.now()-c);t<1500?F():(M=e/Math.min(e,t),N(),O=requestAnimationFrame(I))})}var o=document.querySelector(`.ambient-flow`),s=o?.getContext(`webgl`,{alpha:!1,antialias:!1}),c=!1,l=()=>a(null,()=>{});if(!s)l();else{function e(e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),s.getShaderParameter(n,s.COMPILE_STATUS)?n:(s.deleteShader(n),null)}let t=e(s.VERTEX_SHADER,`
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `),n=e(s.FRAGMENT_SHADER,`
    precision mediump float;
    uniform vec2 u_page;
    uniform vec2 u_offset;
    uniform float u_time;
    uniform mat2 u_rot; // rot(time * 0.1): одинаков для всех пикселей, считается один раз на кадр в JS
    void main() {
      vec2 frag = gl_FragCoord.xy + u_offset;
      vec2 uv = frag / u_page;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_page.x / u_page.y;
      vec2 flow = p;
      float time = u_time * 0.15;
      for (float i = 1.0; i < 4.0; i++) {
        flow *= u_rot;
        flow.x += sin(flow.y * 2.0 * i + time) * 0.5;
        flow.y += cos(flow.x * 1.5 * i - time * 0.8) * 0.5;
      }
      float intensity = sin(flow.x * 2.0 + flow.y * 3.0) * 0.5 + 0.5;
      vec3 fluid = mix(vec3(0.02, 0.0, 0.0), vec3(0.8, 0.07, 0.07), smoothstep(0.2, 0.6, intensity));
      fluid = mix(fluid, vec3(1.0, 0.25, 0.2), smoothstep(0.7, 1.0, intensity));
      vec2 cell = fract(frag / 6.0) - 0.5;
      float radius = intensity * 0.45;
      float dots = 1.0 - smoothstep(radius - 0.1, radius, length(cell));
      gl_FragColor = vec4(fluid * (dots + 0.15), 1.0);
    }
  `);if(t&&n){let e=s.createProgram();if(s.attachShader(e,t),s.attachShader(e,n),s.linkProgram(e),s.getProgramParameter(e,s.LINK_STATUS)){s.useProgram(e);let t=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,t),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,1,1,1,-1,-1,1,-1]),s.STATIC_DRAW);let n=s.getAttribLocation(e,`a_position`);s.enableVertexAttribArray(n),s.vertexAttribPointer(n,2,s.FLOAT,!1,0,0);let r=()=>{s.useProgram(e),s.bindBuffer(s.ARRAY_BUFFER,t),s.enableVertexAttribArray(n),s.vertexAttribPointer(n,2,s.FLOAT,!1,0,0)},i=s.getUniformLocation(e,`u_page`),l=s.getUniformLocation(e,`u_offset`),u=s.getUniformLocation(e,`u_time`),d=s.getUniformLocation(e,`u_rot`),f=new Float32Array(4),p=window.matchMedia(`(prefers-reduced-motion: reduce)`),m=o.offsetParent||document.body,h=window.matchMedia(`(hover: hover) and (pointer: fine)`),g=160,_=0,v=-1,y=0,b=1,x=1,S=1,C=-1,w=1;function T(){let e=Math.max(0,Math.min(x-S,Math.round(window.scrollY-g)));e!==C&&(C=e,o.style.transform=`translate3d(0,${e}px,0)`)}function E(){T(),s.uniform2f(i,b,x),s.uniform2f(l,0,x-C-S);let e=y;s.uniform1f(u,e);let t=Math.fround(Math.fround(Math.fround(e)*.15)*.1),n=Math.cos(t),r=Math.sin(t);f[0]=n,f[1]=-r,f[2]=r,f[3]=n,s.uniformMatrix2fv(d,!1,f),s.drawArrays(s.TRIANGLE_STRIP,0,4)}let D=()=>C>0&&window.scrollY<C+g/2||C+S<x&&window.scrollY+window.innerHeight>C+S-g/2;function O(e){v<0&&(v=e),(e-v>=33||D())&&(y+=Math.min(e-v,50)/1e3,v=e,E()),_=requestAnimationFrame(O)}let k=!1;function A(){p.matches&&!k&&(k=!0,requestAnimationFrame(()=>{k=!1,D()&&E()}))}function j(){c||(cancelAnimationFrame(_),v=-1,p.matches||document.hidden?document.hidden||E():_=requestAnimationFrame(O))}let M=0;function N(){clearTimeout(M),M=setTimeout(P,200)}function P(){let e=Math.max(1,Math.round(m.clientWidth)),t=Math.max(1,Math.round(m.clientHeight));w=Math.max(w,Math.round(window.innerHeight));let n=w;g=h.matches&&!p.matches?160:Math.round(n/2);let r=Math.min(t,n+2*g);(e!==b||t!==x||r!==S)&&(b=e,x=t,S=r,C=-1,o.style.height=`${S}px`,o.width=b,o.height=S,s.viewport(0,0,o.width,o.height),c||E())}new ResizeObserver(N).observe(document.body),window.addEventListener(`resize`,N,{passive:!0}),window.addEventListener(`scroll`,A,{passive:!0}),p.addEventListener(`change`,()=>{j(),N()}),h.addEventListener(`change`,N),document.addEventListener(`visibilitychange`,j),o.width=o.height=0,P(),c=!0,a({gl:s,quad:t,bind:r,band:()=>({bandTop:C,bandH:S,pageW:b,pageH:x}),drawField:e=>{y+=Math.min(e,50)/1e3,E()}},()=>{c=!1,j()})}else l()}else l()}