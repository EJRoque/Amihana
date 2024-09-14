import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { addEventReservation, fetchUserFullName, checkDuplicateReservation, checkDailyReservationLimit } from '../../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import 'antd/dist/reset.css';

export default function ReserveEventHomeowners() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState(""); // State to hold user's name
    const [lastSubmittedReservation, setLastSubmittedReservation] = useState(null);

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Club House', label: 'Club House' },
    ];

    useEffect(() => {
        // Fetch user name
        const fetchUserName = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                try {
                    const fullName = await fetchUserFullName(user.uid);
                    setUserName(fullName); // Store the user's name in the state
                } catch (error) {
                    toast.error('Failed to fetch user data.');
                    console.error('Error fetching user name:', error);
                }
            }
        };

        fetchUserName();

        // Retrieve the last submitted reservation from local storage
        const storedReservation = localStorage.getItem('lastSubmittedReservation');
        if (storedReservation) {
            setLastSubmittedReservation(storedReservation);
        }
    }, []);

    const handleReset = () => {
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        values.userName = userName;

        const isValid = validateForm(values);
        if (!isValid) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        if (values.endTime <= values.startTime) {
            toast.warn('End time must be after start time.');
            return;
        }

        const currentValuesJson = JSON.stringify(values);

        if (lastSubmittedReservation === currentValuesJson) {
            toast.warn("Duplicate submission detected. You have already submitted this reservation.");
            return;
        }

        setLoading(true);

        try {
            // Check if the user has already reached the daily limit of 3 reservations
            const hasReachedLimit = await checkDailyReservationLimit(userName);
            if (hasReachedLimit) {
                toast.error('You have reached the maximum of 3 reservations for today.');
                return;
            }

            // Check for duplicate reservations based on date, time, and venue
            const isDuplicate = await checkDuplicateReservation(
                values.userName,
                values.date,
                values.startTime,
                values.endTime,
                values.venue
            );

            if (isDuplicate) {
                toast.error("You already have a similar reservation for this time, date, and venue.");
                return;
            }

            await addEventReservation(values);

            // Store the current reservation details in local storage
            localStorage.setItem('lastSubmittedReservation', currentValuesJson);
            setLastSubmittedReservation(currentValuesJson);

            toast.success("Your reservation request is under review. You will be notified once a decision is made.");
        } catch (error) {
            toast.error(error.message || "Failed to add reservation.");
            console.error("Error adding event:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (values) => {
        return values.date && values.startTime && values.endTime && values.venue;
    };

    // Get today's date and check if it is past midnight
    const today = new Date();
    let todayDate = today.toISOString().split('T')[0]; // Default date for the calendar

    // If the current time is after midnight (00:00), disable today as well
    if (today.getHours() >= 0) {
        today.setDate(today.getDate() + 1);
        todayDate = today.toISOString().split('T')[0]; // Disable today after 00:00
    }

    return (
        <Form
            form={form}
            layout="vertical"
            className="p-4 mx-auto desktop:w-2/5 laptop:w-3/5 phone:w-full"
            onFinish={handleSubmit}
        >
            <h2 className="text-[#000000ae] font-poppins text-2xl font-bold text-center mb-4 desktop:text-3xl laptop:text-2xl phone:text-xl">
                Add Event
            </h2>

            <div className="mb-4">
                <label className="text-base font-semibold text-gray-600">Name:</label>
                <p className="text-lg text-black">{userName}</p> {/* Display name as plain text */}
            </div>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]}
            >
                <Input type="date" min={todayDate} />
            </Form.Item>

            <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select a start time!' }]}
            >
                <Input type="time" />
            </Form.Item>

            <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select an end time!' }]}
            >
                <Input type="time" />
            </Form.Item>

            <Form.Item
                name="venue"
                label="Venue"
                rules={[{ required: true, message: 'Please select a venue!' }]}
            >
                <select className="w-full p-2 border rounded" defaultValue="">
                    <option value="" disabled>
                        Choose your Venue
                    </option>
                    {venues.map((venue) => (
                        <option key={venue.value} value={venue.value}>
                            {venue.label}
                        </option>
                    ))}
                </select>
            </Form.Item>

            <Form.Item>
                <div className="flex flex-col desktop:flex-row desktop:space-x-2 phone:flex-col phone:space-y">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="flex-1"
                        loading={loading}
                        icon={loading ? <LoadingOutlined /> : null}
                    >
                        {loading ? "Processing..." : "Add"}
                    </Button>
                    <Button
                        type="default"
                        onClick={handleReset}
                        className="flex-1 mt-2 desktop:mt-0"
                    >
                        Reset
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
}