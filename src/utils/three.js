import * as THREE from 'three';
import FBXLoader from 'three-fbxloader-offical';
const SALAMI_FBX_MODEL_PATH = '3dmodels/salami/salami.fbx';

const generateScene = () => new THREE.Scene();

const generateCamera = props => new THREE.PerspectiveCamera(props);

const initCamera = camera => {
	camera.position.z = 10;
};

const generateRenderer = props => new THREE.WebGLRenderer(props);

const initRenderer = renderer => {
	// renderer.setClearColor('#fff');
	renderer.setSize(window.innerWidth, window.innerHeight);
	// ref.current.appendChild(renderer.domElement);
};

export const generateBox = (positionX = 0, positionY = 0, positionZ = 0) => {
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(positionX, positionY, positionZ);
	// mesh.rotation.set(1, 3, 1);
	// mesh.scale.set(10, 1, 1);
	return mesh;
};

const addLight = scene => {
	const pLight1 = new THREE.PointLight(0xffffff, 1, 100);
	pLight1.position.set(0, 100, 0);
	scene.add(pLight1);

	var aLight = new THREE.AmbientLight(0xffffff); // soft white light
	scene.add(aLight);
};

export const loadSalami = scene =>
	new Promise((resolve, reject) => {
		const loader = new FBXLoader();
		loader.load(SALAMI_FBX_MODEL_PATH, object3d => {
			resolve(object3d);
		});
	});

export const initThree = ({ cameraProps, rendererProps } = {}) => {
	const scene = generateScene();
	const camera = generateCamera(...cameraProps);
	const renderer = generateRenderer(rendererProps);

	initCamera(camera);
	initRenderer(renderer);
	addLight(scene);
	return { scene, camera, renderer };
};

export const generateHandleResize = (camera, renderer) => () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
};

export const generateProjectRatio = (obj, camera) => {
	const vector = new THREE.Vector3();
	const clonedObj = obj.clone();
	clonedObj.position.set(1, 1, 0);
	clonedObj.updateMatrixWorld();
	vector.setFromMatrixPosition(clonedObj.matrixWorld);
	vector.project(camera);
	return vector.x / clonedObj.position.x;
};

// helper
export const toScreenPosition = (obj, camera, width, height) => {
	const vector = new THREE.Vector3();

	const widthHalf = 0.5 * width;
	const heightHalf = 0.5 * height;

	obj.updateMatrixWorld();
	vector.setFromMatrixPosition(obj.matrixWorld);
	vector.project(camera);

	const x = vector.x * widthHalf + widthHalf;
	const y = -(vector.y * heightHalf) + heightHalf;

	return {
		x,
		y
	};
};

export const to3dPosition = (positionX, positionY, width, height, ratio) => {
	const widthHalf = 0.5 * width;
	const heightHalf = 0.5 * height;

	const x = (positionX - widthHalf) / widthHalf;
	const y =
		positionY === heightHalf ? 0 : -(positionY - heightHalf) / heightHalf;

	const vectorX = Math.round(x / ratio);
	const vectorY = Math.round(y / ratio);

	return {
		x: vectorX,
		y: vectorY
	};
};
