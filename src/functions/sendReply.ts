const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

exports.sendReplyToUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { messageId, userEmail, userName, replyMessage, adminName } = data;

  const mailOptions = {
    from: `ENSYP Support <support@enspy.com>`,
    to: userEmail,
    subject: `Re: ${data.originalSubject || 'Your Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">ENSYP Response</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Thank you for contacting ENSYP. Here is our response to your inquiry:</p>
          <div style="background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          <p>If you have any further questions, please reply to this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Sent by:</strong> ${adminName}<br>
              <strong>Reference ID:</strong> ${messageId.substring(0, 8).toUpperCase()}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ENSYP - National Advanced School of Posts, Telecommunications and ICT</p>
          <p>Yaoundé, Cameroon | (+237) 222 22 45 47</p>
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending reply email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});