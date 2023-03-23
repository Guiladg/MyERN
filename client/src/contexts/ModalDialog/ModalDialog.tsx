import { FC, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import SuccessIcon from '@mui/icons-material/CheckCircleTwoTone';
import ErrorIcon from '@mui/icons-material/ErrorTwoTone';
import ConfirmIcon from '@mui/icons-material/HelpTwoTone';
import ImageIcon from '@mui/icons-material/ImageTwoTone';
import ZoomInTwoToneIcon from '@mui/icons-material/ZoomInTwoTone';
import ZoomOutTwoToneIcon from '@mui/icons-material/ZoomOutTwoTone';

export interface ModalDialogOptions {
	type?: 'error' | 'success' | 'confirm' | 'image';
	title?: string;
	text?: string;
	content?: any;
	image?: any;
}

interface ModalDialogProps extends ModalDialogOptions {
	open: boolean;
	onSubmit: () => void;
	onClose: () => void;
}

export const ModalDialog: FC<ModalDialogProps> = ({ open, title, type, text, image, onSubmit, onClose, content }) => {
	const [zoom, setZoom] = useState(100);

	useEffect(() => setZoom(100), [open]);

	return (
		<Dialog open={open}>
			<DialogTitle>
				{title && (
					<>
						{type === 'error' && <ErrorIcon sx={{ verticalAlign: 'middle' }} />}
						{type === 'success' && <SuccessIcon sx={{ verticalAlign: 'middle' }} />}
						{type === 'confirm' && <ConfirmIcon sx={{ verticalAlign: 'middle' }} />}
						{type === 'image' && <ImageIcon sx={{ verticalAlign: 'middle' }} />}
						&ensp;
						{title}
					</>
				)}
			</DialogTitle>
			<DialogContent
				sx={{
					py: 0,
					'&::-webkit-scrollbar': {
						width: '10px',
						height: '10px'
					},
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: 'rgba(0, 0, 0, 0.2)',
						borderRadius: '5px',
						border: '1px solid white'
					}
				}}
			>
				{content ? (
					content
				) : image ? (
					<img src={image} style={{ width: zoom + '%' }} />
				) : (
					<DialogContentText>
						<span dangerouslySetInnerHTML={{ __html: text }} />
					</DialogContentText>
				)}
			</DialogContent>
			<DialogActions>
				{type === 'confirm' && (
					<>
						<Button color="primary" onClick={onSubmit}>
							Yes
						</Button>
						<Button color="error" onClick={onClose} autoFocus>
							No
						</Button>
					</>
				)}
				{(type === 'error' || type === 'success') && (
					<Button color="primary" onClick={onSubmit} autoFocus>
						Ok
					</Button>
				)}
				{type === 'image' && (
					<>
						<Button color="primary" onClick={() => setZoom(zoom - 10)} sx={{ minWidth: '40px', px: 0 }} disabled={zoom === 100}>
							<ZoomOutTwoToneIcon />
						</Button>
						<Button color="primary" onClick={() => setZoom(zoom + 10)} sx={{ minWidth: '40px', px: 0 }}>
							<ZoomInTwoToneIcon />
						</Button>
						<Button color="primary" onClick={onSubmit} autoFocus>
							Close
						</Button>
					</>
				)}
			</DialogActions>
		</Dialog>
	);
};
