import {
  BoxGeometry,
  Clock,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ExtendedMaterial } from "../../src/ExtendedMaterial";
import "./styles.css";

const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const scene = new Scene();
const camera = new PerspectiveCamera();
camera.position.z = 3;
const clock = new Clock();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const checkerBoardExtension = {
  name: "checkerboard",
  uniforms: {
    checkersSize: 5,
  },
  fragmentShader: (shader) => {
    shader = `
      uniform float checkersSize;
      ${shader.replace(
        "#include <opaque_fragment>",
        /*glsl*/ `
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
const material = new ExtendedMaterial(
  MeshStandardMaterial,
  [checkerBoardExtension],
  {
    color: 0x00aaff,
    checkersSize: 10.0,
  },
  { debug: true }
);
const box = new Mesh(new BoxGeometry(), material);
scene.add(box);

const light = new HemisphereLight(0xffffbb, 0x080820, 1.0);
scene.add(light);

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

  box.rotation.set(elapsed / 2, elapsed / 2, elapsed / 2);

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();
