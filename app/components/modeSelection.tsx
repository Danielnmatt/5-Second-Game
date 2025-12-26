import { GAMEMODES } from '../utils/game';
import { GameMode } from '../utils/game';
import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
interface ModeSelectionButtonProps {
	id: GameMode;
	label: string;
	description: string;
	isSelected: boolean;
	onSelect: (mode: GameMode) => void;
}

function ModeSelectionButton({
	id,
	label,
	description,
	isSelected,
	onSelect,
}: ModeSelectionButtonProps) {
	return (
		<button
			onClick={() => onSelect(id)}
			className={cn(
				'flex items-center justify-center space-x-3 py-4 px-4 rounded-xl border-2 transition-all duration-300 w-full hover:cursor-pointer hover:scale-105 active:scale-95',
				isSelected
					? 'bg-primary/20 border-primary text-primary-text'
					: 'bg-background/50 border-border text-secondary-text hover:border-primary/50 hover:bg-primary/10 hover:text-primary-text'
			)}>
			<span className='font-semibold flex flex-col'>
				{label}
				<span className='opacity-70 text-sm'>{description}</span>
			</span>
		</button>
	);
}

interface ModeSelectionProps {
    selectedMode: GameMode;
    setSelectedMode: (mode: GameMode) => void;
}

export default function ModeSelection({selectedMode, setSelectedMode} : ModeSelectionProps) {
	return (
		<section
			className={`grid grid-cols-1 md:grid-cols-${GAMEMODES.length} gap-4 mb-8`}>
			{GAMEMODES.map((mode) => (
				<ModeSelectionButton
					key={mode.id}
					id={mode.id}
					label={mode.label}
					description={mode.description}
					isSelected={selectedMode === mode.id}
					onSelect={setSelectedMode}
				/>
			))}
		</section>
	);
}
