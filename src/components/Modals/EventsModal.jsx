import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';


export default function EventsModal(props) {
    const { title, children, openMod, setOpenMod } = props;

    return (
        <Dialog open={openMod} maxWidth='md' onClose={() => setOpenMod(false)}>
            <DialogTitle>
                <div>
                    {title}
                </div> 
            </DialogTitle>
            
            <DialogContent>
                {children} 
            </DialogContent>
        </Dialog>
    );
}
