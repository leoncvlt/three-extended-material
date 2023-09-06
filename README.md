# three-extended-material

Easily extend native three.js materials with modular and composable shader units and effects, available as a vanilla or React component.

![image](https://user-images.githubusercontent.com/4929974/151654060-d44e7859-f966-4b0e-834e-0f7b13b60e21.png)

## Usage
```
npm install three-extended-material
```

Then, create your extended material:
```js
import { ExtendedMaterial } from "three-extended-material"

const material = new ExtendedMaterial(

    superMaterial,  // the threejs material class to extend

    extensions,     // the extension (or an array of extensions) 
                    // object to extend the material with

    parameters,     // the properties to pass the material 
                    // (can be either properties from the original material, 
                    // or uniforms from the extensions)

    options         // additional options (explained later)
)
```

An extension is a simple object with the following signature:
```js
const extension = {

  name: "",         // string defining the name of the extension
                    // used to generate a unique shader program code

  uniforms: {},     // uniforms to pass to the materials, in a { uniform: value } format.
                    // note that uniforms are not automatically prepended to the shader code.
                    // be careful about not repeating uniform names when chaining extensions

  defines: {},      // defines to pass to the materials, in a { define: 1 or 0 } format.

  vertexShader: (shader, type) => shader,    // a function which takes the original vertex
                                            // shader code, and returns the modified cone

  fragmentShader: (shader, type) => shader,   // a function which takes the original fragment
                                              // shader code, and returns the modified cone
};
```
The name of each extension is hashed alongside the name of the original material in order to generate a unique [shader program cache key](https://threejs.org/docs/?q=materi#api/en/materials/Material.customProgramCacheKey) for that combination.

The `ExtendedMaterial` will provide property accessors to all uniforms, so you can use `extension.myUniform` to set or get the value. This means that when using multiple extension, each uniform name should be unique.

The `vertexShader` and `fragmentShader` functions provide you with the original material shaders code, and should return the modified shader code to replace the original shaders code with. A common pattern is to prepend the uniforms definition to the code, and then run a string replace function to add extra shader code in specific places. The second argument `type` will be the type of the shader, and can be useful to support multiple SuperMaterials at once, by monkey-patch specific bits of thhe shader if the `type` is of `MeshBasicMaterial`, some other for `MeshPhysicalMaterial`, and so on.

Note that when chaining multiple extensions, the shader code is modified for each extension, and passed to the next one - so be careful about not removing pieces of shader which might be queried by later extensions.

You can also pass an options object with any of the following parameters to the ExtendedMaterial constructor as the last argument:
```js
{
  debug: false,           // if true, prints the material's shader code after being patched
  programCacheKey: null   // if not null, sets the customProgramCacheKey 
                          // for the material to this value instead of hashing it.
}
```

three.js materials' shaders are pretty opinionated - a good starting point would be to use the `debug` option to print the original shader code, then exploring the [ShaderChunks definitions on GitHub](https://github.com/mrdoob/three.js/tree/master/src/renderers/shaders/ShaderChunk) to figure out a good injection point for your logic.

## Example
Here's a basic setup where we extend the `MeshStandardMaterial` with an extension which overlays a screen-space checkerboard:

```js
const checkerBoardExtension = {
  name: "checkerboard",
  uniforms: {
    checkersSize: 5.0,
  },
  // no defines or vertex shader modifications needed
  // in this extension, so we can leave them out
  fragmentShader: (shader, type) => {
    shader = `
      uniform float checkersSize;
      ${shader.replace(
        "#include <opaque_fragment>",
        // here we inject the checkerboard logic right before the <opaque_fragment>,
        // where gl_FragColor is set according to the lighting calculation
        // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/output_fragment.glsl.js
        `
        vec2 pos = floor(gl_FragCoord.xy / checkersSize);
        float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
  
        outgoingLight = outgoingLight * pattern;
        #include <opaque_fragment>
        `
      )}
    `;
    return shader;
  },
};

const material = new ExtendedMaterial(MeshStandardMaterial, [checkerBoardExtension], {
  color: 0x00aaff,
  checkersSize: 8.0, // we can pass different values than the default one...
});

const box = new Mesh(new BoxGeometry(), material);
box.material.checkersSize: 10.0; //... or use the property accessor to set / get its value
```

## React

`ExtendedMaterial` is also exported as a `react-three-fiber`-friendly component to be used in `React` projects:

```jsx
import { ExtendedMaterial } from "three-extended-material/react"
import { MeshStandardMaterial } from 'three';

function Box() {
  return (
    <mesh
      <boxGeometry args={[1, 1, 1]} />
      <ExtendedMaterial 
        superMaterial={MeshStandardMaterial} 
        extensions={[Checkerboard]} 
        color={0x00aaff}
        checkersSize={checkersSize}
      /> 
    </mesh>
  )
}
```
In this case, just pass the ExtendedMaterial's parameters to as props to the component, in the classic react declarative style. Its properties will be updated reactively, and the Material will be re-created only if the `superMaterial` or its `extensions` changes.

## Demos

- [three-extended-material/simple](https://leoncvlt.github.io/three-extended-material/simple/) - A demo of the checkerboard setup illustrated above
- [three-extended-material/complex](https://leoncvlt.github.io/three-extended-material/complex/) - A more complex example with multiple toggleable extensions, editing properties in real-time and some interesting effects.
- [three-extended-material/react](https://leoncvlt.github.io/three-extended-material/react/) - A demo of the checkerboard setup using `react-three-fiber`

## Support [![Buy me a coffee](https://img.shields.io/badge/-buy%20me%20a%20coffee-lightgrey?style=flat&logo=buy-me-a-coffee&color=FF813F&logoColor=white "Buy me a coffee")](https://www.buymeacoffee.com/leoncvlt)
If this tool has proven useful to you, consider [buying me a coffee](https://www.buymeacoffee.com/leoncvlt) to support development of this and [many other projects](https://github.com/leoncvlt?tab=repositories).
