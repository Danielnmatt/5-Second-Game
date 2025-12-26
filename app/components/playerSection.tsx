interface PlayerSectionProps {
	addPlayer: string;
	setAddPlayer: (player: string) => void;

	players: string[];
	setPlayers: (players: string[]) => void;

	winningScore: number;
	setWinningScore: (score: number) => void;

	answerTimeSeconds: number;
	setAnswerTimeSeconds: (seconds: number) => void;
}

export default function PlayerSection({
	addPlayer,
	setAddPlayer,
	players,
	setPlayers,
	winningScore,
	setWinningScore,
	answerTimeSeconds,
	setAnswerTimeSeconds,
}: PlayerSectionProps) {
	const handleAddPlayer = (playerName: string) => {
		if (!playerName) return;
		setPlayers([...players, playerName]);
	};

	return (
		<aside className='mt-8 lg:mt-0 lg:absolute lg:top-0 lg:h-full lg:left-full lg:ml-8 w-64 flex flex-col z-10'>
			{/* Input Area */}
			<div className='bg-card p-4 rounded-2xl border border-primary/20 shadow-xl w-full mb-4 shrink-0'>
				<label
					htmlFor='players'
					className='block text-lg font-bold mb-2 text-center'>
					Add Players
				</label>
				<div className='flex gap-2'>
					<input
						onChange={(e) => setAddPlayer(e.target.value)}
						value={addPlayer}
						type='text'
						id='players'
						placeholder='Name...'
						onKeyDown={(e) =>
							e.key === 'Enter' &&
							(handleAddPlayer(addPlayer), setAddPlayer(''))
						}
						className='w-full p-2 rounded-lg bg-background text-primary-text border border-border focus:outline-none focus:ring-2 ring-primary/50 transition duration-300'
					/>
					<button
						type='button'
						onClick={() => {
							handleAddPlayer(addPlayer);
							setAddPlayer('');
						}}
						className='px-3 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition duration-300 '>
						+
					</button>
				</div>
			</div>

			{players.length > 0 && (
				<div className='overflow-y-auto bg-card rounded-2xl border border-primary/20 shadow-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb :rounded-full dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-primary/30'>
					<h3 className='text-secondary-text text-sm font-semibold p-4 border-b border-border'>
						CURRENT PLAYERS
					</h3>
					<ul className='space-y-2 p-4'>
						{players.map((p, index) => (
							<li
								key={index}
								onClick={() =>
									setPlayers(
										players.filter((_, i) => i !== index)
									)
								}
								className='flex justify-between items-center bg-background p-2 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 hover:cursor-pointer relative group animate-in fade-in slide-in-from-top-2 hover:border-error hover:bg-gray-700 transition-all duration-300'>
								<span
									className='font-medium truncate max-w-30'
									title={p}>
									{p}
								</span>
								<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
									<span className='text-error font-bold text-xl drop-shadow-sm'>
										✕
									</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Winning Score */}
			<div className='bg-card p-4 rounded-2xl border border-primary/20 shadow-xl w-full mt-4 shrink-0'>
				<label
					htmlFor='winningScore'
					className='block text-lg font-bold mb-2 text-center'>
					Winning Score
				</label>
				<div className='flex items-center gap-2'>
					<input
						id='winningScore'
						type='number'
						inputMode='numeric'
						min={1}
						step={1}
						value={winningScore}
						onChange={(e) => {
							const raw = e.target.value;
							if (raw === '') return;
							const next = Math.max(1, Math.floor(Number(raw)));
							if (Number.isFinite(next)) setWinningScore(next);
						}}
						className='w-full p-2 rounded-lg bg-background text-primary-text border border-border focus:outline-none focus:ring-2 ring-primary/50 transition duration-300'
					/>
				</div>
				<p className='text-secondary-text text-xs mt-2 text-center'>
					First player to {winningScore} wins
				</p>
			</div>

			{/* Answer Time */}
			<div className='bg-card p-4 rounded-2xl border border-primary/20 shadow-xl w-full mt-4 shrink-0'>
				<label
					htmlFor='answerTimeSeconds'
					className='block text-lg font-bold mb-2 text-center'>
					Answer Time (seconds)
				</label>
				<div className='flex items-center gap-2'>
					<input
						id='answerTimeSeconds'
						type='number'
						inputMode='decimal'
						min={0.5}
						step={0.5}
						value={answerTimeSeconds}
						onChange={(e) => {
							const raw = e.target.value;
							if (raw === '') return;
							const next = Number(raw);
							if (!Number.isFinite(next)) return;
							setAnswerTimeSeconds(Math.max(0.5, next));
						}}
						className='w-full p-2 rounded-lg bg-background text-primary-text border border-border focus:outline-none focus:ring-2 ring-primary/50 transition duration-300'
					/>
				</div>
				<p className='text-secondary-text text-xs mt-2 text-center'>
					Default is 5 seconds
				</p>
			</div>
		</aside>
	);
}
