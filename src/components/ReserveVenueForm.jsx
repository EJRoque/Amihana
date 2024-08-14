import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from "react-toastify";

export default function ReserveVenueForm() {
    const [formValues, setFormValues] = useState({
        date: '',
        startTime: '',
        endTime: '',
        venue: 'Basketball Court',
    });

    const [loading, setLoading] = useState(false); // Loading state

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Tennis Court', label: 'Tennis Court' },
        { value: 'Swimming Pool', label: 'Swimming Pool' },
    ];

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
            await submitFormData(formValues);
 
            toast.success("Form submitted successfully.");
        } catch (error) {
            toast.error("Form submission failed:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const validateForm = (values) => {
        return values.date && values.startTime && values.endTime && values.venue;
    };
    
    const submitFormData = (values) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("Submitting form data:", values);
                resolve();
            }, 1500); 
        });
    };
    

    return (
        <form 
            className="flex flex-col space-y-4 p-4 w-96 mx-auto" 
            onSubmit={handleSubmit}
        >
            <h2 className="text-2xl font-bold text-center mb-4">Reserve a Venue</h2>

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
                    startIcon={loading ? <CircularProgress size={20} /> : null} // Show loading icon
                >
                    {loading ? "Processing..." : "Reserve"}
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
