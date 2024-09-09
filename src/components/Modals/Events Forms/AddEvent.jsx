import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { checkReservationConflict, addEventReservation, fetchUserFullName } from '../../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import 'antd/dist/reset.css';

export default function AddEvent() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Club House', label: 'Club House' },
    ];

    useEffect(() => {
        const fetchUserName = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                try {
                    const fullName = await fetchUserFullName(user.uid);
                    form.setFieldsValue({ userName: fullName }); // Set username directly in the form
                } catch (error) {
                    toast.error('Failed to fetch user data.');
                    console.error('Error fetching user name:', error);
                }
            }
        };

        fetchUserName();
    }, [form]);

    const handleReset = () => {
        // Reset specific fields to their default values
        form.setFieldsValue({
            date: '',
            startTime: '',
            endTime: '',
            venue: '', // Ensure venue is reset to empty or any other default value
        });
    };

    const handleSubmit = async (values) => {
        const isValid = validateForm(values);
        if (!isValid) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        // Check if endTime is before or equal to startTime
        if (values.endTime <= values.startTime) {
            toast.warn('End time must be after start time.');
            return;
        }

        setLoading(true);

        try {
            // Check for conflicts with existing reservations
            const conflictExists = await checkReservationConflict(
                values.date,
                values.venue,
                values.startTime,
                values.endTime
            );

            if (conflictExists) {
                toast.warn('The date and time is already reserved.');
                return;
            }

            // If no conflict, add the event
            await addEventReservation(values);
            toast.success("Event added successfully.");
            // Do not reset fields here; only reset when Reset button is clicked
        } catch (error) {
            toast.error("Failed to add the event.");
            console.error("Error adding event:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (values) => {
        return values.date && values.startTime && values.endTime && values.venue && values.userName;
    };

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

            <Form.Item label="Name" name="userName">
                <Input disabled />
            </Form.Item>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]}
            >
                <Input type="date" />
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