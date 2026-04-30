export const sendNotification = async (phoneNumber: string, customerName: string, orderId: number) => {
  // In a real application, this would call an SMS API like Twilio or Semaphore.
  // For this project, we'll simulate the dispatch.
  
  const message = `Hi ${customerName}, your laundry order #${orderId} at Sofia's Soft Bubble's Laundry Shop is READY for pickup!`;
  
  console.log(`[SMS NOTIFICATION SENT] To: ${phoneNumber} | Message: ${message}`);
  
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Notification dispatched' });
    }, 1000);
  });
};
