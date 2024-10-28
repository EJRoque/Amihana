import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, AutoComplete } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from "react-toastify";
import { fetchReservationsForToday } from '../../firebases/firebaseFunctions';
import nogroup from "../../assets/images/no-group.png";

const { Text, Title } = Typography;

export default function EventsSection() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch today's reservations for all homeowners
    const fetchReservations = async () => {
        setLoading(true);
        try {
            const allReservations = await fetchReservationsForToday();
            const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
            
            // Filter reservations to only include those with today's date
            const todayReservations = allReservations.filter(reservation => reservation.date === today);
            setEvents(todayReservations);
        } catch (error) {
            toast.error('Failed to fetch reservations for today.');
            console.error("Error fetching reservations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    return (
        <div className="section-wrapper p-4">
            <div className='flex space-x-4'>
            <Title level={4}>Today's Reservations</Title>
            <AutoComplete 
                style={{ width: 200 }}
                placeholder={[<SearchOutlined/> ,'   Search']}
                
            />
            </div>
            {loading ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center opacity-30">
                    <img 
                        src={nogroup} 
                        alt="No Events Available" 
                        className="max-h-screen max-w-screen mb-2"
                    />
                    <Text>No reservations for today.</Text>
                </div>
            ) : (
                events.map((reservation, index) => (
                    <Card key={index} className="max-w-xl mx-auto mb-4" title="Reservation Details" bordered={true}>
                        <Text strong>User Name: </Text>
                        <Text>{reservation.userName}</Text>
                        <br />
                        <Text strong>Date: </Text>
                        <Text>{reservation.date}</Text>
                        <br />
                        <Text strong>Start Time: </Text>
                        <Text>{reservation.startTime}</Text>
                        <br />
                        <Text strong>End Time: </Text>
                        <Text>{reservation.endTime}</Text>
                        <br />
                        <Text strong>Venue: </Text>
                        <Text>{reservation.venue}</Text>
                        <br />
                        <Text strong>Status: </Text>
                        <Text type={reservation.status === 'approved' ? "success" : "warning"}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Text>
                    </Card>
                ))
            )}
        </div>
    );
}