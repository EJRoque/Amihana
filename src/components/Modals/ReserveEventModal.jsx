import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

export default function ReserveEventModal(props) {
    const { title, children, openMod, setOpenMod } = props;

    return (
        <Dialog
            open={openMod}
            onClose={() => setOpenMod(false)}
            maxWidth='md'
            fullWidth
            classes={{ paper: 'p-4 rounded-lg desktop:w-1/2 laptop:w-2/3 phone:w-full' }}
        >
            <DialogTitle className="text-xl font-semibold border-b-2 pb-2 mb-4 desktop:text-2xl laptop:text-xl phone:text-lg">
                {title}
            </DialogTitle>

            <DialogContent className="p-4 desktop:p-6 laptop:p-4 phone:p-2">
                {children}
            </DialogContent>
        </Dialog>
    );
}
