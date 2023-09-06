import{c as u}from"./three-bc13f03e.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const e of a.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&s(e)}).observe(document,{childList:!0,subtree:!0});function l(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(t){if(t.ep)return;t.ep=!0;const a=l(t);fetch(t.href,a)}})();const d={name:"",uniforms:{},defines:{},vertexShader:r=>r,fragmentShader:r=>r};function h(r,n=[],l={},s={debug:!1,programCacheKey:null}){if(!new.target)throw"Uncaught TypeError: Class constructor ExtendedMaterial cannot be invoked without 'new'";class t extends r{constructor(e={}){super(),Array.isArray(n)||(n=[n]),n=n.map(i=>({...d,...i})),this.uniforms={},this._id=r.name+"_"+n.map(i=>i.name).join("_"),this._cacheKey=0;for(let i=0;i<this._id.length;i++)this._cacheKey=Math.imul(31,this._cacheKey)+this._id.charCodeAt(i)|0;n.forEach(i=>{Object.entries(i.uniforms).forEach(([o,f])=>{o in this.uniforms&&console.warn(`ExtendedMaterial: duplicated '${o}' uniform - shader compilation might fail.To fix this, rename the ${o} uniform in the ${i.name} extension.`),this.uniforms[o]={value:e[o]||f},o in this?console.warn(`ExtendedMaterial: the material already contains a '${o}' property - getters and setters will not be set.To fix this, rename the ${o} uniform in the ${i.name} extension.`):Object.defineProperty(this,o,{get(){var c;return(c=this.uniforms[o])==null?void 0:c.value},set(c){this.uniforms&&(this.uniforms[o].value=c)}})})}),this.setValues(e)}onBeforeCompile(e){n.forEach(i=>{Object.keys(i.uniforms).forEach(o=>{e.uniforms[o]=this.uniforms[o]}),Object.entries(i.defines).forEach(([o,f])=>{e.defines||(e.defines={}),e.defines[o]=f}),e.vertexShader=i.vertexShader(e.vertexShader,e.shaderType),e.fragmentShader=i.fragmentShader(e.fragmentShader,e.shaderType)}),s.debug&&console.debug(this._id,e),this.uniforms=e.uniforms,this.needsUpdate=!0}customProgramCacheKey(){return s.programCacheKey||this._cacheKey||0}}return new t(l)}const g={name:"rim-glow",uniforms:{glowIntensity:1,glowColor:new u("white"),glowPower:1},vertexShader:r=>(r.includes("vViewPosition")||(r=`
        varying vec3 vViewPosition;
        ${r.replace("#include <project_vertex>",`
          #include <project_vertex>
          vViewPosition = - mvPosition.xyz;
          `)}
      `),r),fragmentShader:r=>(r=`
      uniform float glowIntensity;
      uniform vec3 glowColor;
      uniform float glowPower;
      ${r.replace("#include <opaque_fragment>",`
        float rim = smoothstep(0.0, 1.0, pow(1.0 - dot(normal, normalize(vViewPosition)), glowPower));
  
        outgoingLight = outgoingLight + (rim * glowIntensity) * glowColor;
        #include <opaque_fragment>
        `)}
    `,r)};export{h as E,g as R};
