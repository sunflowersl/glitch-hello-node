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
      return res.json({ success: true, message: `เติมเงินสำเร็จจำนวน ${response.data.data.my_ticket.amount_baht} บาท!` });
    } else {
      return res.status(400).json({ success: false, message: response.data?.status?.message || 'เติมเงินไม่สำเร็จ' });
    }
  } catch (err) {
    return res.status(400).json({ success: false, message: err.response?.data?.status?.message || 'ซองถูกใช้ไปแล้ว' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Server started!');
});
