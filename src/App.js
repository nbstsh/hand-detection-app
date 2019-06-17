import React, { useEffect } from 'react';
import './App.css';
import { useHandDetection, runDetection } from './utils/hand-detection';

const App = () => {
	const { videoRef, canvasRef, isReady } = useHandDetection();

	useEffect(() => {
		if (!isReady) return;
		setInterval(runDetection, 500);
	}, [isReady]);

	return (
		<div className='App'>
			<h1 style={{ width: '100%', textAlign: 'center' }}>
				hand detection app
			</h1>
			<video style={{ width: '100vw', height: '100vh' }} ref={videoRef} />
			<canvas
				style={{ width: '100vw', height: '100vh' }}
				ref={canvasRef}
			/>
		</div>
	);
};
export default App;
