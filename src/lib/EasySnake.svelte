<script>
	import { onMount, onDestroy } from 'svelte';
	onMount(() => {
		reset();
		document.addEventListener('keydown', listenForKeyboard);
	});
	onDestroy(() => {
		document.removeEventListener('keydown', listenForKeyboard);
	});
	const canvasSize = 240;
	const snakeSize = 10;
	const GAME = {
		INIT: 'INITIALIZING',
		READY: 'GAME_READY',
		SETUP: 'GAME_SETUP',
		PLAYING: 'GAME_PLAYING',
		OVER: 'GAME_OVER',
	}
	const DIRECTION = {
		RIGHT: 'RIGHT',
		LEFT: 'LEFT',
		UP: 'UP',
		DOWN: 'DOWN',
	}
	const keys = {
		'arrowup': DIRECTION.UP,
		'arrowright': DIRECTION.RIGHT,
		'arrowdown': DIRECTION.DOWN,
		'arrowleft': DIRECTION.LEFT,
		'w': DIRECTION.UP,
		'a': DIRECTION.LEFT,
		's': DIRECTION.DOWN,
		'd': DIRECTION.RIGHT,
	}
	const acceptableKeys = Object.keys(keys);
	function listenForKeyboard(e) {
		const key = e.key.toLowerCase()
		if (acceptableKeys.includes(key)) {
			changeDirection(keys[key]);
		}
	}
	
	let gameState = GAME.INIT;
	let canvas;
	let ctx;
	let speedMs;
	let direction; 
	let bodyPositions = [];
	let fruit;
	$: score = (bodyPositions.length - 4) * 10;
	$: highScore = score > highScore ? score : highScore || 0;
	$: {
		if (highScore !== 0) {
			localStorage.setItem('snakeHighScore', highScore);
		}
	}
	onMount(() => {
		const hs = localStorage.getItem('snakeHighScore');
		if (hs) {
			highScore = hs;
		}
	});
	
	function reset() {
		if (ctx) {
			ctx.clearRect(0,0,canvasSize, canvasSize);
		}
		speedMs = 200;
		direction = DIRECTION.RIGHT; 
		bodyPositions = [
				{ x: 50, y: 50 }, 
				{ x: 40, y: 50 },
				{ x: 30, y: 50 },
		];
		gameState = GAME.READY;
		fruit = undefined;
	}
	function setupGame() {
		canvas = document.getElementById('canvas');
		ctx = canvas.getContext('2d');
		gameState = GAME.PLAYING;
		drawSnake();
	}
	function drawSnake() {
		// calculate next position for element
		bodyPositions = bodyPositions.map(({ x, y }, i) => {
			const isHead = i === 0;
			let nextX;
			let nextY;
			
			switch(direction) {
				case DIRECTION.RIGHT:
						nextX = isHead ? x + snakeSize : bodyPositions[i - 1].x;
						nextY = isHead ? y : bodyPositions[i - 1].y;
						break;
				case DIRECTION.LEFT:
						nextX = isHead ? x - snakeSize : bodyPositions[i - 1].x;
						nextY = isHead ? y : bodyPositions[i - 1].y;
						break;
				case DIRECTION.DOWN:
						nextX = isHead ? x : bodyPositions[i - 1].x;
						nextY = isHead ? y + snakeSize : bodyPositions[i - 1].y;
						break;
				case DIRECTION.UP:
				default:
						nextX = isHead ? x : bodyPositions[i - 1].x;
						nextY = isHead ? y - snakeSize : bodyPositions[i - 1].y;
						break;
			}
			// if next values break bounds of canvas or bites self, make game over
			let bitesSelf = false;
			if (isHead) {
				const bitten = bodyPositions.find(part => (part.x === nextX && part.y === nextY));
				bitesSelf = !!bitten;
			}
			if (
					nextX >= canvasSize || 
					nextX <= 0 - snakeSize || 
					nextY >= canvasSize || 
					nextY <= 0 - snakeSize ||
					bitesSelf
			) {
				gameState = GAME.OVER;
			}
			
			// if head touches fruit; remove it and add new body part
			if (isHead && fruit && nextX === fruit.x && nextY === fruit.y) {
					fruit = undefined;
			}
			
			return {
				x: nextX,
				y: nextY,
			}
		});
		if (!fruit) {
			const currentTail = bodyPositions[bodyPositions.length - 1];
			bodyPositions = [...bodyPositions, { ...currentTail }];
			speedMs *= .95;
		}
		// if no fruit; create it!
		createAndDrawFruit();
		
		ctx.fillStyle = 'green';
		bodyPositions.forEach(({ x, y }) => {
			ctx.fillRect(x, y, snakeSize, snakeSize);
		});
		
		// recursivley call, but check if boundaries are reached and end game
		setTimeout(() => {
			if (gameState !== GAME.OVER) {
				// reset canvas then draw
				ctx.clearRect(0,0,canvasSize, canvasSize);
				drawSnake();	
			}
		}, speedMs);
	}
	function generateFruitCoords() {
			const x = Math.floor(Math.random() * (canvasSize / 10)) * 10;
			const y = Math.floor(Math.random() * (canvasSize / 10)) * 10;
			
			const conflictsWithSnake = bodyPositions.find(part => (part.x === x && part.y === y));
			if (!!conflictsWithSnake) {
				return generateFruitCoords();
			}
			return { x, y };
	}
	function createAndDrawFruit() {
		if (!fruit) {
			fruit = generateFruitCoords();
		}
		ctx.fillStyle = 'red';
		ctx.fillRect(fruit.x, fruit.y, snakeSize, snakeSize);
	}
	function changeDirection(nextDirection) {
			switch(nextDirection) {
				case DIRECTION.LEFT:
					if (direction !== DIRECTION.RIGHT) {
						direction = nextDirection;
					}
					break;
				case DIRECTION.RIGHT:
					if (direction !== DIRECTION.LEFT) {
						direction = nextDirection;
					}
					break;
				case DIRECTION.UP:
					if (direction !== DIRECTION.DOWN) {
						direction = nextDirection;
					}
					break;
				case DIRECTION.DOWN:
					if (direction !== DIRECTION.UP) {
						direction = nextDirection;
					}
					break;
			}
	}
