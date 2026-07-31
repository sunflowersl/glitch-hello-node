const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const MY_MOBILE = '0631323172';

app.get('/', (req, res) => {
  res.send('✅ TMN Redeem Server is online on Render!');
});

app.post('/redeem', async (req, res) => {
  const { link } = req.body;
  console.log('👀 มีคนกดส่งลิงก์เข้ามา:', link);

  if (!link) return res.status(400).json({ success: false, message: 'กรุณากรอกลิงก์' });

  try {
    let hash = link;
    if (link.includes('v=')) hash = link.split('v=')[1].split('&')[0];

    const response = await axios.post(`https://gift.truemoney.com/campaign/vouchers/${hash}/redeem`, {
      mobile: MY_MOBILE, voucher_hash: hash
    }, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });

    if (response.data?.status?.code === 'SUCCESS') {
      console.log('✅ ดึงเงินสำเร็จ!');
      return res.json({ success: true, message: `เติมเงินสำเร็จจำนวน ${response.data.data.my_ticket.amount_baht} บาท!` });
    } else {
      console.log('❌ ดึงเงินไม่สำเร็จ:', response.data?.status?.message);
      return res.status(400).json({ success: false, message: response.data?.status?.message || 'เติมเงินไม่สำเร็จ' });
    }
    
  } catch (err) {
    // ดึงรหัส Error จาก TrueMoney ถ้ามี
    const tmnErrorCode = err.response?.data?.status?.code;
    const tmnErrorMsg = err.response?.data?.status?.message;
    console.log('❌ Error จากระบบ:', tmnErrorCode || err.message);

    let myErrorMessage = 'เกิดข้อผิดพลาดบางอย่าง';

    // แปลง Error เป็นภาษาไทยให้ตรงกับสาเหตุจริงๆ
    if (tmnErrorCode === 'VOUCHER_OUT_OF_STOCK') {
      myErrorMessage = 'ซองนี้ถูกใช้งานไปแล้ว';
    } else if (tmnErrorCode === 'VOUCHER_NOT_FOUND') {
      myErrorMessage = 'ไม่ถูกต้อง'; // เพื่อให้หน้าเว็บ Carrd จับคำว่า "ไม่ถูกต้อง" ได้
    } else if (tmnErrorCode === 'VOUCHER_EXPIRED') {
      myErrorMessage = 'ซองนี้หมดอายุแล้ว';
    } else if (tmnErrorMsg) {
      myErrorMessage = tmnErrorMsg;
    } else {
      // ถ้าลิงก์เละเกินไปจน TrueMoney คืนค่า 404 กลับมา
      myErrorMessage = 'ไม่ถูกต้อง'; 
    }

    return res.status(400).json({ success: false, message: myErrorMessage });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server started!');
});
