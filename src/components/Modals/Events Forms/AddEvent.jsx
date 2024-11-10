import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { addEventReservation, fetchUserFullName } from '../../../firebases/firebaseFunctions';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import 'antd/dist/reset.css';

const { Text } = Typography;
const db = getFirestore();

export default function AddEvent() {
    const [form] = Form.useForm(); 
    const [loading, setLoading] = useState(false);
    const [venueAmount, setVenueAmount] = useState(0);
    const [basketballAmount, setBasketballAmount] = useState(35);
    const [clubhouseAmount, setClubhouseAmount] = useState(50);
    const [totalAmount, setTotalAmount] = useState(0);
    const [duration, setDuration] = useState(0);

    // To store the last successful submission data for comparison
    const lastSubmission = useRef(null);

    const venues = [
        { value: 'Basketball Court', label: 'Basketball Court' },
        { value: 'Club House', label: 'Club House' },
    ];

    // Fetch the venue amounts from Firestore
    useEffect(() => {
        const fetchVenueAmounts = async () => {
            try {
                const basketballDocRef = doc(db, "venueAmounts", "BasketballCourt");
                const clubhouseDocRef = doc(db, "venueAmounts", "ClubHouse");

                const basketballDoc = await getDoc(basketballDocRef);
                const clubhouseDoc = await getDoc(clubhouseDocRef);

                setBasketballAmount(basketballDoc.exists() ? basketballDoc.data().amount : 35);
                setClubhouseAmount(clubhouseDoc.exists() ? clubhouseDoc.data().amount : 50);
            } catch (error) {
                toast.error('Failed to fetch venue amounts.');
                console.error('Error fetching venue amounts:', error);
            }
        };

        fetchVenueAmounts();
    }, []);

    // Update the venue amount based on selected venue
    const handleVenueChange = (value) => {
        setVenueAmount(value === 'Basketball Court' ? basketballAmount : clubhouseAmount);
    };

    // Calculate duration and total amount when times are changed
    const handleTimeChange = () => {
        const { startTime, endTime } = form.getFieldsValue(['startTime', 'endTime']);
        if (startTime && endTime) {
            const start = new Date(`1970-01-01T${startTime}:00Z`);
            const end = new Date(`1970-01-01T${endTime}:00Z`);
            let durationInHours = (end - start) / (1000 * 60 * 60);
            if (durationInHours < 0) durationInHours += 24;
            setDuration(durationInHours);
            setTotalAmount(durationInHours * venueAmount);
        }
    };

    // Update the total amount when duration or venue amount changes
    useEffect(() => {
        setTotalAmount(duration * venueAmount);
    }, [duration, venueAmount]);

    const handleReset = () => {
        form.resetFields();
        setDuration(0);
        setTotalAmount(0);
    };

    const handleSubmit = async (values) => {
        const auth = getAuth();
        const user = auth.currentUser;
        values.userName = user ? await fetchUserFullName(user.uid) : "";
        values.totalAmount = totalAmount; // Add totalAmount to the data that will be saved

        if (!validateForm(values)) {
            toast.warn("Please fill in all required fields.");
            return;
        }

        if (values.endTime <= values.startTime) {
            toast.warn('End time must be after start time.');
            return;
        }

        // Check if the form values haven't changed since the last successful submission
        if (lastSubmission.current && areValuesEqual(lastSubmission.current, values)) {
            toast.warn("You haven't made any changes since your last submission.");
            return;
        }

        setLoading(true);

        try {
            await addEventReservation(values);  // Pass totalAmount with the reservation data
            toast.success("Your reservation request is under review.");

            // Store the current form values as the last successful submission
            lastSubmission.current = values;
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

    const areValuesEqual = (prevValues, currentValues) => {
        return prevValues.date === currentValues.date &&
               prevValues.startTime === currentValues.startTime &&
               prevValues.endTime === currentValues.endTime &&
               prevValues.venue === currentValues.venue;
    };

    const today = new Date();
    const todayDate = today.toISOString().split('T')[0];

    return (
        <Form
            form={form}
            layout="vertical"
            className="p-4 mx-auto desktop:w-2/5 laptop:w-3/5 phone:w-full"
            onFinish={handleSubmit}
            initialValues={{
                venue: '',
                startTime: '',
                endTime: '',
            }}
            onValuesChange={handleTimeChange}
        >
            <h2 className="text-[#000000ae] font-poppins text-2xl font-bold text-center mb-4 desktop:text-3xl laptop:text-2xl phone:text-xl">
                Add Event
            </h2>

            <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date!' }]} >
                <Input type="date" min={todayDate} />
            </Form.Item>

            <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Please select a start time!' }]} >
                <Input type="time" />
            </Form.Item>

            <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'Please select an end time!' }]} >
                <Input type="time" />
            </Form.Item>

            <Form.Item
                name="venue"
                label="Venue"
                rules={[{ required: true, message: 'Please select a venue!' }]} >
                <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleVenueChange(e.target.value)} >
                    <option value="" disabled>Choose your Venue</option>
                    {venues.map((venue) => (
                        <option key={venue.value} value={venue.value}>
                            {venue.label}
                        </option>
                    ))}
                </select>
            </Form.Item>

            {venueAmount > 0 && (
                <Form.Item>
                    <Text strong>Amount per Hour: {venueAmount} Php</Text>
                </Form.Item>
            )}

            {totalAmount > 0 && (
                <Form.Item>
                    <Text strong>Total Amount: {totalAmount} Php</Text>
                </Form.Item>
            )}

            <Form.Item>
                <div className="flex flex-col desktop:flex-row desktop:space-x-2 phone:flex-col phone:space-y-2">
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
