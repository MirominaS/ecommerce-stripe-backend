import User from '../models/User.js';
import sendEmail from '../utils/email/sendEmail.js';
import sendOTP from '../utils/email/sendOTP.js';

export const sendEmailMessage = async (req, res) => {
  try {
    const {
      to, subject, html, text,
    } = req.body;

    await sendEmail({
      to, subject, html, text,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendOTPMessage = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        sccess: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      const otp = await sendOTP({
        to: user.email,
      });

      user.otp = otp;
      user.otpExpiresAt = Date.now() + 5 * 60 * 1000;

      await user.save();
    }
    return res.status(200).json({
      success: true,
      message: 'OTP was sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,

    });
  }
};
