'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesNormal, categoriesHard } from '../utils/categories';
import { GameMode } from '../utils/game';

const DEFAULT_ANSWER_SECONDS = 5.0;
const PREVIEW_SECONDS = 3.0;
const TICK_RATE_MS = 100;

type TurnMode = Exclude<GameMode, 'mixed'>;

type StoredGameData = {
	mode: GameMode;
	players: string[];
	winningScore: number;
	answerTimeSeconds: number;
};

type Phase = 'reveal' | 'preview' | 'active' | 'result' | 'gameover';

export default function GameScreen() {
	const router = useRouter();

	// --- State ---
	const [gameMode, setGameMode] = useState<GameMode | null>(null);
	const [players, setPlayers] = useState<string[]>([]);
	const [winningScore, setWinningScore] = useState(10);
	const [answerTimeSeconds, setAnswerTimeSeconds] = useState(
		DEFAULT_ANSWER_SECONDS
	);
	const [turnMode, setTurnMode] = useState<TurnMode>('normal');
	const [scores, setScores] = useState<number[]>([]);
	const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
	const [phase, setPhase] = useState<Phase>('reveal');

	const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
	const [currentCategory, setCurrentCategory] = useState('');
	const [timeLeft, setTimeLeft] = useState(DEFAULT_ANSWER_SECONDS);
	const [previewLeft, setPreviewLeft] = useState(PREVIEW_SECONDS);
	const [isActive, setIsActive] = useState(false);

	const activePlayers = players
	const totalTime = answerTimeSeconds;
	const currentPlayerName = activePlayers[currentPlayerIdx];
	const usedCategories = new Set();

	// Helper: Pick a random category based on a turn's mode
	const pickNewCategory = useCallback((modeForTurn: TurnMode) => {
		let list: string[] = [];
		if (modeForTurn === 'normal') {
			list = categoriesNormal;
		}
		else if (modeForTurn === 'hard') {
			list = categoriesHard;
		}
		else if (modeForTurn === 'mixed') {
			list = [...categoriesNormal, ...categoriesHard];
		}

		const randomIndex = Math.floor(Math.random() * list.length);
		if (usedCategories.has(list[randomIndex])) {
			return pickNewCategory(modeForTurn);
		}

		usedCategories.add(list[randomIndex]);
		setCurrentCategory(list[randomIndex] ?? '');
	}, []);

	// Helper: Initialize a fresh turn (starts at "Reveal")
	const initTurn = useCallback(() => {
		if (!gameMode) return;

		const nextTurnMode: TurnMode =
			gameMode === 'mixed'
				? Math.random() < 0.5
					? 'normal'
					: 'hard'
				: gameMode;

		setTurnMode(nextTurnMode);
		pickNewCategory(nextTurnMode);
		setTimeLeft(answerTimeSeconds);
		setPreviewLeft(PREVIEW_SECONDS);
		setIsActive(false);
		setPhase('reveal');
	}, [answerTimeSeconds, gameMode, pickNewCategory]);

	// Keep scores array aligned with players length
	useEffect(() => {
		const names = players.length > 0 ? players : ['Player 1'];
		setScores((prev) => names.map((_, i) => prev[i] ?? 0));
		setCurrentPlayerIdx((prev) => (prev >= names.length ? 0 : prev));
	}, [players]);

	// INITIAL LOAD: Read game config from localStorage
	useEffect(() => {
		try {
			const raw = localStorage.getItem('5SecondGameData');
			if (!raw) {
				setGameMode('normal');
				setPlayers([]);
				return;
			}

			const parsed = JSON.parse(raw) as Partial<StoredGameData>;
			const parsedMode =
				parsed.mode === 'normal' ||
				parsed.mode === 'hard' ||
				parsed.mode === 'mixed'
					? parsed.mode
					: 'normal';
			setGameMode(parsedMode);
			setWinningScore(
				typeof parsed.winningScore === 'number' &&
					Number.isFinite(parsed.winningScore) &&
					parsed.winningScore >= 1
					? Math.floor(parsed.winningScore)
					: 10
			);
			setAnswerTimeSeconds(
				typeof parsed.answerTimeSeconds === 'number' &&
					Number.isFinite(parsed.answerTimeSeconds) &&
					parsed.answerTimeSeconds > 0
					? parsed.answerTimeSeconds
					: DEFAULT_ANSWER_SECONDS
			);
			setPlayers(Array.isArray(parsed.players) ? parsed.players : []);
		} catch {
			setGameMode('normal');
			setPlayers([]);
		}
	}, []);

	useEffect(() => {
		if (!gameMode) return;
		setWinnerIdx(null);
		setPhase('reveal');
		initTurn();
	}, [gameMode, initTurn]);

	// PREVIEW COUNTDOWN (3 seconds after "Reveal")
	useEffect(() => {
		if (phase !== 'preview') return;

		let interval: ReturnType<typeof setInterval> | undefined;
		interval = setInterval(() => {
			setPreviewLeft((prev) => {
				const next = Math.max(0, prev - TICK_RATE_MS / 1000);
				if (next <= 0) {
					setIsActive(true);
					setPhase('active');
				}
				return next;
			});
		}, TICK_RATE_MS);

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [phase]);

	// TIMER LOGIC: Main countdown
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;

		if (phase === 'active' && isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prevTime) => {
					const newTime = Math.max(0, prevTime - TICK_RATE_MS / 1000);
					if (newTime <= 0) {
						setIsActive(false);
						setPhase('result');
					}
					return newTime;
				});
			}, TICK_RATE_MS);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, phase, timeLeft]);

	// Helper: Handle moving to next player (used by both buttons)
	const handleReveal = () => {
		if (phase !== 'reveal') return;
		setPreviewLeft(PREVIEW_SECONDS);
		setPhase('preview');
	};

	const handlePassFail = (didPass: boolean) => {
		if (phase !== 'result') return;

		if (didPass) {
			setScores((prev) => {
				const next = [...prev];
				next[currentPlayerIdx] = (next[currentPlayerIdx] ?? 0) + 1;
				const newScore = next[currentPlayerIdx] ?? 0;
				if (newScore >= winningScore) {
					setWinnerIdx(currentPlayerIdx);
					setPhase('gameover');
					setIsActive(false);
				}
				return next;
			});
		}

		// If game is over, stop.
		if (didPass) {
			const projected = (scores[currentPlayerIdx] ?? 0) + 1;
			if (projected >= winningScore) return;
		}

		// Next player's turn
		const nextIdx = (currentPlayerIdx + 1) % activePlayers.length;
		setCurrentPlayerIdx(nextIdx);
		initTurn();
	};

	const handleQuitToMenu = () => {
		router.push('/');
	};

	// --- UI Calculations ---
	const showPrompt = phase !== 'reveal' && phase !== 'gameover';
	const displayTotal = phase === 'preview' ? PREVIEW_SECONDS : totalTime;
	const displayTime = phase === 'preview' ? previewLeft : timeLeft;

	// Calculate percentage for progress bar width
	const progressPercentage = (displayTime / displayTotal) * 100;

	// Dynamic Color for progress bar based on urgency
	let progressBarColorClass = 'from-primary to-purple-400'; // Default purple
	let timerTextClass = 'text-primary-text';

	if (phase === 'active' && timeLeft <= 3.0 && timeLeft > 1.5) {
		// Warning State (Yellow/Orange)
		progressBarColorClass =
			'from-yellow-500 to-orange-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]';
		timerTextClass =
			'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]';
	} else if (phase === 'active' && timeLeft <= 1.5) {
		// Critical State (Red)
		progressBarColorClass =
			'from-red-500 to-pink-600 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse';
		timerTextClass =
			'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)] font-black';
	}

	return (
		<div className='min-h-screen bg-background w-full flex flex-col items-center justify-center p-4 relative overflow-hidden'>
			{/* Background ambient glow */}
			<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse duration-[4s]'></div>

			{/* Scoreboard Header */}
			<header className='w-full max-w-2xl mt-4 mb-6 relative z-20'>
				<div className='bg-card/70 backdrop-blur-md border border-primary/30 rounded-2xl p-4 shadow-primary/20 shadow-xl'>
					<div className='flex items-center justify-between gap-3 mb-3'>
						<div className='text-primary-text font-black text-lg'>
							Scores
						</div>
						<div className='text-secondary-text text-sm font-semibold'>
							{`First to ${winningScore} wins`}
						</div>
					</div>
					<div className='flex flex-wrap gap-2'>
						{activePlayers.map((name, idx) => {
							const isCurrent =
								idx === currentPlayerIdx &&
								phase !== 'gameover';
							return (
								<div
									key={`${name}-${idx}`}
									className={
										'px-3 py-2 rounded-xl border text-sm font-semibold max-w-full wrap-break-word' +
										(isCurrent
											? 'bg-primary/20 border-primary text-primary-text'
											: 'bg-background/40 border-border text-secondary-text')
									}>
									<span className='text-primary-text wrap-break-word'>
										{name}
									</span>
									<span className='text-secondary-text'>
										{' '}
										—{' '}
									</span>
									<span className='text-primary-text'>
										{scores[idx] ?? 0}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</header>

			{/* Main Game Card */}
			<main className='relative bg-background/80 backdrop-blur-md w-full max-w-2xl p-8 pt-12 rounded-3xl text-center border-[3px] border-primary/50 shadow-[0_0_50px_-10px_rgba(139,92,246,0.6),inset_0_0_20px_-5px_rgba(139,92,246,0.3)] z-20'>
				{/* Player Badge */}
				<div className='absolute -top-5 left-1/2 -translate-x-1/2 bg-card border border-primary/50 px-6 py-2 rounded-full shadow-[0_0_15px_-3px_rgba(139,92,246,0.6)] max-w-1/2 text-ellipsis overflow-hidden whitespace-nowrap'>
					<span className='text-secondary-text text-sm font-semibold'>
						Current Player:{' '}
						<span className='text-primary-text font-bold'>
							{currentPlayerName}
						</span>
					</span>
				</div>

				{/* The Category Text */}
				<h2 className='text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] text-white uppercase min-h-30 flex items-center justify-center'>
					{showPrompt ? currentCategory : ' '}
				</h2>

				{phase === 'reveal' && (
					<div className='mx-auto max-w-md bg-card/80 border border-primary/30 rounded-2xl p-6 shadow-primary/20 shadow-xl wrap-break-word'>
						<div className='text-secondary-text font-semibold mb-2'>
							Up next:
						</div>
						<div className='text-primary-text text-2xl font-black mb-5'>
							{currentPlayerName}
						</div>
						<button
							onClick={handleReveal}
							className='w-full bg-primary hover:bg-primary/80 text-white font-black text-2xl py-3 rounded-2xl transition-all active:scale-95 hover:scale-105 hover:cursor-pointer'>
							Reveal
						</button>
					</div>
				)}

				{phase === 'gameover' && winnerIdx !== null && (
					<div className='mx-auto max-w-md bg-card/80 border border-primary/30 rounded-2xl p-6 shadow-primary/20 shadow-xl'>
						<div className='text-primary-text text-3xl font-black mb-2'>
							{activePlayers[winnerIdx] ?? 'Player'} wins!
						</div>
						<div className='text-secondary-text font-semibold'>
							First to {winningScore} points
						</div>
					</div>
				)}

				{/* Timer Section */}
				<div className='mb-4'>
					{/* Digital Clock Display */}
					<div
						className={`text-7xl font-mono font-bold transition-all duration-200 ${timerTextClass}`}>
						{phase === 'reveal' || phase === 'gameover'
							? ' '
							: displayTime.toFixed(1)}
					</div>
				</div>

				{/* Progress Bar (only during active round) */}
				{phase === 'active' && (
					<div className='w-full h-6 bg-background/50 rounded-full p-1 border border-primary/30 overflow-hidden relative'>
						{/* Moving Bar */}
						<div
							className={`h-full rounded-full bg-linear-to-r transition-all duration-100 ease-linear relative ${progressBarColorClass}`}
							style={{ width: `${progressPercentage}%` }}>
							<div className='absolute right-0 top-0 h-full w-2 bg-white/70 blur-[2px] rounded-full'></div>
						</div>
					</div>
				)}
			</main>

			{/* Action Buttons */}
			{phase === 'result' && (
				<footer className='mt-12 flex flex-col md:flex-row gap-4 w-full max-w-2xl relative z-20 text-white'>
					{/* Pass Button (Green) */}
					<button
						onClick={() => handlePassFail(true)}
						className='flex items-center justify-center space-x-2 bg-success hover:bg-success/90 font-bold text-xl py-4 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 w-1/2 hover:cursor-pointer'>
						<span>Pass</span>
					</button>

					{/* Fail Button (Red) */}
					<button
						onClick={() => handlePassFail(false)}
						className='flex items-center justify-center space-x-2 bg-error hover:bg-error/90 font-bold text-xl py-4 px-8 rounded-2xl transition-all hover:scale-105 active:scale-95 w-1/2 hover:cursor-pointer'>
						<span>Fail</span>
					</button>
				</footer>
			)}

			{/* Quit Game Button */}
			<button
				onClick={handleQuitToMenu}
				className='mt-8 text-secondary-text hover:text-error underline text-sm z-20 hover:cursor-pointer'>
				Quit to Menu
			</button>
		</div>
	);
}
