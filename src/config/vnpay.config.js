import { VNPay, ignoreLogger } from 'vnpay';

const vnpay = new VNPay({
  tmnCode: '13NYHJME',
  secureSecret: 'Z99CEX0JOHT5J8SQ233Y661OEIK3C1M2',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
  hashAlgorithm: 'SHA512', // tùy chọn

  /**
   * Sử dụng enableLog để bật/tắt logger
   * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
   */
  enableLog: false, // optional

  /**
   * Hàm `loggerFn` sẽ được gọi để ghi log
   * Mặc định, loggerFn sẽ ghi log ra console
   * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
   *
   * `ignoreLogger` là một hàm không làm gì cả
   */
  loggerFn: ignoreLogger, // optional
});

export default vnpay;
