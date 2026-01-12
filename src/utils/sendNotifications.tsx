export const sendNotification = async ({
  user_email,
  message,
  type = 'status_change',
  booking_id,
  status_before,
  status_after,
  title,
  sent_via = 'both',
  action_url,
  related_program_id,
  related_program_name,
  metadata,
}: {
  user_email: string;
  message: string;
  type?: 'status_change' | 'booking_created' | 'booking_updated' | 'payment' | 'system' | 'announcement';
  booking_id?: string;
  status_before?: string;
  status_after?: string;
  title?: string;
  sent_via?: 'email' | 'sms' | 'both' | 'none';
  action_url?: string;
  related_program_id?: string;
  related_program_name?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const notificationsRef = collection(db, 'notification_logs');
    
    const notificationData = {
      booking_id: booking_id || null,
      user_email,
      message,
      type,
      status_before: status_before || null,
      status_after: status_after || null,
      title: title || getNotificationTitle(type, status_before, status_after),
      is_sent: true,
      sent_via,
      action_url: action_url || null,
      related_program_id: related_program_id || null,
      related_program_name: related_program_name || null,
      metadata: metadata || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await addDoc(notificationsRef, notificationData);
    
    console.log(`Notification sent to ${user_email}: ${message}`);
    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
};

const getNotificationTitle = (
  type: string, 
  status_before?: string, 
  status_after?: string
): string => {
  switch (type) {
    case 'status_change':
      if (status_before && status_after) {
        return `Status Updated: ${status_before} → ${status_after}`;
      }
      return 'Status Updated';
    case 'booking_created':
      return 'New Booking Created';
    case 'booking_updated':
      return 'Booking Updated';
    case 'payment':
      return 'Payment Notification';
    case 'system':
      return 'System Notification';
    case 'announcement':
      return 'Announcement';
    default:
      return 'Notification';
  }
};