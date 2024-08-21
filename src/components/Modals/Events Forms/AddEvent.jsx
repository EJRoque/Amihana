import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { checkReservationConflict, addEventReservation, fetchUserFullName } from '../../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import 'antd/dist/reset.css';

export default function AddEvent() {
    const [form] = Form.useForm();
    const [formValues, setFormValues] = useState({
        date: '',
        startTime: '',
        endTime: '',
        venue: 'Basketball Court',
        userName: '',
    });

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
                    setFormValues((prevValues) => ({
                        ...prevValues,
                        userName: fullName,
                    }));
                } catch (error) {
                    toast.error('Failed to fetch user data.');
                    console.error('Error fetching user name:', error);
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

    const handleVenueChange = (e) => {
        setFormValues({
            ...formValues,
            venue: e.target.value,
        });
    };

    const handleReset = () => {
        form.resetFields();
        setFormValues({
            date: '',
            startTime: '',
            endTime: '',
            venue: 'Basketball Court',
            userName: formValues.userName,
        });
    };

    const handleSubmit = async () => {
        const isValid = validateForm(formValues);
        if (!isValid) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        if (formValues.endTime <= formValues.startTime) {
            toast.warn('End time must be after start time.');
            return;
        }

        setLoading(true);

        try {
            const conflictExists = await checkReservationConflict(
                formValues.date,
                formValues.venue,
                formValues.startTime,
                formValues.endTime
            );

            if (conflictExists) {
                toast.warn('The selected date, venue, and time are already booked.');
                return;
            }

            await addEventReservation(formValues);
            toast.success("Event added successfully.");
            handleReset();
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
            initialValues={formValues}
        >
            <h2 className="text-[#000000ae] font-poppins text-2xl font-bold text-center mb-4 desktop:text-3xl laptop:text-2xl phone:text-xl">
                Add Event
            </h2>

            <Form.Item label="Name">
                <Input value={formValues.userName} disabled />
            </Form.Item>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]}
            >
                <Input type="date" name="date" value={formValues.date} onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select a start time!' }]}
            >
                <Input type="time" name="startTime" value={formValues.startTime} onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select an end time!' }]}
            >
                <Input type="time" name="endTime" value={formValues.endTime} onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="venue"
                label="Venue"
                rules={[{ required: true, message: 'Please select a venue!' }]}
            >
                <select name="venue" value={formValues.venue} onChange={handleVenueChange} className="w-full p-2 border rounded">
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