import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from "react-toastify";
import { checkReservationConflict, addEventReservation, fetchUserFullName } from '../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';

export default function AddEvent() {
    const [formValues, setFormValues] = useState({
        date: '',
        startTime: '',
        endTime: '',
        venue: 'Basketball Court',
        userName: '', // Automatically populated with logged-in user's name
    });

    const [loading, setLoading] = useState(false);

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Tennis Court', label: 'Tennis Court' },
        { value: 'Swimming Pool', label: 'Swimming Pool' },
    ];

    useEffect(() => {
        const fetchUserName = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                try {
                    const fullName = await fetchUserFullName(user.uid);
                    setFormValues((prevValues) => ({
                        ...prevValues,
                        userName: fullName,
                    }));
                } catch (error) {
                    toast.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchUserName();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleReset = () => {
        setFormValues({
            date: '',
            startTime: '',
            endTime: '',
            venue: 'Basketball Court',
            userName: formValues.userName, // Retain user name
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm(formValues);
        if (!isValid) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const conflictExists = await checkReservationConflict(formValues.date, formValues.venue);

            if (conflictExists) {
                toast.warn("The selected date and venue are already booked.");
                return;
            }

            await addEventReservation(formValues);
            toast.success("Event Added successfully.");
            handleReset();
        } catch (error) {
            toast.error("Failed to add the Event:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (values) => {
        return values.date && values.startTime && values.endTime && values.venue && values.userName;
    };

    return (
        <form className="flex flex-col space-y-4 p-4 w-96 mx-auto" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-center mb-4">Add Event</h2>

            <TextField
                label="Name"
                name="userName"
                value={formValues.userName}
                fullWidth
                className="mb-4"
                disabled // User name is auto-filled and not editable
            />

            <TextField
                label="Date"
                type="date"
                name="date"
                value={formValues.date}
                onChange={handleInputChange}
                InputLabelProps={{
                    shrink: true,
                }}
                fullWidth
                className="mb-4"
            />

            <TextField
                label="Start Time"
                type="time"
                name="startTime"
                value={formValues.startTime}
                onChange={handleInputChange}
                InputLabelProps={{
                    shrink: true,
                }}
                fullWidth
                className="mb-4"
            />

            <TextField
                label="End Time"
                type="time"
                name="endTime"
                value={formValues.endTime}
                onChange={handleInputChange}
                InputLabelProps={{
                    shrink: true,
                }}
                fullWidth
                className="mb-4"
            />

            <TextField
                select
                label="Venue"
                name="venue"
                value={formValues.venue}
                onChange={handleInputChange}
                fullWidth
                className="mb-4"
            >
                {venues.map((venue) => (
                    <MenuItem key={venue.value} value={venue.value}>
                        {venue.label}
                    </MenuItem>
                ))}
            </TextField>

            <Box className="flex flex-nowrap space-x-5">
                <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? "Processing..." : "Add"}
                </Button>
                <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={handleReset}
                    fullWidth
                    disabled={loading}
                >
                    Reset
                </Button>
            </Box>
        </form>
    );
}
