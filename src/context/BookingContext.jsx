import React, { createContext, useContext, useState, useEffect } from 'react';
// Firebase imports
import { db } from '../firebase'; 
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const MAX_CAPACITY = 4;
  // Database table ka naam "bookings" hoga
  const COLLECTION_NAME = "bookings"; 

  // --- 1. Data Read (Real-time Sync) ---
  // Jaise hi koi form bharega, ye turant update hoga
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
      // Check: Kya ye number already hai?
      const alreadyBooked = bookings.find((b) => b.mobile === data.mobile);
      if (alreadyBooked) {
        return { success: false, message: 'This mobile number is already booked! Please check with Admin.' };
      }

      // Check: Kya slot full hai?
      const slotBookings = bookings.filter(
        (b) => b.date === data.date && b.time === data.time
      );

      if (slotBookings.length >= MAX_CAPACITY) {
        return { success: false, message: 'Sorry, this time slot is fully booked!' };
      }

      // Save to Firebase Online
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        timestamp: new Date().toISOString(), // Sorting ke liye
        createdAt: new Date().toLocaleString() // Dikhane ke liye
      });

      return { success: true, token: docRef.id }; // Firebase ki ID hi Token banegi

    } catch (error) {
      console.error("Error adding document: ", error);
      return { success: false, message: "Network Error! Check your internet connection." };
    }
  };

  // --- 3. Data Delete ---
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
    <BookingContext.Provider value={{ bookings, addBooking, removeBooking, loading }}>
      {children}
    </BookingContext.Provider>
  );
};