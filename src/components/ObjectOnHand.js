import React, { useEffect, useRef, useState } from 'react';

import style from './ObjectOnHand.module.scss';
import { useHandDetectionWithPredictinos } from '../utils/hand-detection';
import {
	initThree,
	generateHandleResize,
	toScreenPosition,
	to3dPosition,
	generateProjectRatio,
	loadSalami
} from '../utils/three';

let obj = null;
const { scene, camera, renderer } = initThree({
	cameraProps: [75, window.innerWidth / window.innerHeight, 0.1, 1000],
	rendererProps: {
		antialias: true,
		alpha: true
	}
});
const VIDEO_HEIGHT = 480;
const VIDEO_WIDTH = 640;
renderer.setSize(VIDEO_WIDTH, VIDEO_HEIGHT);
const render = () => {
	requestAnimationFrame(render);
	if (obj) obj.rotation.y += 0.01;
	renderer.render(scene, camera);
};

const ObjectOnHand = () => {
	const { canvasContainerRef } = useThree();
	// const { PositionSection } = usePositionLog();
	const {
		videoRef,
		canvasRef,
		predictions
	} = useHandDetectionWithPredictinos(300);

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
			// place obj outside of screen
			obj.position.x = 10000;
			obj.position.y = 10000;
		}
	}, [predictions]);

	return (
		<div className={style.container} ref={canvasContainerRef}>
			{/* <h1 className={style.title}>ObjectOnHand</h1> */}
			<video
				className={style.video}
				style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
				ref={videoRef}
			/>
			{/* <PositionSection /> */}
			<canvas
				className={style.prediction}
				style={{ width: '100vw', height: '100vh' }}
				ref={canvasRef}
			/>
		</div>
	);
};

const useThree = () => {
	const canvasContainerRef = useRef(null);

	// load 3d object
	useEffect(() => {
		loadSalami(scene).then(object3d => {
			scene.add(object3d);
			obj = object3d;
			obj.rotation.x = 45;
			obj.position.x = 10000;
			obj.position.y = 10000;
		});
	}, []);

	// start rendering
	useEffect(() => {
		const { domElement } = renderer;
		domElement.classList.add(style.threeCanvas);
		domElement.width = VIDEO_WIDTH;
		domElement.height = VIDEO_HEIGHT;
		canvasContainerRef.current.appendChild(domElement);
		render();
	}, []);

	// resize handling
	useEffect(() => {
		const handleResize = generateHandleResize(camera, renderer);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	return { canvasContainerRef };
};

/******************************************************************************
 * use function belowe if you want to log data of 2d position and 3d position
 *******************************************************************************/
const usePositionLog = () => {
	const xPositionInput = useFormInput(0);
	const yPositionInput = useFormInput(0);

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

	const PositionSection = () => (
		<section className={style.inputSection}>
			<input {...xPositionInput} type='number' />
			<input {...yPositionInput} type='number' />
		</section>
	);
	return {
		xPositionInput,
		yPositionInput,
		PositionSection
	};
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