</script>
<main class="main">
	<header>
			<div>
				Score: {bodyPositions.length !== 3 ? score : '0'}
			</div>
			<div>
				High score: {highScore}
			</div>
	</header>
	<div class="canvasContainer">
		<canvas id="canvas" width={canvasSize} height={canvasSize}></canvas>
		{#if gameState === GAME.OVER || gameState === GAME.READY}
			<div class="gameDialog">
				{#if gameState === GAME.READY}
					SNAKE
				{:else}
					GAME OVER	
				{/if}
				<button on:click={() => {
					reset(); 
					setupGame();
					}}>
					{#if gameState === GAME.READY}
						Play
					{:else}
						Restart
					{/if}
				</button>
			</div>
		{/if}
	</div>
	<div class="buttons">
		<div></div>
		<button on:click={() => changeDirection(DIRECTION.UP)} aria-label="Up">
			&#x25B2;
		</button>
		<div></div>
		<button on:click={() => changeDirection(DIRECTION.LEFT)} aria-label="left">
			&#x25C0;
		</button>
		<div></div>
		<button on:click={() => changeDirection(DIRECTION.RIGHT)} aria-label="Right">
			&#x25BA;
		</button>
		<div></div>
		<button on:click={() => changeDirection(DIRECTION.DOWN)} aria-label="Down">
			&#9660;
		</button>
		<div></div>
	</div>
	<a href="https://www.czaas.dev/projects/svelte-repl-projects/" target="_blank">Built by Cameron Zaas</a>
</main>
<style>
	.main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 240px;
		margin: 0 auto;
	}
	header {
		width: 100%;
		height: 42px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.buttons {
		padding: 16px 0;
		display: grid;
		grid-template-columns: 33% 33% 33%;
		grid-gap: 8px;
	}
	.buttons button {
		width: 50px;
		height: 50px;
	}
	#canvas {
		border: 1px solid #000;
	}
	.canvasContainer {
		position: relative;
	}
	.gameDialog {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255,255,255,.7);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.gameDialog button {
		margin: 8px 0;
	}
</style>