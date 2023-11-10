import { PropsWithChildren, createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModalDialog, ModalDialogOptions } from './ModalDialog';

const ModalDialogContext = createContext<(options: ModalDialogOptions) => Promise<boolean>>(Promise.resolve);

export const useModalDialog = () => useContext(ModalDialogContext);

export const ModalDialogProvider = ({ children }: PropsWithChildren) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [confirmationState, setConfirmationState] = useState<ModalDialogOptions | null>(null);
	const [open, setOpen] = useState(false);
	const [response, setResponse] = useState(false);
	const [endPromise, setEndPromise] = useState(false);

	const awaitingCallback = useRef<(response: boolean) => void>();

	const openConfirmation = (options: ModalDialogOptions) => {
		navigate('#mdl');
		setConfirmationState(options);
		setOpen(true);
		setResponse(false);
		setEndPromise(false);
		return new Promise<boolean>((callback) => {
			awaitingCallback.current = callback;
		});
	};

	const handleClose = () => {
		setResponse(false);
		setOpen(false);
	};

	const handleSubmit = () => {
		setResponse(true);
		setOpen(false);
	};

	// change hash on close
	useEffect(() => {
		// navigate back when hash is on, open is false and modal was initialized
		if (location.hash === '#mdl' && !open) {
			navigate(-1);
		}
	}, [open]);

	// ask for resolve or reject after hash change (click on buttons or back)
	useEffect(() => {
		if (confirmationState && location.hash !== '#mdl') {
			setOpen(false);
			// sets initial state
			setConfirmationState(null);
			setEndPromise(false);
			// Execute callback
			if (awaitingCallback.current) {
				awaitingCallback.current(response);
			}
		}
	}, [location]);

	// resolve promise after asking
	useEffect(() => {
		if (endPromise) {
			// sets initial state
			setConfirmationState(null);
			setEndPromise(false);
			if (awaitingCallback.current) {
				awaitingCallback.current(response);
			}
		}
	}, [endPromise]);

	return (
		<>
			<ModalDialogContext.Provider value={openConfirmation}>{children}</ModalDialogContext.Provider>
			<ModalDialog open={open} onSubmit={handleSubmit} onClose={handleClose} {...confirmationState} />
		</>
	);
};
