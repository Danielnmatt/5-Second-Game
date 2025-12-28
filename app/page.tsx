'use client';

import { useState } from 'react';
import { GameMode } from './utils/game';
import ModeSelection from './components/modeSelection';
import PlayerSection from './components/playerSection';
import RulesDialog from './components/rulesDialog';
import { useRouter } from 'next/navigation';

export default function Home() {
	const router = useRouter();
	const [selectedModes, setSelectedModes] = useState<GameMode[]>(['normal']);
	const [addPlayer, setAddPlayer] = useState<string>('');
	const [players, setPlayers] = useState<string[]>([]);
	const [winningScore, setWinningScore] = useState<number>(10);
	const [answerTimeSeconds, setAnswerTimeSeconds] = useState<number>(5);

	const handleStartGame = () => {
		if (players.length < 2) {
			return;
		}

		const gameData = {
			modes: selectedModes,
			players: players,
			winningScore: winningScore,
			answerTimeSeconds: answerTimeSeconds,
		};

		localStorage.setItem('5SecondGameData', JSON.stringify(gameData));

		router.push('/game');
	};

	return (
		<div className='min-h-screen bg-background text-primary-text overflow-x-hidden'>
			<div className='w-screen lg:h-screen flex flex-col justify-center items-center'>
				<div className='relative flex flex-col lg:block'>
					{/* --- Main Card --- */}
					<main className='bg-card w-full max-w-xl p-8 rounded-3xl text-center border border-primary/30 shadow-primary/30 shadow-2xl relative z-20'>
						{/* Header */}
						<header className='mb-10'>
							<h1 className='text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]'>
								5 SECOND RULE
							</h1>
							<p className='text-secondary-text text-lg font-medium'>
								The Fast-Paced Party Game. Think Fast, Talk
								Faster!
							</p>
						</header>
						{/* Select Mode */}
						<ModeSelection
							selectedModes={selectedModes}
							setSelectedModes={setSelectedModes}
						/>
						{/* Start Game Button */}
						<button
							onClick={handleStartGame}
							className='bg-primary font-black text-3xl rounded-2xl py-3 w-full hover:cursor-pointer hover:scale-105 transition duration-300 active:scale-95 hover:bg-primary/80 hover:text-white/80'>
							START GAME
						</button>
					</main>

					{/* Player Section */}
					<PlayerSection
						addPlayer={addPlayer}
						setAddPlayer={setAddPlayer}
						players={players}
						setPlayers={setPlayers}
						winningScore={winningScore}
						setWinningScore={setWinningScore}
						answerTimeSeconds={answerTimeSeconds}
						setAnswerTimeSeconds={setAnswerTimeSeconds}
					/>
				</div>

				{/* Footer */}
				<footer className='mt-12 flex space-x-6 relative z-10'>
					<RulesDialog />
				</footer>
			</div>
		</div>
	);
}
