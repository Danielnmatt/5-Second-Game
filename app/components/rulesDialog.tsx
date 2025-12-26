import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { useState } from "react";

export default function RulesDialog() {
	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<div>
			<button
				onClick={handleClickOpen}
				className="px-6 py-3 rounded-xl bg-card text-secondary-text font-semibold border border-transparent hover:border-primary/40 hover:text-primary-text hover:bg-primary/5 transition-all hover:cursor-pointer"
			>
				Rules
			</button>
			<Dialog
                fullWidth={true}
                maxWidth="md"
				open={open}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				PaperProps={{
					sx: {
						backgroundColor: "#1a1a1a",
					},
				}}
			>
				<DialogTitle id="alert-dialog-title" sx={{ color: "white" }}>
					{"Rules"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText
						id="alert-dialog-description"
						sx={{ color: "white", whiteSpace: "pre-wrap" }}
					>
						{`* Be the first player to reach 10 points.
* How to Play:
    - Turns: One player will be given a category and 5 seconds to answer a prompt."
    - Categories: Click Start. A category will appear ("Name 3 Pizza Toppings").
    - The Timer: As soon as the category appears, the timer starts! You have 5 seconds.
    - Shout It Out: The current player must shout out the required number of answers before the buzzer sounds.
    - Judge Jury: The other players are the judges. If the answers are valid and said in time, click the "Check". If not, click "Fail"
    - Hard Mode: In Hard Mode, you must name 5 items. (I recommend giving 7-10 seconds for this.`}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<button
						onClick={handleClose}
						className="hover:cursor-pointer text-white"
					>
						Close
					</button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
