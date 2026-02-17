import React, { createContext, useContext, useState, useEffect } from 'react';
// Firebase imports - Added updateDoc
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const MAX_CAPACITY = 4;
  const COLLECTION_NAME = "bookings"; 

  // --- 1. Data Read (Real-time Sync) ---
  useEffect(() => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(data);
        setLoading(false);
      }, (error) => {
        console.error("Database Error:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Connection Error:", err);
      setLoading(false);
    }
  }, []);

  // --- 2. Data Add (Booking Save) ---
  const addBooking = async (data) => {
    try {
      const alreadyBooked = bookings.find((b) => b.mobile === data.mobile);
      if (alreadyBooked) {
        return { success: false, message: 'This mobile number is already booked!' };
      }

      const slotBookings = bookings.filter(
        (b) => b.date === data.date && b.time === data.time
      );

      if (slotBookings.length >= MAX_CAPACITY) {
        return { success: false, message: 'Sorry, this time slot is fully booked!' };
      }

      // Updated: Every new booking now gets a 'status: Pending'
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        status: 'Pending', // Default Status
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString()
      });

      return { success: true, token: docRef.id };

    } catch (error) {
      console.error("Error adding document: ", error);
      return { success: false, message: "Network Error!" };
    }
  };

  // --- 3. NEW: Update Status (Success/Pending) ---
  const updateBookingStatus = async (id, newStatus) => {
    try {
      const bookingRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(bookingRef, {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update status.");
    }
  };

  // --- 4. Data Delete ---
  const removeBooking = async (id) => {
    try {
      if(!id) return;
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete booking.");
    }
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, removeBooking, updateBookingStatus, loading }}>
      {children}
    </BookingContext.Provider>
  );
};