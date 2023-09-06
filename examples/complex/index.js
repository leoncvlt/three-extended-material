import "../styles.css";
import {
  Clock,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RGBADepthPacking,
  Scene,
  TorusKnotGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { ExtendedMaterial } from "../../src/ExtendedMaterial";
import { DitheredOpacity, RimGlow, Noise } from "../extensions";

const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const scene = new Scene();
const camera = new PerspectiveCamera();
camera.position.z = 8;
const clock = new Clock();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// structures outlining the currently active extensions and their properties value
// these will be controlled by lil-gui
const extensions = {
  dither: true,
  glow: true,
  noise: true,
};
const props = {
  dither: {
    opacity: 0.5,
  },
  glow: {
    glowIntensity: 1.0,
    glowColor: { r: 0, g: 1, b: 0.6 },
    glowPower: 1.0,
  },
  noise: {},
};
const meta = {
  glowPower: { min: 0, max: 5 },
};

// rebuilds the ExtendedMaterial based on the active extensions
const rebuildMaterial = () => {
  const extensionObjects = {
    dither: DitheredOpacity,
    glow: RimGlow,
    noise: Noise,
  };

  const _extensions = Object.keys(extensions)
    .filter((e) => !!extensions[e])
    .map((e) => extensionObjects[e]);
  const _props = Object.values(props).reduce((accumulator, extensionProps) => ({
    ...accumulator,
    ...extensionProps,
  }));

  const material = new ExtendedMaterial(MeshStandardMaterial, _extensions, _props);
  return material;
};

// builds an extended MeshDepth material if the noise extension is active
// by passing the same vertex shader code, in order to have accurate shadows
const rebuildMeshDepthMaterial = () => {
  const depthMaterialProps = {
    depthPacking: RGBADepthPacking,
    alphaTest: 0.5,
  };
  const basicDepthMaterial = new MeshDepthMaterial(depthMaterialProps);
  const customDepthMaterial = new ExtendedMaterial(MeshDepthMaterial, [Noise], depthMaterialProps);
  return extensions.noise ? customDepthMaterial : basicDepthMaterial;
};

const torus = new Mesh(new TorusKnotGeometry(1, 0.4, 128, 32), rebuildMaterial());
torus.customDepthMaterial = rebuildMeshDepthMaterial();
torus.castShadow = true;
scene.add(torus);

const light = new HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(light);

const dir = new DirectionalLight(0xffffff, 0.5);
dir.castShadow = true;
dir.position.set(0, 10, 0);
scene.add(dir);

const floor = new Mesh(new PlaneGeometry(32, 32), new MeshStandardMaterial());
floor.receiveShadow = true;
floor.rotation.set(-Math.PI / 2, 0, 0);
floor.position.set(0, -3, 0);
scene.add(floor);

scene.fog = new Fog(new Color(0x000000), 10, 20);

// sets up a lil-gui panel to toggle extensions, rebuilding materials as needed
// and sliders / pickers to control the extensions' parameters and set
// the appropriate values on the material
const gui = new GUI();
Object.keys(extensions).forEach((extension) => {
  const folder = gui.addFolder(`${extension} extension`);
  folder
    .add(extensions, extension)
    .name("enabled")
    .onChange((v) => {
      torus.material.dispose();
      torus.customDepthMaterial.dispose();
      torus.material = rebuildMaterial();
      torus.customDepthMaterial = rebuildMeshDepthMaterial();
      if (v) {
        Object.entries(props[extension]).forEach(([prop, value]) => {
          torus.material[prop] = value;
        });
      }
    });
  Object.entries(props[extension]).forEach(([prop, value]) => {
    const handle =
      typeof value === "object"
        ? folder.addColor(props[extension], prop)
        : folder.add(props[extension], prop, meta[prop]?.min || 0, meta[prop]?.max || 1);
    handle.onChange((v) => {
      torus.material[prop] = v;
    });
  });
});

const render = () => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  torus.rotation.set(elapsed / 2, elapsed / 2, elapsed / 2);

  // if the noise extension is active, set the appropriate properties to the elapsed time
  if (extensions.noise) {
    torus.material.noiseTime = elapsed;
    torus.customDepthMaterial.noiseTime = elapsed;
  }

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();
