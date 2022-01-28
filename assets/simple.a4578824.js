import{O as m,E as h}from"./ExtendedMaterial.f8a02f57.js";import{W as g,S as u,P as f,C as p,M as w,a as x,B as S,H as b}from"./three.45ac66c1.js";const t=new g({canvas:document.querySelector("canvas"),antialias:!0});t.setPixelRatio(window.devicePixelRatio);t.shadowMap.enabled=!0;const o=new u,n=new f;n.position.z=3;const i=new p,c=new m(n,t.domElement);c.enableDamping=!0;const k={name:"checkerboard",uniforms:{checkersSize:5},fragmentShader:e=>(e=`
      uniform float checkersSize;
      ${e.replace("#include <output_fragment>",`
        vec2 pos = floor(gl_FragCoord.xy / checkersSize);
        float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
  
        outgoingLight = outgoingLight * pattern;
        #include <output_fragment>
        `)}
    `,e)},z=new h(w,[k],{color:43775,checkersSize:10},{debug:!0}),d=new x(new S,z);o.add(d);const M=new b(16777147,526368,1);o.add(M);const l=()=>{const e=t.domElement,r=e.clientWidth,s=e.clientHeight;(e.width!==r||e.height!==s)&&(t.setSize(r,s,!1),n.aspect=e.clientWidth/e.clientHeight,n.updateProjectionMatrix()),i.getDelta();const a=i.getElapsedTime();d.rotation.set(a/2,a/2,a/2),c.update(),t.render(o,n),requestAnimationFrame(l)};l();
