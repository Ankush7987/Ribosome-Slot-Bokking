import React, { createContext, useContext, useState, useEffect } from 'react';
// Firebase imports
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
      // --- LOGIC CHANGE HERE (Is Line ko dhyan se dekhein) ---
      
      // Pehle hum sirf mobile check kar rahe the. 
      // Ab hum check kar rahe hain ki wo mobile number ho LEKIN uska status 'Expired' NA ho.
      const activeBooking = bookings.find((b) => 
        b.mobile === data.mobile && b.status !== 'Expired'
      );

      // Agar koi aisa booking mila jo Expired nahi hai (Pending ya Success hai), to error do.
      if (activeBooking) {
        return { success: false, message: 'This mobile number is already active with a Pending or Success slot!' };
      }

      // Check: Kya slot full hai?
      const slotBookings = bookings.filter(
        (b) => b.date === data.date && b.time === data.time && b.status !== 'Expired' 
        // Note: Expired wale slots ko hum count nahi karenge capacity mein
      );

      if (slotBookings.length >= MAX_CAPACITY) {
        return { success: false, message: 'Sorry, this time slot is fully booked!' };
      }

      // Save to Firebase Online
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        status: 'Pending', // Default Status
        timestamp: new Date().toISOString(),
        createdAt: new Date().toLocaleString()
      });

      return { success: true, token: docRef.id };

    } catch (error) {
      console.error("Error adding document: ", error);
      return { success: false, message: "Network Error! Check your internet connection." };
    }
  };

  // --- 3. Update Booking Status ---
  const updateBookingStatus = async (id, newStatus) => {
    try {
      const bookingRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(bookingRef, {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status: ", error);
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