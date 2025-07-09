import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  // Ensure we use the correct protocol (http for development)
  const baseUrl = 'https://testdeploymentuserside.vercel.app';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to Belto Admin Portal!</h2>
        <p style="color: #666;">Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #FFB800; 
                    color: black; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #666; font-size: 12px;">${verificationUrl}</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// New function for reset password emails
export const sendResetPasswordEmail = async (email, resetToken) => {
  // Get base URL from env or fallback to localhost for development
  const baseUrl = 'https://testdeploymentuserside.vercel.app';
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #666;">You are receiving this email because you (or someone else) has requested to reset your password for the Belto Admin Portal.</p>
        <p style="color: #666;">Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #FFB800; 
                    color: black; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px;
                    font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #666; font-size: 12px;">${resetUrl}</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
