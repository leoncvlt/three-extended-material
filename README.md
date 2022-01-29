# three-extended-material

Easily extend native three.js materials with modular and composable shader units and effects.

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

  vertexShader: (shader) => shader,     // a function which takes the original vertex
                                        // shader code, and returns the modified cone

  fragmentShader: (shader) => shader,   // a function which takes the original fragment
                                        // shader code, and returns the modified cone
};
```
The name of each extension is hashed alongside the name of the original material in order to generate a unique [shader program cache key](https://threejs.org/docs/?q=materi#api/en/materials/Material.customProgramCacheKey) for that combination.

The `ExtendedMaterial` will provide property accessors to all uniforms, so you can use `extension.myUniform` to set or get the value. This means that when using multiple extension, each uniform name should be unique.

The `vertexShader` and `fragmentShader` functions provide you with the original material shaders code, and should return the modified shader code to replace the original shaders code with. A common pattern is to prepend the uniforms definition to the code, and then run a string replace function to add extra shader code in specific places.

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
  fragmentShader: (shader) => {
    shader = `
      uniform float checkersSize;
      ${shader.replace(
        "#include <output_fragment>",
        // here we inject the checkerboard logic right before the <output_fragment>,
        // where gl_FragColor is set according to the lighting calculation
        // https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/output_fragment.glsl.js
        `
        vec2 pos = floor(gl_FragCoord.xy / checkersSize);
        float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
  
        outgoingLight = outgoingLight * pattern;
        #include <output_fragment>
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

## Demos

- [three-extended-material/simple](https://leoncvlt.github.io/three-extended-material/simple/) - A demo of the checkerboard setup illustrated above
- [three-extended-material/complex](https://leoncvlt.github.io/three-extended-material/complex/) - A more complex example with multiple toggleable extensions, editing properties in real-time and some interesting effects.
