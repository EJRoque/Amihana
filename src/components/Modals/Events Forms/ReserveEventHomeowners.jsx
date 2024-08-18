import React, { useState } from 'react';
import { Button, Select, Form, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import 'antd/dist/reset.css'; // Ensure Ant Design styles are included

export default function ReserveEventHomeowners() {
    const [formValues, setFormValues] = useState({
        date: '',
        startTime: '',
        endTime: '',
        venue: 'Basketball Court',
    });

    const [loading, setLoading] = useState(false); // Loading state

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

    const handleReset = () => {
        setFormValues({
            date: '',
            startTime: '',
            endTime: '',
            venue: 'Basketball Court',
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
            toast.success("The request has been sent. Please wait for the response.");
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
            layout="vertical"
            className="p-4 mx-auto desktop:w-2/5 laptop:w-3/5 phone:w-full"
            onFinish={handleSubmit}
            initialValues={formValues}
        >
            <h2 className="text-[#000000ae] font-poppins text-2xl font-bold text-center mb-4 desktop:text-3xl laptop:text-2xl phone:text-xl">
                Reserve Event
            </h2>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]}
            >
                <Input type="date" onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select a start time!' }]}
            >
                <Input type="time" onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select an end time!' }]}
            >
                <Input type="time" onChange={handleInputChange} />
            </Form.Item>

            <Form.Item
                name="venue"
                label="Venue"
                rules={[{ required: true, message: 'Please select a venue!' }]}
            >
                <Select onChange={(value) => setFormValues({ ...formValues, venue: value })}>
                    {venues.map((venue) => (
                        <Select.Option key={venue.value} value={venue.value}>
                            {venue.label}
                        </Select.Option>
                    ))}
                </Select>
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
                        {loading ? "Processing..." : "Reserve"}
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
