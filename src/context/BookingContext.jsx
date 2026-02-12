import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('ribosome_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const MAX_CAPACITY = 4; // 4 Staff members available

  useEffect(() => {
    localStorage.setItem('ribosome_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (data) => {
    // Check 1: Duplicate Booking Prevention (Spam Check)
    // Agar is mobile number se already koi booking hai, to block karo.
    const alreadyBooked = bookings.find((b) => b.mobile === data.mobile);
    if (alreadyBooked) {
      return { 
        success: false, 
        message: 'This mobile number is already booked! Please contact admin if you need to change it.' 
      };
    }

    // Check 2: Slot Capacity
    const slotBookings = bookings.filter(
      (b) => b.date === data.date && b.time === data.time
    );

    if (slotBookings.length >= MAX_CAPACITY) {
      return { success: false, message: 'Sorry, this time slot is fully booked!' };
    }

    const newBooking = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
    };

    setBookings([...bookings, newBooking]);
    return { success: true, token: newBooking.id };
  };

  const removeBooking = (id) => {
    setBookings(bookings.filter((b) => b.id !== id));
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, removeBooking }}>
      {children}
    </BookingContext.Provider>
  );
};