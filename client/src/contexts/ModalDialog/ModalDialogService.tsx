import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModalDialog, ModalDialogOptions } from './ModalDialog';

const ModalDialogContext = createContext<(options: ModalDialogOptions) => Promise<void>>(Promise.reject);

export const useModalDialog = () => useContext(ModalDialogContext);

type Props = {
	children: JSX.Element | JSX.Element[] | string | string[];
};
export const ModalDialogProvider = ({ children }: Props) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [confirmationState, setConfirmationState] = useState<ModalDialogOptions | null>(null);
	const [open, setOpen] = useState(false);
	const [resolvePromise, setResolvePromise] = useState(false);
	const [endPromise, setEndPromise] = useState(false);

	const awaitingPromiseRef = useRef<{
		resolve: () => void;
		reject: () => void;
	}>();

	const openConfirmation = (options: ModalDialogOptions) => {
		navigate('#mdl');
		setConfirmationState(options);
		setOpen(true);
		setResolvePromise(false);
		setEndPromise(false);
		return new Promise<void>((resolve, reject) => {
			awaitingPromiseRef.current = { resolve, reject };
		});
	};

	const handleClose = () => {
		setResolvePromise(false);
		setOpen(false);
	};

	const handleSubmit = () => {
		setResolvePromise(true);
		setOpen(false);
	};

	// change hash on close
	useEffect(() => {
		// navigate back when hash is on, open is false and modal was initialized
		if (location.hash === '#mdl' && !open) {
			navigate(-1);
		}
	}, [open]);

	// ask por resolve or reject after hash change (click on buttons or back)
	useEffect(() => {
		if (confirmationState && location.hash !== '#mdl') {
			setOpen(false);
			setEndPromise(true);
		}
	}, [location]);

	// resolve or reject promise after asking
	useEffect(() => {
		if (endPromise) {
			// sets initial state
			setConfirmationState(null);
			setEndPromise(false);
			if (awaitingPromiseRef.current) {
				if (resolvePromise) {
					awaitingPromiseRef.current.resolve();
				} else {
					awaitingPromiseRef.current.reject();
				}
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
