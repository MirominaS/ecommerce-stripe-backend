import { customAlphabet } from 'nanoid';
import sendEmail from './sendEmail.js';

const generateOTP = customAlphabet('0123456789', 6);

const sendOTP = async ({ to }) => {
  const otp = generateOTP();
  await sendEmail({
    to,
    subject: 'Your OTP',
    html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hello User</h2>
                <p>Your verification code is:</p>

                <div style="
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 4px;
                    margin: 20px 0;
                ">
                    ${otp}
                </div>

                <p>This code will expire in 5 minutes.</p>
            </div>
            `,
    text: `Your OTP is ${otp}. It will expire in 5 minutes`,
  });
  return otp;
};

export default sendOTP;
