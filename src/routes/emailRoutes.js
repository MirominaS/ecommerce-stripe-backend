import express from 'express';
import {
  sendEmailMessage, sendOTPMessage,
} from '../controllers/emailController.js';

const router = express.Router();

router.post('/send-email', sendEmailMessage);
router.post('/send-otp', sendOTPMessage);

export default router;
