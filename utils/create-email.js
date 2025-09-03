"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingNotification = void 0;
const BookingNotification = (admin, username, img, email, contact, address, people, hostelName, location, peopleNumber, price) => {
    const emailBody = ` <div style="font-family: Arial, sans-serif; max-width: 600px;  padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #4CAF50; text-align: center;">New Room Booking Notification</h2>
          <p style="font-size: 16px; color: #333;">Hi <strong>${admin}</strong>,</p>
          <p style="font-size: 16px; color: #333;">New user  with the name ${username} has just schedule booking to the following room</p>
          
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src=${img} alt={room.hostelName} style={{ maxWidth: '60%', height: 'auto', borderRadius: '8px' }} />
        </div>
        
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Booking Details:</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#3498db' }}>User Information:</h3>
          <p><strong>Name:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contact:</strong> ${contact}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Number of People:</strong> ${people}</p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#3498db' }}>Room Information:</h3>
          <p><strong>Aawas Name:</strong> ${hostelName}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Capacity:</strong> ${peopleNumber} people</p>
          <p><strong>Price:</strong> NPR ${price}</p>
        </div>
        
        <div style={{ backgroundColor: '#e8f4fd', padding: '15px', borderRadius: '8px', marginTop: '30px' }}>
          <p style={{ color: '#2980b9', textAlign: 'center', margin: 0 }}>
            Please contact the user to confirm the booking and provide any additional information.
          </p>
        </div>


          <p style="font-size: 16px; color: #333;">Best Regards,</p>
          <p style="font-size: 16px; color: #333;"><strong>Saligo Aawas</strong></p>
          <hr style="border-top: 1px solid #ddd; margin-top: 20px;">
          <p style="font-size: 12px; text-align: center; color: #999;">&copy; 2025 Sajilo Aawas. All rights reserved.</p>
        </div>
        `;
    return emailBody;
};
exports.BookingNotification = BookingNotification;
