import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import style from './ObjectOnHand.module.scss';
import { useHandDetectionWithPredictinos } from '../utils/hand-detection';
import {
	initThree,
	generateHandleResize,
	generateBox,
	toScreenPosition,
	to3dPosition,
	generateProjectRatio,
	loadSalami
} from '../utils/three';

const VIDEO_HEIGHT = 480;
const VIDEO_WIDTH = 640;

const cameraProps = [75, window.innerWidth / window.innerHeight, 0.1, 1000];
const rendererProps = {
	antialias: true,
	alpha: true
};

let obj = null;

const ObjectOnHand = () => {
	const threeCanvasRef = useRef();
	const [scene, setScene] = useState(null);
	const [camera, setCamera] = useState(null);
	const {
		videoRef,
		canvasRef,
		predictions
	} = useHandDetectionWithPredictinos(300);
	const xPositionInput = useFormInput(0);
	const yPositionInput = useFormInput(0);

	useEffect(() => {
		rendererProps.canvas = threeCanvasRef.current;
		const { scene, camera, renderer } = initThree({
			cameraProps,
			rendererProps
		});
		setScene(scene);
		setCamera(camera);
		renderer.setSize(VIDEO_WIDTH, VIDEO_HEIGHT);
		loadSalami(scene).then(object3d => {
			scene.add(object3d);
			obj = object3d;
			obj.rotation.x = 45;
			obj.position.x = 10000;
			obj.position.y = 10000;
		});

		const render = () => {
			requestAnimationFrame(render);
			if (obj) {
				obj.rotation.y += 0.01;
			}
			renderer.render(scene, camera);
		};
		render();

		const handleResize = generateHandleResize(camera, renderer);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!predictions || !obj) return;
		console.log({ predictions });
		const prediction = predictions[0];
		if (prediction) {
			const [sx, sy, handWidth, handHeight] = prediction.bbox;

			const ratio = generateProjectRatio(obj, camera);
			const { x, y } = to3dPosition(
				sx + handWidth / 2,
				sy + handHeight / 2,
				VIDEO_WIDTH,
				VIDEO_HEIGHT,
				ratio
			);
			console.log({ x, y });

			obj.position.x = x;
			obj.position.y = y;
		} else {
			obj.position.x = 10000;
			obj.position.y = 10000;
		}
	}, [predictions]);

	useEffect(() => {
		if (!camera || !obj) return;

		obj.position.x = Number(xPositionInput.value);
		obj.position.y = Number(yPositionInput.value);

		const screenPosition = toScreenPosition(
			obj,
			camera,
			VIDEO_WIDTH,
			VIDEO_HEIGHT
		);
		console.log('screen position', screenPosition);

		const ratio = generateProjectRatio(obj, camera);
		console.log({ ratio });

		console.log(
			'3d position',
			to3dPosition(
				screenPosition.x,
				screenPosition.y,
				VIDEO_WIDTH,
				VIDEO_HEIGHT,
				ratio
			)
		);
	}, [xPositionInput.value, yPositionInput.value]);

	return (
		<div className={style.container}>
			<h1 className={style.title}>ObjectOnHand</h1>
			<video
				className={style.video}
				style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
				ref={videoRef}
			/>
			<canvas
				ref={threeCanvasRef}
				id='three-canvas'
				className={style.threeCanvas}
				style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
			/>
			<section className={style.inputSection}>
				<input {...xPositionInput} type='number' />
				<input {...yPositionInput} type='number' />
			</section>
			<canvas
				className={style.prediction}
				style={{ width: '100vw', height: '100vh' }}
				ref={canvasRef}
			/>
		</div>
	);
};

const useFormInput = initialValue => {
	const [value, setValue] = useState(initialValue);

	const onChange = e => {
		setValue(e.target.value);
	};

	return {
		value,
		onChange
	};
};

export default ObjectOnHand;
