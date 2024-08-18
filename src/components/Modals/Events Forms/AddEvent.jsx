import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import 'antd/dist/reset.css'; // Ensure Ant Design styles are included

export default function AddEvent() {
    const [form] = Form.useForm(); 
    const [formValues, setFormValues] = useState({
        date: '',
        startTime: '',
        endTime: '',
        venue: 'Basketball Court',
    });

    const [loading, setLoading] = useState(false); 

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Club House', label: 'Club House' },
    ];

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
        form.resetFields(); // Reset the form fields
        setFormValues({
            date: '',
            startTime: '',
            endTime: '',
            venue: 'Basketball Court', // Reset to default venue
        });
    };

    const handleSubmit = async (values) => {
        const isValid = validateForm(values);
        if (!isValid) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            await submitFormData(values);
            toast.success("Added an Event.");
        } catch (error) {
            toast.error("Failed to add the event:", error);
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
