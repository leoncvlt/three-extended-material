import { Color } from "three";

export const RimGlow = {
  name: "rim-glow",
  uniforms: {
    glowIntensity: 1.0,
    glowColor: new Color("white"),
    glowPower: 1.0,
  },
  vertexShader: (shader) => {
    if (!shader.includes("vViewPosition")) {
      shader = `
        varying vec3 vViewPosition;
        ${shader.replace(
          "#include <project_vertex>",
          /*glsl*/ `
          #include <project_vertex>
          vViewPosition = - mvPosition.xyz;
          `
        )}
      `;
    }
    return shader;
  },
  fragmentShader: (shader) => {
    shader = `
      uniform float glowIntensity;
      uniform vec3 glowColor;
      uniform float glowPower;
      ${shader.replace(
        "#include <output_fragment>",
        /*glsl*/ `
        float rim = smoothstep(0.0, 1.0, pow(1.0 - dot(normal, normalize(vViewPosition)), glowPower));
  
        outgoingLight = outgoingLight + (rim * glowIntensity) * glowColor;
        #include <output_fragment>
        `
      )}
    `;
    return shader;
  },
};
