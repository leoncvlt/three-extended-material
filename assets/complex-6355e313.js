import{E as u,R as P}from"./RimGlow-87c32f64.js";import{W as S,S as T,P as _,M as w,T as A,H as R,D as j,b as L,a as g,F as N,c as O,d as p,C as I,R as G}from"./three-bc13f03e.js";import{O as k}from"./OrbitControls-a9a53808.js";import{g as F}from"./lil-gui.module.min-a1e98589.js";const H={name:"dithered-opacity",defines:{ENABLE_DITHER_TRANSPARENCY:1},fragmentShader:e=>(e=`
      float bayerDither2x2( vec2 v ) {
        return mod( 3.0 * v.y + 2.0 * v.x, 4.0 );
      }
      float bayerDither4x4( vec2 v ) {
        vec2 P1 = mod( v, 2.0 );
        vec2 P2 = mod( floor( 0.5  * v ), 2.0 );
        return 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 );
      }
      ${e.replace("void main() {",`
        void main() {
          #if ENABLE_DITHER_TRANSPARENCY
          if( ( bayerDither4x4( floor( mod( gl_FragCoord.xy, 4.0 ) ) ) ) / 16.0 >= opacity ) discard;
          #endif
        `)}
    `,e)},b={name:"noise",uniforms:{noiseTime:0},vertexShader:e=>(e=`
      uniform float noiseTime;

      //
      // Description : Array and textureless GLSL 2D/3D/4D simplex
      //               noise functions.
      //      Author : Ian McEwan, Ashima Arts.
      //  Maintainer : ijm
      //     Lastmod : 20110822 (ijm)
      //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
      //               Distributed under the MIT License. See LICENSE file.
      //               https://github.com/ashima/webgl-noise
      //

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
      }

      vec4 taylorInvSqrt(vec4 r)
      {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise(vec3 v)
        {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

      // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        //   x0 = x0 - 0.0 + 0.0 * C.xxx;
        //   x1 = x0 - i1  + 1.0 * C.xxx;
        //   x2 = x0 - i2  + 2.0 * C.xxx;
        //   x3 = x0 - 1.0 + 3.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

      // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      // Gradients: 7x7 points over a square, mapped onto an octahedron.
      // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

      // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                      dot(p2,x2), dot(p3,x3) ) );
        }

      ${e.replace("#include <begin_vertex>",`
        #include <begin_vertex>
        float noise = snoise(transformed + noiseTime) * 0.1;
        transformed += normal * noise;
        `)}
    `,e)},r=new S({canvas:document.querySelector("canvas"),antialias:!0});r.setPixelRatio(window.devicePixelRatio);r.shadowMap.enabled=!0;const s=new T,d=new _;d.position.z=8;const y=new I,z=new k(d,r.domElement);z.enableDamping=!0;const a={dither:!0,glow:!0,noise:!0},x={dither:{opacity:.5},glow:{glowIntensity:1,glowColor:{r:0,g:1,b:.6},glowPower:1},noise:{}},f={glowPower:{min:0,max:5}},D=()=>{const e={dither:H,glow:P,noise:b},n=Object.keys(a).filter(o=>!!a[o]).map(o=>e[o]),t=Object.values(x).reduce((o,l)=>({...o,...l}));return new u(g,n,t)},C=()=>{const e={depthPacking:G,alphaTest:.5},n=new p(e),t=new u(p,[b],e);return a.noise?t:n},i=new w(new A(1,.4,128,32),D());i.customDepthMaterial=C();i.castShadow=!0;s.add(i);const q=new R(16777147,526368,.5);s.add(q);const v=new j(16777215,.5);v.castShadow=!0;v.position.set(0,10,0);s.add(v);const m=new w(new L(32,32),new g);m.receiveShadow=!0;m.rotation.set(-Math.PI/2,0,0);m.position.set(0,-3,0);s.add(m);s.fog=new N(new O(0),10,20);const W=new F;Object.keys(a).forEach(e=>{const n=W.addFolder(`${e} extension`);n.add(a,e).name("enabled").onChange(t=>{i.material.dispose(),i.customDepthMaterial.dispose(),i.material=D(),i.customDepthMaterial=C(),t&&Object.entries(x[e]).forEach(([c,o])=>{i.material[c]=o})}),Object.entries(x[e]).forEach(([t,c])=>{var l,h;(typeof c=="object"?n.addColor(x[e],t):n.add(x[e],t,((l=f[t])==null?void 0:l.min)||0,((h=f[t])==null?void 0:h.max)||1)).onChange(E=>{i.material[t]=E})})});const M=()=>{const e=r.domElement,n=e.clientWidth,t=e.clientHeight;(e.width!==n||e.height!==t)&&(r.setSize(n,t,!1),d.aspect=e.clientWidth/e.clientHeight,d.updateProjectionMatrix()),y.getDelta();const o=y.getElapsedTime();i.rotation.set(o/2,o/2,o/2),a.noise&&(i.material.noiseTime=o,i.customDepthMaterial.noiseTime=o),z.update(),r.render(s,d),requestAnimationFrame(M)};M();
