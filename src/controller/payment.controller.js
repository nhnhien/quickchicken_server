import { ProductCode, VnpLocale, dateFormat } from 'vnpay';
import prisma from '../prismaClient.js';
import vnpay from '../config/vnpay.config.js';

const updatePaymentStatus = async (paymentId, status, txnRef, amount, response_code) => {
  try {
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status,
        txn_ref: txnRef,
        amount: parseInt(amount),
        response_code: response_code,
      },
    });
    return updatedPayment;
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

const processPayment = async (req, res) => {
  const { paymentId, totalPrice, returnUrl } = req.body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || payment.status !== 'pending') {
      console.error('Invalid payment status or payment not found:', { paymentId });
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status or payment not found',
      });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip,
      vnp_TxnRef: payment.order_id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${payment.order_id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    console.info('Payment URL generated:', { paymentId, paymentUrl });

    return res.status(200).json({
      success: true,
      message: 'Payment URL generated successfully',
      paymentUrl,
    });
  } catch (error) {
    console.error('Failed to process payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message,
    });
  }
};

const repayment = async (req, res) => {
  const { paymentId, totalPrice, returnUrl } = req.body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      console.error('Payment not found:', { paymentId });
      return res.status(400).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === 'completed') {
      console.warn('Payment already completed:', { paymentId });
      return res.status(400).json({
        success: false,
        message: 'Payment already completed',
      });
    }

    if (payment.status === 'failed' || payment.status === 'cancelled') {
      await updatePaymentStatus(payment.id, 'pending');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: totalPrice,
        vnp_IpAddr:
          req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip,
        vnp_TxnRef: payment.order_id.toString(),
        vnp_OrderInfo: `Thanh toán lại đơn hàng ${payment.order_id}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
      });

      console.info('Payment URL generated for repayment:', { paymentId, paymentUrl });

      return res.status(200).json({
        success: true,
        message: 'Payment URL generated for repayment successfully',
        paymentUrl,
      });
    } else {
      console.error('Invalid payment status for repayment:', { paymentId, status: payment.status });
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status for repayment',
      });
    }
  } catch (error) {
    console.error('Failed to process repayment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process repayment',
      error: error.message,
    });
  }
};

const handleVnpayCallback = async (req, res) => {
  const { vnp_ResponseCode, vnp_TxnRef, vnp_SecureHash, vnp_Amount } = req.query;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(vnp_TxnRef, 10) },
    });

    if (!payment) {
      console.error('Payment not found:', { vnp_TxnRef });
      return res.status(400).json({ success: false, message: 'Payment not found' });
    }
    if (vnp_ResponseCode === '00') {
      await updatePaymentStatus(payment.id, 'completed', vnp_TxnRef, vnp_Amount, vnp_ResponseCode);
      console.info('Payment completed:', { paymentId: payment.id });
      return res.status(200).json({ success: true, message: 'Payment successful', paymentId: payment.id });
    } else if (vnp_ResponseCode === '24') {
      await updatePaymentStatus(payment.id, 'cancelled', vnp_TxnRef, vnp_Amount, vnp_ResponseCode);
      console.warn('Payment cancelled:', { paymentId: payment.id });
      return res.status(200).json({ success: false, message: 'Payment cancelled', paymentId: payment.id });
    } else {
      await updatePaymentStatus(payment.id, 'failed', vnp_TxnRef, vnp_Amount, vnp_ResponseCode);
      console.warn('Payment failed:', { paymentId: payment.id });
      return res.status(200).json({ success: false, message: 'Payment failed', paymentId: payment.id });
    }
  } catch (error) {
    console.error('Error handling VNPay callback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error handling VNPay callback',
      error: error.message,
    });
  }
};

export { processPayment, handleVnpayCallback, repayment };
